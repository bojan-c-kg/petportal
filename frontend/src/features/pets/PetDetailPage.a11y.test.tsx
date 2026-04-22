import { describe, expect, it, vi } from 'vitest';
import { axe } from 'jest-axe';
import { waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../test/renderWithProviders';
import { PetDetailPage } from './PetDetailPage';
import { apiClient } from '../../api/client';

vi.mock('../../api/client', () => ({
  apiClient: {
    get: vi.fn(() =>
      Promise.resolve({
        data: {
          id: 'p1',
          name: 'Rex',
          species: 'Dog',
          breed: 'Labrador',
          dateOfBirth: '2022-03-10',
          notes: 'Loves fetch.',
          vaccinations: [
            {
              id: 'v1',
              name: 'Rabies',
              dateAdministered: '2025-10-10T00:00:00Z',
              nextDueDate: null,
            },
          ],
          conditions: [
            { id: 'c1', name: 'Mild hip dysplasia', diagnosedDate: '2025-06-01', notes: null },
          ],
        },
      }),
    ),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('PetDetailPage a11y', () => {
  it('has no axe violations with vaccinations and conditions', async () => {
    const { container, findByText } = renderWithProviders(
      <Routes>
        <Route path="/pets/:id" element={<PetDetailPage />} />
      </Routes>,
      {
        route: '/pets/p1',
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
      },
    );
    await findByText('Rex');
    await waitFor(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    expect(vi.mocked(apiClient.get)).toHaveBeenCalled();
  });
});
