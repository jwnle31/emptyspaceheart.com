import { Link } from 'react-router-dom';
import { IconLanguage } from '@tabler/icons-react';
import styles from './Header.module.css';
import ThemeIcon from './ThemeIcon';
import { useLanguage } from '../i18n/locale';

function Header() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className={styles.header}>
      <div className={styles['header-menu']}>
        <button
          type="button"
          className={styles['language-toggle']}
          aria-label={locale === 'en' ? 'Switch to Korean' : '영어로 전환'}
          title={locale === 'en' ? 'Switch to Korean' : '영어로 전환'}
          onClick={() => setLocale(locale === 'en' ? 'ko' : 'en')}
        >
          <IconLanguage size={16} stroke={1.5} aria-hidden="true" />
          <span lang={locale}>{locale.toUpperCase()}</span>
        </button>
        <ThemeIcon />
      </div>
      <h1 className={styles.title}>
        <Link to="/" className={styles.link}>empty space</Link>
      </h1>
    </div>
  );
}

export default Header;
