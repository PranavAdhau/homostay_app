import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Star, Users, BedDouble } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getAmenityIcon } from '../lib/amenityIcons';

interface HomestayCardProps {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: string;
  image: string;
  rating: number;
  capacity: number;
  rooms: number;
  amenities: string[];
  isGlamping?: boolean;
}

export default function HomestayCard({
  id, slug, name, description, price, image,
  rating, capacity, rooms, amenities, isGlamping = false
}: HomestayCardProps) {
  const navigate = useNavigate();
  const visibleAmenities = amenities.slice(0, 4);
  const remainingAmenities = Math.max(0, amenities.length - visibleAmenities.length);

  // ✅ Use navigate() so React Router's useSearchParams reacts immediately
  const handleBookNow = () => {
    navigate(`/?homestay_id=${id}#booking`);
    setTimeout(() => {
      const bookingSection = document.getElementById('booking');
      if (bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <Card className="overflow-hidden h-full shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_32px_rgba(0,0,0,0.10)] transition-shadow duration-300">
        <motion.div
          className="relative overflow-hidden"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.25 }}
        >
          <ImageWithFallback
            src={image}
            alt={name}
            className="w-full h-44 sm:h-48 object-cover"
            loading="lazy"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          {isGlamping && (
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Badge className="absolute top-3 left-3 bg-[#22C55E] text-white">
                Glamping
              </Badge>
            </motion.div>
          )}
          <motion.div
            className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Star className="h-4 w-4 text-[#1F8A84] fill-current" />
            <span className="text-xs font-medium text-[#173A39]">{rating}</span>
          </motion.div>
        </motion.div>

        <CardContent className="p-5 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-semibold mb-2 line-clamp-1">{name}</h3>
            <p className="text-[#4F5F5B] mb-4 line-clamp-2">{description}</p>
          </motion.div>

          <motion.div
            className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[#4F5F5B]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Up to {capacity} guests</span>
            </span>
            <span className="flex items-center gap-2">
              <BedDouble className="h-4 w-4" />
              <span>{rooms} {rooms === 1 ? 'Room' : 'Rooms'}</span>
            </span>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-2 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {visibleAmenities.map((amenity, index) => {
              const IconComponent = getAmenityIcon(amenity);
              return (
                <motion.div
                  key={amenity}
                  className="flex items-center space-x-1 text-xs text-[#4F5F5B] bg-[#F8F8F8] px-2 py-1 rounded-md"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  {IconComponent && <IconComponent className="h-3 w-3" />}
                  <span>{amenity}</span>
                </motion.div>
              );
            })}
            {remainingAmenities > 0 && (
              <span className="flex items-center text-xs text-[#4F5F5B] bg-[#F8F8F8] px-2 py-1 rounded-md">
                +{remainingAmenities} more
              </span>
            )}
          </motion.div>

          <motion.div
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div>
              <span className="text-2xl text-[#1F8A84]">{price}</span>
              <span className="text-[#73867A]"> / night</span>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:min-w-[210px]">
              <Button
                variant="ghost"
                className="h-11 w-full border border-[#D8E3DE] text-[#173A39] hover:bg-[#F4F7F6]"
                onClick={() => navigate(`/properties/${slug}`)}
              >
                Details
              </Button>
              <Button
                className="h-11 w-full bg-[#1F8A84] hover:bg-[#264948]"
                onClick={handleBookNow}
              >
                Book Now
              </Button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
