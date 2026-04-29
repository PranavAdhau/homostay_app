import { motion } from 'motion/react';
import { Mail } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { useContent } from './ContentProvider';

export default function TeamSection() {
  const { hostProfile } = useContent();
  const hosts = [
    {
      name: hostProfile?.host_name,
      role: "Host · Sacred Homes Varanasi",
      image: hostProfile?.host_image_url,
      bio: hostProfile?.host_bio,
      contact: hostProfile?.host_contact,
      isSuperhost: true,
    },
    {
      name: hostProfile?.co_host_name,
      role: "Co-Host · Sacred Homes Varanasi",
      image: hostProfile?.co_host_image_url,
      bio: hostProfile?.co_host_bio,
      contact: hostProfile?.co_host_contact,
      isSuperhost: false,
    },
  ].filter(host => host.name && host.image && host.bio);

  if (hosts.length === 0) return null;

  return (
    <section id="hosts" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <AnimatedSection className="text-center mb-12">
          <motion.h2
            className="text-4xl mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Meet Your <span className="text-[#1F8A84]">Hosts</span>
          </motion.h2>

          <motion.p
            className="text-xl text-[#4F5F5B] max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            The people behind Sacred Homes — passionate locals who will make your Varanasi stay unforgettable.
          </motion.p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
          {hosts.map((host) => (
            <div
              key={host.name}
              className="bg-white border border-[#E5ECE6] rounded-xl shadow-sm p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1 w-full max-w-md mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center w-full"
              >
                <img
                  src={host.image}
                  alt={host.name}
                  loading="lazy"
                  className="w-32 h-32 rounded-2xl object-cover shadow-sm border border-[#E5ECE6]"
                />

                <h3 className="text-2xl font-semibold text-[#173A39] mt-4 tracking-tight">
                  {host.name}
                </h3>

                <div className="h-6 flex items-center justify-center mt-2">
                  {host.isSuperhost && (
                    <span className="text-xs bg-[#E6F4F1] text-[#1F8A84] px-2 py-1 rounded-full">
                      Superhost
                    </span>
                  )}
                </div>

                <p className="text-sm text-[#73867A] mt-2 italic">
                  {host.role}
                </p>

                <p className="text-sm text-[#4F5F5B] mt-3 leading-relaxed max-w-sm min-h-[120px]">
                  {host.bio}
                </p>

                <div className="w-12 h-[1px] bg-[#E5ECE6] my-4"></div>

                <div className="mt-4 flex gap-4 justify-center">
                  <a
                    href={`mailto:${host.contact}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#73867A] hover:text-[#1F8A84] transition-all hover:scale-110"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
