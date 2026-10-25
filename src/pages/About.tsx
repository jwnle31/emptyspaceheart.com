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

        <section className={styles.content} aria-labelledby="about-title">
          <h1 id="about-title" className={styles.title}>About</h1>
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
        </section>
      </main>
    </>
  );
}

export default About;
