import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import {
  buildBlogPath,
  getRouteSeoContent,
  type RouteSeoContent,
  LOCALITY_ROUTE_CONTENT,
} from '../lib/seo';
import { fetchPublicBlogs, type PublicBlog } from '../lib/publicContent';

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
  const [featuredBlogs, setFeaturedBlogs] = useState<PublicBlog[]>([]);
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

  const routeSeoContent = useMemo<RouteSeoContent>(
    () => getRouteSeoContent(location.pathname),
    [location.pathname],
  );

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

  useEffect(() => {
    let cancelled = false;

    const fetchBlogs = async () => {
      try {
        const blogs = await fetchPublicBlogs(8);
        if (!cancelled) {
          setFeaturedBlogs(blogs);
        }
      } catch (error) {
        console.error('Error fetching featured blogs for SEO hub:', error);
        if (!cancelled) {
          setFeaturedBlogs([]);
        }
      }
    };

    fetchBlogs();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const featuredPropertyLinks = useMemo(() => {
    const preferredSlugs = routeSeoContent.featuredPropertySlugs ?? [];
    const preferred = preferredSlugs
      .map((slug) => allHomestays.find((homestay) => homestay.slug === slug))
      .filter((homestay): homestay is PublicHomestay => Boolean(homestay));

    const fallback = allHomestays.filter(
      (homestay) => !preferred.some((selected) => selected.slug === homestay.slug),
    );

    return [...preferred, ...fallback].slice(0, 3);
  }, [allHomestays, routeSeoContent.featuredPropertySlugs]);

  const featuredBlogLinks = useMemo(() => {
    const preferredTopics = routeSeoContent.featuredBlogTopics ?? [];
    const preferred = preferredTopics
      .map((topic) => featuredBlogs.find((blog) => blog.title === topic))
      .filter((blog): blog is PublicBlog => Boolean(blog));

    const fallback = featuredBlogs.filter(
      (blog) => !preferred.some((selected) => selected.id === blog.id),
    );

    return [...preferred, ...fallback].slice(0, 3);
  }, [featuredBlogs, routeSeoContent.featuredBlogTopics]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="overflow-x-hidden">
        <Hero
          content={{
            eyebrow: routeSeoContent.heroEyebrow,
            title: routeSeoContent.heroTitle,
            subtitle: routeSeoContent.heroSubtitle,
            description: routeSeoContent.heroDescription,
          }}
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
          heading={routeSeoContent.sectionHeading}
          description={routeSeoContent.sectionDescription}
          supportingLinks={routeSeoContent.hubLinks}
        />
        {(routeSeoContent.authorityParagraphs?.length || routeSeoContent.hubLinks?.length) ? (
          <section className="bg-white py-16">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-5xl rounded-[24px] border border-[#DDE7E1] bg-[#FCFDFB] px-6 py-8 shadow-[0_2px_16px_rgba(0,0,0,0.03)] sm:px-8">
                <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    {routeSeoContent.authorityHeading ? (
                      <h2 className="text-3xl text-[#173A39]">{routeSeoContent.authorityHeading}</h2>
                    ) : null}
                    <div className="mt-4 space-y-4 text-base leading-8 text-[#4F5F5B]">
                      {(routeSeoContent.authorityParagraphs ?? []).map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    {routeSeoContent.introHeading ? (
                      <div>
                        <h3 className="text-xl font-semibold text-[#173A39]">
                          {routeSeoContent.introHeading}
                        </h3>
                        <div className="mt-3 space-y-3 text-sm leading-7 text-[#4F5F5B]">
                          {(routeSeoContent.introParagraphs ?? []).map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {routeSeoContent.hubLinks?.length ? (
                      <div>
                        <h3 className="text-xl font-semibold text-[#173A39]">Explore stay types and localities</h3>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {routeSeoContent.hubLinks.map((link) => (
                            <Link
                              key={link.path}
                              to={link.path}
                              className="rounded-full border border-[#CFE1D8] bg-white px-4 py-2 text-sm font-medium text-[#1F8A84] transition-colors hover:bg-[#F4F7F6]"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {(featuredPropertyLinks.length || featuredBlogLinks.length) ? (
                      <div>
                        <h3 className="text-xl font-semibold text-[#173A39]">Plan with key stays and guides</h3>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {featuredPropertyLinks.map((property) => (
                            <Link
                              key={property.slug}
                              to={`/properties/${property.slug}`}
                              className="rounded-full border border-[#CFE1D8] bg-white px-4 py-2 text-sm font-medium text-[#1F8A84] transition-colors hover:bg-[#F4F7F6]"
                            >
                              {property.name}
                            </Link>
                          ))}
                          {featuredBlogLinks.map((blog) => (
                            <Link
                              key={blog.id}
                              to={buildBlogPath(blog)}
                              className="rounded-full border border-[#CFE1D8] bg-white px-4 py-2 text-sm font-medium text-[#1F8A84] transition-colors hover:bg-[#F4F7F6]"
                            >
                              {blog.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}
        {routeSeoContent.faqEntries?.length ? (
          <section className="bg-[#F4F7F6] py-16">
            <div className="container mx-auto px-4">
              <div className="mx-auto max-w-4xl">
                <div className="text-center">
                  <h2 className="text-3xl text-[#173A39]">Frequently asked questions about staying in Varanasi</h2>
                  <p className="mt-3 text-base leading-7 text-[#4F5F5B]">
                    These quick answers help guests compare Varanasi homestays, Banaras neighborhoods, and the stay styles that fit family trips, premium stays, and temple-focused visits.
                  </p>
                </div>
                <div className="mt-8 space-y-4">
                  {routeSeoContent.faqEntries.map((faqEntry, index) => (
                    <details
                      key={`${faqEntry.question}-${index}`}
                      className="rounded-[20px] border border-[#DDE7E1] bg-white px-5 py-4"
                    >
                      <summary className="cursor-pointer text-left text-base font-semibold text-[#173A39]">
                        {faqEntry.question}
                      </summary>
                      <p className="mt-3 text-sm leading-7 text-[#4F5F5B]">{faqEntry.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}
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
