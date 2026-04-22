import { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Icon } from './Icon';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { useAnnounce } from '../hooks/useAnnounce';

interface NavItem {
  to: string;
  label: string;
}

export function AppHeader() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const announce = useAnnounce();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems: NavItem[] = user
    ? [
        { to: '/', label: 'Home' },
        { to: '/pets', label: 'My pets' },
        { to: '/book', label: 'Book' },
        { to: '/appointments', label: 'Appointments' },
        { to: '/account', label: 'Account' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/login', label: 'Log in' },
        { to: '/signup', label: 'Sign up' },
      ];

  const handleLogout = async () => {
    setDrawerOpen(false);
    await dispatch(logout());
    announce('You have been logged out.');
    navigate('/', { replace: true });
  };

  return (
    <AppBar position="static" component="header">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            color: 'inherit',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          PetPortal
        </Typography>

        <Box
          component="nav"
          aria-label="Primary"
          sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}
        >
          {navItems.map((item) => (
            <Button key={item.to} component={RouterLink} to={item.to} color="inherit">
              {item.label}
            </Button>
          ))}
          {user && (
            <Button onClick={handleLogout} color="inherit">
              Log out
            </Button>
          )}
        </Box>

        <IconButton
          aria-label="Open navigation menu"
          aria-controls="primary-drawer"
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen(true)}
          color="inherit"
          edge="end"
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <Icon icon={faBars} label="Open navigation menu" />
        </IconButton>
      </Toolbar>

      <Drawer
        id="primary-drawer"
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 260 } } }}
      >
        <Box component="nav" aria-label="Primary" sx={{ pt: 1 }}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.to} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.to}
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            {user && (
              <>
                <Divider />
                <ListItem disablePadding>
                  <ListItemButton onClick={handleLogout}>
                    <ListItemText primary="Log out" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
