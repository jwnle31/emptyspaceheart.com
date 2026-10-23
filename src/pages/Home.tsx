import styles from './Home.module.css';
import List from '../components/List';
import Breathe from '../components/Breathe';
import SEO from '../components/SEO';
import EmptySpaceHeart from '../assets/gifs/emptyspaceheart.gif';
import type { Category } from '../types/Category';

const categories: { title: string; category: Category }[] = [
  { title: 'Official', category: 'official' },
  { title: 'General', category: 'general' },
  { title: 'Discord', category: 'discord-global' },
  { title: 'Modding', category: 'modding' },
  { title: 'Challenges', category: 'challenge' },
  { title: 'Speedrunning', category: 'speedrunning' },
  { title: 'Merch', category: 'merch' },
  { title: 'Misc.', category: 'misc' },
];

function Home() {
  return (
    <>
      <SEO />
      <main className={styles.page}>
        <header className={styles.hero}>
          <img src={EmptySpaceHeart} alt="Empty Space Heart" className={styles.heart} />
          <blockquote className={styles.quote}>
            <p>
              The way I see it,
              <br />
              the Mountain can&apos;t bring out
              <br />
              anything that isn&apos;t already in you.
            </p>
            <cite>- Celia -</cite>
          </blockquote>
        </header>

        <Breathe />

        <nav className={styles['category-nav']} aria-label="Resource categories">
          <span>Browse</span>
          <div className={styles['category-links']}>
            {categories.map(({ title, category }) => (
              <a href={`#${category}`} key={category}>{title}</a>
            ))}
          </div>
        </nav>

        <div className={styles['resource-grid']}>
          {categories.map(({ title, category }) => (
            <List title={title} category={category} key={category} />
          ))}
        </div>
      </main>
    </>
  );
}

export default Home;
