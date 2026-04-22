import { describe, expect, it, vi } from 'vitest';
import { axe } from 'jest-axe';
import { waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/renderWithProviders';
import { BookingPage } from './BookingPage';

vi.mock('../../api/client', () => ({
  apiClient: {
    get: vi.fn(() =>
      Promise.resolve({
        data: [
          {
            id: 's1',
            name: 'Wellness Checkup',
            description: 'General exam',
            durationMinutes: 30,
            price: 55,
          },
        ],
      }),
    ),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('BookingPage a11y', () => {
  it('has no axe violations on the Pick Service step', async () => {
    const { container, findByText } = renderWithProviders(<BookingPage />, {
      route: '/book',
      preloadedAuth: {
        user: {
          id: 'u1',
          email: 'test@example.com',
          firstName: 'Alex',
          lastName: 'Taylor',
          phone: '555',
          address: 'Here',
        },
      },
    });
    await findByText('Wellness Checkup');
    await waitFor(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
