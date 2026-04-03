import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import DesktopSearchBar from "./DesktopSearchBar";
import MobileFilterDrawer from "./MobileFilterDrawer";
import type { SearchFilters, SearchValidation } from "../lib/searchFilters";

type HeroSearchUi = {
  filters: SearchFilters;
  validation: SearchValidation;
  onCheckInChange: (value: SearchFilters["checkIn"]) => void;
  onCheckOutChange: (value: SearchFilters["checkOut"]) => void;
  onGuestsChange: (value: string) => void;
  onRoomsChange: (value: string) => void;
  onClear: () => void;
  onSearch: () => void;
};

type HeroProps = {
  searchUi?: HeroSearchUi;
};

function focusBodyFallback() {
  document.body.setAttribute("tabindex", "-1");
  document.body.focus({ preventScroll: true });
  document.body.removeAttribute("tabindex");
}

export default function Hero({ searchUi }: HeroProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const scrollPositionRef = useRef(0);
  const previousFilterStateRef = useRef(false);

  useEffect(() => {
    if (isFilterOpen) {
      if (!previousFilterStateRef.current) {
        scrollPositionRef.current = window.scrollY;
        document.body.style.overflow = "hidden";
      }
    } else if (previousFilterStateRef.current) {
      document.body.style.overflow = "";
      window.scrollTo({ top: scrollPositionRef.current, behavior: "auto" });

      if (triggerRef.current && document.contains(triggerRef.current)) {
        triggerRef.current.focus();
      } else {
        focusBodyFallback();
      }
    }

    previousFilterStateRef.current = isFilterOpen;

    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        setIsFilterOpen(false);
      }
    };

    handleChange(mediaQuery);

    const listener = (event: MediaQueryListEvent) => handleChange(event);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }

    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener(listener);
  }, []);

  const handleMobileSearch = () => {
    searchUi?.onSearch();
    setIsFilterOpen(false);
  };

  return (
    <>
      <section
        id="home"
        className="relative flex min-h-screen items-center justify-center overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1920&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            minHeight: "90vh",
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
        </motion.div>

        <div className="relative z-10 container mx-auto px-4 py-20 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1
              className="mb-4 text-4xl md:text-6xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.span
                className="mb-2 block text-sm uppercase tracking-[0.3em] text-[#F4EBD7] md:text-base"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Sacred Homes
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                Sacred Homes – Varanasi
              </motion.span>
            </motion.h1>

            <motion.p
              className="mx-auto mb-6 max-w-3xl text-lg md:text-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Stay close to the ghats, temples, and timeless spirit of Kashi.
            </motion.p>
            <motion.p
              className="mx-auto mb-8 max-w-3xl text-base text-[#F8F8F8] md:text-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Discover thoughtfully designed homestays in the heart of Varanasi.
              Experience authentic Benaras living with modern comfort.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button
                  size="lg"
                  className="w-full bg-[#1F8A84] text-white hover:bg-[#264948] sm:w-auto"
                  asChild
                >
                  <Link to="/bookings">Book Now</Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white bg-black/50 text-white backdrop-blur-sm hover:bg-[#FAF5F2] hover:text-[#173A39] sm:w-auto"
                  asChild
                >
                  <Link to="/homestays">Explore Homestays</Link>
                </Button>
              </motion.div>
            </motion.div>

            {searchUi ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="mx-auto mt-10 w-full min-w-0 max-w-[72rem] pb-6"
              >
                <div className="hidden min-w-0 xl:block">
                  <DesktopSearchBar
                    filters={searchUi.filters}
                    validation={searchUi.validation}
                    onCheckInChange={searchUi.onCheckInChange}
                    onCheckOutChange={searchUi.onCheckOutChange}
                    onGuestsChange={searchUi.onGuestsChange}
                    onRoomsChange={searchUi.onRoomsChange}
                    onSearch={searchUi.onSearch}
                  />
                </div>

                <div className="mx-auto max-w-sm lg:hidden">
                  <Button
                    ref={triggerRef}
                    type="button"
                    onClick={() => setIsFilterOpen(true)}
                    className="h-12 w-full rounded-full bg-white text-[#1F3432] shadow-lg hover:bg-[#F3F6F3]"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search your stay
                  </Button>
                  {searchUi.validation.helperText ? (
                    <p className="mt-3 text-sm font-medium text-white/90">
                      {searchUi.validation.helperText}
                    </p>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 transform"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <motion.div
            className="flex h-10 w-6 justify-center rounded-full border-2 border-white"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              className="mt-2 h-3 w-1 rounded-full bg-white"
              animate={{ scaleY: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </section>

      {searchUi ? (
        <MobileFilterDrawer
          open={isFilterOpen}
          onOpenChange={setIsFilterOpen}
          filters={searchUi.filters}
          validation={searchUi.validation}
          onCheckInChange={searchUi.onCheckInChange}
          onCheckOutChange={searchUi.onCheckOutChange}
          onGuestsChange={searchUi.onGuestsChange}
          onRoomsChange={searchUi.onRoomsChange}
          onClear={searchUi.onClear}
          onSearch={handleMobileSearch}
        />
      ) : null}
    </>
  );
}
