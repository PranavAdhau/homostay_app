import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import AnimatedSection from "./AnimatedSection";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { formatImpactAmount, getImpactDisplayNumber } from "../lib/impact";

type TrustSectionProps = {
  images?: string[];
  donationPercentage?: number | null;
  totalContributionAmount?: number | null;
};

const placeholderTiles = [
  {
    title: "Community",
    className: "bg-gradient-to-br from-[#E3F1EC] via-[#F7FBF9] to-[#D4E7DD]",
  },
  {
    title: "Care",
    className: "bg-gradient-to-br from-[#FAF1E8] via-[#FFF9F4] to-[#EEDFD1]",
  },
  {
    title: "Education",
    className: "bg-gradient-to-br from-[#EEF3F2] via-[#FBFDFD] to-[#DCE7E5]",
  },
  {
    title: "Sustainability",
    className: "bg-gradient-to-br from-[#E8F3ED] via-[#FCFFFD] to-[#D6E5DA]",
  },
];

function AnimatedImpactValue({
  value,
  suffix,
  decimals,
}: {
  value: number;
  suffix: string;
  decimals: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frame = 0;
    let started = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || started) return;
        started = true;
        const duration = 1200;
        const start = performance.now();

        const tick = (timestamp: number) => {
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplayValue(value * eased);
          if (progress < 1) {
            frame = window.requestAnimationFrame(tick);
          }
        };

        frame = window.requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref}>
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function TrustSection({
  images = [],
  donationPercentage,
  totalContributionAmount,
}: TrustSectionProps) {
  const galleryImages = images.slice(0, 4);
  const collageItems = Array.from({ length: 4 }, (_, index) => galleryImages[index] ?? null);
  const amountDisplay = useMemo(
    () => getImpactDisplayNumber(totalContributionAmount),
    [totalContributionAmount],
  );
  const showImpactMetrics = donationPercentage != null || totalContributionAmount != null;

  return (
    <section className="h-auto bg-white py-20">
      <div className="mx-auto h-auto max-w-7xl px-4 sm:px-6">
        
        {/* HEADING SECTION */}
        <AnimatedSection className="mb-12 text-center">
          <motion.h2
            className="text-3xl sm:text-4xl mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            A Little More Than <span className="text-[#1F8A84]">Just a Stay</span>
          </motion.h2>

          <motion.p
            className="text-base sm:text-xl text-[#4F5F5B] max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Every stay reflects more than a booking — it reflects local care, thoughtful hosting, and a more grounded way to experience Varanasi.
          </motion.p>
        </AnimatedSection>

        {/* MAIN GRID */}
        <div className="grid items-center gap-10 md:grid-cols-2">
          
          {/* IMAGE GRID */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            {collageItems.map((image, index) => {
              const placeholder = placeholderTiles[index];
              const heightClassName = index % 2 === 0 ? "aspect-[0.9]" : "aspect-[0.78]";

              return (
                <div
                  key={`trust-tile-${index}`}
                  className={`overflow-hidden rounded-[1.75rem] shadow-[0_18px_40px_rgba(23,58,57,0.10)] ${heightClassName}`}
                >
                  {image ? (
                    <ImageWithFallback
                      src={image}
                      alt={placeholder.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className={`flex h-full w-full items-end p-5 ${placeholder.className}`}
                      aria-hidden="true"
                    >
                      <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2E5756]">
                        {placeholder.title}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>

          {/* TEXT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-left"
          >
            <h2 className="text-4xl font-semibold leading-tight text-[#173A39]">
              Stays That Feel Good, Inside and Out
            </h2>

            <div className="mt-6 h-px w-24 bg-[#B9CDC3]" />

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#4F5F5B]">
              Sacred Homes is built around real neighborhood familiarity, guest comfort, and a hosting style that helps visitors understand where they are staying, not just where they are sleeping.
            </p>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#6F7B76]">
              That means practical guidance around local areas, more confidence for family and temple-focused trips, and stays that feel authentic to Banaras without turning into generic hospitality copy.
            </p>

            {showImpactMetrics && (
              <div className="mt-8 rounded-[1.5rem] border border-[#D8E5DF] bg-[#F8FBF9] p-6 shadow-[0_18px_32px_rgba(23,58,57,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5F7A73]">
                  Impact Highlight
                </p>
                <p className="mt-3 text-lg leading-8 text-[#173A39]">
                  We&apos;ve contributed over{" "}
                  <span className="font-semibold text-[#1F8A84]">
                    <AnimatedImpactValue
                      value={amountDisplay.value}
                      suffix={amountDisplay.suffix}
                      decimals={amountDisplay.decimals}
                    />
                  </span>{" "}
                  towards community initiatives and sustainable hospitality.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#6F7B76]">Total Contribution</p>
                    <p className="mt-2 text-2xl font-semibold text-[#173A39]">{formatImpactAmount(totalContributionAmount)}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#6F7B76]">Revenue Reinvested</p>
                    <p className="mt-2 text-2xl font-semibold text-[#173A39]">
                      <AnimatedImpactValue value={donationPercentage ?? 0} suffix="%" decimals={0} />
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
