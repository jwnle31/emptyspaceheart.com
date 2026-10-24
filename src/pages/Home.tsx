import styles from './Home.module.css';
import List from '../components/List';
import Breathe from '../components/Breathe';
import SEO from '../components/SEO';
import EmptySpaceHeart from '../assets/gifs/emptyspaceheart.gif';
import type { Category } from '../types/Category';
import { homeCopy } from '../i18n/home';
import { useLocale } from '../i18n/locale';

const categories: Category[] = [
  'official',
  'general',
  'discord-global',
  'modding',
  'challenge',
  'speedrunning',
  'merch',
  'misc',
];

function Home() {
  const locale = useLocale();
  const copy = homeCopy[locale];

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

        <nav className={styles['category-nav']} aria-label={copy.categoryNavLabel}>
          <span>{copy.browse}</span>
          <div className={styles['category-links']}>
            {categories.map((category) => (
              <a href={`#${category}`} key={category}>{copy.categories[category]}</a>
            ))}
          </div>
        </nav>

        <div className={styles['resource-grid']}>
          {categories.map((category) => (
            <List
              title={copy.categories[category]}
              category={category}
              linksLabel={copy.linksLabel}
              key={category}
            />
          ))}
        </div>
      </main>
    </>
  );
}

export default Home;
