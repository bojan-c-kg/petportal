import { axe } from 'jest-axe';
import { renderWithProviders } from '../../test/renderWithProviders';
import { AccountPage } from './AccountPage';

describe('AccountPage a11y', () => {
  it('has no axe violations when authed', async () => {
    const { container } = renderWithProviders(<AccountPage />, {
      route: '/account',
      preloadedAuth: {
        user: {
          id: 'u1',
          email: 'test@example.com',
          firstName: 'Alex',
          lastName: 'Taylor',
          phone: '555-0100',
          address: '1 Test Lane',
        },
      },
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
