import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner@2.0.3";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WhatsAppFloat from "./components/WhatsAppFloat";
import PropertyDetailPage from "./components/PropertyDetailPage";
import BlogDetailPage from "./components/BlogDetailPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import BookingList from "./components/admin/BookingList";
import BlogForm from "./components/admin/BlogForm";
import BlogList from "./components/admin/BlogList";
import HomestayForm from "./components/admin/HomestayForm";
import HomestayList from "./components/admin/HomestayList";
import AdminAuthGuard from "./components/admin/AdminAuthGuard";
import SettingsPage from "./components/admin/SettingsPage";
import { SiteSettingsProvider } from "./components/SiteSettingsProvider";
import SeoManager from "./components/SeoManager";

export default function App() {
  return (
    <SiteSettingsProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SeoManager />
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Index />} />
          <Route path="/homestays" element={<Index />} />
          <Route path="/bookings" element={<Index />} />
          <Route path="/blogs/:id" element={<BlogDetailPage />} />
          <Route path="/properties/:slug" element={<PropertyDetailPage />} />
          <Route path="/properties/:slug" element={<PropertyDetailPage />} />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <AdminAuthGuard>
                <AdminLayout />
              </AdminAuthGuard>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="blogs" element={<BlogList />} />
            <Route path="blogs/new" element={<BlogForm />} />
            <Route path="blogs/:id/edit" element={<BlogForm />} />
            <Route path="homestays" element={<HomestayList />} />
            <Route path="homestays/new" element={<HomestayForm />} />
            <Route path="homestays/:id/edit" element={<HomestayForm />} />
            <Route path="bookings" element={<BookingList />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* 404 ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <WhatsAppFloat />
      <Toaster position="top-right" richColors />
    </SiteSettingsProvider>
  );
}
