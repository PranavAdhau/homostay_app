import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner@2.0.3";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
import WhatsAppFloat from "./components/WhatsAppFloat";
const PropertyDetailPage = lazy(() => import("./components/PropertyDetailPage"));
const BlogDetailPage = lazy(() => import("./components/BlogDetailPage"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const BookingList = lazy(() => import("./components/admin/BookingList"));
const BlogForm = lazy(() => import("./components/admin/BlogForm"));
const BlogList = lazy(() => import("./components/admin/BlogList"));
const HomestayForm = lazy(() => import("./components/admin/HomestayForm"));
const HomestayList = lazy(() => import("./components/admin/HomestayList"));
const HomestayCalendarPage = lazy(() => import("./components/admin/HomestayCalendarPage"));
const AdminAuthGuard = lazy(() => import("./components/admin/AdminAuthGuard"));
const SettingsPage = lazy(() => import("./components/admin/SettingsPage"));
import { SiteSettingsProvider } from "./components/SiteSettingsProvider";
import SeoManager from "./components/SeoManager";
import { ContentProvider } from "./components/ContentProvider";
const HostProfilePage = lazy(() => import("./components/admin/HostProfilePage"));
const SiteContentPage = lazy(() => import("./components/admin/SiteContentPage"));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7F6]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1F8A84] border-t-transparent mx-auto" />
        <p className="mt-4 text-[#4F5F5B]">Loading page...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SiteSettingsProvider>
      <ContentProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <SeoManager />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Index />} />
            <Route path="/homestays" element={<Index />} />
            <Route path="/bookings" element={<Index />} />
            <Route path="/varanasi-homestays" element={<Index />} />
            <Route path="/banaras-homestays" element={<Index />} />
            <Route path="/homestays-near-assi-ghat" element={<Index />} />
            <Route path="/homestays-near-kashi-vishwanath" element={<Index />} />
            <Route path="/homestays-near-dashashwamedh-ghat" element={<Index />} />
            <Route path="/family-homestays-varanasi" element={<Index />} />
            <Route path="/budget-homestays-banaras" element={<Index />} />
            <Route path="/blogs/:id" element={<BlogDetailPage />} />
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
              <Route path="homestays/:id/calendar" element={<HomestayCalendarPage />} />
              <Route path="bookings" element={<BookingList />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="host-profile" element={<HostProfilePage />} />
              <Route path="site-content" element={<SiteContentPage />} />
            </Route>

            {/* 404 ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <WhatsAppFloat />
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </ContentProvider>
    </SiteSettingsProvider>
  );
}
