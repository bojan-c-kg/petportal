import { TextField } from '@mui/material';
import { useFormContext } from 'react-hook-form';

interface FieldTextProps {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  helperText?: string;
}

export function FieldText({
  name,
  label,
  type = 'text',
  autoComplete,
  required = false,
  multiline = false,
  rows,
  helperText,
}: FieldTextProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const errorMessage = errors[name]?.message as string | undefined;
  const hasError = Boolean(errorMessage);
  const errorId = `${name}-error`;
  const helperId = helperText ? `${name}-helper` : undefined;
  const describedBy = [hasError ? errorId : null, helperId].filter(Boolean).join(' ') || undefined;
  const display = hasError ? errorMessage : helperText;

  return (
    <TextField
      id={name}
      label={label}
      type={type}
      autoComplete={autoComplete}
      required={required}
      multiline={multiline}
      rows={rows}
      fullWidth
      error={hasError}
      helperText={display}
      slotProps={{
        htmlInput: {
          'aria-required': required,
          'aria-invalid': hasError,
          'aria-describedby': describedBy,
        },
        formHelperText: { id: hasError ? errorId : helperId },
      }}
      {...register(name)}
    />
  );
}
