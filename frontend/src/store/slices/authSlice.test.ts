import { describe, expect, it } from 'vitest';
import authReducer, {
  clear,
  clearError,
  fetchMe,
  login,
  logout,
  setUser,
  signup,
  updateMe,
  type AuthState,
  type AuthUser,
} from './authSlice';

const anonymousState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

const testUser: AuthUser = {
  id: 'u1',
  email: 'test@example.com',
  firstName: 'Alex',
  lastName: 'Taylor',
  phone: '555-0100',
  address: '1 Test Lane',
};

describe('authSlice synchronous reducers', () => {
  it('setUser populates the user and marks status succeeded', () => {
    const next = authReducer(anonymousState, setUser(testUser));
    expect(next.user).toEqual(testUser);
    expect(next.status).toBe('succeeded');
    expect(next.error).toBeNull();
  });

  it('clear wipes the user and resets status to succeeded (treated as anonymous)', () => {
    const logged: AuthState = { user: testUser, status: 'succeeded', error: null };
    const next = authReducer(logged, clear());
    expect(next.user).toBeNull();
    expect(next.status).toBe('succeeded');
  });

  it('clearError wipes only the error', () => {
    const withError: AuthState = {
      user: testUser,
      status: 'failed',
      error: { message: 'nope' },
    };
    const next = authReducer(withError, clearError());
    expect(next.error).toBeNull();
    expect(next.user).toEqual(testUser);
  });
});

describe('authSlice fetchMe transitions', () => {
  it('pending sets loading and clears error', () => {
    const withError: AuthState = { ...anonymousState, error: { message: 'old' } };
    const next = authReducer(withError, fetchMe.pending('req', undefined));
    expect(next.status).toBe('loading');
    expect(next.error).toBeNull();
  });

  it('fulfilled with a user populates user and marks succeeded', () => {
    const loading: AuthState = { ...anonymousState, status: 'loading' };
    const next = authReducer(loading, fetchMe.fulfilled(testUser, 'req'));
    expect(next.user).toEqual(testUser);
    expect(next.status).toBe('succeeded');
  });

  it('fulfilled with null leaves user anonymous but marks succeeded', () => {
    const loading: AuthState = { ...anonymousState, status: 'loading' };
    const next = authReducer(loading, fetchMe.fulfilled(null, 'req'));
    expect(next.user).toBeNull();
    expect(next.status).toBe('succeeded');
  });

  it('rejected with payload marks failed and records the error', () => {
    const loading: AuthState = { ...anonymousState, status: 'loading' };
    const next = authReducer(
      loading,
      fetchMe.rejected(null, 'req', undefined, { message: 'down' }),
    );
    expect(next.user).toBeNull();
    expect(next.status).toBe('failed');
    expect(next.error?.message).toBe('down');
  });
});

describe('authSlice login / signup / logout / updateMe', () => {
  it('login.fulfilled stores the user', () => {
    const next = authReducer(
      anonymousState,
      login.fulfilled(testUser, 'req', { email: testUser.email, password: 'x' }),
    );
    expect(next.user).toEqual(testUser);
    expect(next.status).toBe('succeeded');
  });

  it('login.rejected records the error and clears the user', () => {
    const logged: AuthState = { user: testUser, status: 'succeeded', error: null };
    const next = authReducer(
      logged,
      login.rejected(null, 'req', { email: testUser.email, password: 'x' }, {
        message: 'bad creds',
      }),
    );
    expect(next.user).toBeNull();
    expect(next.status).toBe('failed');
    expect(next.error?.message).toBe('bad creds');
  });

  it('signup.fulfilled stores the user', () => {
    const next = authReducer(
      anonymousState,
      signup.fulfilled(testUser, 'req', {
        email: testUser.email,
        password: 'Password123!',
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        phone: testUser.phone,
        address: testUser.address,
      }),
    );
    expect(next.user).toEqual(testUser);
  });

  it('logout.fulfilled clears the user', () => {
    const logged: AuthState = { user: testUser, status: 'succeeded', error: null };
    const next = authReducer(logged, logout.fulfilled(undefined, 'req'));
    expect(next.user).toBeNull();
    expect(next.status).toBe('succeeded');
  });

  it('updateMe.fulfilled replaces the user with the server-returned version', () => {
    const logged: AuthState = { user: testUser, status: 'succeeded', error: null };
    const updated: AuthUser = { ...testUser, phone: '555-9999', address: 'New address' };
    const next = authReducer(
      logged,
      updateMe.fulfilled(updated, 'req', { phone: updated.phone, address: updated.address }),
    );
    expect(next.user).toEqual(updated);
    expect(next.error).toBeNull();
  });

  it('updateMe.rejected keeps the user but records the error', () => {
    const logged: AuthState = { user: testUser, status: 'succeeded', error: null };
    const next = authReducer(
      logged,
      updateMe.rejected(
        null,
        'req',
        { phone: '555-9999', address: 'x' },
        { message: 'validation failed', fieldErrors: { phone: ['required'] } },
      ),
    );
    expect(next.user).toEqual(testUser);
    expect(next.error?.message).toBe('validation failed');
    expect(next.error?.fieldErrors?.phone).toEqual(['required']);
  });
});
