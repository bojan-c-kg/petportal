import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { DateTime } from 'luxon';
import { Icon } from '../../../components/Icon';
import { getAvailability, type AvailabilitySlotDto } from '../../../api/endpoints';
import { normaliseError } from '../../../api/errors';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setSlot } from '../../../store/slices/bookingSlice';

function formatTime(iso: string): string {
  return DateTime.fromISO(iso, { zone: 'utc' })
    .toLocal()
    .toLocaleString(DateTime.TIME_SIMPLE);
}

export function PickTimeStep() {
  const dispatch = useAppDispatch();
  const vetId = useAppSelector((state) => state.booking.vetId);
  const serviceId = useAppSelector((state) => state.booking.serviceId);
  const date = useAppSelector((state) => state.booking.date);
  const slotId = useAppSelector((state) => state.booking.slotId);

  const [slots, setSlots] = useState<AvailabilitySlotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vetId || !serviceId || !date) {
      return;
    }
    let cancelled = false;
    getAvailability(vetId, serviceId, date, date)
      .then((data) => {
        if (!cancelled) {
          setSlots(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(normaliseError(err, 'Unable to load times.').message);
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
  }, [vetId, serviceId, date]);

  if (!vetId || !serviceId || !date) {
    return (
      <Alert severity="warning" role="alert">
        Pick a service, vet, and date first.
      </Alert>
    );
  }

  return (
    <section aria-labelledby="step-time-heading">
      <Typography
        id="step-time-heading"
        variant="h5"
        component="h2"
        tabIndex={-1}
        data-wizard-step-heading
        sx={{ mb: 2 }}
      >
        Pick a time
      </Typography>

      {loading && (
        <div role="status">
          <CircularProgress aria-hidden />
          <span>Loading times…</span>
        </div>
      )}

      {error && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}

      {!loading && !error && slots.length === 0 && (
        <Alert severity="info">No open times on this date.</Alert>
      )}

      {!loading && !error && slots.length > 0 && (
        <Box
          role="group"
          aria-label="Available time slots"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 1,
          }}
        >
          {slots.map((slot) => {
            const selected = slotId === slot.id;
            return (
              <Button
                key={slot.id}
                variant={selected ? 'contained' : 'outlined'}
                onClick={() => dispatch(setSlot(slot.id))}
                aria-pressed={selected}
                startIcon={selected ? <Icon icon={faCheck} decorative /> : undefined}
                sx={{ justifyContent: 'center' }}
              >
                {formatTime(slot.startTime)}
              </Button>
            );
          })}
        </Box>
      )}
    </section>
  );
}
