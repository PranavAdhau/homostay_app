import { memo, useState } from 'react';
import { motion } from 'motion/react';
import { Star, Quote, ChevronDown } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import AnimatedSection from './AnimatedSection';

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import review1 from "../assets/reviews/1_review.avif";
import review2 from "../assets/reviews/2_review.avif";
import review3 from "../assets/reviews/3_review.avif";
import review4 from "../assets/reviews/4_review.avif";
import review5 from "../assets/reviews/5_review.avif";
import review6 from "../assets/reviews/6_review.avif";
import review7 from "../assets/reviews/7_review.avif";
import review8 from "../assets/reviews/8_review.avif";
import review9 from "../assets/reviews/9_review.avif";
import review10 from "../assets/reviews/10_review.webp";
import review11 from "../assets/reviews/11_review.avif";
import review12 from "../assets/reviews/12_review.avif";

const swiperStyles = `
  /* ─── Shared base — desktop + tablet (EXACTLY as v1) ─── */
  .reviews-swiper {
    padding-bottom: 52px !important;
    overflow: visible !important;
  }

  .reviews-swiper .swiper-wrapper {
    align-items: stretch;
  }

  .reviews-swiper .swiper-slide {
    height: auto;
    transition: transform 0.4s ease, opacity 0.4s ease;
    opacity: 0.55;
    transform: scale(0.94);
  }

  .reviews-swiper .swiper-slide-active {
    opacity: 1;
    transform: scale(1);
  }

  .reviews-swiper .swiper-slide-prev,
  .reviews-swiper .swiper-slide-next {
    opacity: 0.8;
    transform: scale(0.97);
  }

  .reviews-swiper .swiper-pagination {
    bottom: 0px !important;
  }

  .reviews-swiper .swiper-pagination-bullet {
    width: 20px !important;
    height: 4px !important;
    border-radius: 4px !important;
    background: #C5D4CD !important;
    opacity: 1 !important;
    margin: 0 4px !important;
    transition: width 0.3s ease, background 0.3s ease !important;
  }

  .reviews-swiper .swiper-pagination-bullet-active {
    background: #1F8A84 !important;
    width: 32px !important;
  }

  .reviews-swiper .swiper-slide-active .review-card {
    border-color: rgba(31, 138, 132, 0.35) !important;
    box-shadow: 0 20px 40px rgba(23, 58, 57, 0.1) !important;
  }

  /* ─── Mobile-only overrides (< 640px) ─── */
  @media (max-width: 639px) {
    /* Slightly less bottom space; dynamic bullets are compact */
    .reviews-swiper {
      padding-bottom: 44px !important;
    }

    /* Snappier swipe feel on touch */
    .reviews-swiper .swiper-slide {
      transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  opacity 0.3s ease;
    }

    /* Dynamic bullet system — compact even for 15-18 slides */
    .reviews-swiper .swiper-pagination-bullet {
      width: 6px !important;
      height: 6px !important;
      border-radius: 50% !important;
      margin: 0 3px !important;
      transition: width 0.25s ease, background 0.25s ease,
                  border-radius 0.25s ease, opacity 0.25s ease !important;
    }

    .reviews-swiper .swiper-pagination-bullet-active {
      width: 22px !important;
      border-radius: 4px !important;
      background: #1F8A84 !important;
    }

    .reviews-swiper .swiper-pagination-bullet-active-prev,
    .reviews-swiper .swiper-pagination-bullet-active-next {
      opacity: 0.65 !important;
    }

    .reviews-swiper .swiper-pagination-bullet-active-prev-prev,
    .reviews-swiper .swiper-pagination-bullet-active-next-next {
      opacity: 0.35 !important;
    }

    /* Center the active card text content on mobile */
    .reviews-swiper .swiper-slide {
      display: flex;
      justify-content: center;
    }
  }
`;

