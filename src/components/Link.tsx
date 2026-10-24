import styles from './Link.module.css';
import { iconMap } from '../utils/iconMap';

type LinkProps = {
  icon: string;
  text: string;
  description: string;
  url: string;
  flag?: string;
  internal: boolean;
};

function Link({ icon, text, description, url, flag, internal }: LinkProps) {
  const Icon = iconMap[icon as keyof typeof iconMap];
  const isInternal = internal || url.startsWith('/');
  return (
    <li className={styles.link}>
      {Icon && <Icon size={14} />}
      <div className={styles.content}>
        {isInternal ? (
          <a href={url}>
            <span className={styles.name}>{text}</span>
            <span className={styles.description}>{description}</span>
          </a>
        ) : (
          <a href={url} target="_blank" rel="noopener noreferrer">
            <span className={styles.name}>{text}</span>
            <span className={styles.description}>{description}</span>
          </a>
        )}
      </div>
      {flag && (
        <div className={styles['flag-wrapper']}>
          <span className={`fi fi-${flag.toLowerCase()}`} />
        </div>
      )}
    </li>
  );
}

export default Link;
