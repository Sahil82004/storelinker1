import React from 'react';
import { Card, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CompareIcon from '@mui/icons-material/Compare';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.paper,
  border: '1px solid',
  borderColor: theme.palette.grey[200],
  borderRadius: theme.spacing(2),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    borderColor: theme.palette.grey[300],
    '& .icon': {
      transform: 'scale(1.1)',
      color: theme.palette.primary.main,
    }
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .icon': {
    fontSize: 48,
    color: theme.palette.grey[800],
    transition: 'all 0.3s ease-in-out',
  }
}));

const CategoryTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 600,
  textAlign: 'center',
  marginBottom: theme.spacing(1),
}));

const CategoryDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: 'center',
  fontSize: '0.875rem',
}));

const IconMap = {
  StorefrontIcon: StorefrontIcon,
  CompareIcon: CompareIcon,
  LocalOfferIcon: LocalOfferIcon,
};

export default function CategoryCard({ category }) {
  const Icon = IconMap[category.icon];

  return (
    <StyledCard
      component={RouterLink}
      to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
      sx={{ textDecoration: 'none' }}
    >
      <IconWrapper>
        <Icon className="icon" />
      </IconWrapper>
      <CategoryTitle variant="h6">
        {category.name}
      </CategoryTitle>
      <CategoryDescription>
        {category.description}
      </CategoryDescription>
    </StyledCard>
  );
} 