import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { FieldText } from '../../components/FieldText';
import { useFocusOnError } from '../../hooks/useFocusOnError';
import { useAnnounce } from '../../hooks/useAnnounce';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateMe } from '../../store/slices/authSlice';

const accountSchema = z.object({
  phone: z.string().min(1, 'Phone is required.').max(50, 'Phone is too long.'),
  address: z.string().min(1, 'Address is required.').max(500, 'Address is too long.'),
});

type AccountValues = z.infer<typeof accountSchema>;

export function AccountPage() {
  const user = useAppSelector((state) => state.auth.user);
  const error = useAppSelector((state) => state.auth.error);
  const dispatch = useAppDispatch();
  const announce = useAnnounce();
  const focusOnError = useFocusOnError();

  const methods = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { phone: user?.phone ?? '', address: user?.address ?? '' },
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (user) {
      methods.reset({ phone: user.phone, address: user.address });
    }
  }, [user, methods]);

  const onSubmit = methods.handleSubmit(
    async (values) => {
      const result = await dispatch(updateMe(values));
      if (updateMe.fulfilled.match(result)) {
        announce('Account saved.');
      } else {
        const payload = result.payload;
        if (payload?.fieldErrors) {
          for (const [field, messages] of Object.entries(payload.fieldErrors)) {
            methods.setError(field as keyof AccountValues, {
              type: 'server',
              message: messages[0],
            });
          }
          focusOnError(methods.formState.errors);
        } else {
          announce(payload?.message ?? 'Save failed.', 'assertive');
        }
      }
    },
    (errors) => {
      focusOnError(errors);
      announce('Please fix the errors in the form.', 'assertive');
    },
  );

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto' }}>
      <Typography variant="h4" component="h1" tabIndex={-1} sx={{ mb: 3 }}>
        Account
      </Typography>
      <Stack spacing={3}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Email
          </Typography>
          <Typography>{user.email}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Name
          </Typography>
          <Typography>
            {user.firstName} {user.lastName}
          </Typography>
        </Box>
        <FormProvider {...methods}>
          <form noValidate onSubmit={onSubmit}>
            <Stack spacing={2}>
              {error?.message && !error.fieldErrors && (
                <Alert severity="error" role="alert">
                  {error.message}
                </Alert>
              )}
              <FieldText name="phone" label="Phone" autoComplete="tel" required />
              <FieldText name="address" label="Address" autoComplete="street-address" required />
              <Button type="submit" variant="contained">
                Save
              </Button>
            </Stack>
          </form>
        </FormProvider>
      </Stack>
    </Box>
  );
}
