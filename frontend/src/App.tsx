import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { SkipLink } from './components/SkipLink';
import { AppHeader } from './components/AppHeader';
import { AppFooter } from './components/AppFooter';
import { FocusOnRouteChange } from './components/FocusOnRouteChange';
import { LiveSnackbar } from './components/LiveSnackbar';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchMe } from './store/slices/authSlice';

function App() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const isBooting = status === 'idle' || status === 'loading';

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchMe());
    }
  }, [dispatch, status]);

  return (
    <>
      <SkipLink />
      <AppHeader />
      <Box
        component="main"
        id="main"
        tabIndex={-1}
        aria-busy={isBooting}
        sx={{ flex: 1, outline: 'none', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}
      >
        <FocusOnRouteChange />
        {isBooting ? (
          <div role="status">
            <CircularProgress aria-hidden />
            <span>Loading…</span>
          </div>
        ) : (
          <Outlet />
        )}
      </Box>
      <AppFooter />
      <LiveSnackbar />
    </>
  );
}

export default App;
