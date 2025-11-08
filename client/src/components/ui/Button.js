import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme/theme';

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.iconOnly ? '0' : theme.spacing.sm};
  padding: ${props => {
    if (props.size === 'sm') return `${theme.spacing.sm} ${theme.spacing.md}`;
    if (props.size === 'lg') return `${theme.spacing.md} ${theme.spacing.xl}`;
    return `${theme.spacing.md} ${theme.spacing.lg}`;
  }};
  font-size: ${props => {
    if (props.size === 'sm') return theme.typography.fontSize.sm;
    if (props.size === 'lg') return theme.typography.fontSize.lg;
    return theme.typography.fontSize.base;
  }};
  font-weight: ${theme.typography.fontWeight.medium};
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  outline: none;
  
  background: ${props => {
    if (props.variant === 'primary') return theme.colors.primary;
    if (props.variant === 'secondary') return theme.colors.secondary;
    if (props.variant === 'danger') return theme.colors.error;
    if (props.variant === 'ghost') return 'transparent';
    return theme.colors.primary;
  }};
  
  color: ${props => {
    if (props.variant === 'ghost') return theme.colors.textPrimary;
    return theme.colors.textInverse;
  }};
  
  &:hover:not(:disabled) {
    background: ${props => {
      if (props.variant === 'primary') return theme.colors.primaryDark;
      if (props.variant === 'secondary') return theme.colors.secondaryDark;
      if (props.variant === 'danger') return '#dc2626';
      if (props.variant === 'ghost') return theme.colors.borderLight;
      return theme.colors.primaryDark;
    }};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
`;

function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  iconOnly = false,
  ...props 
}) {
  return (
    <StyledButton 
      variant={variant} 
      size={size} 
      iconOnly={iconOnly}
      {...props}
    >
      {children}
    </StyledButton>
  );
}

export default Button;
