import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, Typography } from '@mui/material';
import { FieldText } from '../../components/FieldText';
import { useFocusOnError } from '../../hooks/useFocusOnError';
import { useAnnounce } from '../../hooks/useAnnounce';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearError, login } from '../../store/slices/authSlice';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const methods = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const status = useAppSelector((state) => state.auth.status);
  const error = useAppSelector((state) => state.auth.error);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? '/pets';
  const announce = useAnnounce();
  const focusOnError = useFocusOnError();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      navigate(returnTo, { replace: true });
    }
  }, [user, navigate, returnTo]);

  useEffect(() => {
    if (error?.message && !error.fieldErrors) {
      announce(error.message, 'assertive');
    }
  }, [error, announce]);

  const onSubmit = methods.handleSubmit(
    async (values) => {
      const result = await dispatch(login(values));
      if (login.rejected.match(result)) {
        const payload = result.payload;
        if (payload?.fieldErrors) {
          for (const [field, messages] of Object.entries(payload.fieldErrors)) {
            methods.setError(field as keyof LoginValues, {
              type: 'server',
              message: messages[0],
            });
          }
          focusOnError(methods.formState.errors);
        }
      }
    },
    (errors) => {
      focusOnError(errors);
      announce('Please fix the errors in the form.', 'assertive');
    },
  );

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto' }}>
      <Typography variant="h4" component="h1" tabIndex={-1} sx={{ mb: 3 }}>
        Log in
      </Typography>
      <FormProvider {...methods}>
        <form noValidate onSubmit={onSubmit}>
          <Stack spacing={2}>
            {error?.message && !error.fieldErrors && (
              <Alert severity="error" role="alert">
                {error.message}
              </Alert>
            )}
            <FieldText name="email" label="Email" type="email" autoComplete="email" required />
            <FieldText
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              required
            />
            <Button type="submit" variant="contained" disabled={status === 'loading'}>
              Log in
            </Button>
          </Stack>
        </form>
      </FormProvider>
      <Typography variant="body2" sx={{ mt: 3 }}>
        Don&rsquo;t have an account?{' '}
        <Link component={RouterLink} to="/signup">
          Sign up
        </Link>
      </Typography>
    </Box>
  );
}
