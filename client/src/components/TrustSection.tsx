import { motion } from "motion/react";
import AnimatedSection from "./AnimatedSection";
import { ImageWithFallback } from "./figma/ImageWithFallback";

type TrustSectionProps = {
  images?: string[];
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

export default function TrustSection({ images = [] }: TrustSectionProps) {
  const galleryImages = images.slice(0, 4);
  const collageItems = Array.from({ length: 4 }, (_, index) => galleryImages[index] ?? null);

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
            Every stay quietly contributes to something meaningful — making your
            experience feel just a little more special.
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
              When you choose to stay with us, you're also supporting local communities,
              mindful living, and small initiatives that make a quiet difference.
            </p>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#6F7B76]">
              It’s not something you have to think about — just enjoy your stay knowing
              it’s part of something positive.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
