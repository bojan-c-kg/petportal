import { axe } from 'jest-axe';
import { renderWithProviders } from '../../test/renderWithProviders';
import { SignupPage } from './SignupPage';

describe('SignupPage a11y', () => {
  it('has no axe violations on initial render', async () => {
    const { container } = renderWithProviders(<SignupPage />, { route: '/signup' });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
