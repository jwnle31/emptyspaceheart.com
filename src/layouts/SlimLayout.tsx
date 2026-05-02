import { type ReactNode } from 'react';
import styles from './SlimLayout.module.css';

interface SlimLayoutProps {
  children: ReactNode;
}

export function SlimLayout({ children }: SlimLayoutProps) {
  return <div className={styles['slim-layout']}>{children}</div>;
}
