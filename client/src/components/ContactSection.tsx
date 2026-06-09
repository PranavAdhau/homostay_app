import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import AnimatedSection from './AnimatedSection';
import { useSiteSettings } from "./SiteSettingsProvider";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { settings, loading } = useSiteSettings();

  const fallbackSettings = {
    phone: "+919743340477",
    email: "pranavadhau2003@gmail.com",
    address: "Varanasi, India",
  };
  const resolvedSettings = settings ?? fallbackSettings;

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      value: resolvedSettings.phone,
      subValues: null as string[] | null,
      action: "tel:" + resolvedSettings.phone.replace(/[^\d+]/g, ''),
    },
    {
      icon: Mail,
      title: "Email",
      value: resolvedSettings.email,
      subValues: null as string[] | null,
      action: "mailto:" + resolvedSettings.email,
    },
    {
      icon: MapPin,
      title: "Location",
      value: resolvedSettings.address || fallbackSettings.address,
      subValues: null as string[] | null,
      action: null,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isFormValid = !!(formData.name.trim() && formData.email.trim() && formData.message.trim());

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="pt-16 pb-28 sm:py-20 bg-white"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        <AnimatedSection className="text-center mb-10 sm:mb-12">
          <motion.h2
            id="contact-title"
            className="text-3xl sm:text-4xl mb-3 text-[#173A39]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Get in <span className="text-[#1F8A84]">Touch</span>
          </motion.h2>
          <motion.p
            className="text-sm sm:text-base text-[#4F5F5B] max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Have questions about our Varanasi homestays? We typically respond within a few hours.
          </motion.p>
        </AnimatedSection>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 gap-5 sm:gap-6 lg:gap-0 lg:grid-cols-[2fr_3fr]"
        >

          {/* ── Left / Top panel (teal) ── */}
          <div className="relative bg-[#1F8A84] overflow-hidden rounded-2xl border border-[#E8EFEA] shadow-[0_4px_32px_rgba(0,0,0,0.07)] lg:rounded-r-none lg:border-r-0">
            <div className="relative z-10 px-6 py-7 sm:px-8 sm:py-10">

              <h3 className="text-base sm:text-[1.05rem] font-semibold text-white">
                Contact Information
              </h3>
              <p className="mt-2 text-[12.5px] leading-relaxed text-white/60">
                Reach out anytime — we're happy to help.
              </p>

              {loading && (
                <p className="mt-2 text-[11px] text-white/40">Loading…</p>
              )}

              {/* Always single-column list — no cramped 2-col on mobile */}
              <address className="not-italic mt-6 space-y-4">
                {contactInfo.map((info, i) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.1 + i * 0.06 }}
                    className="flex items-start gap-3.5"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <info.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.11em] text-white/45 mb-0.5">
                        {info.title}
                      </p>
                      {info.subValues ? (
                        <div>
                          {info.subValues.map((sv, j) => (
                            <p key={j} className="text-[13px] text-white/85 leading-snug">{sv}</p>
                          ))}
                        </div>
                      ) : info.action ? (
                        <a
                          href={info.action}
                          className="text-[13px] text-white/85 hover:text-white transition-colors leading-snug"
                          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-[13px] text-white/85 leading-snug">{info.value}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </address>
            </div>

            {/* Decorative circles — visible on desktop, subtle on mobile */}
            <div className="hidden sm:block absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/5 pointer-events-none" />
            <div className="hidden sm:block absolute bottom-4 right-4 h-14 w-14 rounded-full bg-white/8 pointer-events-none" />
          </div>

          {/* ── Right / Bottom panel (form) ── */}
          <div className="bg-white px-6 py-7 sm:px-8 sm:py-10 rounded-2xl border border-[#E8EFEA] shadow-[0_4px_32px_rgba(0,0,0,0.07)] lg:rounded-l-none lg:border-l-0">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1F8A84]/10">
                <Send className="h-3 w-3 text-[#1F8A84]" />
              </div>
              <h3 className="text-[0.95rem] font-semibold text-[#173A39]">
                Send us a Message
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-[12.5px] font-medium text-[#2E3F3B]">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1.5"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-[12.5px] font-medium text-[#2E3F3B]">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1.5"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-[12.5px] font-medium text-[#2E3F3B]">
                  Phone
                  <span className="ml-1 text-[11px] font-normal text-[#96A89E]">(optional)</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1.5"
                  placeholder="+91 00000 00000"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-[12.5px] font-medium text-[#2E3F3B]">
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="mt-1.5 min-h-[110px] resize-none"
                  placeholder="Tell us about your inquiry or booking requirements…"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!isFormValid}
                className="w-full h-12 rounded-lg flex items-center justify-center gap-2 text-[14px] font-medium text-white transition-opacity duration-200"
                style={{
                  backgroundColor: '#1F8A84',
                  opacity: isFormValid ? 1 : 0.45,
                  cursor: isFormValid ? 'pointer' : 'not-allowed',
                }}
              >
                <Send className="h-3.5 w-3.5" />
                Send Message
              </button>
            </form>
          </div>

        </motion.div>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white rounded-2xl p-8 shadow-2xl text-center w-full max-w-sm"
            >
              <CheckCircle className="h-12 w-12 text-[#1F8A84] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#173A39] mb-2">Message Sent!</h3>
              <p className="text-[13.5px] text-[#4F5F5B] leading-relaxed">
                Thank you for reaching out. We'll get back to you within a few hours.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
