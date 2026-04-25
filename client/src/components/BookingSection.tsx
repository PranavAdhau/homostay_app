import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import SharedCalendar from "./SharedCalendar";
import { cn } from "./ui/utils";
import AnimatedSection from "./AnimatedSection";
import api from "../lib/axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import { formatINR, formatNightlyRate } from "../lib/currency";

interface Homestay {
  id: number;
  slug: string;
  name: string;
  price_per_night: number;
  capacity: number;
}

interface AvailabilityData {
  available_dates: string[];
  unavailable_dates: string[];
  time_slots: Record<string, Array<{ start_time: string; end_time: string }>>;
}

const toDateOnly = (date: Dayjs) => date.format("YYYY-MM-DD");

export default function BookingSection() {
  const navigate = useNavigate();
  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [searchParams] = useSearchParams();
  const [selectedHomestay, setSelectedHomestay] = useState("");
  const [checkIn, setCheckIn] = useState<Dayjs | null>(null);
  const [checkOut, setCheckOut] = useState<Dayjs | null>(null);
  const [guests, setGuests] = useState("2");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityData | null>(
    null,
  );
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  const formatDate = (date: Dayjs | null) => {
    if (!date) return "Pick a date";
    return date.format("MMMM D, YYYY");
  };

  useEffect(() => {
    fetchHomestays();
  }, []);

  // ✅ Reacts to both page load and card-click (searchParams change)
  useEffect(() => {
    if (homestays.length === 0) return;
    const homestayId = searchParams.get("homestay_id");
    if (!homestayId) return;
    const match = homestays.find((h) => String(h.id) === homestayId);
    if (match) {
      setSelectedHomestay(String(match.id));
      setGuests(String(match.capacity));
    }
  }, [searchParams, homestays]);

  useEffect(() => {
    const selected = homestays.find(
      (h) => h.id.toString() === selectedHomestay,
    );
    if (!selected) {
      setAvailability(null);
      return;
    }
    const startStr = toDateOnly(dayjs());
    const endStr = toDateOnly(dayjs().add(90, "day"));
    api
      .get(`/homestays/${selected.slug}/availability`, {
        params: { start_date: startStr, end_date: endStr },
      })
      .then((r) => {
        if (r.data.success) setAvailability(r.data.data);
      })
      .catch((err) => {
        console.error("Error fetching availability:", err);
        setAvailability(null);
      });
  }, [selectedHomestay, homestays]);

  const fetchHomestays = async () => {
    try {
      const response = await api.get("/homestays");
      if (response.data?.success && Array.isArray(response.data?.data)) {
        setHomestays(response.data.data);
      } else {
        setHomestays([]);
      }
    } catch (error) {
      console.error("Error fetching homestays:", error);
      setHomestays([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHomestay || !checkIn || !checkOut) return;
    setSubmitting(true);
    try {
      const selected = homestays.find(
        (h) => h.id.toString() === selectedHomestay,
      );
      if (!selected) return;
      const response = await api.post("/bookings", {
        booking: {
          homestay_id: selected.id,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          check_in_date: checkIn.format("YYYY-MM-DD"),
          check_out_date: checkOut.format("YYYY-MM-DD"),
          number_of_guests: parseInt(guests),
          total_price: calculateTotal(),
        },
      });
      if (response.data.success) {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setSelectedHomestay("");
          setCheckIn(null);
          setCheckOut(null);
          setGuestName("");
          setGuestEmail("");
          setGuestPhone("");
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error submitting booking:", error);
      alert(error.response?.data?.message || "Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateNights = () => {
    if (checkIn && checkOut) return checkOut.diff(checkIn, "day");
    return 0;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    const selected = homestays.find(
      (h) => h.id.toString() === selectedHomestay,
    );
    if (!selected) return 0;
    return nights * selected.price_per_night;
  };

  const selectedHomestayObj = homestays.find(
    (h) => h.id.toString() === selectedHomestay,
  );
  const maxGuests = selectedHomestayObj?.capacity ?? 6;

  useEffect(() => {
    if (parseInt(guests, 10) > maxGuests) setGuests(String(maxGuests));
  }, [maxGuests, guests]);

  const unavailableDates = availability?.unavailable_dates ?? [];
  const checkoutMin = checkIn ? checkIn.add(1, "day") : dayjs().add(1, "day");
  const checkoutDisabled = checkIn
    ? [...unavailableDates, checkIn.format("YYYY-MM-DD")]
    : unavailableDates;

  return (
    <section id="booking" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <motion.h2
            className="text-4xl mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Book Your <span className="text-[#1F8A84]">Stay</span>
          </motion.h2>
          <motion.p
            className="text-xl text-[#4F5F5B] max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Reserve your perfect Sacred Homes stay in Varanasi. Check
            availability and get instant confirmation.
          </motion.p>
        </AnimatedSection>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-6 w-6 text-[#1F8A84]" />
                  <span>Make a Reservation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/*
                    ✅ FIX: On mobile (< md) stack vertically.
                    On desktop (md+) use 3-col grid: homestay = col-span-2, guests = col-span-1.
                    This makes "Number of Guests" align with "Phone" (both 1/3 width on desktop).
                  */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                      className="md:col-span-2"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <Label htmlFor="homestay">Choose Homestay</Label>
                      <Select
                        value={selectedHomestay}
                        onValueChange={setSelectedHomestay}
                      >
                        {/* ✅ overflow-hidden on trigger prevents text from pushing layout */}
                        <SelectTrigger className="mt-2 w-full overflow-hidden">
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                              textAlign: "left",
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            {selectedHomestayObj
                              ? `${selectedHomestayObj.name} - ${formatNightlyRate(selectedHomestayObj.price_per_night)}`
                              : "Select a homestay"}
                          </span>
                        </SelectTrigger>
                        {/*
                          ✅ w-[var(--radix-select-trigger-width)] keeps dropdown
                          the same width as the trigger, preventing overflow-driven layout shift.
                        */}
                        <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]">
                          {homestays.map((homestay) => (
                            <SelectItem
                              key={homestay.id}
                              value={homestay.id.toString()}
                              className="whitespace-normal break-words"
                            >
                              {homestay.name} - {formatNightlyRate(homestay.price_per_night)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <motion.div
                      className="md:col-span-1"
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Label htmlFor="guests">Number of Guests</Label>
                      <Select value={guests} onValueChange={setGuests}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            { length: maxGuests },
                            (_, i) => i + 1,
                          ).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} {num === 1 ? "Guest" : "Guests"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </div>

                  {/* Name / Email / Phone — unchanged 3-col grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        id: "guestName",
                        label: "Full Name",
                        value: guestName,
                        setter: setGuestName,
                        type: "text",
                        delay: 0.3,
                      },
                      {
                        id: "guestEmail",
                        label: "Email",
                        value: guestEmail,
                        setter: setGuestEmail,
                        type: "email",
                        delay: 0.4,
                      },
                      {
                        id: "guestPhone",
                        label: "Phone",
                        value: guestPhone,
                        setter: setGuestPhone,
                        type: "tel",
                        delay: 0.5,
                      },
                    ].map(({ id, label, value, setter, type, delay }) => (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay }}
                      >
                        <Label htmlFor={id}>{label}</Label>
                        <Input
                          id={id}
                          type={type}
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          required
                          className="mt-2"
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Check-in / Check-out */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="flex flex-col space-y-2"
                    >
                      <Label htmlFor="checkin">Check-in Date</Label>
                      <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            id="checkin"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal mt-2",
                              !checkIn && "text-muted-foreground",
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4 shrink-0" />
                            {formatDate(checkIn)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <SharedCalendar
                            value={checkIn}
                            onChange={(date) => {
                              setCheckIn(date);
                              if (date && checkOut && !checkOut.isAfter(date))
                                setCheckOut(null);
                            }}
                            onClose={() => setCheckInOpen(false)}
                            minDate={dayjs().add(1, "day")}
                            disabledDates={unavailableDates}
                          />
                        </PopoverContent>
                      </Popover>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="flex flex-col space-y-2"
                    >
                      <Label htmlFor="checkout">Check-out Date</Label>
                      <Popover
                        open={checkOutOpen}
                        onOpenChange={setCheckOutOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            id="checkout"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal mt-2",
                              !checkOut && "text-muted-foreground",
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4 shrink-0" />
                            {formatDate(checkOut)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <SharedCalendar
                            value={checkOut}
                            onChange={setCheckOut}
                            onClose={() => setCheckOutOpen(false)}
                            minDate={checkoutMin}
                            disabledDates={checkoutDisabled}
                            defaultCalendarMonth={checkoutMin}
                          />
                        </PopoverContent>
                      </Popover>
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {selectedHomestay && checkIn && checkOut && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-[#FAF5F2] p-4 rounded-lg"
                      >
                        <h4 className="text-lg mb-2">Booking Summary</h4>
                        <div className="space-y-1 text-sm text-[#4F5F5B]">
                          <div className="flex justify-between">
                            <span>Nights:</span>
                            <span>{calculateNights()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Guests:</span>
                            <span>{guests}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-[#D4DDD5]">
                            <span className="text-base">Total:</span>
                            <motion.span
                              className="text-xl text-[#1F8A84]"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              {formatINR(calculateTotal())}
                            </motion.span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-[#1F8A84] hover:bg-[#264948] text-lg py-3"
                      disabled={
                        !selectedHomestay ||
                        !checkIn ||
                        !checkOut ||
                        !guestName ||
                        !guestEmail ||
                        !guestPhone ||
                        submitting
                      }
                    >
                      <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Calendar className="h-5 w-5" />
                        <span>
                          {submitting ? "Submitting..." : "Reserve Now"}
                        </span>
                      </motion.div>
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <AnimatePresence>
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-md mx-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                >
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl mb-2 text-green-600">
                  Booking Confirmed!
                </h3>
                <p className="text-[#4F5F5B]">
                  We'll contact you shortly to finalize your reservation.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
