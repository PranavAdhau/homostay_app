import { useMemo, useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import AnimatedSection from "./AnimatedSection";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { formatImpactAmount } from "../lib/impact";

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

function useCountUp(target: number, duration = 3200, trigger: boolean) {
  const [current, setCurrent] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!trigger || hasRun.current) return;
    hasRun.current = true;

    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [trigger, target, duration]);

  return current;
}

function formatLakhs(value: number): string {
  const inLakhs = (value / 100000).toFixed(1);
  return `₹${inLakhs} L`;
}

export default function TrustSection({
  images = [],
  donationPercentage,
  totalContributionAmount,
}: TrustSectionProps) {
  const galleryImages = images.slice(0, 4);
  const collageItems = Array.from({ length: 4 }, (_, index) => galleryImages[index] ?? null);
  const showImpactMetrics = donationPercentage != null || totalContributionAmount != null;
  const reinvestedDisplay = useMemo(
    () => (donationPercentage != null ? `${Math.round(donationPercentage)}%` : "0%"),
    [donationPercentage],
  );

  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-80px" });
  const rawTotal = totalContributionAmount ?? 0;
  const animatedValue = useCountUp(rawTotal, 3200, isInView);

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">

        {/* HEADING SECTION */}
        <AnimatedSection className="mb-14 sm:mb-16 text-center">
          <motion.h2
            className="text-3xl sm:text-4xl mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            A Little More Than <span className="text-[#1F8A84]">Just a Stay</span>
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg text-[#4F5F5B] max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.12 }}
          >
            Every stay quietly contributes to something meaningful — making your
            experience feel just a little more special.
          </motion.p>
        </AnimatedSection>

        {/* MAIN GRID */}
        <div className="grid items-center gap-10 lg:gap-16 lg:grid-cols-2">

          {/* IMAGE COLLAGE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-2.5 sm:gap-3"
          >
            {collageItems.map((image, index) => {
              const placeholder = placeholderTiles[index];
              const heightClass = index % 2 === 0 ? "aspect-[0.88]" : "aspect-[0.76]";

              return (
                <motion.div
                  key={`trust-tile-${index}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.07 }}
                  className={`overflow-hidden rounded-xl sm:rounded-2xl shadow-[0_2px_12px_rgba(23,58,57,0.06)] ${heightClass}`}
                >
                  {image ? (
                    <ImageWithFallback
                      src={image}
                      alt={placeholder.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                    />
                  ) : (
                    <div
                      className={`flex h-full w-full items-end p-5 ${placeholder.className}`}
                      aria-hidden="true"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2E5756]">
                        {placeholder.title}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* TEXT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-left"
          >
            <h2 className="text-3xl sm:text-[2.1rem] font-semibold leading-tight text-[#173A39]">
              Your Stay Supports Something Meaningful
            </h2>

            <div className="mt-5 h-px w-12 bg-[#C8D9D3]" />

            <p className="mt-6 text-base leading-8 text-[#4F5F5B]">
              When you choose to stay with us, you're also supporting local communities,
              mindful living, and small initiatives that make a quiet difference.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#7A8C87]">
              It's not something you have to think about — just enjoy your stay knowing
              it's part of something positive.
            </p>

            {showImpactMetrics && (
              <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8 rounded-xl border border-[#EAF0ED] px-5 py-5"
              >
                {/* IMPACT LABEL */}
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#A8BDB6]">
                  Impact
                </p>

                {/* COUNTER */}
                <div className="mt-3.5 flex flex-wrap items-baseline gap-2">
                  <span className="text-[2rem] font-semibold tracking-[-0.03em] text-[#1F8A84] leading-none tabular-nums">
                    {formatLakhs(animatedValue)}
                  </span>
                  <span className="text-xs text-[#A8BDB6] tracking-wide">contributed so far</span>
                </div>

                <p className="mt-2 text-sm leading-6 text-[#7A8C87]">
                  A portion of every stay helps support local communities and meaningful
                  initiatives around us.
                </p>

                {/* DIVIDER */}
                <div className="mt-4 h-px bg-[#EAF0ED]" />

                {/* REINVESTED STAT */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-lg font-semibold text-[#173A39] tabular-nums">
                    {reinvestedDisplay}
                  </span>
                  <span className="text-xs text-[#7A8C87] leading-5">
                    of revenue reinvested into community-focused initiatives
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
