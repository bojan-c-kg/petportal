import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { getVets, type VetDto } from '../../../api/endpoints';
import { normaliseError } from '../../../api/errors';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setVet } from '../../../store/slices/bookingSlice';

export function PickVetStep() {
  const dispatch = useAppDispatch();
  const serviceId = useAppSelector((state) => state.booking.serviceId);
  const vetId = useAppSelector((state) => state.booking.vetId);
  const [vets, setVets] = useState<VetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) {
      return;
    }
    let cancelled = false;
    getVets(serviceId)
      .then((data) => {
        if (!cancelled) {
          setVets(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(normaliseError(err, 'Unable to load vets.').message);
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
  }, [serviceId]);

  if (!serviceId) {
    return (
      <Alert severity="warning" role="alert">
        Pick a service first.
      </Alert>
    );
  }

  return (
    <section aria-labelledby="step-vet-heading">
      <Typography
        id="step-vet-heading"
        variant="h5"
        component="h2"
        tabIndex={-1}
        data-wizard-step-heading
        sx={{ mb: 2 }}
      >
        Pick a vet
      </Typography>

      {loading && (
        <div role="status">
          <CircularProgress aria-hidden />
          <span>Loading vets…</span>
        </div>
      )}

      {error && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}

      {!loading && !error && vets.length === 0 && (
        <Typography>No vets offer this service.</Typography>
      )}

      {!loading && !error && vets.length > 0 && (
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" sx={{ mb: 2 }}>
            Vets who offer this service
          </FormLabel>
          <RadioGroup
            value={vetId ?? ''}
            onChange={(event) => dispatch(setVet(event.target.value))}
          >
            <Stack spacing={2}>
              {vets.map((vet) => (
                <Card key={vet.id} variant="outlined">
                  <FormControlLabel
                    sx={{
                      m: 0,
                      p: 2,
                      display: 'flex',
                      alignItems: 'flex-start',
                      width: '100%',
                    }}
                    value={vet.id}
                    control={<Radio sx={{ mt: '-2px' }} />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>
                          {vet.firstName} {vet.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {vet.bio}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Specialties: {vet.specialties}
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
