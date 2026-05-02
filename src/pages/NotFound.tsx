import styles from './NotFound.module.css';
import Link from '../components/Link';
import SEO from '../components/SEO';
import Creature_F from '../assets/gifs/creature_f.gif';
import { SlimLayout } from '../layouts/SlimLayout';

function NotFound() {
  return (
    <SlimLayout>
      <SEO title="Page Not Found" noIndex={true} />
      <div className={styles['img-wrapper']}>
        <img src={Creature_F} alt="Creature F" className={styles.image} />
      </div>
      <div className={styles['not-found-container']}>
        <h5 className={styles.title}>404 - Not Found</h5>
        <Link icon="link" text="emptyspaceheart.com" url="/" internal={true} />
      </div>
    </SlimLayout>
  );
}

export default NotFound;
