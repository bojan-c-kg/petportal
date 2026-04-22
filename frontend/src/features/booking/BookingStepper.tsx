import { Step, StepLabel, Stepper } from '@mui/material';
import { wizardStepLabels } from './wizardSteps';

interface BookingStepperProps {
  activeStep: number;
}

export function BookingStepper({ activeStep }: BookingStepperProps) {
  return (
    <Stepper
      component="div"
      activeStep={activeStep - 1}
      alternativeLabel
      sx={{ mb: 4, overflowX: 'auto' }}
    >
      {wizardStepLabels.map((label) => (
        <Step component="div" key={label}>
          <StepLabel
            sx={{
              '& .MuiStepLabel-label': {
                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                whiteSpace: 'nowrap',
              },
            }}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
