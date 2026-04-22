import { describe, expect, it, vi } from 'vitest';
import { axe } from 'jest-axe';
import { waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/renderWithProviders';
import { AppointmentsPage } from './AppointmentsPage';
import { apiClient } from '../../api/client';

vi.mock('../../api/client', () => ({
  apiClient: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('AppointmentsPage a11y', () => {
  it('has no axe violations on empty state', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [] } as never);
    const { container, findByText } = renderWithProviders(<AppointmentsPage />, {
      route: '/appointments',
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
    await findByText(/No upcoming appointments/i);
    await waitFor(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
