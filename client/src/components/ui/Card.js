import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme/theme';

const StyledCard = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  padding: ${props => {
    if (props.size === 'sm') return theme.spacing.md;
    if (props.size === 'lg') return theme.spacing.xl;
    return theme.spacing.lg;
  }};
  box-shadow: ${props => props.elevated ? theme.shadows.lg : theme.shadows.sm};
  transition: all ${theme.transitions.normal};
  
  ${props => props.hoverable && `
    &:hover {
      box-shadow: ${theme.shadows.md};
      transform: translateY(-2px);
    }
  `}
`;

const CardHeader = styled.div`
  margin-bottom: ${theme.spacing.md};
  padding-bottom: ${theme.spacing.md};
  border-bottom: ${props => props.divider ? `1px solid ${theme.colors.border}` : 'none'};
`;

const CardTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const CardContent = styled.div`
  color: ${theme.colors.textSecondary};
`;

const CardFooter = styled.div`
  margin-top: ${theme.spacing.md};
  padding-top: ${theme.spacing.md};
  border-top: ${props => props.divider ? `1px solid ${theme.colors.border}` : 'none'};
`;

function Card({ children, title, footer, size = 'md', elevated = false, hoverable = false, ...props }) {
  return (
    <StyledCard size={size} elevated={elevated} hoverable={hoverable} {...props}>
      {title && (
        <CardHeader divider={!!children}>
          {typeof title === 'string' ? <CardTitle>{title}</CardTitle> : title}
        </CardHeader>
      )}
      {children && <CardContent>{children}</CardContent>}
      {footer && <CardFooter divider={!!children}>{footer}</CardFooter>}
    </StyledCard>
  );
}

export default Card;
