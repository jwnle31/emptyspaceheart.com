import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useLocale } from '../i18n/locale';
import { SITE_DESCRIPTION } from '../i18n/common';

type SEOProps = {
  title?: string;
  description?: string;
  noIndex?: boolean;
};

function SEO({
  title,
  description = SITE_DESCRIPTION,
  noIndex = false,
}: SEOProps) {
  const locale = useLocale();
  const { pathname } = useLocation();
  const fullTitle = title
    ? `${title} - Empty Space Heart`
    : 'Empty Space Heart';

  const fullUrl = `https://emptyspaceheart.com${pathname}`;
  const imageUrl = 'https://emptyspaceheart.com/favicon.png';

  return (
    <Helmet>
      <html lang={locale} />
      <title>{fullTitle}</title>

      <link rel="canonical" href={fullUrl} />
      <meta name="description" content={description} />

      {noIndex && <meta name="robots" content="noindex" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Empty Space Heart" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image:width" content="64" />
      <meta property="og:image:height" content="64" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={fullTitle} />

      <meta name="twitter:card" content="summary" />
      <meta property="twitter:domain" content="emptyspaceheart.com" />
      <meta property="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image:width" content="64" />
      <meta name="twitter:image:height" content="64" />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={fullTitle} />
    </Helmet>
  );
}

export default SEO;
