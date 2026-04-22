import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '../../components/Icon';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useAnnounce } from '../../hooks/useAnnounce';
import {
  cancelAppointment,
  getAppointments,
  type AppointmentDto,
} from '../../api/endpoints';
import { normaliseError } from '../../api/errors';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function AppointmentsPage() {
  const [upcoming, setUpcoming] = useState<AppointmentDto[]>([]);
  const [past, setPast] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toCancel, setToCancel] = useState<AppointmentDto | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const announce = useAnnounce();

  useEffect(() => {
    let cancelled = false;
    Promise.all([getAppointments('upcoming'), getAppointments('past')])
      .then(([u, p]) => {
        if (!cancelled) {
          setUpcoming(u);
          setPast(p);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(normaliseError(err, 'Unable to load appointments.').message);
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

  const handleCancel = async () => {
    if (!toCancel) return;
    const target = toCancel;
    setCancelling(true);
    try {
      await cancelAppointment(target.id);
      setUpcoming((curr) => curr.filter((a) => a.id !== target.id));
      setPast((curr) =>
        [{ ...target, status: 'Cancelled' as const }, ...curr].sort((a, b) =>
          b.slotStartTime.localeCompare(a.slotStartTime),
        ),
      );
      announce('Appointment cancelled.');
      setToCancel(null);
    } catch (err) {
      announce(normaliseError(err, 'Unable to cancel appointment.').message, 'assertive');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div role="status">
        <CircularProgress aria-hidden />
        <span>Loading…</span>
      </div>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" component="h1" tabIndex={-1} sx={{ mb: 3 }}>
        My appointments
      </Typography>

      {loadError && (
        <Alert severity="error" role="alert" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      <Box component="section" aria-labelledby="upcoming-h2" sx={{ mb: 5 }}>
        <Typography variant="h5" component="h2" id="upcoming-h2" sx={{ mb: 2 }}>
          Upcoming
        </Typography>
        {upcoming.length === 0 ? (
          <Typography>No upcoming appointments.</Typography>
        ) : (
          <Stack spacing={2}>
            {upcoming.map((a) => (
              <Card key={a.id}>
                <CardContent>
                  <Typography variant="h6" component="p">
                    {a.serviceName} with {a.vetName}
                  </Typography>
                  <Typography color="text.secondary">
                    For {a.petName} on {formatDateTime(a.slotStartTime)}
                  </Typography>
                  {a.invoiceNumber && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Invoice {a.invoiceNumber}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    component="a"
                    href={`/api/appointments/${a.id}/invoice.pdf`}
                    download={`${a.invoiceNumber || `invoice-${a.id.slice(0, 8)}`}.pdf`}
                  >
                    Download invoice
                  </Button>
                  <Button color="error" onClick={() => setToCancel(a)}>
                    Cancel
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      <Box component="section" aria-labelledby="past-h2">
        <Typography variant="h5" component="h2" id="past-h2" sx={{ mb: 2 }}>
          Past
        </Typography>
        {past.length === 0 ? (
          <Typography>No past appointments.</Typography>
        ) : (
          <Stack spacing={2}>
            {past.map((a) => (
              <Card key={a.id}>
                <CardContent>
                  <Typography variant="h6" component="p">
                    {a.serviceName} with {a.vetName}
                  </Typography>
                  <Typography color="text.secondary">
                    For {a.petName} on {formatDateTime(a.slotStartTime)}
                  </Typography>
                  {a.invoiceNumber && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Invoice {a.invoiceNumber}
                    </Typography>
                  )}
                  {a.status === 'Cancelled' && (
                    <Chip
                      icon={<Icon icon={faBan} decorative />}
                      label="Cancelled"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    component="a"
                    href={`/api/appointments/${a.id}/invoice.pdf`}
                    download={`${a.invoiceNumber || `invoice-${a.id.slice(0, 8)}`}.pdf`}
                  >
                    Download invoice
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      <ConfirmDialog
        open={Boolean(toCancel)}
        title="Cancel appointment"
        message={
          toCancel
            ? `Cancel your ${toCancel.serviceName} on ${formatDateTime(toCancel.slotStartTime)}?`
            : ''
        }
        confirmLabel={cancelling ? 'Cancelling…' : 'Cancel appointment'}
        cancelLabel="Keep it"
        destructive
        onConfirm={handleCancel}
        onClose={() => setToCancel(null)}
      />
    </Box>
  );
}
