import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
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
import AdminAccess from "./pages/AdminAccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/** When hash is empty or "#", go to home so the app doesn't land on the wrong page after load/delay. */
function HashRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    const isEmptyHash = !hash || hash === "#";
    if (isEmptyHash) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return null;
}

const AppRoutes = () => (
  <>
    <HashRedirect />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/events" element={<Events />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/heritage" element={<Heritage />} />
      <Route path="/leadership" element={<Leadership />} />
      <Route path="/choir-registration" element={<ChoirRegistration />} />
      <Route path="/admin" element={<AdminAccess />} />
      <Route path="/admin/choir-registrations" element={<ChoirRegistrationsDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
