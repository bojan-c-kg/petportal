import { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FieldText } from '../../components/FieldText';
import { useFocusOnError } from '../../hooks/useFocusOnError';
import { useAnnounce } from '../../hooks/useAnnounce';
import { normaliseError } from '../../api/errors';
import { createPet, updatePet, type PetDto, type PetFormPayload } from '../../api/endpoints';
import { petFormSchema, type PetFormValues } from './petSchema';

type PetFormMode = 'create' | 'edit';

interface PetFormProps {
  open: boolean;
  mode: PetFormMode;
  pet?: PetDto;
  onClose: () => void;
  onSaved: (pet: PetDto) => void;
}

const emptyValues: PetFormValues = {
  name: '',
  species: 'Dog',
  breed: '',
  dateOfBirth: '',
  notes: '',
};

function toValues(pet?: PetDto): PetFormValues {
  if (!pet) return emptyValues;
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed ?? '',
    dateOfBirth: pet.dateOfBirth ?? '',
    notes: pet.notes ?? '',
  };
}

export function PetForm({ open, mode, pet, onClose, onSaved }: PetFormProps) {
  const methods = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: toValues(pet),
    mode: 'onSubmit',
  });
  const focusOnError = useFocusOnError();
  const announce = useAnnounce();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset,
    setError,
    clearErrors,
  } = methods;
  const speciesError = errors.species?.message;
  const titleId = mode === 'edit' ? 'edit-pet-title' : 'add-pet-title';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (open) {
      reset(toValues(pet));
      clearErrors();
    }
  }, [open, pet, reset, clearErrors]);

  const onSubmit = handleSubmit(
    async (values) => {
      const payload: PetFormPayload = {
        name: values.name.trim(),
        species: values.species,
        breed: values.breed ? values.breed.trim() : null,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth : null,
        notes: values.notes ? values.notes.trim() : null,
      };
      try {
        const saved =
          mode === 'edit' && pet
            ? await updatePet(pet.id, payload)
            : await createPet(payload);
        onSaved(saved);
        announce(mode === 'edit' ? 'Pet updated.' : 'Pet added.');
      } catch (error) {
        const normalised = normaliseError(error, 'Unable to save pet.');
        if (normalised.fieldErrors) {
          for (const [field, messages] of Object.entries(normalised.fieldErrors)) {
            setError(field as keyof PetFormValues, { type: 'server', message: messages[0] });
          }
          focusOnError(methods.formState.errors);
        } else {
          setError('root', { type: 'server', message: normalised.message });
          announce(normalised.message, 'assertive');
        }
      }
    },
    (formErrors) => {
      focusOnError(formErrors);
      announce('Please fix the errors in the form.', 'assertive');
    },
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
    >
      <DialogTitle id={titleId}>{mode === 'edit' ? 'Edit pet' : 'Add pet'}</DialogTitle>
      <FormProvider {...methods}>
        <form noValidate onSubmit={onSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {errors.root?.message && (
                <Alert severity="error" role="alert">
                  {errors.root.message}
                </Alert>
              )}
              <FieldText name="name" label="Name" autoComplete="off" required />
              <FormControl component="fieldset" error={Boolean(speciesError)}>
                <FormLabel id="species-label">Species</FormLabel>
                <Controller
                  name="species"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      row
                      aria-labelledby="species-label"
                      aria-invalid={Boolean(speciesError)}
                      {...field}
                    >
                      <FormControlLabel value="Dog" control={<Radio />} label="Dog" />
                      <FormControlLabel value="Cat" control={<Radio />} label="Cat" />
                      <FormControlLabel value="Other" control={<Radio />} label="Other" />
                    </RadioGroup>
                  )}
                />
                {speciesError && <FormHelperText>{speciesError}</FormHelperText>}
              </FormControl>
              <FieldText name="breed" label="Breed" autoComplete="off" />
              <FieldText
                name="dateOfBirth"
                label="Date of birth"
                type="date"
                helperText="Optional. Format YYYY-MM-DD."
              />
              <FieldText name="notes" label="Notes" multiline rows={3} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={20} aria-label="Saving" /> : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
