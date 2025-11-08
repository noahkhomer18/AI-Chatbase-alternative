import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme/theme';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;
`;

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
`;

const StyledInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.base};
  font-family: ${theme.typography.fontFamily.sans};
  color: ${theme.colors.textPrimary};
  background: ${theme.colors.surface};
  border: 2px solid ${props => props.error ? theme.colors.error : theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.normal};
  outline: none;
  
  &:focus {
    border-color: ${props => props.error ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.error ? theme.colors.errorLight : 'rgba(99, 102, 241, 0.1)'};
  }
  
  &:disabled {
    background: ${theme.colors.borderLight};
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  &::placeholder {
    color: ${theme.colors.textTertiary};
  }
`;

const ErrorText = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.error};
`;

function Input({ label, error, ...props }) {
  return (
    <InputWrapper>
      {label && <Label>{label}</Label>}
      <StyledInput error={error} {...props} />
      {error && <ErrorText>{error}</ErrorText>}
    </InputWrapper>
  );
}

export default Input;
