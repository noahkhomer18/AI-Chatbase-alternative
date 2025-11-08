import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../theme/theme';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  padding: ${props => props.fullScreen ? '0' : theme.spacing.xl};
  min-height: ${props => props.fullScreen ? '100vh' : 'auto'};
`;

const Spinner = styled.div`
  width: ${props => {
    if (props.size === 'sm') return '20px';
    if (props.size === 'lg') return '48px';
    return '32px';
  }};
  height: ${props => {
    if (props.size === 'sm') return '20px';
    if (props.size === 'lg') return '48px';
    return '32px';
  }};
  border: ${props => {
    const width = props.size === 'sm' ? '2px' : props.size === 'lg' ? '4px' : '3px';
    return `${width} solid ${theme.colors.border}`;
  }};
  border-top: ${props => {
    const width = props.size === 'sm' ? '2px' : props.size === 'lg' ? '4px' : '3px';
    return `${width} solid ${theme.colors.primary}`;
  }};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const LoadingText = styled.div`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.textSecondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const Dots = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  
  span {
    width: 8px;
    height: 8px;
    background: ${theme.colors.primary};
    border-radius: 50%;
    animation: ${pulse} 1.4s ease-in-out infinite;
    
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
`;

function Loading({ 
  text, 
  size = 'md', 
  fullScreen = false, 
  variant = 'spinner' 
}) {
  return (
    <SpinnerContainer fullScreen={fullScreen}>
      {variant === 'spinner' ? (
        <Spinner size={size} />
      ) : (
        <Dots>
          <span></span>
          <span></span>
          <span></span>
        </Dots>
      )}
      {text && <LoadingText>{text}</LoadingText>}
    </SpinnerContainer>
  );
}

export default Loading;
