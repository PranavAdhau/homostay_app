import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../lib/adminAxios';
interface AdminAuthGuardProps {
  children: ReactNode;
}
export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      setChecking(true);
      setErrorMessage(null);
      try {
        await api.get('/dashboard/stats');
        if (isMounted) {
          setAuthorized(true);
        }
      } catch (error: any) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          window.location.href = '/admin/sign_in';
        } else {
          console.error('Error checking admin authentication:', error);
          if (isMounted) {
            setAuthorized(false);
            setErrorMessage('Unable to verify admin access right now. Please try again.');
          }
        }
      } finally {
        if (isMounted) setChecking(false);
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, [location.pathname]);
  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Verifying access…</p>
        </div>
      </div>
    );
  }
  if (errorMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <div className="max-w-md w-full rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Admin access unavailable</h2>
          <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  if (!authorized) return null;
  return <>{children}</>;
}
