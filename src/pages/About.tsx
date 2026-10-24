import styles from './About.module.css';
import Breathe from '../components/Breathe';
import Seed from '../assets/gifs/seed.gif';
import SEO from '../components/SEO';

function About() {
  return (
    <>
      <SEO title="About" />
      <main className={styles.page}>
        <div className={styles['img-wrapper']}>
          <img src={Seed} alt="Seed" className={styles.image} />
        </div>
        <Breathe />

        <h2 className={styles.title}>About</h2>
        <div className={styles.content}>
          <div className={styles.story}>
            <p className={styles.lead}>
              emptyspaceheart.com is a minimalist hub for Celeste.
            </p>
            <p>
              Named after a fleeting heart, it serves as a reminder: no matter
              how much you&apos;ve overcome, there&apos;s always more to discover,
              more to climb.
            </p>
          </div>
          <aside className={styles.contribute}>
            <h3>Contribute</h3>
            <p>Want to add something? Suggest it through GitHub Issues.</p>
            <a
              href="https://github.com/jwnle31/emptyspaceheart/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub Issues ↗
            </a>
          </aside>
        </div>
      </main>
    </>
  );
}

export default About;
