const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../database/init');
const { verifyToken } = require('./auth');
const { scrapeUrls, isValidUrl } = require('../utils/webScraper');

const router = express.Router();

// Configure multer for training file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './training-data';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `training-${req.userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for training files
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.txt', '.md', '.json', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only TXT, MD, JSON, and CSV files are allowed for training'));
    }
  }
});

// Create training dataset
router.post('/create-dataset', verifyToken, upload.array('trainingFiles', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No training files uploaded' });
    }

    const { datasetName, description } = req.body;
    
    if (!datasetName) {
      return res.status(400).json({ error: 'Dataset name is required' });
    }

    // Create dataset record
    db.run(
      `INSERT INTO training_datasets (user_id, name, description, status, created_at) 
       VALUES (?, ?, ?, 'processing', CURRENT_TIMESTAMP)`,
      [req.userId, datasetName, description],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create dataset' });
        }

        const datasetId = this.lastID;
        let processedFiles = 0;
        const totalFiles = req.files.length;

        // Process each uploaded file
        req.files.forEach((file, index) => {
          const filePath = file.path;
          const fileType = path.extname(file.originalname).toLowerCase();
          
          // Read and process file content
          let content = '';
          try {
            content = fs.readFileSync(filePath, 'utf8');
          } catch (error) {
            console.error('Error reading file:', error);
            return;
          }

          // Store training data
          db.run(
            `INSERT INTO training_data (dataset_id, filename, file_type, content, file_size, source_type, created_at) 
             VALUES (?, ?, ?, ?, ?, 'file', CURRENT_TIMESTAMP)`,
            [datasetId, file.originalname, fileType, content, file.size],
            function(err) {
              if (err) {
                console.error('Error storing training data:', err);
              }

              processedFiles++;
              
              // Clean up uploaded file
              fs.unlinkSync(filePath);

              // Check if all files processed
              if (processedFiles === totalFiles) {
                // Update dataset status
                db.run(
                  'UPDATE training_datasets SET status = ? WHERE id = ?',
                  ['ready', datasetId]
                );

                res.json({
                  datasetId: datasetId,
                  message: 'Training dataset created successfully',
                  filesProcessed: processedFiles
                });
              }
            }
          );
        });
      }
    );
  } catch (error) {
    console.error('Training dataset creation error:', error);
    res.status(500).json({ error: 'Failed to create training dataset' });
  }
});

// Create training dataset from URLs
router.post('/create-dataset-from-urls', verifyToken, async (req, res) => {
  try {
    const { datasetName, description, urls, followLinks = false, maxLinks = 5, maxDepth = 1 } = req.body;
    
    if (!datasetName) {
      return res.status(400).json({ error: 'Dataset name is required' });
    }

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'At least one URL is required' });
    }

    // Validate URLs
    const invalidUrls = urls.filter(url => !isValidUrl(url));
    if (invalidUrls.length > 0) {
      return res.status(400).json({ 
        error: `Invalid URLs: ${invalidUrls.join(', ')}` 
      });
    }

    // Limit URLs to prevent abuse
    if (urls.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 URLs allowed per dataset' });
    }

    // Create dataset record
    db.run(
      `INSERT INTO training_datasets (user_id, name, description, status, created_at) 
       VALUES (?, ?, ?, 'processing', CURRENT_TIMESTAMP)`,
      [req.userId, datasetName, description],
      async function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create dataset' });
        }

        const datasetId = this.lastID;

        try {
          // Scrape URLs
          const scrapeOptions = {
            followLinks: followLinks === true || followLinks === 'true',
            maxLinksPerPage: parseInt(maxLinks) || 5,
            maxDepth: parseInt(maxDepth) || 1,
            concurrency: 3
          };

          const scrapedData = await scrapeUrls(urls, scrapeOptions);
          
          let processedUrls = 0;
          const totalUrls = scrapedData.length;
          let hasErrors = false;

          if (totalUrls === 0) {
            db.run(
              'UPDATE training_datasets SET status = ? WHERE id = ?',
              ['error', datasetId]
            );
            return res.status(400).json({ error: 'No content could be scraped from the provided URLs' });
          }

          // Store scraped content
          scrapedData.forEach((data, index) => {
            if (data.error) {
              hasErrors = true;
              processedUrls++;
              if (processedUrls === totalUrls) {
                updateDatasetStatus(datasetId, processedUrls, totalUrls, hasErrors);
              }
              return;
            }

            const content = data.content || '';
            const title = data.title || data.url;
            const contentSize = Buffer.byteLength(content, 'utf8');

            if (content.length === 0) {
              processedUrls++;
              if (processedUrls === totalUrls) {
                updateDatasetStatus(datasetId, processedUrls, totalUrls, hasErrors);
              }
              return;
            }

            db.run(
              `INSERT INTO training_data (dataset_id, filename, file_type, content, file_size, source_url, source_type, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, 'url', CURRENT_TIMESTAMP)`,
              [datasetId, title, '.html', content, contentSize, data.url],
              function(err) {
                if (err) {
                  console.error('Error storing scraped data:', err);
                  hasErrors = true;
                }

                processedUrls++;
                
                // Check if all URLs processed
                if (processedUrls === totalUrls) {
                  updateDatasetStatus(datasetId, processedUrls, totalUrls, hasErrors);
                }
              }
            );
          });

          function updateDatasetStatus(datasetId, processed, total, errors) {
            const status = errors && processed === 0 ? 'error' : 'ready';
            db.run(
              'UPDATE training_datasets SET status = ? WHERE id = ?',
              [status, datasetId]
            );

            res.json({
              datasetId: datasetId,
              message: `Training dataset created successfully. Processed ${processed} of ${total} URLs.`,
              urlsProcessed: processed,
              totalUrls: total,
              hasErrors: errors
            });
          }

        } catch (scrapeError) {
          console.error('URL scraping error:', scrapeError);
          db.run(
            'UPDATE training_datasets SET status = ? WHERE id = ?',
            ['error', datasetId]
          );
          res.status(500).json({ 
            error: `Failed to scrape URLs: ${scrapeError.message}` 
          });
        }
      }
    );
  } catch (error) {
    console.error('Training dataset creation error:', error);
    res.status(500).json({ error: 'Failed to create training dataset' });
  }
});

