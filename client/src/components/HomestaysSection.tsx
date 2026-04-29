import { memo, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import HomestayCard from './HomestayCard';
import AnimatedSection from './AnimatedSection';
import api from '../lib/axios';
import type { PublicHomestay } from '../lib/homestays';
import { formatINR } from '../lib/currency';

type HomestaysSectionProps = {
  homestays?: PublicHomestay[] | null;
  loading?: boolean;
  emptyMessage?: string;
};

function HomestaysSection({
  homestays: prefetchedHomestays,
  loading: prefetchedLoading,
  emptyMessage,
}: HomestaysSectionProps) {
  const [homestays, setHomestays] = useState<PublicHomestay[]>([]);
  const [loading, setLoading] = useState(true);
  const isControlled = prefetchedHomestays !== undefined;

  useEffect(() => {
    if (isControlled) {
      return;
    }

    fetchHomestays();
  }, [isControlled]);

  const fetchHomestays = async () => {
    try {
      const response = await api.get('/homestays');
      if (response.data?.success && Array.isArray(response.data?.data)) {
        setHomestays(response.data.data);
      } else {
        setHomestays([]);
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
      setHomestays([]);
    } finally {
      setLoading(false);
    }
  };

  const resolvedHomestays = isControlled ? prefetchedHomestays ?? [] : homestays;
  const resolvedLoading = isControlled ? Boolean(prefetchedLoading) : loading;

  return (
    <section id="homestays" className="py-20 bg-[#FAF5F2] scroll-mt-16 md:scroll-mt-24">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <motion.h2 
            className="text-4xl mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our <span className="text-[#1F8A84]">Homestays</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-[#4F5F5B] max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Choose from our collection of Sacred Homes in Varanasi, 
            each designed to offer calm, comfort, and an authentic Benaras experience near the ghats.
          </motion.p>
        </AnimatedSection>

        <motion.div 
          className="grid grid-cols-1 min-[460px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
        >
          {resolvedLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F8A84] mx-auto"></div>
              <p className="mt-4 text-[#4F5F5B]">Loading homestays...</p>
            </div>
          ) : resolvedHomestays.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-[#4F5F5B]">{emptyMessage || 'No homestays available at the moment.'}</p>
            </div>
          ) : (
            resolvedHomestays.map((homestay) => (
              <motion.div
                key={homestay.id}
                variants={{
                  hidden: { opacity: 0, y: 50, scale: 0.9 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: {
                      duration: 0.6,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }
                  }
                }}
              >
                <HomestayCard
                  id={homestay.id}
                  slug={homestay.slug}
                  name={homestay.name}
                  description={homestay.description}
                  price={formatINR(homestay.price_per_night)}
                  image={homestay.featured_image || (homestay.images.length > 0 ? homestay.images[0] : '')}
                  rating={4.8}
                  capacity={homestay.capacity}
                  rooms={homestay.rooms}
                  amenities={homestay.amenities.map(a => a.name)}
                />
              </motion.div>
            ))
          )}
        </motion.div>

        <AnimatedSection className="text-center mt-12" delay={0.3}>
          <motion.p 
            className="text-[#4F5F5B] mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Can't decide? Contact us for personalized recommendations based on your needs.
          </motion.p>
          <motion.button
            className="bg-[#1F8A84] hover:bg-[#264948] text-white px-8 py-3 rounded-lg transition-colors"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get Recommendations
          </motion.button>
        </AnimatedSection>
      </div>
    </section>
  );
}

export default memo(HomestaysSection);
