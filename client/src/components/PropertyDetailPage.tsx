import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import PropertyMap from "./PropertyMap";
import { getAmenityIcon } from "../lib/amenityIcons";
import dayjs, { Dayjs } from "dayjs";
import { Button } from "./ui/button";
import { formatINR } from "../lib/currency";
import { applySeoMetadata, buildAbsoluteUrl, setJsonLd } from "../lib/seo";
import { toast } from "sonner@2.0.3";
import { useContent } from "./ContentProvider";
import "./PropertyDetailPage.css";

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
      .then(r => { if (r.data.success) setHomestay(r.data.data); })
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

    const imageUrl = images[0] || homestay.featured_image || "/sacred-homes-logo-circle.svg";
    const metaDescription = `${homestay.description} Stay near ${
      homestay.address || "Varanasi's ghats and temples"
    } with Sacred Homes Varanasi.`;

    applySeoMetadata({
      title: `${homestay.name} | Homestay in Varanasi | Sacred Homes`,
      description: metaDescription,
      canonicalPath: `/properties/${slug}`,
      image: imageUrl,
    });

    setJsonLd("sacred-homes-property-jsonld", {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      name: homestay.name,
      description: homestay.description,
      url: buildAbsoluteUrl(`/properties/${slug}`),
      image: buildAbsoluteUrl(imageUrl),
      telephone: undefined,
      address: {
        "@type": "PostalAddress",
        streetAddress: homestay.address || "Varanasi, Uttar Pradesh, India",
        addressLocality: "Varanasi",
        addressRegion: "Uttar Pradesh",
        addressCountry: "IN",
      },
      numberOfRooms: homestay.rooms,
      occupancy: {
        "@type": "QuantitativeValue",
        maxValue: homestay.capacity,
      },
      amenityFeature: homestay.amenities.map((amenity) => ({
        "@type": "LocationFeatureSpecification",
        name: amenity.name,
        value: true,
      })),
      priceRange: formatINR(homestay.price_per_night),
    });

    setJsonLd("sacred-homes-breadcrumb-jsonld", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: buildAbsoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Homestays",
          item: buildAbsoluteUrl("/homestays"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: homestay.name,
          item: buildAbsoluteUrl(`/properties/${slug}`),
        },
      ],
    });

    return () => {
      setJsonLd("sacred-homes-property-jsonld", null);
      setJsonLd("sacred-homes-breadcrumb-jsonld", null);
    };
  }, [homestay, images, slug]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF5F2' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#1F8A84] border-t-transparent mx-auto" />
        <p style={{ marginTop: 16, color: '#73867A', fontSize: 14 }}>Loading stay...</p>
      </div>
    </div>
  );

  if (!homestay) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF5F2' }}>
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

  return (
    <div style={{ minHeight: '100vh', background: '#FAF5F2', fontFamily: 'inherit', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div className="pdp-page-body">
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
                              alt={`${homestay.name} - ${i + 1}`}
                              className="w-full h-full object-cover"
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
                      <ImageWithFallback src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
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
              <PropertyMap lat={displayLat} lng={displayLng} />
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
      </div>

      {success && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 36, maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#FAF5F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
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
          <div style={{ background: '#FAF5F2', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
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
