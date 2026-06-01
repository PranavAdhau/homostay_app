import React, { lazy, Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, Maximize2, ChevronLeft, ChevronRight,
  Check, CheckCircle, Calendar, Clock, BedDouble,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import Header from './Header';
import Footer from './Footer';
import api from '../lib/axios';
import { GuestDropdown } from "./ui/ReservationForm";
import SharedCalendar from "./SharedCalendar";
import { getAmenityIcon } from "../lib/amenityIcons";
import dayjs, { Dayjs } from "dayjs";
import { Button } from "./ui/button";
import { formatINR } from "../lib/currency";
import {
  applySeoMetadata,
  buildAttractionLinks,
  buildBreadcrumbJsonLd,
  buildBlogPath,
  buildFaqJsonLd,
  buildLandmarkSummary,
  buildManagedInternalLinks,
  buildNearbyLocalityLinks,
  buildPropertyLocalContext,
  buildPropertyImageAlt,
  buildPropertySeo,
  buildRelatedBlogsForProperty,
  buildRelatedProperties,
  inferVaranasiLocality,
  normalizeFaqEntries,
  normalizeNumericIds,
  resolveItemsByIds,
  setJsonLd,
} from "../lib/seo";
import { toast } from "sonner@2.0.3";
import { useContent } from "./ContentProvider";
import { fetchPublicBlogs, fetchPublicHomestays, type PublicBlog } from "../lib/publicContent";
import type { PublicHomestay } from "../lib/homestays";
import "./PropertyDetailPage.css";

const PropertyMap = lazy(() => import("./PropertyMap"));

interface Homestay {
  id: number;
  slug: string;
  name: string;
  description: string;
  capacity: number;
  rooms: number;
  size: string;
  price_per_night: number;
  amenities: Array<{ id: number; name: string; icon_name?: string }>;
  images: string[];
  featured_image?: string;
   latitude?: number | null;
   longitude?: number | null;
   address?: string | null;
  seo_summary?: string | null;
  seo_locality_focus?: string | null;
  locality_tags?: string[];
  nearby_landmark_tags?: string[];
  related_blog_ids?: number[];
  related_homestay_ids?: number[];
  faq_entries?: Array<{ question: string; answer: string }>;
}

interface AvailabilityData {
  available_dates: string[];
  unavailable_dates: string[];
  time_slots: Record<string, Array<{ start_time: string; end_time: string }>>;
}

const toDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function PropertyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [homestay, setHomestay] = useState<Homestay | null>(null);
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [success, setSuccess] = useState(false);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [relatedHomestays, setRelatedHomestays] = useState<PublicHomestay[]>([]);
  const [relatedBlogs, setRelatedBlogs] = useState<PublicBlog[]>([]);
  const [managedLocalityLinks, setManagedLocalityLinks] = useState<ReturnType<typeof buildManagedInternalLinks>>([]);
  const { siteContent } = useContent();

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const images = useMemo(() => {
    if (!homestay) return [];
    return homestay.images.length > 0
      ? homestay.images
      : homestay.featured_image
        ? [homestay.featured_image]
        : [];
  }, [homestay]);

  useEffect(() => {
    if (!slug) return;
    api.get(`/homestays/${slug}`)
      .then(r => {
        if (r.data.success) {
          const data = r.data.data;
          // Fix: normalize related ID arrays to numbers on hydration
          setHomestay({
            ...data,
            id: Number(data.id),
            related_blog_ids: normalizeNumericIds(data.related_blog_ids ?? []),
            related_homestay_ids: normalizeNumericIds(data.related_homestay_ids ?? []),
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    const s = new Date().toISOString().split('T')[0];
    const e = new Date(Date.now() + 90 * 864e5).toISOString().split('T')[0];
    api.get(`/homestays/${slug}/availability`, { params: { start_date: s, end_date: e } })
      .then(r => { if (r.data.success) setAvailability(r.data.data); })
      .catch(console.error);
  }, [slug]);

  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    return dayjs(checkOut).diff(dayjs(checkIn), 'day');
  })();

  const total = homestay ? nights * homestay.price_per_night : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homestay || nights <= 0) {
      toast.info('Please select valid check-in and check-out dates.');
      return;
    }
    if (!guestName || !guestEmail || !guestPhone) {
      toast.info('Please complete the guest details before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const r = await api.post('/bookings', {
        booking: {
          homestay_id: homestay.id, guest_name: guestName, guest_email: guestEmail,
          guest_phone: guestPhone, check_in_date: checkIn, check_out_date: checkOut,
          number_of_guests: parseInt(guests), total_price: total,
        },
      });
      if (r.data.success) {
        setSuccess(true);
        setTimeout(() => { setSuccess(false); navigate('/'); }, 3000);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message;
      const isConflict =
        err?.response?.status === 409 ||
        (typeof message === 'string' &&
          /not available|conflict|already booked/i.test(message));
      toast.error(
        isConflict
          ? 'Selected dates are not available. Please choose different dates.'
          : message || 'Unable to submit your booking right now. Please try again.',
      );
    } finally { setSubmitting(false); }
  };

  const goNext = useCallback((total: number) => {
    if (total <= 1) return;
    setImgIndex(p => (p + 1) % total);
  }, []);

  const goPrev = useCallback((total: number) => {
    if (total <= 1) return;
    setImgIndex(p => (p - 1 + total) % total);
  }, []);

  useEffect(() => { setImgIndex(0); }, [homestay?.slug]);

  const imageCount = images.length;

  useEffect(() => {
    if (imageCount <= 1) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev(imageCount);
      if (e.key === 'ArrowRight') goNext(imageCount);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [imageCount, goNext, goPrev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (imageCount: number) => {
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) goNext(imageCount);
      else goPrev(imageCount);
    }
  };

  useEffect(() => {
    if (!homestay || !slug) {
      return;
    }

    const propertySeo = buildPropertySeo({
      slug,
      name: homestay.name,
      description: homestay.description,
      seoSummary: homestay.seo_summary,
      seoLocalityFocus: homestay.seo_locality_focus,
      localityTags: homestay.locality_tags,
      nearbyLandmarkTags: homestay.nearby_landmark_tags,
      faqEntries: homestay.faq_entries,
      address: homestay.address,
      images,
      featuredImage: homestay.featured_image,
      amenities: homestay.amenities,
      capacity: homestay.capacity,
      rooms: homestay.rooms,
      pricePerNight: homestay.price_per_night,
      latitude: homestay.latitude,
      longitude: homestay.longitude,
    });

    applySeoMetadata(propertySeo.metadata);
    setJsonLd("sacred-homes-property-jsonld", propertySeo.schema);
    setJsonLd("sacred-homes-faq-jsonld", buildFaqJsonLd(propertySeo.faqEntries));
    setJsonLd(
      "sacred-homes-breadcrumb-jsonld",
      buildBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Homestays", path: "/homestays" },
        { name: homestay.name, path: `/properties/${slug}` },
      ]),
    );

    return () => {
      setJsonLd("sacred-homes-property-jsonld", null);
      setJsonLd("sacred-homes-faq-jsonld", null);
      setJsonLd("sacred-homes-breadcrumb-jsonld", null);
    };
  }, [homestay, images, slug]);

  useEffect(() => {
    if (!homestay) {
      return;
    }

    let cancelled = false;

    const loadRelatedSeoContent = async () => {
      try {
        const [homestays, blogs] = await Promise.all([
          fetchPublicHomestays(),
          fetchPublicBlogs(20),
        ]);

        if (cancelled) {
          return;
        }

        setManagedLocalityLinks(
          (() => {
            const managedLinks = buildManagedInternalLinks(
              [
                homestay.seo_locality_focus,
                ...(homestay.locality_tags ?? []),
                ...(homestay.nearby_landmark_tags ?? []),
              ],
              4,
            );

            if (managedLinks.length >= 3) {
              return managedLinks;
            }

            return buildNearbyLocalityLinks(
              homestay.name,
              homestay.address,
              homestay.description,
              homestay.seo_locality_focus,
              ...(homestay.locality_tags ?? []),
              ...(homestay.nearby_landmark_tags ?? []),
            );
          })(),
        );
        const curatedHomestays = resolveItemsByIds(
          homestay.related_homestay_ids ?? [],
          homestays,
        )
          .filter((property) => property.slug !== homestay.slug)
          .slice(0, 3);
        const curatedBlogs = resolveItemsByIds(
          homestay.related_blog_ids ?? [],
          blogs,
        ).slice(0, 3);

        setRelatedHomestays(
          curatedHomestays.length > 0
            ? curatedHomestays
            : buildRelatedProperties(
                {
                  id: homestay.id,
                  slug: homestay.slug,
                  name: homestay.name,
                  description: homestay.description,
                  amenities: homestay.amenities,
                  address: homestay.address,
                  capacity: homestay.capacity,
                  rooms: homestay.rooms,
                  price_per_night: homestay.price_per_night,
                },
                homestays,
              ),
        );
        setRelatedBlogs(
          curatedBlogs.length > 0
            ? curatedBlogs
            : buildRelatedBlogsForProperty(
                {
                  id: homestay.id,
                  slug: homestay.slug,
                  name: homestay.name,
                  description: homestay.description,
                  amenities: homestay.amenities,
                  address: homestay.address,
                  capacity: homestay.capacity,
                  rooms: homestay.rooms,
                  price_per_night: homestay.price_per_night,
                },
                blogs,
              ),
        );
      } catch (error) {
        console.error("Error fetching related property SEO content:", error);
        if (!cancelled) {
          setManagedLocalityLinks([]);
          setRelatedHomestays([]);
          setRelatedBlogs([]);
        }
      }
    };

    loadRelatedSeoContent();

    return () => {
      cancelled = true;
    };
  }, [homestay]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F7F6' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1F8A84] border-t-transparent mx-auto" />
        <p style={{ marginTop: 16, color: '#73867A', fontSize: 14 }}>Loading stay...</p>
      </div>
    </div>
  );

  if (!homestay) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F7F6' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, color: '#173A39' }}>Stay not found</h2>
        <button onClick={() => navigate('/#homestays')} style={{ padding: '10px 24px', background: '#1F8A84', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Back to Homestays</button>
      </div>
    </div>
  );

  const fieldLabel: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 500, color: '#73867A', marginBottom: 3, letterSpacing: '0.16em', textTransform: 'uppercase',
  };

  const lat = homestay.latitude != null ? Number(homestay.latitude) : null;
  const lng = homestay.longitude != null ? Number(homestay.longitude) : null;
  
  const hasLocation =
    lat !== null &&
    lng !== null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);
  
  const displayLat = lat !== null ? lat + 0.001 : null;
  const displayLng = lng !== null ? lng + 0.001 : null;
  
  const mapsUrl =
    lat !== null && lng !== null
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : null;
  const localityLabel =
    inferVaranasiLocality(homestay.address, homestay.name)?.label || "the ghats";
  const faqEntries = normalizeFaqEntries(homestay.faq_entries);
  const localContext = buildPropertyLocalContext(
    homestay.name,
    homestay.address,
    homestay.description,
    homestay.seo_locality_focus,
    ...(homestay.locality_tags ?? []),
    ...(homestay.nearby_landmark_tags ?? []),
  );
  const landmarkSummary = buildLandmarkSummary([
    ...(homestay.nearby_landmark_tags ?? []),
    homestay.seo_locality_focus,
  ]);
  const contextualTravelLinks = buildAttractionLinks(
    homestay.name,
    homestay.address,
    homestay.description,
    homestay.seo_locality_focus,
    ...(homestay.locality_tags ?? []),
    ...(homestay.nearby_landmark_tags ?? []),
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F4F7F6', fontFamily: 'inherit', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main className="pdp-page-body">
        <button className="pdp-back" onClick={() => navigate('/#homestays')}>
          <ArrowLeft style={{ width: 15, height: 15 }} />
          Back to Homestays
        </button>

        <div className="pdp-grid">
          <div className="pdp-left">
            <div>
              <div
                className="pdp-gallery"
                ref={sliderRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={() => handleTouchEnd(images.length)}
              >
                {images.length > 0 ? (
                  <>
                    <div
                      className="pdp-slider-track"
                      style={{ transform: `translate3d(-${imgIndex * 100}%, 0, 0)` }}
                    >
                      {images.map((img, i) => (
                        <div className="pdp-slide" key={i}>
                          {Math.abs(i - imgIndex) <= 1 ? (
                            <ImageWithFallback
                              src={img}
                              alt={buildPropertyImageAlt(homestay.name, localityLabel, i)}
                              className="w-full h-full object-cover"
                              loading={i === 0 ? "eager" : "lazy"}
                              decoding="async"
                              fetchPriority={i === 0 ? "high" : "auto"}
                              width={1600}
                              height={900}
                            />
                          ) : (
                            <div style={{ background: '#e2e8f0' }} />
                          )}
                        </div>
                      ))}
                    </div>
                    {images.length > 1 && (
                      <>
                        <button className="pdp-gallery-btn prev" onClick={() => goPrev(images.length)} aria-label="Previous image">
                          <ChevronLeft style={{ width: 20, height: 20, color: '#374151' }} />
                        </button>
                        <button className="pdp-gallery-btn next" onClick={() => goNext(images.length)} aria-label="Next image">
                          <ChevronRight style={{ width: 20, height: 20, color: '#374151' }} />
                        </button>
                        <div className="pdp-gallery-counter">{imgIndex + 1} / {images.length}</div>
                      </>
                    )}
                  </>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 14 }}>
                    No images available
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="pdp-thumbs">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      className={`pdp-thumb-btn ${i === imgIndex ? 'active' : 'inactive'}`}
                      onClick={() => setImgIndex(i)}
                      aria-label={`View image ${i + 1}`}
                    >
                      <ImageWithFallback
                        src={img}
                        alt={buildPropertyImageAlt(homestay.name, localityLabel, i)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width={240}
                        height={160}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pdp-info-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                <h1 style={{ fontSize: 21, fontWeight: 700, color: '#173A39', margin: 0, lineHeight: 1.3 }}>{homestay.name}</h1>
                <p style={{ margin: 0, whiteSpace: 'nowrap' }}>
                  <span style={{ fontSize: 19, fontWeight: 700, color: '#1F8A84' }}>{formatINR(homestay.price_per_night)}</span>
                  <span style={{ fontSize: 13, color: '#73867A' }}> / night</span>
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, color: '#73867A', fontSize: 13, marginBottom: 18 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Users style={{ width: 14, height: 14 }} /> {homestay.capacity} Guests
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <BedDouble style={{ width: 14, height: 14 }} /> {homestay.rooms} {homestay.rooms === 1 ? 'Room' : 'Rooms'}
                </span>
                {homestay.size && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Maximize2 style={{ width: 14, height: 14 }} /> {homestay.size}
                  </span>
                )}
              </div>

              <div style={{ borderTop: '1px solid #E5ECE6', paddingTop: 16, marginBottom: 18 }}>
                <p style={{ margin: '0 0 12px', fontSize: 14, color: '#4F5F5B', lineHeight: 1.7 }}>
                  Check In time: <strong>2PM</strong>, Check out time: <strong>11AM</strong>.
                  Early check in and late check out is subject to availability.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 w-full sm:w-auto rounded-full border-[#1F8A84] px-0 sm:px-5 text-[12px] sm:text-sm font-semibold tracking-wide text-[#1F8A84] hover:bg-[#F3F7F4] flex items-center justify-center whitespace-nowrap"
                  >
                    <a href={siteContent?.house_rules_pdf_url || "/assets/house-rules.pdf"} download>
                      House Rules
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 w-full sm:w-auto rounded-full border-[#1F8A84] px-0 sm:px-5 text-[12px] sm:text-sm font-semibold tracking-wide text-[#1F8A84] hover:bg-[#F3F7F4] flex items-center justify-center whitespace-nowrap"
                  >
                    <a href={siteContent?.cancellation_policy_pdf_url || "/assets/cancellation-policy.pdf"} download>
                      Cancel Policy
                    </a>
                  </Button>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #E5ECE6', paddingTop: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#173A39', marginBottom: 8, marginTop: 0 }}>About This Stay</h2>
                <p style={{ fontSize: 14, color: '#4F5F5B', lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>{homestay.description}</p>
                <p style={{ fontSize: 14, color: '#4F5F5B', lineHeight: 1.75, margin: '12px 0 0' }}>
                  {localContext}
                  {landmarkSummary ? ` Nearby landmarks and local references often associated with this stay include ${landmarkSummary}.` : ''}
                </p>
              </div>

              {homestay.amenities.length > 0 && (
                <div style={{ borderTop: '1px solid #E5ECE6', marginTop: 18, paddingTop: 16 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: '#173A39', marginBottom: 12, marginTop: 0 }}>Amenities</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {homestay.amenities.map(a => {
                      const Icon = getAmenityIcon(a.name);
                      return (
                        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', background: '#F8F8F8', borderRadius: 8, fontSize: 13, color: '#4F5F5B', border: '1px solid #D4DDD5' }}>
                          {Icon ? <Icon style={{ width: 14, height: 14 }} /> : <Check style={{ width: 14, height: 14, color: '#1F8A84' }} />}
                          {a.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            <div className="pdp-mobile-form">
              <ReservationForm
                homestay={homestay}
                guests={guests} setGuests={setGuests}
                guestName={guestName} setGuestName={setGuestName}
                guestEmail={guestEmail} setGuestEmail={setGuestEmail}
                guestPhone={guestPhone} setGuestPhone={setGuestPhone}
                checkIn={checkIn} setCheckIn={setCheckIn}
                checkOut={checkOut} setCheckOut={setCheckOut}
                nights={nights} total={total}
                submitting={submitting} handleSubmit={handleSubmit}
                availability={availability}
                fieldLabel={fieldLabel}
              />
            </div>
          </div>

          <div className="pdp-right">
            <ReservationForm
              homestay={homestay}
              guests={guests} setGuests={setGuests}
              guestName={guestName} setGuestName={setGuestName}
              guestEmail={guestEmail} setGuestEmail={setGuestEmail}
              guestPhone={guestPhone} setGuestPhone={setGuestPhone}
              checkIn={checkIn} setCheckIn={setCheckIn}
              checkOut={checkOut} setCheckOut={setCheckOut}
              nights={nights} total={total}
              submitting={submitting} handleSubmit={handleSubmit}
              availability={availability}
              fieldLabel={fieldLabel}
              calendarAlign="left"
            />
          </div>
        </div>

        {hasLocation && displayLat != null && displayLng != null && (
          <div className="pdp-map-section">
            <h2
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#173A39",
                marginBottom: 6,
                marginTop: 0,
              }}
            >
              Where you&apos;ll be
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#4F5F5B",
                margin: 0,
              }}
            >
              {homestay.address && homestay.address.trim().length > 0
                ? homestay.address
                : "Exact address will be shared after booking"}
            </p>

            <div style={{ marginTop: 12 }}>
              <Suspense
                fallback={
                  <div
                    style={{
                      minHeight: 280,
                      borderRadius: 16,
                      background: "#EAF0EC",
                    }}
                  />
                }
              >
                <PropertyMap lat={displayLat} lng={displayLng} />
              </Suspense>
            </div>

            {mapsUrl && (
              <div style={{ marginTop: 10 }}>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#1F8A84",
                    textDecoration: "none",
                  }}
                >
                  View larger map &rarr;
                </a>
              </div>
            )}
          </div>
        )}

        {managedLocalityLinks.length > 0 && (
          <section className="pdp-map-section" aria-labelledby="nearby-links-heading">
            <h2
              id="nearby-links-heading"
              style={{ fontSize: 15, fontWeight: 600, color: "#173A39", marginBottom: 10, marginTop: 0 }}
            >
              Explore related locality pages
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {managedLocalityLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#1F8A84",
                    textDecoration: "none",
                    border: "1px solid #CFE1D8",
                    borderRadius: 999,
                    padding: "8px 14px",
                    background: "#fff",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {contextualTravelLinks.length > 0 && (
          <section className="pdp-map-section" aria-labelledby="stay-guides-heading">
            <h2
              id="stay-guides-heading"
              style={{ fontSize: 15, fontWeight: 600, color: "#173A39", marginBottom: 10, marginTop: 0 }}
            >
              Plan your stay around nearby landmarks
            </h2>
            <p style={{ fontSize: 14, color: "#4F5F5B", lineHeight: 1.7, marginBottom: 12 }}>
              These nearby pages can help you compare locality-driven stay options across ghats, temple routes, and the neighborhoods most guests explore while staying in Varanasi.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {contextualTravelLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#1F8A84",
                    textDecoration: "none",
                    border: "1px solid #CFE1D8",
                    borderRadius: 999,
                    padding: "8px 14px",
                    background: "#fff",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {relatedHomestays.length > 0 && (
          <section className="pdp-map-section" aria-labelledby="related-stays-heading">
            <h2
              id="related-stays-heading"
              style={{ fontSize: 15, fontWeight: 600, color: "#173A39", marginBottom: 10, marginTop: 0 }}
            >
              Related Sacred Homes stays
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {relatedHomestays.map((property) => (
                <Link
                  key={property.slug}
                  to={`/properties/${property.slug}`}
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#1F8A84",
                    textDecoration: "none",
                    border: "1px solid #CFE1D8",
                    borderRadius: 999,
                    padding: "8px 14px",
                    background: "#fff",
                  }}
                >
                  {property.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {relatedBlogs.length > 0 && (
          <section className="pdp-map-section" aria-labelledby="related-guides-heading">
            <h2
              id="related-guides-heading"
              style={{ fontSize: 15, fontWeight: 600, color: "#173A39", marginBottom: 10, marginTop: 0 }}
            >
              Related local guides
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {relatedBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  to={buildBlogPath(blog)}
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#1F8A84",
                    textDecoration: "none",
                    border: "1px solid #CFE1D8",
                    borderRadius: 999,
                    padding: "8px 14px",
                    background: "#fff",
                  }}
                >
                  {blog.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        {faqEntries.length > 0 && (
          <section className="pdp-map-section" aria-labelledby="property-faq-heading">
            <h2
              id="property-faq-heading"
              style={{ fontSize: 15, fontWeight: 600, color: "#173A39", marginBottom: 10, marginTop: 0 }}
            >
              Frequently asked questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {faqEntries.map((faqEntry, index) => (
                <details
                  key={`${faqEntry.question}-${index}`}
                  style={{
                    border: "1px solid #E5ECE6",
                    borderRadius: 16,
                    padding: "14px 16px",
                    background: "#fff",
                  }}
                >
                  <summary style={{ cursor: "pointer", color: "#173A39", fontWeight: 600 }}>
                    {faqEntry.question}
                  </summary>
                  <p style={{ marginTop: 12, color: "#4F5F5B", lineHeight: 1.7 }}>
                    {faqEntry.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}
      </main>

      {success && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 36, maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#F4F7F6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <CheckCircle style={{ width: 42, height: 42, color: '#1F8A84' }} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#173A39', marginBottom: 8 }}>Booking Confirmed!</h2>
            <p style={{ color: '#73867A', marginBottom: 26, fontSize: 14, lineHeight: 1.6 }}>We'll contact you shortly to finalize your reservation.</p>
            <button onClick={() => setSuccess(false)} style={{ width: '100%', height: 46, background: '#1F8A84', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Done</button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

// ─── Reservation Form ────────────────────────────────────────────────────────

interface ReservationFormProps {
  homestay: { capacity: number; price_per_night: number };
  guests: string; setGuests: (v: string) => void;
  guestName: string; setGuestName: (v: string) => void;
  guestEmail: string; setGuestEmail: (v: string) => void;
  guestPhone: string; setGuestPhone: (v: string) => void;
  checkIn: string; setCheckIn: (v: string) => void;
  checkOut: string; setCheckOut: (v: string) => void;
  nights: number;
  total: number;
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  availability: AvailabilityData | null;
  fieldLabel: React.CSSProperties;
  // ✅ 'left' = align calendar to left edge of trigger (desktop sidebar)
  // 'center' = center calendar under trigger (mobile/default)
  calendarAlign?: 'left' | 'center';
}

function ReservationForm({
  homestay, guests, setGuests, guestName, setGuestName,
  guestEmail, setGuestEmail, guestPhone, setGuestPhone,
  checkIn, setCheckIn, checkOut, setCheckOut,
  nights, total, submitting, handleSubmit, availability, fieldLabel,
  calendarAlign = 'center',
}: ReservationFormProps) {
  const [openCal, setOpenCal] = useState<'checkIn' | 'checkOut' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const unavailableDates = availability?.unavailable_dates ?? [];

  // ✅ Close calendar on outside click (relative to the whole card)
  useEffect(() => {
    if (!openCal) return;
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setOpenCal(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openCal]);

  const formatDisplay = (dateStr: string) => {
    if (!dateStr) return null;
    return dayjs(dateStr).format('D MMM YYYY');
  };

  const checkoutMin = checkIn
    ? dayjs(checkIn).add(1, 'day')
    : dayjs().add(1, 'day');

  const checkoutDisabled = checkIn
    ? [...unavailableDates, checkIn]
    : unavailableDates;

  return (
    <div className="pdp-res-card" ref={cardRef}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <Calendar style={{ width: 20, height: 20, color: '#1F8A84', flexShrink: 0 }} />
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#173A39', margin: 0 }}>Make a Reservation</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ position: 'relative' }}>
          <label style={fieldLabel}>Number of Guests</label>
          <GuestDropdown value={guests} setValue={setGuests} max={homestay.capacity} />
        </div>

        <div>
          <label style={fieldLabel}>Full Name</label>
          <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} required className="pdp-field pdp-input" />
        </div>

        <div>
          <label style={fieldLabel}>Email</label>
          <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} required className="pdp-field pdp-input" />
        </div>

        <div>
          <label style={fieldLabel}>Phone</label>
          <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} required className="pdp-field pdp-input" />
        </div>

        {/* ✅ Date row — each calendar is absolutely positioned inside its own wrapper */}
        <div className="pdp-date-row">

          {/* Check-in */}
          <div style={{ minWidth: 0 }}>
            <label style={fieldLabel}>Check-in Date</label>
            <div className="pdp-calendar-wrapper">
              <button
                type="button"
                className={`pdp-cal-trigger${openCal === 'checkIn' ? ' open' : ''}`}
                onClick={() => setOpenCal(openCal === 'checkIn' ? null : 'checkIn')}
              >
                {checkIn
                  ? <span style={{ fontSize: 13, fontWeight: 500 }}>{formatDisplay(checkIn)}</span>
                  : <span className="placeholder">Check-in</span>
                }
                <Calendar className="cal-icon" style={{ width: 15, height: 15 }} />
              </button>

              {openCal === 'checkIn' && (
                <div
                  className="pdp-calendar-popover"
                  style={calendarAlign === 'left' ? { left: 0, transform: 'none' } : undefined}
                >
                  <SharedCalendar
                    value={checkIn ? dayjs(checkIn) : null}
                    onChange={(date) => {
                      if (!date) { setCheckIn(''); return; }
                      const str = date.format('YYYY-MM-DD');
                      setCheckIn(str);
                      if (checkOut && checkOut <= str) setCheckOut('');
                    }}
                    onClose={() => setOpenCal(null)}
                    minDate={dayjs().add(1, 'day')}
                    disabledDates={unavailableDates}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Check-out */}
          <div style={{ minWidth: 0 }}>
            <label style={fieldLabel}>Check-out Date</label>
            <div className="pdp-calendar-wrapper">
              <button
                type="button"
                className={`pdp-cal-trigger${openCal === 'checkOut' ? ' open' : ''}`}
                onClick={() => setOpenCal(openCal === 'checkOut' ? null : 'checkOut')}
              >
                {checkOut
                  ? <span style={{ fontSize: 13, fontWeight: 500 }}>{formatDisplay(checkOut)}</span>
                  : <span className="placeholder">Check-out</span>
                }
                <Calendar className="cal-icon" style={{ width: 15, height: 15 }} />
              </button>

              {openCal === 'checkOut' && (
                <div
                  className="pdp-calendar-popover"
                  style={calendarAlign === 'left' ? { left: 0, transform: 'none' } : undefined}
                >
                  <SharedCalendar
                    value={checkOut ? dayjs(checkOut) : null}
                    onChange={(date) => {
                      if (!date) { setCheckOut(''); return; }
                      setCheckOut(date.format('YYYY-MM-DD'));
                    }}
                    onClose={() => setOpenCal(null)}
                    minDate={checkoutMin}
                    disabledDates={checkoutDisabled}
                    defaultCalendarMonth={checkoutMin}
                  />
                </div>
              )}
            </div>
          </div>

        </div>

        {nights > 0 && (
          <div style={{ background: '#F4F7F6', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#73867A' }}>
              {formatINR(homestay.price_per_night)} × {nights} {nights === 1 ? 'night' : 'nights'}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1F8A84', whiteSpace: 'nowrap' }}>
              {formatINR(total)}
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={!checkIn || !checkOut || !guestName || !guestEmail || !guestPhone || submitting}
          className="pdp-btn"
        >
          <Calendar style={{ width: 18, height: 18 }} />
          {submitting ? 'Processing...' : 'Reserve Now'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#73867A', margin: 0 }}>
          You won't be charged at this time
        </p>
      </form>
    </div>
  );
}
