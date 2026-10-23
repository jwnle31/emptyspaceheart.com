import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';
import Breathe from '../components/Breathe';
import SEO from '../components/SEO';
import CreatureF from '../assets/gifs/creature_f.gif';

const destinations = [
  { label: 'Speedrunning', path: '/speedrunning' },
  { label: 'Deathless', path: '/deathless' },
  { label: 'Top challenges', path: '/deathless/top-challenges' },
  { label: 'About', path: '/about' },
];

function NotFound() {
  return (
    <>
      <SEO title="Page Not Found" noIndex={true} />
      <main className={styles.page}>
        <div className={styles['img-wrapper']}>
          <img src={CreatureF} alt="" className={styles.image} />
        </div>
        <Breathe />

        <div className={styles.content}>
          <section className={styles.message}>
            <p className={styles.code}>404</p>
            <h1>Nothing here.</h1>
            <p className={styles.description}>
              This address doesn&apos;t lead to a page. Head back home or choose
              somewhere else to explore.
            </p>
            <Link to="/" className={styles.homeLink}>
              Back to home <span aria-hidden="true">↗</span>
            </Link>
          </section>

          <nav className={styles.destinations} aria-label="Explore the site">
            <h2>Explore</h2>
            {destinations.map(({ label, path }) => (
              <Link to={path} key={path}>
                <span>{label}</span>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </nav>
        </div>
      </main>
    </>
  );
}

export default NotFound;
