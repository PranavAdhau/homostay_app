import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import BlogsSection from '../components/BlogsSection';
import HomestaysSection from '../components/HomestaysSection';
import TeamSection from '../components/TeamSection';
import BookingSection from '../components/BookingSection';
import ReviewsSection from '../components/ReviewsSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import HostPropertySection from '../components/HostPropertySection';
import TrustSection from '../components/TrustSection';
import api from '../lib/axios';
import type { PublicHomestay } from '../lib/homestays';
import {
  buildSearchValidation,
  DEFAULT_SEARCH_FILTERS,
  type SearchFilters,
} from '../lib/searchFilters';
import { useContent } from '../components/ContentProvider';
import { LOCALITY_ROUTE_CONTENT } from '../lib/seo';

function buildHomestaySearchParams(filters: SearchFilters) {
  const params: Record<string, string> = {};

  if (filters.guests) {
    params.guests = filters.guests;
  }

  if (filters.rooms) {
    params.rooms = filters.rooms;
  }

  if (
    filters.checkIn &&
    filters.checkOut &&
    filters.checkOut.diff(filters.checkIn, 'day') > 0
  ) {
    params.check_in = filters.checkIn.format('YYYY-MM-DD');
    params.check_out = filters.checkOut.format('YYYY-MM-DD');
  }

  return params;
}

function hasActiveFilters(filters: SearchFilters) {
  return Boolean(
    filters.checkIn || filters.checkOut || filters.guests || filters.rooms,
  );
}