// Get user's training datasets
router.get('/datasets', verifyToken, (req, res) => {
  db.all(
    `SELECT td.*, COUNT(td_data.id) as file_count 
     FROM training_datasets td 
     LEFT JOIN training_data td_data ON td.id = td_data.dataset_id 
     WHERE td.user_id = ? 
     GROUP BY td.id 
     ORDER BY td.created_at DESC`,
    [req.userId],
    (err, datasets) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(datasets);
    }
  );
});

// Get dataset details
router.get('/datasets/:id', verifyToken, (req, res) => {
  const datasetId = req.params.id;
  
  db.get(
    'SELECT * FROM training_datasets WHERE id = ? AND user_id = ?',
    [datasetId, req.userId],
    (err, dataset) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found' });
      }

      // Get training data files
      db.all(
        'SELECT * FROM training_data WHERE dataset_id = ? ORDER BY created_at ASC',
        [datasetId],
        (err, trainingData) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          
          res.json({
            ...dataset,
            trainingData: trainingData
          });
        }
      );
    }
  );
});

// Start model training
router.post('/train', verifyToken, async (req, res) => {
  try {
    const { datasetId, modelName, trainingParams } = req.body;
    
    if (!datasetId || !modelName) {
      return res.status(400).json({ error: 'Dataset ID and model name are required' });
    }

    // Verify dataset belongs to user
    db.get(
      'SELECT * FROM training_datasets WHERE id = ? AND user_id = ?',
      [datasetId, req.userId],
      async (err, dataset) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!dataset) {
          return res.status(404).json({ error: 'Dataset not found' });
        }

        // Create model record
        db.run(
          `INSERT INTO trained_models (user_id, dataset_id, name, status, parameters, created_at) 
           VALUES (?, ?, ?, 'training', ?, CURRENT_TIMESTAMP)`,
          [req.userId, datasetId, modelName, JSON.stringify(trainingParams || {})],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create model record' });
            }

            const modelId = this.lastID;

            // Simulate training process (in real implementation, this would call ML service)
            setTimeout(() => {
              db.run(
                'UPDATE trained_models SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
                ['completed', modelId]
              );
            }, 5000); // 5 second simulation

            res.json({
              modelId: modelId,
              message: 'Model training started',
              status: 'training'
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Model training error:', error);
    res.status(500).json({ error: 'Failed to start model training' });
  }
});

// Get user's trained models
router.get('/models', verifyToken, (req, res) => {
  db.all(
    `SELECT tm.*, td.name as dataset_name 
     FROM trained_models tm 
     JOIN training_datasets td ON tm.dataset_id = td.id 
     WHERE tm.user_id = ? 
     ORDER BY tm.created_at DESC`,
    [req.userId],
    (err, models) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(models);
    }
  );
});

// Delete training dataset
router.delete('/datasets/:id', verifyToken, (req, res) => {
  const datasetId = req.params.id;
  
  db.run(
    'DELETE FROM training_datasets WHERE id = ? AND user_id = ?',
    [datasetId, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Dataset not found' });
      }
      res.json({ success: true });
    }
  );
});

// Delete trained model
router.delete('/models/:id', verifyToken, (req, res) => {
  const modelId = req.params.id;
  
  db.run(
    'DELETE FROM trained_models WHERE id = ? AND user_id = ?',
    [modelId, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Model not found' });
      }
      res.json({ success: true });
    }
  );
});

module.exports = router;

