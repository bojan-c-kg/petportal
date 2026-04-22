import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { getPets, type PetDto } from '../../../api/endpoints';
import { normaliseError } from '../../../api/errors';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setPet } from '../../../store/slices/bookingSlice';

export function PickPetStep() {
  const dispatch = useAppDispatch();
  const petId = useAppSelector((state) => state.booking.petId);
  const [pets, setPets] = useState<PetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPets()
      .then((data) => {
        if (!cancelled) {
          setPets(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(normaliseError(err, 'Unable to load pets.').message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section aria-labelledby="step-pet-heading">
      <Typography
        id="step-pet-heading"
        variant="h5"
        component="h2"
        tabIndex={-1}
        data-wizard-step-heading
        sx={{ mb: 2 }}
      >
        Pick a pet
      </Typography>

      {loading && (
        <div role="status">
          <CircularProgress aria-hidden />
          <span>Loading pets…</span>
        </div>
      )}

      {error && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}

      {!loading && !error && pets.length === 0 && (
        <Alert severity="info">
          You don&rsquo;t have any pets yet.{' '}
          <Link component={RouterLink} to="/pets">
            Add a pet first
          </Link>
          , then come back to book.
        </Alert>
      )}

      {!loading && !error && pets.length > 0 && (
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" sx={{ mb: 2 }}>
            Which pet is the appointment for?
          </FormLabel>
          <RadioGroup
            value={petId ?? ''}
            onChange={(event) => dispatch(setPet(event.target.value))}
          >
            <Stack spacing={2}>
              {pets.map((pet) => (
                <Card key={pet.id} variant="outlined">
                  <FormControlLabel
                    sx={{
                      m: 0,
                      p: 2,
                      display: 'flex',
                      alignItems: 'flex-start',
                      width: '100%',
                    }}
                    value={pet.id}
                    control={<Radio sx={{ mt: '-2px' }} />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>{pet.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {pet.species}
                          {pet.breed ? ` · ${pet.breed}` : ''}
                        </Typography>
                      </Box>
                    }
                  />
                </Card>
              ))}
            </Stack>
          </RadioGroup>
        </FormControl>
      )}
    </section>
  );
}
