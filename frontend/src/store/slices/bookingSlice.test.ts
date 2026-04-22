import { describe, expect, it } from 'vitest';
import bookingReducer, {
  clearError,
  goToStep,
  initialBookingState,
  reset,
  setDate,
  setPet,
  setService,
  setSlot,
  setVet,
  slotTaken,
  submitBooking,
  type BookingState,
} from './bookingSlice';

const populated: BookingState = {
  step: 5,
  serviceId: 'svc-1',
  vetId: 'vet-1',
  date: '2026-05-01',
  slotId: 'slot-1',
  petId: 'pet-1',
  submissionStatus: 'idle',
  error: null,
};

describe('bookingSlice clear-downstream invariant', () => {
  it('setService clears vetId, date, slotId, and petId', () => {
    const next = bookingReducer(populated, setService('svc-2'));
    expect(next.serviceId).toBe('svc-2');
    expect(next.vetId).toBeNull();
    expect(next.date).toBeNull();
    expect(next.slotId).toBeNull();
    expect(next.petId).toBeNull();
  });

  it('setVet after a date is picked clears date, slotId, and petId', () => {
    const next = bookingReducer(populated, setVet('vet-2'));
    expect(next.vetId).toBe('vet-2');
    expect(next.serviceId).toBe('svc-1');
    expect(next.date).toBeNull();
    expect(next.slotId).toBeNull();
    expect(next.petId).toBeNull();
  });

  it('setDate clears slotId and petId, preserves service and vet', () => {
    const next = bookingReducer(populated, setDate('2026-05-02'));
    expect(next.date).toBe('2026-05-02');
    expect(next.serviceId).toBe('svc-1');
    expect(next.vetId).toBe('vet-1');
    expect(next.slotId).toBeNull();
    expect(next.petId).toBeNull();
  });

  it('setSlot clears petId but preserves service/vet/date', () => {
    const next = bookingReducer(populated, setSlot('slot-2'));
    expect(next.slotId).toBe('slot-2');
    expect(next.serviceId).toBe('svc-1');
    expect(next.vetId).toBe('vet-1');
    expect(next.date).toBe('2026-05-01');
    expect(next.petId).toBeNull();
  });

  it('setPet preserves everything else', () => {
    const withoutPet: BookingState = { ...populated, petId: null };
    const next = bookingReducer(withoutPet, setPet('pet-2'));
    expect(next.petId).toBe('pet-2');
    expect(next.slotId).toBe('slot-1');
    expect(next.date).toBe('2026-05-01');
    expect(next.vetId).toBe('vet-1');
    expect(next.serviceId).toBe('svc-1');
  });

  it('reset returns the initial state', () => {
    const next = bookingReducer(populated, reset());
    expect(next).toEqual(initialBookingState);
  });
});

describe('bookingSlice step and error actions', () => {
  it('goToStep sets the step number', () => {
    const next = bookingReducer(populated, goToStep(2));
    expect(next.step).toBe(2);
  });

  it('clearError resets only the error field', () => {
    const withError: BookingState = { ...populated, error: { message: 'oops' } };
    const next = bookingReducer(withError, clearError());
    expect(next.error).toBeNull();
    expect(next.serviceId).toBe('svc-1');
  });

  it('slotTaken clears slotId and petId, rewinds to step 4, resets status and error', () => {
    const failed: BookingState = {
      ...populated,
      submissionStatus: 'failed',
      error: { message: 'conflict', status: 409 },
    };
    const next = bookingReducer(failed, slotTaken());
    expect(next.slotId).toBeNull();
    expect(next.petId).toBeNull();
    expect(next.step).toBe(4);
    expect(next.submissionStatus).toBe('idle');
    expect(next.error).toBeNull();
    expect(next.serviceId).toBe('svc-1');
    expect(next.vetId).toBe('vet-1');
    expect(next.date).toBe('2026-05-01');
  });
});

describe('bookingSlice submitBooking transitions', () => {
  it('pending sets submissionStatus to submitting and clears error', () => {
    const failed: BookingState = {
      ...populated,
      submissionStatus: 'failed',
      error: { message: 'previous failure' },
    };
    const next = bookingReducer(failed, submitBooking.pending('req-1', undefined));
    expect(next.submissionStatus).toBe('submitting');
    expect(next.error).toBeNull();
  });

  it('fulfilled sets submissionStatus to succeeded', () => {
    const submitting: BookingState = { ...populated, submissionStatus: 'submitting' };
    const next = bookingReducer(
      submitting,
      submitBooking.fulfilled(
        {
          id: 'appt-1',
          petId: populated.petId!,
          petName: 'Rex',
          vetId: populated.vetId!,
          vetName: 'Anna Martinez',
          serviceId: populated.serviceId!,
          serviceName: 'Wellness Checkup',
          slotId: populated.slotId!,
          slotStartTime: '2026-05-01T10:00:00Z',
          slotEndTime: '2026-05-01T10:30:00Z',
          status: 'Booked',
          createdAt: '2026-04-22T10:00:00Z',
          invoiceNumber: 'INV-005',
        },
        'req-1',
      ),
    );
    expect(next.submissionStatus).toBe('succeeded');
    expect(next.error).toBeNull();
  });

  it('rejected with payload captures the error and marks failed', () => {
    const submitting: BookingState = { ...populated, submissionStatus: 'submitting' };
    const next = bookingReducer(
      submitting,
      submitBooking.rejected(null, 'req-1', undefined, {
        message: 'Slot taken',
        status: 409,
      }),
    );
    expect(next.submissionStatus).toBe('failed');
    expect(next.error?.message).toBe('Slot taken');
    expect(next.error?.status).toBe(409);
  });
});
