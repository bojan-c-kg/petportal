import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

export function HomePage() {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', py: { xs: 2, sm: 4 } }}>
      <Typography
        variant="h3"
        component="h1"
        tabIndex={-1}
        sx={{ mb: 2, fontSize: { xs: '2rem', sm: '3rem' } }}
      >
        PetPortal
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Manage your pets, book vet appointments, review past visits, and download invoices &mdash;
        all in one place.
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        {user ? (
          <Button component={RouterLink} to="/pets" variant="contained" size="large">
            Go to my pets
          </Button>
        ) : (
          <>
            <Button component={RouterLink} to="/signup" variant="contained" size="large">
              Sign up
            </Button>
            <Button component={RouterLink} to="/login" variant="outlined" size="large">
              Log in
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}
