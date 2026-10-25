import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import { commonCopy, SITE_TAGLINE } from '../i18n/common';
import { useLocale } from '../i18n/locale';

function Footer() {
  const locale = useLocale();
  const copy = commonCopy[locale];

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.primary}>
          <div className={styles.identity}>
            <Link to="/" className={styles.brand}>empty space</Link>
            <p>{SITE_TAGLINE}</p>
          </div>
          <nav className={styles.navigation} aria-label={copy.footerNavigationLabel}>
            <Link to="/">{copy.home}</Link>
            <Link to="/speedrunning">{copy.speedrunning}</Link>
            <Link to="/deathless">{copy.deathless}</Link>
            <Link to="/deathless/top-challenges">{copy.topChallenges}</Link>
            <Link to="/about">{copy.about}</Link>
          </nav>
        </div>
        <div className={styles.secondary}>
          <span>emptyspaceheart.com</span>
          <div className={styles.external}>
            <a
              href="https://cloud.umami.is/share/dap298M75AbdWQGb/emptyspaceheart.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.siteData}
            </a>
            <a
              href="https://github.com/jwnle31/emptyspaceheart"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
