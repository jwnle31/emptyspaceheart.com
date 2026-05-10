import styles from './Footer.module.css';

function Footer() {
  return (
    <>
      <footer className={styles.footer}>
        <div className={styles['footer-menu']}>
          <a href="/" className={styles.link}>
            Home
          </a>
          <span> · </span>
          <a href="/speedrunning" className={styles.link}>
            Speedrunning
          </a>
          <span> · </span>
          <a href="/deathless" className={styles.link}>
            Deathless
          </a>
          <span> · </span>
          <a
            href="https://cloud.umami.is/share/dap298M75AbdWQGb/emptyspaceheart.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Data
          </a>
          <span> · </span>
          <a href="/about" className={styles.link}>
            About
          </a>
        </div>
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
      </footer>
      <script async src="./scripts/buttons.js"></script>
    </>
  );
}

export default Footer;
