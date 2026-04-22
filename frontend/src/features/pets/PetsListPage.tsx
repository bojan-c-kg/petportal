import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useAnnounce } from '../../hooks/useAnnounce';
import { deletePet, getPets, type PetDto } from '../../api/endpoints';
import { normaliseError } from '../../api/errors';
import { PetForm } from './PetForm';

type DialogState =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; pet: PetDto }
  | { kind: 'delete'; pet: PetDto };

export function PetsListPage() {
  const [pets, setPets] = useState<PetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>({ kind: 'closed' });
  const [deleting, setDeleting] = useState(false);
  const announce = useAnnounce();

  useEffect(() => {
    let cancelled = false;
    getPets()
      .then((data) => {
        if (!cancelled) {
          setPets(data);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(normaliseError(error, 'Unable to load pets.').message);
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

  const closeDialog = () => setDialog({ kind: 'closed' });

  const handleSaved = (saved: PetDto) => {
    setPets((current) => {
      const exists = current.some((p) => p.id === saved.id);
      if (exists) {
        return current.map((p) => (p.id === saved.id ? saved : p));
      }
      return [...current, saved].sort((a, b) => a.name.localeCompare(b.name));
    });
    closeDialog();
  };

  const handleConfirmDelete = async () => {
    if (dialog.kind !== 'delete') return;
    const target = dialog.pet;
    setDeleting(true);
    try {
      await deletePet(target.id);
      setPets((current) => current.filter((p) => p.id !== target.id));
      announce(`${target.name} removed.`);
      closeDialog();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        announce('Cannot delete — pet has upcoming appointments.', 'assertive');
      } else {
        const normalised = normaliseError(error, 'Unable to delete pet.');
        announce(normalised.message, 'assertive');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 0 },
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" tabIndex={-1}>
          My pets
        </Typography>
        <Button variant="contained" onClick={() => setDialog({ kind: 'create' })}>
          Add pet
        </Button>
      </Box>

      {loading && (
        <div role="status">
          <CircularProgress aria-hidden />
          <span>Loading…</span>
        </div>
      )}

      {!loading && loadError && (
        <Alert severity="error" role="alert">
          {loadError}
        </Alert>
      )}

      {!loading && !loadError && pets.length === 0 && (
        <Typography>No pets yet. Use &ldquo;Add pet&rdquo; to get started.</Typography>
      )}

      {!loading && pets.length > 0 && (
        <Stack spacing={2}>
          {pets.map((pet) => (
            <Card key={pet.id}>
              <CardActionArea component={RouterLink} to={`/pets/${pet.id}`}>
                <CardContent>
                  <Typography variant="h6" component="p">
                    {pet.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pet.species}
                    {pet.breed ? ` · ${pet.breed}` : ''}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Button onClick={() => setDialog({ kind: 'edit', pet })}>Edit</Button>
                <Button color="error" onClick={() => setDialog({ kind: 'delete', pet })}>
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}

      <PetForm
        open={dialog.kind === 'create' || dialog.kind === 'edit'}
        mode={dialog.kind === 'edit' ? 'edit' : 'create'}
        pet={dialog.kind === 'edit' ? dialog.pet : undefined}
        onClose={closeDialog}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={dialog.kind === 'delete'}
        title="Delete pet"
        message={
          dialog.kind === 'delete'
            ? `Remove ${dialog.pet.name} from your pets? This cannot be undone.`
            : ''
        }
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirmDelete}
        onClose={closeDialog}
      />
    </Box>
  );
}
