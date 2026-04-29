import { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Building2, Calendar, LogOut, Menu, X, Settings, NotebookText, Users, FileImage } from 'lucide-react';
import { Button } from '../ui/button';
import axios from 'axios';
import { resolveAppBaseUrl } from '../../lib/apiBaseUrl';
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = async () => {
    try {
      const rootURL = resolveAppBaseUrl();
      const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
      await axios.delete(`${rootURL}/admin/sign_out`, {
        withCredentials: true,
        headers: token ? { 'X-CSRF-Token': token } : undefined,
      });
      window.location.href = '/admin/sign_in';
    } catch (error) {
      console.error('Error logging out admin user:', error);
      navigate('/admin/sign_out');
    }
  };
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: NotebookText, label: 'Blogs', path: '/admin/blogs' },
    { icon: Building2, label: 'Homestays', path: '/admin/homestays' },
    { icon: Calendar, label: 'Bookings', path: '/admin/bookings' },
    { icon: Users, label: 'Host Profile', path: '/admin/host-profile' },
    { icon: FileImage, label: 'Site Content', path: '/admin/site-content' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];
  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64 bg-card border-r border-border flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <h2 className="text-lg font-bold text-primary tracking-tight">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      {/* Main Content */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">
              {menuItems.find((m) => isActive(m.path))?.label || 'Admin'}
            </h1>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
