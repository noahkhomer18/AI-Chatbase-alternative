const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

/**
 * Scrapes content from a single URL
 * @param {string} url - The URL to scrape
 * @param {Object} options - Scraping options
 * @returns {Promise<Object>} - Scraped content with metadata
 */
async function scrapeUrl(url, options = {}) {
  const {
    followLinks = false,
    maxLinks = 5,
    maxDepth = 1,
    selectors = ['body'],
    timeout = 30000
  } = options;

  try {
    // Validate URL
    new URL(url);

    // Fetch the page
    const response = await axios.get(url, {
      timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Remove script and style elements
    $('script, style, noscript, iframe').remove();
    
    // Extract text content
    let content = '';
    selectors.forEach(selector => {
      $(selector).each((i, elem) => {
        const text = $(elem).text().trim();
        if (text) {
          content += text + '\n\n';
        }
      });
    });

    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    const result = {
      url,
      title: $('title').text().trim() || url,
      content: content,
      links: []
    };

    // Extract links if followLinks is enabled
    if (followLinks && maxDepth > 0) {
      const baseUrl = new URL(url);
      $('a[href]').each((i, elem) => {
        if (result.links.length >= maxLinks) return false;
        
        const href = $(elem).attr('href');
        if (!href) return;
        
        try {
          const linkUrl = new URL(href, baseUrl).href;
          // Only follow same-domain links
          const linkDomain = new URL(linkUrl).hostname;
          if (linkDomain === baseUrl.hostname && linkUrl !== url) {
            result.links.push(linkUrl);
          }
        } catch (e) {
          // Invalid URL, skip
        }
      });
    }

    return result;
  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error(`Failed to connect to ${url}. Please check if the URL is correct and accessible.`);
    }
    if (error.response) {
      throw new Error(`HTTP ${error.response.status}: Failed to fetch ${url}`);
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error(`Request timeout: ${url} took too long to respond.`);
    }
    throw new Error(`Failed to scrape ${url}: ${error.message}`);
  }
}

/**
 * Scrapes multiple URLs and optionally follows links
 * @param {string[]} urls - Array of URLs to scrape
 * @param {Object} options - Scraping options
 * @returns {Promise<Array>} - Array of scraped content
 */
async function scrapeUrls(urls, options = {}) {
  const {
    followLinks = false,
    maxLinksPerPage = 5,
    maxDepth = 1,
    concurrency = 3
  } = options;

  const results = [];
  const visitedUrls = new Set();
  const urlQueue = [...urls];
  let currentDepth = 0;

  while (urlQueue.length > 0 && currentDepth <= maxDepth) {
    const batch = urlQueue.splice(0, concurrency);
    const batchPromises = batch.map(url => {
      if (visitedUrls.has(url)) return null;
      visitedUrls.add(url);
      return scrapeUrl(url, {
        followLinks: followLinks && currentDepth < maxDepth,
        maxLinks: maxLinksPerPage,
        maxDepth: maxDepth - currentDepth,
        ...options
      });
    });

    const batchResults = await Promise.allSettled(batchPromises);
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
        
        // Add links to queue if following links
        if (followLinks && currentDepth < maxDepth && result.value.links) {
          result.value.links.forEach(link => {
            if (!visitedUrls.has(link) && urlQueue.length < 50) {
              urlQueue.push(link);
            }
          });
        }
      } else if (result.status === 'rejected') {
        results.push({
          url: batch[batchResults.indexOf(result)],
          error: result.reason.message,
          content: ''
        });
      }
    }

    if (followLinks && urlQueue.length > 0) {
      currentDepth++;
    } else {
      break;
    }
  }

  return results;
}

/**
 * Validates if a string is a valid URL
 * @param {string} str - String to validate
 * @returns {boolean}
 */
function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  scrapeUrl,
  scrapeUrls,
  isValidUrl
};

