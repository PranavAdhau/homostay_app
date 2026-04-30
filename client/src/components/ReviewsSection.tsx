import { memo } from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import AnimatedSection from './AnimatedSection';

function ReviewsSection() {
  const reviews = [
    {
      id: "aarav-sharma-jan-2024",
      name: "Aarav Sharma",
      location: "Delhi",
      rating: 5,
      comment: "Waking up to the sounds of the Ganga aarti and coming back to such a calm, beautifully designed homestay made our Varanasi trip unforgettable.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b4c0?auto=format&fit=crop&w=150&q=80",
      date: "January 2024"
    },
    {
      id: "meera-iyer-dec-2023",
      name: "Meera Iyer",
      location: "Bengaluru",
      rating: 5,
      comment: "Perfect blend of spiritual energy and comfort. Sacred Homes is just a short ride from the main ghats and still feels peaceful and private.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      date: "December 2023"
    },
    {
      id: "rohit-verma-nov-2023",
      name: "Rohit Verma",
      location: "Mumbai",
      rating: 5,
      comment: "The rooms are thoughtfully done, super clean, and the hosts helped us plan our temple visits and boat rides. Felt like staying with family in Kashi.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
      date: "November 2023"
    },
    {
      id: "priya-singh-oct-2023",
      name: "Priya Singh",
      location: "Lucknow",
      rating: 4,
      comment: "Great location for exploring the old city. Easy access to the ghats while still being tucked away from the chaos. Highly recommended for first-time visitors.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
      date: "October 2023"
    },
    {
      id: "ankit-patel-sep-2023",
      name: "Ankit Patel",
      location: "Ahmedabad",
      rating: 5,
      comment: "Loved the small details – from the decor inspired by Varanasi’s lanes to the cozy balcony space. A perfect base for our spiritual break.",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
      date: "September 2023"
    },
    {
      id: "neha-gupta-aug-2023",
      name: "Neha Gupta",
      location: "Gurugram",
      rating: 5,
      comment: "Sacred Homes made our family trip so easy. Spacious rooms, reliable Wi-Fi, and quick access to both Kashi Vishwanath temple and the ghats.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      date: "August 2023"
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: i * 0.1 }}
      >
        <Star
          className={`h-4 w-4 ${
            i < rating ? 'text-[#1F8A84] fill-current' : 'text-[#D4DDD5]'
          }`}
        />
      </motion.div>
    ));
  };

  return (
    <section id="reviews" className="py-20 bg-[#F4F7F6]">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <motion.h2 
            className="text-3xl sm:text-4xl mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            What Our <span className="text-[#1F8A84]">Guests Say</span>
          </motion.h2>
          <motion.p 
            className="text-base sm:text-xl text-[#4F5F5B] max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Read authentic reviews from guests who have experienced the spiritual energy of Varanasi
            while staying in the comfort of Sacred Homes.
          </motion.p>
        </AnimatedSection>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              variants={{
                hidden: { opacity: 0, y: 50, rotateX: -15 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  rotateX: 0,
                  transition: {
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }
                }
              }}
              whileHover={{ 
                y: -5, 
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="h-full rounded-2xl border-[#E5ECE6]/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(23,58,57,0.08)] hover:-translate-y-1 transition-all duration-500 bg-white">
                <CardContent className="p-6">
                  <motion.div
                    className="flex items-center mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <Quote className="h-8 w-8 text-[#1F8A84] opacity-50 mr-2" />
                    <div className="flex space-x-1">
                      {renderStars(review.rating)}
                    </div>
                  </motion.div>

                  <motion.p 
                    className="text-[#4F5F5B] mb-4 italic"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    "{review.comment}"
                  </motion.p>

                  <motion.div 
                    className="flex items-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={review.avatar} alt={review.name} />
                        <AvatarFallback>{review.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div>
                      <p className="text-sm">{review.name}</p>
                      <p className="text-xs text-[#73867A]">{review.location}</p>
                      <p className="text-xs text-[#A1B2A4]">{review.date}</p>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <AnimatedSection className="text-center mt-12" delay={0.5}>
          <motion.div
            className="bg-[#1F8A84] text-white p-8 rounded-lg max-w-2xl mx-auto"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-2xl mb-2">Join Our Happy Guests!</h3>
            <p className="mb-4">Experience the magic of Varanasi with a peaceful stay at Sacred Homes</p>
            <motion.button
              className="bg-white text-[#1F8A84] px-6 py-3 rounded-lg hover:bg-[#F8F8F8] transition-colors"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Book Your Stay Today
            </motion.button>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

export default memo(ReviewsSection);
