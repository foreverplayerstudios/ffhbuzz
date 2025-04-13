import * as React from 'react';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

// Define window.gtag for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, target: string, params?: Record<string, any>) => void;
  }
}

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'video.movie' | 'video.episode';
  publishedAt?: string;
  modifiedAt?: string;
  canonical?: string;
  rating?: number;
  duration?: number;
  genres?: string[];
  actors?: string[];
  director?: string;
  alternateLanguages?: { [key: string]: string };
  noindex?: boolean; // Add option to prevent indexing of specific pages
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  type = 'website',
  publishedAt,
  modifiedAt,
  canonical,
  rating,
  duration,
  genres,
  actors,
  director,
  alternateLanguages,
  noindex = false
}) => {
  const location = useLocation();
  const siteName = 'FreeFilmHub';
  const defaultImage = `${window.location.origin}/og-image.jpg`;
  
  // Get the absolute URL for the current page
  const currentUrl = canonical || `${window.location.origin}${location.pathname}`;

  // Make sure we keep track of visited URLs for analytics and SEO
  useEffect(() => {
    // Track pageview for analytics (if available)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-XXXXXXXXXX', {
        page_path: location.pathname + location.search
      });
    }
  }, [location]);

  // Create a shorter title for the <title> tag (max 60 characters)
  const shortTitle = title.length > 60 ? `${title.substring(0, 57)}...` : title;
  const pageTitle = `${shortTitle} | ${siteName}`;

  // Truncate description to recommended length (max 155 characters)
  const shortDescription = description.length > 155 
    ? `${description.substring(0, 152)}...` 
    : description;

  // Add self-referencing hreflang
  const allLanguages = {
    'x-default': currentUrl,
    ...(alternateLanguages || {}),
  };

  // Determine if it's a movie page by URL pattern
  const isMoviePage = location.pathname.match(/\/(movie|tv)\/\d+$/);

  // Enhanced Rich Snippets Schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': type === 'video.movie' ? 'Movie' : type === 'video.episode' ? 'TVEpisode' : 'WebSite',
    name: title,
    description: shortDescription,
    url: currentUrl,
    ...(type !== 'website' && {
      datePublished: publishedAt,
      dateModified: modifiedAt || publishedAt,
      image: image || defaultImage,
      aggregateRating: rating && {
        '@type': 'AggregateRating',
        ratingValue: rating,
        bestRating: '10',
        worstRating: '1',
        ratingCount: '1000',
      },
      duration: duration && `PT${duration}M`,
      genre: genres,
      actor: actors?.map((name: string) => ({
        '@type': 'Person',
        name,
      })),
      director: director && {
        '@type': 'Person',
        name: director,
      },
      provider: {
        '@type': 'Organization',
        name: siteName,
        sameAs: window.location.origin,
      },
      potentialAction: {
        '@type': 'WatchAction',
        target: currentUrl,
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      }
    }),
  };

  // Enhanced Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: window.location.origin,
    logo: {
      '@type': 'ImageObject',
      url: `${window.location.origin}/icon-512.svg`,
      width: '512',
      height: '512'
    },
    sameAs: [
      'https://facebook.com/freefilmhub',
      'https://twitter.com/freefilmhub',
      'https://instagram.com/freefilmhub',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'contact@freefilmhub.buzz'
    }
  };

  // Generate dynamic breadcrumb based on current pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: window.location.origin,
    }
  ];

  // Add breadcrumb items for each path segment
  pathSegments.forEach((segment: string, index: number) => {
    let name = segment;
    
    // Format segment if it's a known route
    if (segment === 'movie') name = 'Movies';
    else if (segment === 'tv') name = 'TV Shows';
    else if (segment === 'trending') name = 'Trending';
    else if (segment === 'latest') name = 'Latest';
    else if (segment === 'top-rated') name = 'Top Rated';
    else if (segment === 'genre') name = 'Genres';
    else if (segment === 'search') name = 'Search';
    
    // Only add if not the last segment (which is the title)
    if (index < pathSegments.length - 1 || !isMoviePage) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: index + 2,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        item: `${window.location.origin}/${pathSegments.slice(0, index + 1).join('/')}`,
      });
    }
  });

  // Add the title as the last breadcrumb item if it's a movie/tv page
  if (isMoviePage) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: breadcrumbItems.length + 1,
      name: title,
      item: currentUrl,
    });
  }

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  // VideoObject schema for video pages
  const videoSchema = type.startsWith('video.') ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description: shortDescription,
    thumbnailUrl: image || defaultImage,
    uploadDate: publishedAt,
    duration: duration && `PT${duration}M`,
    contentUrl: currentUrl,
    embedUrl: currentUrl,
    potentialAction: {
      '@type': 'WatchAction',
      target: currentUrl,
    },
  } : null;

  return (
    <Helmet>
      {/* Basic */}
      <html lang="en" />
      <title>{pageTitle}</title>
      <meta name="description" content={shortDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={currentUrl} />

      {/* Robots */}
      {noindex ? (
        <>
          <meta name="robots" content="noindex, nofollow" />
          <meta name="googlebot" content="noindex, nofollow" />
        </>
      ) : (
        <>
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
          <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        </>
      )}

      {/* Open Graph - Enhanced */}
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={shortDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:updated_time" content={modifiedAt || new Date().toISOString()} />
      {rating && <meta property="og:video:rating" content={rating.toString()} />}
      {duration && <meta property="og:video:duration" content={duration.toString()} />}
      {genres && <meta property="og:video:tag" content={genres.join(', ')} />}

      {/* Twitter - Enhanced */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@freefilmhub" />
      <meta name="twitter:creator" content="@freefilmhub" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={shortDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
      <meta name="twitter:image:alt" content={`${title} poster`} />
      {genres && <meta name="twitter:label1" content="Genre" />}
      {genres && <meta name="twitter:data1" content={genres.join(', ')} />}
      {rating && <meta name="twitter:label2" content="Rating" />}
      {rating && <meta name="twitter:data2" content={`${rating}/10`} />}

      {/* Article specific - Enhanced */}
      {publishedAt && <meta property="article:published_time" content={publishedAt} />}
      {modifiedAt && <meta property="article:modified_time" content={modifiedAt} />}
      {publishedAt && <meta property="article:author" content="FreeFilmHub" />}
      {publishedAt && <meta property="article:publisher" content={window.location.origin} />}
      {genres?.map((genre: string) => (
        <meta key={genre} property="article:tag" content={genre} />
      ))}
      {genres?.map((genre: string) => (
        <meta key={`section-${genre}`} property="article:section" content={genre} />
      ))}

      {/* Video specific - Enhanced */}
      {type.startsWith('video.') && (
        <>
          <meta property="video:duration" content={duration?.toString()} />
          <meta property="video:release_date" content={publishedAt} />
          <meta property="video:tag" content={genres?.join(', ')} />
          <meta property="video:director" content={director} />
          <meta property="video:actor" content={actors?.join(', ')} />
          <meta property="video:writer" content={director} />
          <meta property="video:series" content={type === 'video.episode' ? title.split(':')[0] : undefined} />
        </>
      )}

      {/* Hreflang annotations */}
      {Object.entries(allLanguages).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}

      {/* Structured Data - Enhanced */}
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      {videoSchema && <script type="application/ld+json">{JSON.stringify(videoSchema)}</script>}

      {/* Mobile specific - Enhanced */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#6366f1" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="application-name" content={siteName} />
    </Helmet>
  );
};