// ── Mobile comment: 3-line clamp with animated "Read more" toggle ─────────────
function MobileComment({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 95;

  return (
    <div className="mb-3 flex-1">
      <p
        className={`text-[#4F5F5B] italic text-sm leading-relaxed ${
          !expanded && isLong ? 'line-clamp-3' : ''
        }`}
      >
        "{text}"
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-1.5 flex items-center gap-0.5 text-xs text-[#1F8A84] font-medium focus:outline-none"
          aria-label={expanded ? 'Show less' : 'Read more'}
        >
          <span>{expanded ? 'Show less' : 'Read more'}</span>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex"
          >
            <ChevronDown className="h-3 w-3" />
          </motion.span>
        </button>
      )}
    </div>
  );
}

function ReviewsSection() {
const reviews = [
  {
    id: "review-1",
    name: "Anonymous Guest",
    location: "Airbnb Guest",
    rating: 5,
    comment:
      "The location is spot-on — super easy to get around, and still quiet enough to unwind after wandering the ghats all day. The place was sparkling clean and felt instantly comfortable. The hosts helped with taxis, shared amazing recommendations, and just made everything feel seamless. It really felt like staying with people who genuinely want you to enjoy Varanasi. Would 100% come back — this stay made the trip feel extra special!",
    avatar: review1,
    date: "2026"
  },
  {
    id: "review-2",
    name: "Sada",
    location: "Airbnb Guest",
    rating: 5,
    comment:
      "Sahej and Shreeyas both were helpful and call away at anytime. Their help Ranjeet was also cooperative and responsive. Special thanks to the host for arranging Vansh who was a great help and became a memorable part of my trip. Thank you!",
    avatar: review2,
    date: "2026"
  },
  {
    id: "review-3",
    name: "Kanishka",
    location: "Airbnb Guest",
    rating: 5,
    comment:
      "I had an amazing stay here! The place was exactly as shown in the photos – beautiful, clean, and full of charm. It had a wonderful vibe that made me feel instantly at home. The environment was peaceful and, most importantly, felt very safe throughout my stay. Whether you're visiting Banaras for the spiritual atmosphere or just to relax, this is a perfect place to stay. Highly recommended – I’d love to come back!",
    avatar: review3,
    date: "2026"
  },
  {
    id: "review-4",
    name: "Tara & Nate",
    location: "Vancouver, Canada",
    rating: 5,
    comment:
      "My family stayed at Sahej’s apartment for 3 nights. It was exactly like the photos and an excellent retreat for us after exploring the busy streets of Varanasi. Our kids enjoyed the living room swing and having a living room after a couple weeks of hotels. I would highly recommend it. Thanks!",
    avatar: review4,
    date: "January 2026"
  },
  {
    id: "review-5",
    name: "Rakesh",
    location: "Airbnb Guest",
    rating: 5,
    comment:
      "The accommodation was exactly as described, comfortable, well connected and conveniently located near several main temples. The interiors are tastefully done and worth appreciating. Shreyash went out of his way to help us explore the place through his local connections, which made our stay even more memorable. Thank you for hosting us!",
    avatar: review5,
    date: "September 2025"
  },
  {
    id: "review-6",
    name: "Shakhilendu",
    location: "Airbnb Guest",
    rating: 5,
    comment:
      "It was a wonderful stay. Everything was exactly as it was shown in the pictures. We stayed there for 2 days. I would recommend this place if you are planning a trip with your friends or family.",
    avatar: review6,
    date: "March 2026"
  },
  {
    id: "review-7",
    name: "Gurdev",
    location: "Airbnb Guest",
    rating: 5,
    comment:
      "Sahej's house is at a good location. Curry Leaf is a great restaurant right in front of the place. The toilets were clean and fresh towels were provided. Overall, we were happy to have stayed here.",
    avatar: review7,
    date: "February 2026"
  },
  {
    id: "review-8",
    name: "Ezli",
    location: "Airbnb Guest",
    rating: 5,
    comment:
      "It was even better than in the pictures. Very comfortable stay, good location, and a great place to unwind from all that’s happening in the city. Sahej also arranged a taxi for us to the airport. We would definitely stay here again!",
    avatar: review8,
    date: "November 2025"
  },
  {
    id: "review-9",
    name: "Jannes",
    location: "Airbnb Guest",
    rating: 5,
    comment:
      "This is the perfect place for a trip to Varanasi! Sahej and Shreyash are tremendous hosts and the apartment is amazing. Spotlessly clean, even by European standards, and located in a vibrant area that gives you a true Varanasi experience.",
    avatar: review9,
    date: "October 2025"
  },
  {
    id: "review-10",
    name: "Kanika",
    location: "India",
    rating: 5,
    comment:
      "The Penthouse Benares was one of the best Airbnbs I've stayed at in India. As a group of four girls traveling together, we found the place both peaceful and safe. The garden was a wonderful bonus, especially considering the price. The hosts were very sweet and helpful throughout our stay. Highly recommended!",
    avatar: review10,
    date: "May 2024"
  },
  {
    id: "review-11",
    name: "Pankaj",
    location: "Airbnb Guest",
    rating: 5,
    comment:
      "I absolutely loved staying at this apartment! It was incredibly clean, beautifully maintained, and so comfortable—it truly felt like a home away from home. Every detail was thoughtfully arranged, and the atmosphere was warm and welcoming. A lovely place that I would happily return to!",
    avatar: review11,
    date: "April 2025"
  },
  {
    id: "review-12",
    name: "Xaq",
    location: "Los Angeles, California",
    rating: 5,
    comment:
      "This spot was super comfortable, spacious, clean, relaxed and had a cool vibe inside. The neighborhood seems really nice and much quieter than most of Varanasi. The bedrooms are large and comfortable, the living room is perfect, and the hosts were really easy to communicate with. I would definitely recommend it!",
    avatar: review12,
    date: "March 2026"
  }
];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-[#1F8A84] fill-current' : 'text-[#D4DDD5]'
        }`}
      />
    ));
  };

  return (
    <section id="reviews" className="py-20 bg-[#F4F7F6]">
      <style>{swiperStyles}</style>

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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Swiper
            className="reviews-swiper"
            modules={[Autoplay, Pagination, A11y]}
            loop={true}
            centeredSlides={true}
            autoplay={{
              delay: 2800,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            slidesPerView={1}
            spaceBetween={16}
            touchRatio={1.2}
            resistance={true}
            resistanceRatio={0.6}
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 24,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 28,
              },
            }}
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.id}>
                <Card className="review-card h-full rounded-2xl border border-[#E5ECE6]/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 bg-white">
                  <CardContent className="p-5 sm:p-6 flex flex-col h-full">
                    {/* Header: quote icon + stars */}
                    <div className="flex items-center mb-3 sm:mb-4">
                      <Quote className="h-7 w-7 text-[#1F8A84] opacity-40 mr-2 flex-shrink-0" />
                      <div className="flex space-x-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>

                    {/*
                      Two subtrees: mobile gets clamped text + Read more button;
                      tablet/desktop gets the full comment unchanged.
                      Pure CSS visibility — no JS resize listener, SSR-safe.
                    */}

                    {/* Mobile comment — hidden on sm+ */}
                    <div className="sm:hidden flex-1 flex flex-col">
                      <MobileComment text={review.comment} />
                    </div>

                    {/* Tablet/desktop comment — hidden below sm */}
                    <p className="hidden sm:block text-[#4F5F5B] mb-5 italic text-sm leading-relaxed flex-1">
                      "{review.comment}"
                    </p>

                    {/* Footer: avatar + name */}
                    <div className="flex items-center border-t border-[#E5ECE6]/70 pt-3 sm:pt-4 mt-auto">
                      <Avatar className="h-10 w-10 sm:h-11 sm:w-11 mr-3 flex-shrink-0">
                        <AvatarImage src={review.avatar} alt={review.name} />
                        <AvatarFallback className="bg-[#E5ECE6] text-[#4F5F5B] text-xs">
                          {review.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-[#2A3B38]">{review.name}</p>
                        <p className="text-xs text-[#73867A]">{review.location}</p>
                        <p className="text-xs text-[#A1B2A4]">{review.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        <AnimatedSection className="text-center mt-10" delay={0.5}>
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
