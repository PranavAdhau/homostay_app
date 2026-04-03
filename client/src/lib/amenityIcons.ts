import {
  Wifi,
  Snowflake,
  Utensils,
  Car,
  Bath,
  Droplets,
  Battery,
  Home,
  Building2,
  Mountain,
  Waves,
  Flame,
  Laptop,
  Wind,
  Coffee,
  PawPrint,
  DoorOpen,
  Camera,
  KeyRound,
  AlertTriangle,
  FireExtinguisher,
  Shield,
  Tv,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

const AMENITY_ICON_MAP: Record<string, LucideIcon> = {
  // Connectivity & comfort
  WiFi: Wifi,
  "High-Speed WiFi": Wifi,
  AC: Snowflake,
  "Air Conditioning": Snowflake,

  // Spaces
  Kitchen: Utensils,
  "Fully Equipped Kitchen": Utensils,
  "Private Room": Home,
  Balcony: Home,
  Terrace: Building2,
  "Rooftop Terrace": Building2,
  Garden: Home,
  "Private Entrance": DoorOpen,

  // Views
  "River View": Waves,
  "Ganga View": Waves,
  "City View": Building2,
  "Courtyard View": Home,
  "Mountain View": Mountain,
  "Lake View": Waves,

  // Parking & access
  Parking: Car,
  "Free Parking": Car,

  // Bath & water
  Bathroom: Bath,
  "Private Bathroom": Bath,
  "Attached Bathroom": Bath,
  "Hot Water": Droplets,

  // Power & safety
  "Power Backup": Battery,
  "Inverter Backup": Battery,
  "24x7 Security": Shield,
  "Security Cameras": Camera,
  "Smoke Detector": AlertTriangle,
  "First Aid Kit": Shield,
  "Fire Extinguisher": FireExtinguisher,

  // Work & entertainment
  Workspace: Laptop,
  "Dedicated Workspace": Laptop,
  TV: Tv,

  // Appliances
  "Washing Machine": Wind,
  Dryer: Wind,
  Iron: Wind,
  "Hair Dryer": Wind,
  Refrigerator: Battery,
  Fridge: Battery,
  Microwave: Utensils,
  "Coffee Maker": Coffee,

  // Food & hospitality
  "Breakfast Included": Coffee,

  // Outdoor & experience
  "Swimming Pool": Waves,
  "BBQ Area": Flame,
  Fireplace: Flame,

  // Pets & access
  "Pet Friendly": PawPrint,
  "Self Check-in": KeyRound,
};

export function getAmenityIcon(name: string): LucideIcon | undefined {
  return AMENITY_ICON_MAP[name] || undefined;
}

