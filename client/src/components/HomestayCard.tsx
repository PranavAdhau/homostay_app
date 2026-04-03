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
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="overflow-hidden h-full shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <motion.div
          className="relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <ImageWithFallback
            src={image}
            alt={name}
            className="w-full h-48 object-cover"
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
            className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center space-x-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            whileHover={{ scale: 1.1 }}
          >
            <Star className="h-4 w-4 text-[#1F8A84] fill-current" />
            <span className="text-sm">{rating}</span>
          </motion.div>
        </motion.div>

        <CardContent className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl mb-2">{name}</h3>
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
            {amenities.map((amenity, index) => {
              const IconComponent = getAmenityIcon(amenity);
              return (
                <motion.div
                  key={amenity}
                  className="flex items-center space-x-1 text-sm text-[#4F5F5B] bg-[#F8F8F8] px-2 py-1 rounded"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  {IconComponent && <IconComponent className="h-3 w-3" />}
                  <span>{amenity}</span>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div>
              <span className="text-2xl text-[#1F8A84]">{price}</span>
              <span className="text-[#73867A]"> / night</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate(`/properties/${slug}`)}
              >
                Details
              </Button>
              <Button
                className="bg-[#1F8A84] hover:bg-[#264948] flex-1"
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
