import styles from './ThemeIcon.module.css';
import { IconPercentage50 } from '@tabler/icons-react';
import { useTheme } from '../contexts/ThemeContext';

function ThemeIcon() {
  const { toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle"
      className={styles['theme-toggle']}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <IconPercentage50 size={12} />
    </button>
  );
}

export default ThemeIcon;
