import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { Icon } from './Icon';

describe('Icon', () => {
  it('renders a decorative icon with aria-hidden="true" and no aria-label', () => {
    const { container } = render(<Icon icon={faCheck} decorative />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('aria-label')).toBeNull();
  });

  it('renders a labelled icon with role="img" and the given aria-label', () => {
    const { container } = render(<Icon icon={faCheck} label="Selected time" />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-label')).toBe('Selected time');
    expect(svg?.getAttribute('role')).toBe('img');
  });
});
