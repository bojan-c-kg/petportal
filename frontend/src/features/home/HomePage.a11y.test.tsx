import { axe } from 'jest-axe';
import { renderWithProviders } from '../../test/renderWithProviders';
import { HomePage } from './HomePage';

describe('HomePage a11y', () => {
  it('has no axe violations when anonymous', async () => {
    const { container } = renderWithProviders(<HomePage />, { route: '/' });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations when authed', async () => {
    const { container } = renderWithProviders(<HomePage />, {
      route: '/',
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
