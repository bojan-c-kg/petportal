import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { normaliseError } from '../../api/errors';
import { getPet, type PetDetailDto, type PetDto } from '../../api/endpoints';
import { PetForm } from './PetForm';

const thCellStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '2px solid #c0c0c0',
  fontWeight: 600,
};

const tdCellStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid #e0e0e0',
};

function formatIsoDate(value: string): string {
  return value.slice(0, 10);
}

export function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<PetDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;
    getPet(id)
      .then((data) => {
        if (!cancelled) {
          setPet(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(normaliseError(err, 'Unable to load pet.').message);
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
  }, [id]);

  if (!id) {
    return (
      <Alert severity="error" role="alert">
        Missing pet id.
      </Alert>
    );
  }

  const handleSaved = (saved: PetDto) => {
    setPet((current) =>
      current ? { ...current, ...saved } : current,
    );
    setEditOpen(false);
  };

  if (loading) {
    return (
      <div role="status">
        <CircularProgress aria-hidden />
        <span>Loading…</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" role="alert">
        {error}
      </Alert>
    );
  }

  if (!pet) {
    return (
      <Alert severity="error" role="alert">
        Pet not found.
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 0 },
          mb: 2,
        }}
      >
        <Typography variant="h4" component="h1" tabIndex={-1}>
          {pet.name}
        </Typography>
        <Button onClick={() => setEditOpen(true)} variant="outlined">
          Edit
        </Button>
      </Box>

      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography>
          <Box component="span" sx={{ fontWeight: 600 }}>
            Species:{' '}
          </Box>
          {pet.species}
        </Typography>
        {pet.breed && (
          <Typography>
            <Box component="span" sx={{ fontWeight: 600 }}>
              Breed:{' '}
            </Box>
            {pet.breed}
          </Typography>
        )}
        {pet.dateOfBirth && (
          <Typography>
            <Box component="span" sx={{ fontWeight: 600 }}>
              Date of birth:{' '}
            </Box>
            {pet.dateOfBirth}
          </Typography>
        )}
        {pet.notes && (
          <Typography>
            <Box component="span" sx={{ fontWeight: 600 }}>
              Notes:{' '}
            </Box>
            {pet.notes}
          </Typography>
        )}
      </Stack>

      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
        Vaccinations
      </Typography>
      {pet.vaccinations.length === 0 ? (
        <Typography>No vaccinations recorded.</Typography>
      ) : (
        <Box
          component="table"
          sx={{ width: '100%', borderCollapse: 'collapse', '& caption': { captionSide: 'top' } }}
        >
          <caption
            style={{ textAlign: 'left', marginBottom: 8, fontWeight: 500, fontSize: '0.95rem' }}
          >
            Vaccination history
          </caption>
          <thead>
            <tr>
              <th scope="col" style={thCellStyle}>
                Name
              </th>
              <th scope="col" style={thCellStyle}>
                Administered
              </th>
              <th scope="col" style={thCellStyle}>
                Next due
              </th>
            </tr>
          </thead>
          <tbody>
            {pet.vaccinations.map((v) => (
              <tr key={v.id}>
                <td style={tdCellStyle}>{v.name}</td>
                <td style={tdCellStyle}>{formatIsoDate(v.dateAdministered)}</td>
                <td style={tdCellStyle}>
                  {v.nextDueDate ? formatIsoDate(v.nextDueDate) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      )}

      <Typography variant="h5" component="h2" sx={{ mt: 4, mb: 2 }}>
        Conditions
      </Typography>
      {pet.conditions.length === 0 ? (
        <Typography>No conditions recorded.</Typography>
      ) : (
        <Box
          component="table"
          sx={{ width: '100%', borderCollapse: 'collapse', '& caption': { captionSide: 'top' } }}
        >
          <caption
            style={{ textAlign: 'left', marginBottom: 8, fontWeight: 500, fontSize: '0.95rem' }}
          >
            Conditions
          </caption>
          <thead>
            <tr>
              <th scope="col" style={thCellStyle}>
                Name
              </th>
              <th scope="col" style={thCellStyle}>
                Diagnosed
              </th>
              <th scope="col" style={thCellStyle}>
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {pet.conditions.map((c) => (
              <tr key={c.id}>
                <td style={tdCellStyle}>{c.name}</td>
                <td style={tdCellStyle}>{c.diagnosedDate}</td>
                <td style={tdCellStyle}>{c.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </Box>
      )}

      <PetForm
        open={editOpen}
        mode="edit"
        pet={pet}
        onClose={() => setEditOpen(false)}
        onSaved={handleSaved}
      />
    </Box>
  );
}
