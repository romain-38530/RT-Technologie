import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Preconnect to important domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Google Fonts - Inter for body, optimized loading */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

        {/* PWA meta tags */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Global SEO meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="author" content="RT Technologie" />
        <meta name="publisher" content="RT Technologie" />
        <meta name="copyright" content="RT Technologie 2025" />

        {/* Open Graph base tags */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="RT Technologie - Plateforme Logistique" />
        <meta property="og:locale" content="fr_FR" />

        {/* Twitter Card base */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@RTTechnologie" />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'RT Technologie',
              description: 'Plateforme SaaS de gestion logistique et transport multimodal',
              url: 'https://www.rt-technologie.com',
              logo: 'https://www.rt-technologie.com/logo.png',
              sameAs: [
                'https://www.linkedin.com/company/rt-technologie',
                'https://twitter.com/RTTechnologie'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                email: 'support@rt-technologie.com',
                availableLanguage: ['French', 'English']
              }
            })
          }}
        />
      </Head>
      <body className="bg-gray-50 text-gray-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