export default function Index() {
  const location = useLocation();
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [allHomestays, setAllHomestays] = useState<PublicHomestay[]>([]);
  const [visibleHomestays, setVisibleHomestays] = useState<PublicHomestay[]>([]);
  const [homestaysLoading, setHomestaysLoading] = useState(true);
  const [filteredHomestaysLoading, setFilteredHomestaysLoading] = useState(false);
  const { siteContent } = useContent();

  useLayoutEffect(() => {
    const handleNavigation = () => {
      if (location.hash) {
        const id = location.hash.replace('#', '');
        document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
      } else if (location.pathname === '/homestays') {
        document.getElementById('homestays')?.scrollIntoView({ behavior: 'auto', block: 'start' });
      } else if (
        location.pathname !== '/' &&
        location.pathname !== '/bookings' &&
        Boolean(LOCALITY_ROUTE_CONTENT[location.pathname])
      ) {
        document.getElementById('homestays')?.scrollIntoView({ behavior: 'auto', block: 'start' });
      } else if (location.pathname === '/bookings') {
        document.getElementById('booking')?.scrollIntoView({ behavior: 'auto', block: 'start' });
      } else if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    };

    handleNavigation();
  }, [location, homestaysLoading]);

  const fetchHomestays = useCallback(async (searchFilters: SearchFilters) => {
    const response = await api.get('/homestays', {
      params: buildHomestaySearchParams(searchFilters),
    });

    if (response.data?.success && Array.isArray(response.data?.data)) {
      return response.data.data as PublicHomestay[];
    }

    return [];
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchInitialHomestays = async () => {
      setHomestaysLoading(true);

      try {
        const homestays = await fetchHomestays(DEFAULT_SEARCH_FILTERS);

        if (cancelled) {
          return;
        }

        setAllHomestays(homestays);
        setVisibleHomestays(homestays);
      } catch (error) {
        console.error('Error fetching landing homestays:', error);

        if (!cancelled) {
          setAllHomestays([]);
          setVisibleHomestays([]);
        }
      } finally {
        if (!cancelled) {
          setHomestaysLoading(false);
        }
      }
    };

    fetchInitialHomestays();

    return () => {
      cancelled = true;
    };
  }, [fetchHomestays]);

  const hasAppliedFilters = useMemo(
    () => hasActiveFilters(appliedFilters),
    [appliedFilters],
  );

  useEffect(() => {
    if (homestaysLoading) {
      return;
    }

    if (!hasAppliedFilters) {
      setVisibleHomestays(allHomestays);
      setFilteredHomestaysLoading(false);
      return;
    }

    let cancelled = false;

    const fetchFilteredHomestays = async () => {
      setFilteredHomestaysLoading(true);

      try {
        const homestays = await fetchHomestays(appliedFilters);

        if (!cancelled) {
          setVisibleHomestays(homestays);
        }
      } catch (error) {
        console.error('Error fetching filtered homestays:', error);

        if (!cancelled) {
          setVisibleHomestays([]);
        }
      } finally {
        if (!cancelled) {
          setFilteredHomestaysLoading(false);
        }
      }
    };

    fetchFilteredHomestays();

    return () => {
      cancelled = true;
    };
  }, [allHomestays, appliedFilters, fetchHomestays, hasAppliedFilters, homestaysLoading]);

  const handleCheckInChange = useCallback((checkIn: SearchFilters["checkIn"]) => {
    setFilters((current) => {
      const nextCheckOut =
        checkIn && current.checkOut && current.checkOut.diff(checkIn, 'day') <= 0
          ? null
          : current.checkOut;

      return {
        ...current,
        checkIn,
        checkOut: nextCheckOut,
      };
    });
  }, []);

  const handleCheckOutChange = useCallback((checkOut: SearchFilters["checkOut"]) => {
    setFilters((current) => ({
      ...current,
      checkOut,
    }));
  }, []);

  const handleGuestsChange = useCallback((guests: string) => {
    setFilters((current) => ({
      ...current,
      guests,
    }));
  }, []);

  const handleRoomsChange = useCallback((rooms: string) => {
    setFilters((current) => ({
      ...current,
      rooms,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_SEARCH_FILTERS);
    setAppliedFilters(DEFAULT_SEARCH_FILTERS);
  }, []);

  const handleSearch = useCallback(() => {
    setAppliedFilters(filters);
    document.getElementById('homestays')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [filters]);

  const searchValidation = useMemo(
    () => buildSearchValidation(filters),
    [filters],
  );

  const hostPropertyImageCandidates = useMemo(() => {
    if (siteContent?.host_property_image_urls?.length) {
      return siteContent.host_property_image_urls;
    }
    const firstHomestay = allHomestays[0];

    if (!firstHomestay) {
      return [];
    }

    return [firstHomestay.featured_image, firstHomestay.images[0]];
  }, [allHomestays, siteContent]);

  const trustSectionImages = useMemo(
    () => {
      if (siteContent?.little_more_image_urls?.length) {
        return siteContent.little_more_image_urls.slice(0, 4);
      }
      return allHomestays
        .flatMap((homestay) => [homestay.featured_image, homestay.images[0]])
        .filter((image): image is string => Boolean(image))
        .slice(0, 4);
    },
    [allHomestays, siteContent],
  );

  return (
    <div className="min-h-screen">
      <Header />
      <div className="overflow-x-hidden">
        <Hero
          searchUi={{
            filters,
            validation: searchValidation,
            onCheckInChange: handleCheckInChange,
            onCheckOutChange: handleCheckOutChange,
            onGuestsChange: handleGuestsChange,
            onRoomsChange: handleRoomsChange,
            onClear: handleClearFilters,
            onSearch: handleSearch,
          }}
        />
        <HomestaysSection
          homestays={visibleHomestays}
          loading={homestaysLoading || filteredHomestaysLoading}
          emptyMessage={hasAppliedFilters ? 'No homestays match your search.' : undefined}
        />
        <TeamSection />
        <HostPropertySection imageCandidates={hostPropertyImageCandidates} />
        <TrustSection
          images={trustSectionImages}
          donationPercentage={siteContent?.donation_percentage}
          totalContributionAmount={siteContent?.total_contribution_amount}
        />
        <BlogsSection />
        <BookingSection />
        <ReviewsSection />
        <ContactSection />
        <Footer />
      </div>
    </div>
  );
}
