import { describe, expect, it, vi } from 'vitest';
import { axe } from 'jest-axe';
import { renderWithProviders } from '../test/renderWithProviders';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog a11y', () => {
  it('has no axe violations when open', async () => {
    const { baseElement } = renderWithProviders(
      <ConfirmDialog
        open
        title="Delete pet"
        message="Remove Rex from your pets? This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const results = await axe(baseElement);
    expect(results).toHaveNoViolations();
  });
});
