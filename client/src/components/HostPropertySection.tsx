import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { useResolvedWhatsAppLink } from "../lib/whatsapp";
import hostPropertyPlaceholder from "../assets/host-property-placeholder.svg";
import AnimatedSection from "./AnimatedSection";

type HostPropertySectionProps = {
  imageCandidates?: Array<string | null | undefined>;
};

const IMAGE_TIMEOUT_MS = 4500;

export default function HostPropertySection({
  imageCandidates = [],
}: HostPropertySectionProps) {
  const { href } = useResolvedWhatsAppLink();

  const primaryImage = useMemo(
    () =>
      imageCandidates.find((candidate) => Boolean(candidate)) ||
      hostPropertyPlaceholder,
    [imageCandidates]
  );

  const [displayedImage, setDisplayedImage] = useState(primaryImage);
  const [imageResolved, setImageResolved] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setDisplayedImage(primaryImage);
    setImageResolved(false);

    if (primaryImage !== hostPropertyPlaceholder) {
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        setDisplayedImage(hostPropertyPlaceholder);
        setImageResolved(false);
      }, IMAGE_TIMEOUT_MS);
    }

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [primaryImage]);

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      {/* TOP WHITE SECTION */}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <AnimatedSection className="mb-10 text-center lg:mb-12">
          <motion.h2
            className="text-4xl mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Host Your <span className="text-[#1F8A84]">Property</span>
          </motion.h2>

          <motion.p
            className="text-xl text-[#4F5F5B] max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            From setup to support, we make hosting simple, seamless, and rewarding
          </motion.p>
        </AnimatedSection>
      </div>

      {/* FULL WIDTH BROWN SECTION */}
      <div className="relative bg-[#FAF5F2] py-14">

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">

            {/* LEFT */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 text-center lg:order-1 lg:text-left"
            >
              <div className="lg:max-w-md">

                {/* SMALL HEADING */}
                <div className="mb-4 hidden lg:flex items-center gap-4">
                  <p className="text-sm font-medium text-[#214847] whitespace-nowrap">
                    Host with Sacred Homes
                  </p>
                  <span className="h-px flex-1 bg-[#DCCDC2]" />
                </div>

                {/* MOBILE */}
                <p className="mb-2 text-lg font-medium text-[#214847] lg:hidden">
                  Host with Sacred Homes
                </p>

                {/* MAIN */}
                <h2 className="text-[clamp(2.2rem,3vw,3.2rem)] font-semibold text-[#173A39] leading-tight">
                  List your property with Sacred Homes
                </h2>

                <p className="mt-4 max-w-md mx-auto lg:mx-0 text-base leading-7 text-[#6F7B76]">
                  From setup to support, we make hosting simple, seamless, and rewarding
                </p>

                <div className="mt-6">
                  <Button
                    type="button"
                    onClick={() =>
                      window.open(href, "_blank", "noopener,noreferrer")
                    }
                    className="h-12 rounded-full bg-[#1F8A84] px-8 text-sm font-semibold tracking-[0.18em] text-white hover:bg-[#264948]"
                  >
                    LIST NOW
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* RIGHT IMAGE */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="order-1 mx-auto flex w-full max-w-[22rem] justify-center lg:order-2 lg:max-w-[26rem] lg:justify-end"
            >
              <div className="relative isolate w-full">
                <div className="absolute bottom-5 right-0 h-[68%] w-[72%] rounded-[2rem] bg-[#AFC0AF] lg:bottom-[-1.75rem] lg:right-[-1.5rem]" />

                <div className="relative mx-auto w-[78%] overflow-hidden rounded-t-[999px] bg-[#E9DFD8] shadow-[0_24px_60px_rgba(46,87,86,0.16)] lg:mx-0 lg:ml-auto">
                  {!imageResolved && (
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#EDE2DA] via-[#F6EFEA] to-[#E5D8CF]" />
                  )}

                  <img
                    src={displayedImage}
                    alt="Host your property"
                    onLoad={() => setImageResolved(true)}
                    className={`relative aspect-[0.8] w-full object-cover ${
                      imageResolved ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
