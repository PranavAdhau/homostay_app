import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Phone } from 'lucide-react';
import { useSiteSettings } from "./SiteSettingsProvider";
import sacredHomesLogo from "../assets/sacred-homes-logo-circle.svg";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [didLogoError, setDidLogoError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSiteSettings();

  const menuItems = [
    { type: 'scroll', id: 'home', label: 'Home' },
    { type: 'scroll', id: 'homestays', label: 'Homestays' },
    { type: 'scroll', id: 'booking', label: 'Booking' },
    { type: 'scroll', id: 'reviews', label: 'Reviews' },
    { type: 'scroll', id: 'contact', label: 'Contact' },
  ];

  const handleItemClick = (item: { type: string; id: string; label: string }) => {
    if (item.type === 'route') {
      setIsMenuOpen(false);
      navigate(item.id);
      window.scrollTo(0, 0);
      return;
    }

    handleScrollNav(item.id);
  };

  const handleScrollNav = (id: string) => {
    setIsMenuOpen(false);
    const hash = `#${id}`;

    const doScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (id === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    if (location.pathname !== '/') {
      navigate(`/${hash}`);
      setTimeout(doScroll, 100);
    } else {
      if (location.hash !== hash) {
        window.history.pushState(null, '', `/${hash}`);
      }
      setTimeout(doScroll, 300);
    }
  };

  return (
    <motion.header
      className="sticky top-0 bg-white/70 shadow-sm backdrop-blur-md"
      style={{ zIndex: 1000 }}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-7xl overflow-visible px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <motion.div
            className="shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <button
              aria-label="Go to home section"
              onClick={() => handleScrollNav('home')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div className="flex items-center gap-2">
                {didLogoError ? (
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F8A84] text-lg font-semibold text-white"
                    aria-hidden="true"
                  >
                    SH
                  </span>
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center lg:h-14 lg:w-14" aria-hidden="true">
                    <img
                      src={sacredHomesLogo}
                      alt="Sacred Homes logo"
                      className="h-full w-full object-contain"
                      onError={() => setDidLogoError(true)}
                    />
                  </span>
                )}
                <h1 className="text-xl font-semibold text-[#173A39] lg:text-2xl">
                  Sacred Homes
                </h1>
              </div>
            </button>
          </motion.div>

          <div className="hidden items-center gap-6 md:flex">
            <nav className="flex items-center gap-6">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="relative shrink-0"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button
                    onClick={() => handleItemClick(item)}
                    className="text-[#4F5F5B] transition-colors hover:text-[#1F8A84]"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', fontSize: '1rem' }}
                  >
                    {item.label}
                  </button>
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 w-full bg-[#1F8A84]"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              ))}
            </nav>

            {settings?.phone ? (
              <motion.a
                href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                className="hidden items-center gap-2 text-sm font-medium text-[#1F8A84] lg:flex"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Phone className="h-4 w-4" />
                <span>Call Now</span>
              </motion.a>
            ) : null}
          </div>

          <div className="flex items-center gap-4 md:hidden">
            {settings?.phone ? (
              <motion.a
                href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-1.5 text-sm font-medium text-[#1F8A84]"
                whileHover={{ scale: 1.05 }}
              >
                <Phone className="h-4 w-4" />
                <span>Call Now</span>
              </motion.a>
            ) : null}
            <motion.button
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              className="mt-4 pb-4 md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-4">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 10 }}
                  >
                    <button
                      onClick={() => handleItemClick(item)}
                      className="w-full border-b border-[#E5ECE6] py-2 text-left text-[#4F5F5B] transition-colors hover:text-[#1F8A84]"
                      style={{ background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', padding: '8px 0', font: 'inherit', fontSize: '1rem', width: '100%', textAlign: 'left' }}
                    >
                      {item.label}
                    </button>
                  </motion.div>
                ))}
                {settings?.phone ? (
                  <motion.div
                    className="pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <a href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center space-x-2 text-sm font-medium text-[#1F8A84]">
                      <Phone className="h-4 w-4" />
                      <span>Call Now</span>
                    </a>
                  </motion.div>
                ) : null}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
