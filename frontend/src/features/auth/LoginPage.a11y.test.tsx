import { axe } from 'jest-axe';
import { renderWithProviders } from '../../test/renderWithProviders';
import { LoginPage } from './LoginPage';

describe('LoginPage a11y', () => {
  it('has no axe violations on initial render', async () => {
    const { container } = renderWithProviders(<LoginPage />, { route: '/login' });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
