import Head from 'next/head';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
}

export default function SEO({
  title,
  description,
  keywords = 'logistique, transport, TMS, WMS, e-CMR, gestion flotte, supply chain, affrètement, transitaire',
  ogImage = '/og-image.png',
  canonical,
  noIndex = false
}: SEOProps) {
  const fullTitle = `${title} | RT Technologie`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://admin.rt-technologie.com';
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : undefined;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
    </Head>
  );
}
