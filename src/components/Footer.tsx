import { Link, useLocation } from 'react-router-dom';
import styles from './Footer.module.css';

function Footer() {
  const { pathname } = useLocation();
  const widePage = pathname === '/' || pathname === '/about' || pathname === '/speedrunning' || pathname.startsWith('/deathless');

  return (
    <footer className={`${styles.footer} ${widePage ? '' : styles.compact}`}>
      <div className={styles.inner}>
        <div className={styles.primary}>
          <div className={styles.identity}>
            <Link to="/" className={styles.brand}>empty space</Link>
            <p>A minimalist hub for Celeste resources.</p>
          </div>
          <nav className={styles.navigation} aria-label="Footer navigation">
            <Link to="/">Home</Link>
            <Link to="/speedrunning">Speedrunning</Link>
            <Link to="/deathless">Deathless</Link>
            <Link to="/deathless/top-challenges">Top challenges</Link>
            <Link to="/about">About</Link>
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
              Site data
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
