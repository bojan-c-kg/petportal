import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import { DateTime } from 'luxon';
import {
  getAvailability,
  getPets,
  getServices,
  getVets,
  type AvailabilitySlotDto,
  type PetDto,
  type ServiceDto,
  type VetDto,
} from '../../../api/endpoints';
import { normaliseError } from '../../../api/errors';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { submitBooking } from '../../../store/slices/bookingSlice';

interface Summary {
  service: ServiceDto | null;
  vet: VetDto | null;
  pet: PetDto | null;
  slot: AvailabilitySlotDto | null;
}

function formatDateTime(iso: string): string {
  return DateTime.fromISO(iso, { zone: 'utc' })
    .toLocal()
    .toLocaleString(DateTime.DATETIME_MED);
}

export function ConfirmStep() {
  const dispatch = useAppDispatch();
  const booking = useAppSelector((state) => state.booking);
  const { serviceId, vetId, date, slotId, petId, submissionStatus, error } = booking;

  const [summary, setSummary] = useState<Summary>({
    service: null,
    vet: null,
    pet: null,
    slot: null,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId || !vetId || !date || !slotId || !petId) {
      return;
    }
    let cancelled = false;
    Promise.all([
      getServices(),
      getVets(),
      getPets(),
      getAvailability(vetId, serviceId, date, date),
    ])
      .then(([services, vets, pets, slots]) => {
        if (!cancelled) {
          setSummary({
            service: services.find((s) => s.id === serviceId) ?? null,
            vet: vets.find((v) => v.id === vetId) ?? null,
            pet: pets.find((p) => p.id === petId) ?? null,
            slot: slots.find((s) => s.id === slotId) ?? null,
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(normaliseError(err, 'Unable to load summary.').message);
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
  }, [serviceId, vetId, date, slotId, petId]);

  if (!serviceId || !vetId || !date || !slotId || !petId) {
    return (
      <Alert severity="warning" role="alert">
        Complete the previous steps first.
      </Alert>
    );
  }

  return (
    <section aria-labelledby="step-confirm-heading">
      <Typography
        id="step-confirm-heading"
        variant="h5"
        component="h2"
        tabIndex={-1}
        data-wizard-step-heading
        sx={{ mb: 2 }}
      >
        Confirm your appointment
      </Typography>

      {loading && (
        <div role="status">
          <CircularProgress aria-hidden />
          <span>Loading summary…</span>
        </div>
      )}

      {loadError && (
        <Alert severity="error" role="alert">
          {loadError}
        </Alert>
      )}

      {!loading && !loadError && (
        <Box
          component="dl"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'max-content 1fr',
            columnGap: 3,
            rowGap: 1.5,
            my: 3,
          }}
        >
          <Typography component="dt" sx={{ fontWeight: 600 }}>
            Service
          </Typography>
          <Typography component="dd" sx={{ m: 0 }}>
            {summary.service
              ? `${summary.service.name} (${summary.service.durationMinutes} min, $${summary.service.price.toFixed(2)})`
              : '—'}
          </Typography>

          <Typography component="dt" sx={{ fontWeight: 600 }}>
            Vet
          </Typography>
          <Typography component="dd" sx={{ m: 0 }}>
            {summary.vet ? `${summary.vet.firstName} ${summary.vet.lastName}` : '—'}
          </Typography>

          <Typography component="dt" sx={{ fontWeight: 600 }}>
            When
          </Typography>
          <Typography component="dd" sx={{ m: 0 }}>
            {summary.slot ? formatDateTime(summary.slot.startTime) : '—'}
          </Typography>

          <Typography component="dt" sx={{ fontWeight: 600 }}>
            Pet
          </Typography>
          <Typography component="dd" sx={{ m: 0 }}>
            {summary.pet
              ? `${summary.pet.name} (${summary.pet.species}${summary.pet.breed ? `, ${summary.pet.breed}` : ''})`
              : '—'}
          </Typography>
        </Box>
      )}

      {submissionStatus === 'failed' && error?.message && (
        <Alert severity="error" role="alert" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      <Button
        onClick={() => {
          void dispatch(submitBooking());
        }}
        variant="contained"
        size="large"
        disabled={submissionStatus === 'submitting' || loading}
      >
        {submissionStatus === 'submitting' ? 'Booking…' : 'Confirm booking'}
      </Button>
    </section>
  );
}
