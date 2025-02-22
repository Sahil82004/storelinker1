import React from 'react';
import { Box, Container, Typography } from '@mui/material';

function Footer() {
  return (
    <Box component="footer" sx={{ py: 3, bgcolor: 'primary.main', color: 'white' }}>
      <Container maxWidth="lg">
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} StoreLinker. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
