import styles from './About.module.css';
import Breathe from '../components/Breathe';
import Link from '../components/Link';
import Seed from '../assets/gifs/seed.gif';
import { SlimLayout } from '../layouts/SlimLayout';

function About() {
  return (
    <SlimLayout>
      <div className={styles['img-wrapper']}>
        <img src={Seed} alt="Seed" className={styles.image} />
      </div>
      <Breathe />
      <div className={styles['not-found-container']}>
        <h5 className={styles.title}>About</h5>
        <p className={styles.paragraph}>
          emptyspaceheart.com is a<br />
          minimalist hub for Celeste resources.
        </p>
        <br />
        <p className={styles.paragraph}>
          Named after a fleeting heart,
          <br />
          it serves as a reminder - no matter
          <br />
          how much you’ve overcome, there’s
          <br />
          always more to discover,
          <br />
          more to climb.
        </p>
      </div>
      <br />
      <p className={styles['suggestion']}>
        Want to add something?
        <br />
        Suggest it via:
      </p>
      <Link
        icon="brand-github"
        text="GitHub Issues"
        url="https://github.com/jwnle31/emptyspaceheart/issues"
        internal={false}
      />
      <Breathe />
    </SlimLayout>
  );
}

export default About;
