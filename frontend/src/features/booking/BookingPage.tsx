import { useEffect, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  goToStep,
  reset,
  slotTaken,
  type BookingState,
} from '../../store/slices/bookingSlice';
import { useAnnounce } from '../../hooks/useAnnounce';
import { BookingStepper } from './BookingStepper';
import { wizardStepLabels } from './wizardSteps';
import { PickServiceStep } from './steps/PickServiceStep';
import { PickVetStep } from './steps/PickVetStep';
import { PickDateStep } from './steps/PickDateStep';
import { PickTimeStep } from './steps/PickTimeStep';
import { PickPetStep } from './steps/PickPetStep';
import { ConfirmStep } from './steps/ConfirmStep';

interface StepDefinition {
  Component: ComponentType;
  isReady: (state: BookingState) => boolean;
}

const stepDefinitions: StepDefinition[] = [
  { Component: PickServiceStep, isReady: (s) => Boolean(s.serviceId) },
  { Component: PickVetStep, isReady: (s) => Boolean(s.vetId) },
  { Component: PickDateStep, isReady: (s) => Boolean(s.date) },
  { Component: PickTimeStep, isReady: (s) => Boolean(s.slotId) },
  { Component: PickPetStep, isReady: (s) => Boolean(s.petId) },
  { Component: ConfirmStep, isReady: () => true },
];

export function BookingPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const announce = useAnnounce();
  const booking = useAppSelector((state) => state.booking);
  const { step, submissionStatus, error } = booking;
  const current = stepDefinitions[step - 1];
  const canAdvance = current.isReady(booking);
  const isLastStep = step === stepDefinitions.length;
  const StepComponent = current.Component;

  useEffect(() => {
    const heading = document.querySelector<HTMLElement>('[data-wizard-step-heading]');
    heading?.focus();
  }, [step]);

  useEffect(() => {
    if (submissionStatus === 'succeeded') {
      announce('Appointment booked.');
      dispatch(reset());
      navigate('/appointments');
    }
  }, [submissionStatus, announce, dispatch, navigate]);

  useEffect(() => {
    if (submissionStatus === 'failed' && error?.status === 409) {
      announce('That time was just taken. Please pick another.', 'assertive');
      dispatch(slotTaken());
    }
  }, [submissionStatus, error, announce, dispatch]);

  const handleBack = () => {
    if (step > 1) {
      dispatch(goToStep(step - 1));
    }
  };

  const handleNext = () => {
    if (canAdvance && !isLastStep) {
      dispatch(goToStep(step + 1));
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Typography variant="h4" component="h1" tabIndex={-1} sx={{ mb: 3 }}>
        Book an appointment
      </Typography>
      <BookingStepper activeStep={step} />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2 }}
        aria-live="polite"
      >
        Step {step} of {stepDefinitions.length}: {wizardStepLabels[step - 1]}
      </Typography>
      <StepComponent />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
        <Button onClick={handleBack} disabled={step === 1}>
          Back
        </Button>
        {!isLastStep && (
          <Button onClick={handleNext} variant="contained" disabled={!canAdvance}>
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
}
