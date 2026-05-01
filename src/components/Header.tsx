import styles from './Header.module.css';
import ThemeIcon from './ThemeIcon';

function Header() {
  return (
    <div className={styles.header}>
      <div className={styles['header-menu']}>
        <ThemeIcon />
      </div>
      <h1 className={styles.title}>
        <a href="/" className={styles.link}>empty space</a>
      </h1>
    </div>
  );
}

export default Header;
