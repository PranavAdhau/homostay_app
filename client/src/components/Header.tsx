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
      className="sticky top-0 z-50 border-b border-[#E8EFEC] bg-white/80 backdrop-blur-md"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">

        {/*
          ── LAYOUT STRATEGY ──────────────────────────────────────────────
          Mobile  (<md): simple flex row — logo left, controls right.
          Desktop (≥md): CSS grid with 3 equal-flex columns:
            [logo]  [nav - centred]  [CTA - right-aligned]
          Grid ensures nav is always geometrically centred between logo
          and CTA regardless of their individual widths. justify-between
          was the root cause of the off-centre nav and floating CTA gap.

          Bar + logo height scale (bar = logo + 20px vertical breathing):
            mobile  : logo 44px → bar 64px  (h-16)
            md      : logo 44px → bar 64px  (h-16)
            lg      : logo 52px → bar 72px  (h-[72px])
            xl      : logo 56px → bar 76px  (h-[76px])
          ─────────────────────────────────────────────────────────────────
        */}
        <div
          className="
            flex h-14 items-center justify-between
            md:grid md:h-15 md:grid-cols-[auto_1fr_auto] md:items-center
            lg:h-[64px]
            xl:h-[68px]
          "
        >

          {/* ── COL 1 : Logo ── */}
          <motion.div
            className="shrink-0"
            whileHover={{ opacity: 0.85 }}
            transition={{ duration: 0.15 }}
          >
            <button
              aria-label="Go to home section"
              onClick={() => handleScrollNav('home')}
              className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A84] focus-visible:ring-offset-2"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {didLogoError ? (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1F8A84] text-sm font-semibold text-white lg:h-[52px] lg:w-[52px] xl:h-14 xl:w-14">
                  SH
                </span>
              ) : (
                /*
                  Logo sizes chosen so the SVG's internal brand text ("SACRED HOMES")
                  is legible at every breakpoint — the logo asset includes both the
                  icon mark AND the wordmark, so it needs to be tall enough to read.

                  mobile/md : 44px — clear, not dominating the compact bar
                  lg        : 52px — premium feel on laptop / 1024–1279px
                  xl        : 56px — fills the 76px bar proportionally on desktop+
                */
                <img
                  src={sacredHomesLogo}
                  alt="Sacred Homes"
                  className="h-11 w-auto shrink-0 lg:h-[56px] xl:h-[60px]"
                  style={{ display: 'block' }}
                  onError={() => setDidLogoError(true)}
                />
              )}
            </button>
          </motion.div>

          {/* ── COL 2 : Desktop nav — centred inside its grid cell ── */}
          <nav
            className="hidden items-center justify-center gap-1 md:flex"
            aria-label="Main navigation"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.id}
                className="relative"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
              >
                <button
                  onClick={() => handleItemClick(item)}
                  className="group relative flex h-9 items-center rounded-md px-3 text-sm font-medium text-[#4F5F5B] transition-colors duration-150 hover:text-[#1F8A84] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A84] focus-visible:ring-offset-2 lg:px-4 lg:text-[0.9375rem]"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {item.label}
                  <motion.span
                    className="absolute bottom-0.5 left-3 right-3 h-px rounded-full bg-[#1F8A84] lg:left-4 lg:right-4"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.18 }}
                  />
                </button>
              </motion.div>
            ))}
          </nav>

          {/* ── COL 3 : Desktop CTA — right-aligned inside its grid cell ── */}
          <div className="hidden items-center justify-end md:flex">
            {settings?.phone ? (
              <motion.a
                href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                className="flex h-9 items-center gap-2 rounded-full border border-[#DDEBE8] bg-white px-4 text-sm font-medium text-[#1F8A84] transition-colors duration-150 hover:bg-[#F4FAF9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A84] focus-visible:ring-offset-2"
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
              >
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Call Now</span>
              </motion.a>
            ) : (
              /* Invisible spacer keeps grid balanced even without a phone number */
              <div className="h-9 w-[104px]" aria-hidden="true" />
            )}
          </div>

          {/* ── Mobile controls (logo is col-1 above, this is the right side) ── */}
          <div className="flex items-center gap-2 md:hidden">
            {settings?.phone ? (
              <motion.a
                href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                aria-label={`Call ${settings.phone}`}
                className="flex h-9 items-center gap-1.5 rounded-full border border-[#DDEBE8] bg-white px-3 text-sm font-medium text-[#1F8A84] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A84] focus-visible:ring-offset-2"
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
              >
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {/* Always show "Call" — even on 320px the word fits next to the icon */}
                <span>Call</span>
              </motion.a>
            ) : null}

            <motion.button
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-[#4F5F5B] transition-colors hover:bg-[#F4FAF9] hover:text-[#1F8A84] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A84] focus-visible:ring-offset-2"
              whileTap={{ scale: 0.92 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMenuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center justify-center"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center justify-center"
                  >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

        </div>{/* end main row */}

        {/* ── Mobile drawer ── */}
        <AnimatePresence initial={false}>
          {isMenuOpen && (
            <motion.nav
              id="mobile-menu"
              aria-label="Mobile navigation"
              className="overflow-hidden md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex flex-col pb-3 pt-1">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ x: -12, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.06, duration: 0.22 }}
                  >
                    <button
                      onClick={() => handleItemClick(item)}
                      style={{ background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', font: 'inherit', width: '100%', textAlign: 'left', padding: '10px 0' }}
                      className="w-full text-sm font-medium text-[#4F5F5B] transition-colors hover:text-[#1F8A84] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A84] focus-visible:ring-offset-2"
                    >
                      {item.label}
                    </button>
                  </motion.div>
                ))}

                {settings?.phone ? (
                  <motion.div
                    className="pt-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: menuItems.length * 0.06 + 0.05 }}
                  >
                    <a
                      href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[#DDEBE8] bg-white px-4 py-2 text-sm font-medium text-[#1F8A84] transition-colors hover:bg-[#F4FAF9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F8A84] focus-visible:ring-offset-2"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
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
