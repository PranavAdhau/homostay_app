import { motion } from 'motion/react';
import { Mail, Phone } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { useContent } from './ContentProvider';

export default function TeamSection() {
  const { hostProfile } = useContent();

  const hosts = [
    {
      name: hostProfile?.host_name,
      role: "Host · Sacred Homes Varanasi",
      image: hostProfile?.host_image_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80",
      bio: hostProfile?.host_bio,
      description: hostProfile?.host_description,
      contact: hostProfile?.host_contact,
      phone: hostProfile?.host_phone,
      badge: "SUPERHOST",
      badgeVariant: "filled",
    },
    {
      name: hostProfile?.co_host_name,
      role: "Co-Host · Sacred Homes Varanasi",
      image: hostProfile?.co_host_image_url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
      bio: hostProfile?.co_host_bio,
      description: hostProfile?.co_host_description,
      contact: hostProfile?.co_host_contact,
      phone: hostProfile?.co_host_phone,
      badge: "CO-HOST",
      badgeVariant: "outlined",
    },
  ].filter(h => h.name && (h.description || h.bio) && h.name.trim() !== "");

  if (hosts.length === 0) return null;

  return (
    <section id="hosts" aria-labelledby="hosts-heading" className="py-20 bg-white">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6">

        <AnimatedSection className="text-center mb-12">
          <motion.h2
            id="hosts-heading"
            className="text-4xl mb-3 text-[#173A39]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Meet Your <span className="text-[#1F8A84]">Hosts</span>
          </motion.h2>
          <motion.p
            className="text-base text-[#4F5F5B] max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            The people behind Sacred Homes — passionate locals who will make your Varanasi stay unforgettable.
          </motion.p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {hosts.map((host, i) => (
            <article
              key={host.name}
              className="bg-white border border-[#E8EFEA] rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 hover:border-[#B8D8C8] w-full"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex h-full w-full flex-col items-center"
              >
                <img
                  src={host.image}
                  alt={host.name}
                  loading="lazy"
                  className="h-[88px] w-[88px] rounded-full object-cover ring-2 ring-[#9FE1CB]"
                />

                <h3 className="mt-4 text-[1.05rem] font-semibold text-[#173A39]">
                  {host.name}
                </h3>

                <div className="mt-2.5 flex flex-col items-center gap-1.5">
                  {host.badgeVariant === "filled" ? (
                    <span className="rounded-full bg-[#E1F5EE] text-[#0F6E56] px-3 py-0.5 text-[10px] font-medium uppercase tracking-[0.07em]">
                      {host.badge}
                    </span>
                  ) : (
                    <span className="rounded-full border border-[#5DCAA5] text-[#0F6E56] px-3 py-0.5 text-[10px] font-medium uppercase tracking-[0.07em]">
                      {host.badge}
                    </span>
                  )}
                  <p className="text-[10.5px] font-medium text-[#96A89E] uppercase tracking-[0.09em]">
                    {host.role}
                  </p>
                </div>

                <p className="mt-3.5 text-[13px] leading-[1.65] text-[#4F5F5B] line-clamp-3 min-h-[3.6rem] flex-1">
                  {host.description || host.bio}
                </p>

                <div className="mt-4 pt-4 border-t border-[#F0F5F1] w-full flex items-center justify-center gap-4">
                  {host.phone && (
                    <a
                      href={"tel:" + host.phone}
                      className="inline-flex items-center gap-1.5 text-[12px] text-[#4F5F5B] hover:text-[#1F8A84] transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {host.phone}
                    </a>
                  )}
                  {host.contact && (
                    <a
                      href={"mailto:" + host.contact}
                      aria-label={"Email " + host.name}
                      className="inline-flex items-center gap-1.5 text-[12px] text-[#4F5F5B] hover:text-[#1F8A84] transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Send email
                    </a>
                  )}
                </div>

              </motion.div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
