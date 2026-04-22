import { Box, Typography } from '@mui/material';

export function AppFooter() {
  return (
    <Box component="footer" sx={{ py: 2, px: 3, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        PetPortal demo
      </Typography>
    </Box>
  );
}
