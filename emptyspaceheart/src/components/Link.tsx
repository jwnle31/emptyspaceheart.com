import styles from './Link.module.css';
import { iconMap } from '../utils/iconMap';

type LinkProps = {
  icon: string;
  text: string;
  url: string;
  flag?: string;
  internal: boolean;
};

function Link({ icon, text, url, flag, internal }: LinkProps) {
  const Icon = iconMap[icon as keyof typeof iconMap];
  return (
    <li className={styles.link}>
      {Icon && <Icon size={14} />}
      <span title={text}>
        {internal ? (
          <a href={url}>{text}</a>
        ) : (
          <a href={url} target="_blank" rel="noopener noreferrer">
            {text}
          </a>
        )}
      </span>
      {flag && (
        <div className={styles['flag-wrapper']}>
          <span className={`flag flag:${flag}`} />
        </div>
      )}
    </li>
  );
}

export default Link;
