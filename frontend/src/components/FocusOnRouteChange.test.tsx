import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { render, act } from '@testing-library/react';
import { FocusOnRouteChange } from './FocusOnRouteChange';

function Layout() {
  return (
    <main id="main" tabIndex={-1}>
      <FocusOnRouteChange />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/other" element={<Other />} />
      </Routes>
    </main>
  );
}

function Home() {
  const navigate = useNavigate();
  return (
    <div>
      <h1 tabIndex={-1}>Home heading</h1>
      <button type="button" onClick={() => navigate('/other')}>
        Go
      </button>
    </div>
  );
}

function Other() {
  return <h1 tabIndex={-1}>Other heading</h1>;
}

describe('FocusOnRouteChange', () => {
  it('focuses the main heading on initial mount', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Layout />
      </MemoryRouter>,
    );
    expect(document.activeElement?.textContent).toBe('Home heading');
  });

  it('moves focus to the new route heading after navigation', () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={['/']}>
        <Layout />
      </MemoryRouter>,
    );
    const button = getByRole('button', { name: /go/i });
    act(() => {
      button.click();
    });
    expect(document.activeElement?.textContent).toBe('Other heading');
  });

  it('falls back to the main element when there is no h1', () => {
    function NoHeadingLayout() {
      return (
        <main id="main" tabIndex={-1} data-testid="main">
          <FocusOnRouteChange />
          <p>No heading here.</p>
        </main>
      );
    }
    const { getByTestId } = render(
      <MemoryRouter>
        <NoHeadingLayout />
      </MemoryRouter>,
    );
    expect(document.activeElement).toBe(getByTestId('main'));
  });
});
