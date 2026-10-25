import styles from './NotFound.module.css';
import Breathe from '../components/Breathe';
import SEO from '../components/SEO';
import CreatureF from '../assets/gifs/creature_f.gif';

function NotFound() {
  return (
    <>
      <SEO title="Page Not Found" noIndex={true} />
      <main className={styles.page}>
        <div className={styles['img-wrapper']}>
          <img src={CreatureF} alt="" className={styles.image} />
        </div>
        <Breathe />

        <section className={styles.content} aria-labelledby="not-found-title">
          <span className={styles.code}>404</span>
          <div className={styles.message}>
            <h1 id="not-found-title">Nothing here.</h1>
            <p className={styles.description}>
              This address doesn&apos;t lead to a page.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

export default NotFound;
