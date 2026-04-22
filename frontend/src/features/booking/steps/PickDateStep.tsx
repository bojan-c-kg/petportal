import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTime } from 'luxon';
import { getAvailability } from '../../../api/endpoints';
import { normaliseError } from '../../../api/errors';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setDate } from '../../../store/slices/bookingSlice';

export function PickDateStep() {
  const dispatch = useAppDispatch();
  const vetId = useAppSelector((state) => state.booking.vetId);
  const serviceId = useAppSelector((state) => state.booking.serviceId);
  const date = useAppSelector((state) => state.booking.date);

  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vetId || !serviceId) {
      return;
    }
    let cancelled = false;
    const from = DateTime.utc().toISODate() ?? '';
    const to = DateTime.utc().plus({ weeks: 4 }).toISODate() ?? '';
    getAvailability(vetId, serviceId, from, to)
      .then((slots) => {
        if (!cancelled) {
          setAvailableDates(new Set(slots.map((slot) => slot.startTime.slice(0, 10))));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(normaliseError(err, 'Unable to load availability.').message);
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
  }, [vetId, serviceId]);

  if (!vetId || !serviceId) {
    return (
      <Alert severity="warning" role="alert">
        Pick a vet and service first.
      </Alert>
    );
  }

  const selectedValue = date ? DateTime.fromISO(date) : null;

  return (
    <section aria-labelledby="step-date-heading">
      <Typography
        id="step-date-heading"
        variant="h5"
        component="h2"
        tabIndex={-1}
        data-wizard-step-heading
        sx={{ mb: 2 }}
      >
        Pick a date
      </Typography>

      {loading && (
        <div role="status">
          <CircularProgress aria-hidden />
          <span>Loading availability…</span>
        </div>
      )}

      {error && (
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      )}

      {!loading && !error && availableDates.size === 0 && (
        <Alert severity="info">
          No availability in the next four weeks for this vet and service.
        </Alert>
      )}

      {!loading && !error && availableDates.size > 0 && (
        <Box>
          <DatePicker
            label="Appointment date"
            value={selectedValue}
            onChange={(value) => {
              if (value && value.isValid) {
                const iso = value.toISODate();
                if (iso) {
                  dispatch(setDate(iso));
                }
              }
            }}
            shouldDisableDate={(value) => {
              if (!value.isValid) {
                return true;
              }
              const iso = value.toISODate();
              return !iso || !availableDates.has(iso);
            }}
            disablePast
            maxDate={DateTime.utc().plus({ weeks: 4 })}
            slotProps={{
              textField: {
                fullWidth: true,
                helperText: 'Only dates with available time slots can be selected.',
              },
            }}
          />
        </Box>
      )}
    </section>
  );
}
