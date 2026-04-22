import { describe, expect, it, vi } from 'vitest';
import { axe } from 'jest-axe';
import { waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/renderWithProviders';
import { PetsListPage } from './PetsListPage';
import { apiClient } from '../../api/client';

vi.mock('../../api/client', () => {
  return {
    apiClient: {
      get: vi.fn(() => Promise.resolve({ data: [] })),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe('PetsListPage a11y', () => {
  it('has no axe violations on empty state', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] } as never);
    const { container, findByText } = renderWithProviders(<PetsListPage />, {
      route: '/pets',
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
    await findByText(/No pets yet/i);
    await waitFor(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
