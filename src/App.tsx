import { Component, type ErrorInfo, type ReactNode, useCallback, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Heritage from "./pages/Heritage";
import Leadership from "./pages/Leadership";
import ChoirRegistration from "./pages/ChoirRegistration";
import ChoirRegistrationsDashboard from "./pages/ChoirRegistrationsDashboard";
import EventsAdminPage from "./pages/EventsAdminPage";
import AdminHub from "./pages/AdminHub";
import NotFound from "./pages/NotFound";
import { normalizeLocationHashOnce } from "./hashBootstrap";

const queryClient = new QueryClient();

/** Surfaces render errors instead of a blank white screen. */
class RouteErrorBoundary extends Component<{ children: ReactNode }, { err: Error | null }> {
  state: { err: Error | null } = { err: null };

  static getDerivedStateFromError(e: Error) {
    return { err: e };
  }

  componentDidCatch(e: Error, info: ErrorInfo) {
    console.error(e, info.componentStack);
  }

  render() {
    if (this.state.err) {
      return (
        <div className="min-h-screen bg-background text-foreground p-8 font-sans max-w-2xl mx-auto">
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Open the browser developer console (F12) for the full stack trace.
          </p>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto whitespace-pre-wrap">
            {this.state.err.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * - Empty hash → #/ (home).
 * - Decode %2F… fragments.
 * - Ensure leading slash (#admin → #/admin).
 * - Strip trailing slash (#/admin/events/ → #/admin/events) so routes match.
 */
function HashRedirect() {
  const navigate = useNavigate();

  const syncFromHash = useCallback(() => {
    const before = window.location.hash;
    normalizeLocationHashOnce();
    const after = window.location.hash;
    if (after !== before) {
      let path = after.slice(1) || "/";
      path = path.replace(/\/{2,}/g, "/").toLowerCase();
      navigate(path.startsWith("/") ? path : `/${path}`, { replace: true });
      return;
    }
    if (!after || after === "#") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    syncFromHash();
  }, [syncFromHash]);

  useEffect(() => {
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [syncFromHash]);

  return null;
}

const AppRoutes = () => (
  <RouteErrorBoundary>
    <HashRedirect />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/events" element={<Events />} />
      <Route path="/create-event" element={<Navigate to="/admin/events" replace />} />
      <Route path="/create_event" element={<Navigate to="/admin/events" replace />} />
      <Route path="/createevent" element={<Navigate to="/admin/events" replace />} />
      <Route path="/addevent" element={<Navigate to="/admin/events" replace />} />
      <Route path="/events/create" element={<Navigate to="/admin/events" replace />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/heritage" element={<Heritage />} />
      <Route path="/leadership" element={<Leadership />} />
      <Route path="/choir-registration" element={<ChoirRegistration />} />
      <Route path="/admin" element={<AdminHub />} />
      <Route path="/admin/access" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/choir-registrations" element={<ChoirRegistrationsDashboard />} />
      <Route path="/admin/events" element={<EventsAdminPage />} />
      <Route path="/admin/cms" element={<Navigate to="/admin/events" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </RouteErrorBoundary>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppRoutes />
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
