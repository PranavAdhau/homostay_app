import { motion } from 'motion/react';
import { Mail, MessageCircle, Instagram } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const hosts = [
  {
    name: 'Sahej Kohli',
    role: 'Host · Sacred Homes Varanasi',
    city: 'Varanasi, Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
    bio: 'I have been hosting guests in Varanasi for over 4 years, creating comfortable and memorable stays rooted in local culture. I focus on offering a peaceful, well-maintained space along with thoughtful hospitality so guests can truly experience the essence of this ancient city.',
    education: 'Business Consultant · Christ University, Bangalore',
    languages: 'English, Hindi',
    yearsHosting: '4+ years hosting',
    whatsapp: '919999999991',
    email: 'sahej@sacredhomes.in',
    instagram: '@sahej.sacredhomes',
  },
  {
    name: 'Raman',
    role: 'Co-Host · Sacred Homes Varanasi',
    city: 'Varanasi, Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    bio: 'Cooking, storytelling, and creating warm memories for our guests is what drives me. I ensure every stay feels personal, comfortable, and well taken care of with attention to detail and a welcoming approach.',
    education: 'Hospitality & Guest Experience Specialist',
    languages: 'English, Hindi',
    yearsHosting: '4+ years hosting',
    whatsapp: '919999999992',
    email: 'raman@sacredhomes.in',
    instagram: '@raman.sacredhomes',
  },
];

export default function TeamSection() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hosts.map((host, index) => (
            <div
              key={host.email}
              className="bg-white border border-[#E5ECE6] rounded-xl shadow-sm p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1"
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
                  className="w-32 h-32 rounded-2xl object-cover shadow-sm border border-[#E5ECE6]"
                />

                <h3 className="text-2xl font-semibold text-[#173A39] mt-4 tracking-tight">
                  {host.name}
                </h3>

                {/* FIXED: Reserved space for badge */}
                <div className="h-6 flex items-center justify-center mt-2">
                  {index === 0 && (
                    <span className="text-xs bg-[#E6F4F1] text-[#1F8A84] px-2 py-1 rounded-full">
                      Superhost
                    </span>
                  )}
                </div>

                <p className="text-sm text-[#73867A] mt-2 italic">
                  {host.role}
                </p>

                {/* FIXED: Equal bio height */}
                <p className="text-sm text-[#4F5F5B] mt-3 leading-relaxed max-w-sm min-h-[120px]">
                  {host.bio}
                </p>

                {/* Divider */}
                <div className="w-12 h-[1px] bg-[#E5ECE6] my-4"></div>

                {/* FIXED: Equal info height */}
                <div className="mt-1 text-xs text-[#73867A] space-y-1 leading-relaxed min-h-[72px]">
                  <p>{host.education}</p>
                  <p>{host.languages}</p>
                  <p>{host.yearsHosting}</p>
                </div>

                <div className="mt-4 flex gap-4 justify-center">
                  <a
                    href={`https://wa.me/${host.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#73867A] hover:text-[#22C55E] transition-all hover:scale-110"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>

                  <a
                    href={`mailto:${host.email}`}
                    className="text-[#73867A] hover:text-[#1F8A84] transition-all hover:scale-110"
                  >
                    <Mail className="w-5 h-5" />
                  </a>

                  <a
                    href="#"
                    className="text-[#73867A] hover:text-[#264948] transition-all hover:scale-110"
                  >
                    <Instagram className="w-5 h-5" />
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
