import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import csiLogo from '../../assets/csi_logo.jpg';

const navLinks = [
  { name: 'Home', path: '/' },
  {
    name: 'About Us',
    path: '/about',
    dropdown: [
      { name: 'Our Leaders', path: '/leadership' },
      { name: 'Who We Are', path: '/about' },
      { name: 'Heritage', path: '/heritage' },
    ],
  },
  { name: 'Services', path: '/services' },
  { name: 'Choir Registration', path: '/choir-registration' },
  { name: 'Events', path: '/events' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Contact', path: '/contact' },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const location = useLocation();

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenMobileDropdown(null);
  }, [location]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-md py-3"
      >
        <div className="container mx-auto pl-6 pr-8 sm:pl-6 sm:pr-8 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center group shrink-0">
              <div className="relative overflow-hidden rounded-full w-10 h-10 transition-all duration-300">
                <img
                  src={csiLogo}
                  alt="Board containing CSI Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = 'dropdown' in link
                  ? (link.dropdown as { path: string }[]).some((d) => d.path === location.pathname)
                  : location.pathname === link.path;
                if ('dropdown' in link && link.dropdown) {
                  return (
                    <div
                      key={link.path}
                      className="relative group"
                    >
                      <Link
                        to={link.path}
                        className={`relative flex items-center gap-1 px-4 py-2 font-sans text-sm font-medium transition-all duration-300 rounded-full ${isActive
                          ? 'text-primary bg-primary-foreground/20 text-primary-foreground'
                          : 'text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10'
                          }`}
                      >
                        {link.name}
                        <ChevronDown size={16} className="opacity-80 group-hover:rotate-180 transition-transform duration-200" />
                      </Link>
                      <div className="absolute top-full left-0 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="bg-card border border-border rounded-xl shadow-lg py-1 min-w-[180px]">
                          {(link.dropdown as { name: string; path: string; badge?: string; state?: Record<string, string> }[]).map((item) => (
                            <Link
                              key={`${item.path}-${item.name}`}
                              to={item.path}
                              state={item.state}
                              className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-muted rounded-lg mx-1 ${location.pathname === item.path ? 'text-primary bg-primary/10' : 'text-foreground'}`}
                            >
                              {item.name}
                              {item.badge && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">New</span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 py-2 font-sans text-sm font-medium transition-all duration-300 rounded-full ${location.pathname === link.path
                      ? 'text-primary bg-primary-foreground/20 text-primary-foreground'
                      : 'text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10'
                      }`}
                  >
                    {link.name}
                    {location.pathname === link.path && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-foreground"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden shrink-0 p-2.5 rounded-full text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute top-20 left-4 right-4 bg-card rounded-2xl shadow-medium p-6 border border-border"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link, index) => {
                  if ('dropdown' in link && link.dropdown) {
                    const isOpen = openMobileDropdown === link.path;
                    const isActive = (link.dropdown as { path: string }[]).some((d) => d.path === location.pathname);
                    return (
                      <motion.div
                        key={link.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                        className="flex flex-col gap-1"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenMobileDropdown(isOpen ? null : link.path)}
                          className={`flex items-center justify-between w-full px-4 py-3 font-sans text-base font-medium rounded-xl transition-all duration-300 text-left ${isActive
                            ? 'text-primary bg-primary/10'
                            : 'text-foreground hover:text-primary hover:bg-muted'
                            }`}
                        >
                          {link.name}
                          <ChevronDown
                            size={20}
                            className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-4 pb-1 flex flex-col gap-0.5 border-l-2 border-border/50 ml-4">
                                {(link.dropdown as { name: string; path: string; badge?: string; state?: Record<string, string> }[]).map((item, i) => (
                                  <Link
                                    key={`${item.path}-${item.name}`}
                                    to={item.path}
                                    state={item.state}
                                    className={`block px-3 py-2.5 font-sans text-sm font-medium rounded-lg transition-all duration-300 ${location.pathname === item.path
                                      ? 'text-primary bg-primary/10'
                                      : 'text-foreground hover:text-primary hover:bg-muted'
                                      }`}
                                  >
                                    {item.name}
                                    {'badge' in item && item.badge && (
                                      <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">New</span>
                                    )}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  }
                  return (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.2 }}
                    >
                      <Link
                        to={link.path}
                        className={`block px-4 py-3 font-sans text-base font-medium rounded-xl transition-all duration-300 ${location.pathname === link.path
                          ? 'text-primary bg-primary/10'
                          : 'text-foreground hover:text-primary hover:bg-muted'
                          }`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
