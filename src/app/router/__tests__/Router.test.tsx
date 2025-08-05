import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Router } from '../Router';
import { AuthProvider } from '../../providers/AuthProvider';

// Mock all the page components
jest.mock('../../../features/auth/components/pages/PasswordPage', () => ({
  PasswordPage: () => <div>Password Page</div>
}));

jest.mock('../../../features/auth/components/pages/UserSelectionPage', () => ({
  UserSelectionPage: () => <div>User Selection Page</div>
}));

jest.mock('../../../features/auth/components/pages/RegionSelectionPage', () => ({
  RegionSelectionPage: () => <div>Region Selection Page</div>
}));

jest.mock('../../../features/auth/components/pages/DirectorLoginPage', () => ({
  DirectorLoginPage: () => <div>Director Login Page</div>
}));

jest.mock('../../../features/auth/components/pages/TeamSelectionPage', () => ({
  TeamSelectionPage: () => <div>Team Selection Page</div>
}));

jest.mock('../../../features/auth/components/pages/ChangePasswordPage', () => ({
  ChangePasswordPage: () => <div>Change Password Page</div>
}));

jest.mock('../../../features/dashboard/components', () => ({
  Dashboard: () => <div>Dashboard</div>
}));

// Mock AuthGuard
jest.mock('../guards/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

const renderWithRouter = (initialEntries: string[]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Router', () => {
  it('redirects / to /auth/region-selection', () => {
    renderWithRouter(['/']);
    expect(screen.getByText('Region Selection Page')).toBeInTheDocument();
  });

  it('redirects /auth to /auth/region-selection', () => {
    renderWithRouter(['/auth']);
    expect(screen.getByText('Region Selection Page')).toBeInTheDocument();
  });

  it('redirects /auth/login to /auth/region-selection', () => {
    renderWithRouter(['/auth/login']);
    expect(screen.getByText('Region Selection Page')).toBeInTheDocument();
  });

  it('renders region selection page correctly', () => {
    renderWithRouter(['/auth/region-selection']);
    expect(screen.getByText('Region Selection Page')).toBeInTheDocument();
  });

  it('renders director login page correctly', () => {
    renderWithRouter(['/auth/director-login']);
    expect(screen.getByText('Director Login Page')).toBeInTheDocument();
  });

  it('renders team selection page correctly', () => {
    renderWithRouter(['/auth/team-selection']);
    expect(screen.getByText('Team Selection Page')).toBeInTheDocument();
  });

  it('renders user selection page correctly', () => {
    renderWithRouter(['/auth/user-selection']);
    expect(screen.getByText('User Selection Page')).toBeInTheDocument();
  });

  it('renders password page correctly', () => {
    renderWithRouter(['/auth/password']);
    expect(screen.getByText('Password Page')).toBeInTheDocument();
  });

  it('renders change password page correctly', () => {
    renderWithRouter(['/auth/change-password']);
    expect(screen.getByText('Change Password Page')).toBeInTheDocument();
  });

  it('renders dashboard page correctly', () => {
    renderWithRouter(['/dashboard']);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders 404 page for unknown routes', () => {
    renderWithRouter(['/unknown-route']);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Trang không tìm thấy')).toBeInTheDocument();
  });
});
