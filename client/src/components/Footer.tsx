import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Instagram } from 'lucide-react';
import { useSiteSettings } from "./SiteSettingsProvider";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSiteSettings();

  const socialLinks = [
    settings && {
      icon: Instagram,
      href: settings.instagram,
      label: "Instagram",
    },
  ].filter(Boolean) as Array<{ icon: typeof Instagram; href: string; label: string }>;

  // Section scroll links — same sections as Header
  const quickLinks = [
    { type: 'scroll', id: 'home',      label: 'Home' },
    { type: 'scroll', id: 'homestays', label: 'Homestays' },
    { type: 'scroll', id: 'booking',   label: 'Booking' },
    { type: 'scroll', id: 'reviews',   label: 'Reviews' },
    { type: 'scroll', id: 'contact',   label: 'Contact' },
  ];

  const handleItemClick = (item: any) => {
    if (item.type === 'route') {
      navigate(item.path);
      window.scrollTo(0, 0);
    } else {
      handleScrollNav(item.id);
    }
  };

  // Smooth-scroll to a section id; if not on home page, navigate home first then scroll
  const handleScrollNav = (id: string) => {
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
      setTimeout(doScroll, 100);
    }
  };

  return (
    <footer className="bg-[#173A39] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h3
              className="text-xl mb-4 text-[#F4EBD7]"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Sacred Homes
            </motion.h3>
            <p className="text-[#F8F8F8] mb-4 text-sm leading-relaxed">
              Sacred Homes offers cozy, thoughtfully designed stays so you can relax and feel at home.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-[#D4DDD5] transition-colors hover:text-[#F4EBD7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4EBD7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#173A39]"
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links — smooth scroll buttons, all motion preserved */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={link.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <button
                      onClick={() => handleItemClick(link)}
                      className="min-h-11 rounded-md px-2 text-sm text-[#F8F8F8] transition-colors hover:text-[#F4EBD7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4EBD7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#173A39]"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit', textAlign: 'left' }}
                    >
                      {link.label}
                    </button>
                  </motion.div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg mb-4">Contact Us</h4>
            <div className="space-y-3">
              {settings && (
                <>
                  <motion.div
                    className="flex items-center space-x-3 text-sm"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Phone className="h-4 w-4 text-[#F4EBD7]" />
                    <span className="text-[#F8F8F8]">{settings.phone}</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-3 text-sm"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Mail className="h-4 w-4 text-[#F4EBD7]" />
                    <span className="text-[#F8F8F8]">{settings.email}</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-3 text-sm"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <MapPin className="h-4 w-4 text-[#F4EBD7]" />
                    <span className="text-[#F8F8F8]">
                      {settings.address || "Varanasi, Uttar Pradesh, India"}
                    </span>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-lg mb-4">Stay Updated</h4>
            <p className="text-[#F8F8F8] mb-4 text-sm">
              Subscribe to get special offers and updates about our homestays.
            </p>
            <form className="space-y-2" onSubmit={(event) => event.preventDefault()}>
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                placeholder="Your email"
                className="w-full min-h-11 rounded border border-[#A1B2A4] bg-[#264948] px-3 py-2 text-sm text-white focus:border-[#F4EBD7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4EBD7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#173A39]"
              />
              <motion.button
                type="submit"
                className="w-full min-h-11 rounded bg-[#1F8A84] px-3 py-2 text-sm text-white transition-colors hover:bg-[#264948] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4EBD7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#173A39]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                Subscribe
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-[#264948] mt-8 pt-8 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div
            className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <motion.p
              className="text-[#D4DDD5] text-sm"
              whileHover={{ color: "#F4EBD7" }}
              transition={{ duration: 0.3 }}
            >
              © Sacred Homes Varanasi
            </motion.p>
            <motion.div
              className="flex space-x-6 text-sm"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Privacy/Terms are real routes, not scroll sections */}
                <Link
                  to="/privacy"
                  className="min-h-11 rounded-md px-2 text-[#D4DDD5] transition-colors hover:text-[#F4EBD7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4EBD7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#173A39]"
                  style={{ textDecoration: 'none' }}
                >
                  Privacy Policy
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link
                  to="/terms"
                  className="min-h-11 rounded-md px-2 text-[#D4DDD5] transition-colors hover:text-[#F4EBD7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4EBD7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#173A39]"
                  style={{ textDecoration: 'none' }}
                >
                  Terms of Service
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
