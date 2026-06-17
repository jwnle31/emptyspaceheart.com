import styles from './Footer.module.css';

function Footer() {
  return (
    <>
      <footer className={styles.footer}>
        <div className={styles['footer-grid']}>
          <section className={styles['footer-group']}>
            <h3 className={styles['footer-heading']}>Explore</h3>
            <nav className={styles['footer-links']} aria-label="Footer explore">
              <a href="/" className={styles.link}>
                Home
              </a>
              <a href="/speedrunning" className={styles.link}>
                Speedrunning
              </a>
              <a href="/deathless" className={styles.link}>
                Deathless Ranking
              </a>
              <a href="/deathless/top-challenges" className={styles.link}>
                Top Deathless Challenges
              </a>
            </nav>
          </section>

          <section className={styles['footer-group']}>
            <h3 className={styles['footer-heading']}>Resources</h3>
            <nav className={styles['footer-links']} aria-label="Footer resources">
              <a
                href="https://cloud.umami.is/share/dap298M75AbdWQGb/emptyspaceheart.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                Data
              </a>
              <a href="/about" className={styles.link}>
                About
              </a>
            </nav>
          </section>

          <section className={styles['footer-group']}>
            <h3 className={styles['footer-heading']}>Support</h3>
            <div className={styles.socials}>
              <a
                className="github-button"
                href="https://github.com/jwnle31/emptyspaceheart"
                data-color-scheme="no-preference: light; light: light; dark: dark;"
                data-icon="octicon-star"
                data-size="large"
                data-show-count="true"
                aria-label="Star buttons/github-buttons on GitHub"
              >
                Star
              </a>
            </div>
          </section>
        </div>
      </footer>
      <script async src="./scripts/buttons.js"></script>
    </>
  );
}

export default Footer;
