import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, Typography } from '@mui/material';
import { FieldText } from '../../components/FieldText';
import { useFocusOnError } from '../../hooks/useFocusOnError';
import { useAnnounce } from '../../hooks/useAnnounce';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearError, signup } from '../../store/slices/authSlice';

const signupSchema = z
  .object({
    email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password must include an uppercase letter.')
      .regex(/[a-z]/, 'Password must include a lowercase letter.')
      .regex(/[0-9]/, 'Password must include a digit.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    firstName: z.string().min(1, 'First name is required.'),
    lastName: z.string().min(1, 'Last name is required.'),
    phone: z.string().min(1, 'Phone is required.'),
    address: z.string().min(1, 'Address is required.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type SignupValues = z.infer<typeof signupSchema>;

export function SignupPage() {
  const methods = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
    },
    mode: 'onSubmit',
  });
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const status = useAppSelector((state) => state.auth.status);
  const error = useAppSelector((state) => state.auth.error);
  const navigate = useNavigate();
  const announce = useAnnounce();
  const focusOnError = useFocusOnError();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      navigate('/pets', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error?.message && !error.fieldErrors) {
      announce(error.message, 'assertive');
    }
  }, [error, announce]);

  const onSubmit = methods.handleSubmit(
    async (values) => {
      const { email, password, firstName, lastName, phone, address } = values;
      const result = await dispatch(signup({ email, password, firstName, lastName, phone, address }));
      if (signup.rejected.match(result)) {
        const payloadError = result.payload;
        if (payloadError?.fieldErrors) {
          for (const [field, messages] of Object.entries(payloadError.fieldErrors)) {
            methods.setError(field as keyof SignupValues, {
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
    <Box sx={{ maxWidth: 520, mx: 'auto' }}>
      <Typography variant="h4" component="h1" tabIndex={-1} sx={{ mb: 3 }}>
        Sign up
      </Typography>
      <FormProvider {...methods}>
        <form noValidate onSubmit={onSubmit}>
          <Stack spacing={2}>
            {error?.message && !error.fieldErrors && (
              <Alert severity="error" role="alert">
                {error.message}
              </Alert>
            )}
            <FieldText name="firstName" label="First name" autoComplete="given-name" required />
            <FieldText name="lastName" label="Last name" autoComplete="family-name" required />
            <FieldText name="email" label="Email" type="email" autoComplete="email" required />
            <FieldText
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              required
              helperText="At least 8 characters with uppercase, lowercase, and a digit."
            />
            <FieldText
              name="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              required
            />
            <FieldText name="phone" label="Phone" autoComplete="tel" required />
            <FieldText name="address" label="Address" autoComplete="street-address" required />
            <Button type="submit" variant="contained" disabled={status === 'loading'}>
              Create account
            </Button>
          </Stack>
        </form>
      </FormProvider>
      <Typography variant="body2" sx={{ mt: 3 }}>
        Already have an account?{' '}
        <Link component={RouterLink} to="/login">
          Log in
        </Link>
      </Typography>
    </Box>
  );
}
