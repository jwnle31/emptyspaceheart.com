import { Helmet } from 'react-helmet-async';

type SEOProps = {
  title?: string;
  description?: string;
  noIndex?: boolean;
};

function SEO({
  title,
  description = 'A minimalist hub for Celeste resources',
  noIndex = false,
}: SEOProps) {
  const fullTitle = title
    ? `${title} - Empty Space Heart`
    : 'Empty Space Heart';

  const currentUrl = window.location.pathname;
  const fullUrl = `https://emptyspaceheart.com${currentUrl}`;
  const imageUrl = 'https://emptyspaceheart.com/favicon.png';

  return (
    <Helmet>
      <title>{fullTitle}</title>

      <meta name="description" content={description} />

      {noIndex && <meta name="robots" content="noindex" />}

      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content="emptyspaceheart.com" />
      <meta property="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
}

export default SEO;
