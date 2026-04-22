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
import { getServices, type ServiceDto } from '../../../api/endpoints';
import { normaliseError } from '../../../api/errors';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setService } from '../../../store/slices/bookingSlice';

export function PickServiceStep() {
  const dispatch = useAppDispatch();
  const serviceId = useAppSelector((state) => state.booking.serviceId);
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getServices()
      .then((data) => {
        if (!cancelled) {
          setServices(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(normaliseError(err, 'Unable to load services.').message);
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
    <section aria-labelledby="step-service-heading">
      <Typography
        id="step-service-heading"
        variant="h5"
        component="h2"
        tabIndex={-1}
        data-wizard-step-heading
        sx={{ mb: 2 }}
      >
        Pick a service
      </Typography>

      {loading && (
        <div role="status">
          <CircularProgress aria-hidden />
          <span>Loading services…</span>
        </div>
      )}

      {error && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}

      {!loading && !error && services.length === 0 && (
        <Typography>No services available.</Typography>
      )}

      {!loading && !error && services.length > 0 && (
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" sx={{ mb: 2 }}>
            Available services
          </FormLabel>
          <RadioGroup
            value={serviceId ?? ''}
            onChange={(event) => dispatch(setService(event.target.value))}
          >
            <Stack spacing={2}>
              {services.map((service) => (
                <Card key={service.id} variant="outlined">
                  <FormControlLabel
                    sx={{
                      m: 0,
                      p: 2,
                      display: 'flex',
                      alignItems: 'flex-start',
                      width: '100%',
                    }}
                    value={service.id}
                    control={<Radio sx={{ mt: '-2px' }} />}
                    label={
                      <Box sx={{ ml: 1 }}>
                        <Typography sx={{ fontWeight: 600 }}>{service.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {service.description}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {service.durationMinutes} min · ${service.price.toFixed(2)}
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
