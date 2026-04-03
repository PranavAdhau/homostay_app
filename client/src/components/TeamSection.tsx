import { motion } from 'motion/react';
import { Mail, MessageCircle, Instagram } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const hosts = [
  {
    name: 'Arjun Sharma',
    role: 'Host · Sacred Homes Varanasi',
    city: 'Varanasi, Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
    bio: 'I have been welcoming guests into our family home in the heart of Varanasi for over five years. My goal is to make every guest feel at home while experiencing the magic of this ancient city.',
    education: 'B.A. in Hospitality Management, BHU',
    languages: 'Hindi, English, Sanskrit',
    yearsHosting: '5+ years',
    whatsapp: '919999999991',
    email: 'arjun@sacredhomes.in',
    instagram: '@arjun.sacredhomes',
  },
  {
    name: 'Priya Sharma',
    role: 'Co-Host · Sacred Homes Varanasi',
    city: 'Varanasi, Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1531590878845-12627191e687?w=400&q=80',
    bio: 'Cooking, storytelling, and creating warm memories for our guests is what drives me. I personally curate every detail of your stay to make it truly special.',
    education: 'M.A. in Cultural Studies, Kashi Vidyapith',
    languages: 'Hindi, English, Bengali',
    yearsHosting: '5+ years',
    whatsapp: '919999999992',
    email: 'priya@sacredhomes.in',
    instagram: '@priya.sacredhomes',
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
          {hosts.map((host) => (
            <div
              key={host.email}
              className="bg-white border border-[#E5ECE6] rounded-xl shadow-sm p-6 sm:p-8 flex flex-col items-center text-center"
            >
              <motion.div
                key={host.email}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center w-full"
              >
                <img
                  src={host.image}
                  alt={host.name}
                  className="w-32 h-32 rounded-xl object-cover"
                />
                <h3 className="text-xl font-semibold text-[#173A39] mt-4">{host.name}</h3>
                <p className="text-sm text-[#73867A] mt-1">{host.role}</p>
                <p className="text-sm text-[#4F5F5B] mt-3 leading-relaxed max-w-xs">{host.bio}</p>
                <div className="mt-4 flex gap-4 justify-center">
                  <a
                    href={`https://wa.me/${host.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Message ${host.name} on WhatsApp`}
                    className="text-[#73867A] hover:text-[#22C55E] transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </a>
                  <a
                    href={`mailto:${host.email}`}
                    aria-label={`Email ${host.name}`}
                    className="text-[#73867A] hover:text-[#1F8A84] transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    aria-label={`View ${host.name} on Instagram`}
                    className="text-[#73867A] hover:text-[#264948] transition-colors"
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
