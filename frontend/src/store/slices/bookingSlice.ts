import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  createAppointment,
  type AppointmentDto,
  type CreateAppointmentPayload,
} from '../../api/endpoints';
import { normaliseError, type FieldErrors } from '../../api/errors';

export interface BookingError {
  message: string;
  fieldErrors?: FieldErrors;
  status?: number;
}

export type SubmissionStatus = 'idle' | 'submitting' | 'succeeded' | 'failed';

export interface BookingState {
  step: number;
  serviceId: string | null;
  vetId: string | null;
  date: string | null;
  slotId: string | null;
  petId: string | null;
  submissionStatus: SubmissionStatus;
  error: BookingError | null;
}

export const initialBookingState: BookingState = {
  step: 1,
  serviceId: null,
  vetId: null,
  date: null,
  slotId: null,
  petId: null,
  submissionStatus: 'idle',
  error: null,
};

export const submitBooking = createAsyncThunk<
  AppointmentDto,
  void,
  { state: { booking: BookingState }; rejectValue: BookingError }
>('booking/submit', async (_, { getState, rejectWithValue }) => {
  const { booking } = getState();
  if (!booking.serviceId || !booking.vetId || !booking.slotId || !booking.petId) {
    return rejectWithValue({ message: 'Booking is incomplete.' });
  }
  const payload: CreateAppointmentPayload = {
    petId: booking.petId,
    vetId: booking.vetId,
    serviceId: booking.serviceId,
    slotId: booking.slotId,
  };
  try {
    return await createAppointment(payload);
  } catch (error: unknown) {
    return rejectWithValue(normaliseError(error, 'Unable to create appointment.'));
  }
});

const bookingSlice = createSlice({
  name: 'booking',
  initialState: initialBookingState,
  reducers: {
    setService(state, action: PayloadAction<string>) {
      state.serviceId = action.payload;
      state.vetId = null;
      state.date = null;
      state.slotId = null;
      state.petId = null;
      state.error = null;
    },
    setVet(state, action: PayloadAction<string>) {
      state.vetId = action.payload;
      state.date = null;
      state.slotId = null;
      state.petId = null;
      state.error = null;
    },
    setDate(state, action: PayloadAction<string>) {
      state.date = action.payload;
      state.slotId = null;
      state.petId = null;
      state.error = null;
    },
    setSlot(state, action: PayloadAction<string>) {
      state.slotId = action.payload;
      state.petId = null;
      state.error = null;
    },
    setPet(state, action: PayloadAction<string>) {
      state.petId = action.payload;
      state.error = null;
    },
    goToStep(state, action: PayloadAction<number>) {
      state.step = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    reset() {
      return initialBookingState;
    },
    slotTaken(state) {
      state.slotId = null;
      state.petId = null;
      state.step = 4;
      state.submissionStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitBooking.pending, (state) => {
        state.submissionStatus = 'submitting';
        state.error = null;
      })
      .addCase(submitBooking.fulfilled, (state) => {
        state.submissionStatus = 'succeeded';
        state.error = null;
      })
      .addCase(submitBooking.rejected, (state, action) => {
        state.submissionStatus = 'failed';
        state.error = action.payload ?? { message: 'Booking failed.' };
      });
  },
});

export const {
  setService,
  setVet,
  setDate,
  setSlot,
  setPet,
  goToStep,
  clearError,
  reset,
  slotTaken,
} = bookingSlice.actions;
export default bookingSlice.reducer;
