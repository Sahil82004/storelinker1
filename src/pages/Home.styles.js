import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
  color: 'white',
  padding: theme.spacing(15, 0),
  textAlign: 'center',
  borderRadius: '0 0 50px 50px',
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)',
  },
  boxShadow: '0 4px 20px rgba(126, 58, 242, 0.15)',
}));

export const FeatureSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0),
  backgroundColor: theme.palette.background.default,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: `linear-gradient(to bottom, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
  },
})); 