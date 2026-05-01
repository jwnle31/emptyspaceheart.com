import { useEffect, useRef, useState } from 'react';
import styles from './Home.module.css';
import Breathe from '../components/Breathe';
import List from '../components/List';
import SEO from '../components/SEO';
import EmptySpaceHeart from '../assets/gifs/emptyspaceheart.gif';

const STICKY_OFFSET_PX = 32;

function Home() {
  const heartPlaceholderRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const updateStickyState = () => {
      const heartPlaceholder = heartPlaceholderRef.current;

      if (!heartPlaceholder) {
        return;
      }

      const threshold =
        heartPlaceholder.getBoundingClientRect().top +
        window.scrollY -
        STICKY_OFFSET_PX;

      setIsSticky(window.scrollY >= threshold);
    };

    updateStickyState();

    window.addEventListener('scroll', updateStickyState, { passive: true });
    window.addEventListener('resize', updateStickyState);

    return () => {
      window.removeEventListener('scroll', updateStickyState);
      window.removeEventListener('resize', updateStickyState);
    };
  }, []);

  const handleMenuClick = (category: string) => {
    const element = document.getElementById(category);
    const prev = element?.previousElementSibling as HTMLElement | null;

    if (prev) {
      prev.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <SEO />
      <div className={styles['quote']}>
        <div ref={heartPlaceholderRef} className={styles['placeholder']}>
          <div
            className={`${styles['heart-menu']} ${isSticky ? styles['sticky'] : ''}`}
            style={isSticky ? { top: STICKY_OFFSET_PX } : undefined}
          >
            <img src={EmptySpaceHeart} alt="Empty Space Heart" />
            <div className={styles['menu']}>
              <button
                data-category="official"
                onClick={() => handleMenuClick('official')}
              >
                Official
              </button>
              <button
                data-category="general"
                onClick={() => handleMenuClick('general')}
              >
                General
              </button>
              <button
                data-category="discord-global"
                onClick={() => handleMenuClick('discord-global')}
              >
                Discord
              </button>
              <button
                data-category="modding"
                onClick={() => handleMenuClick('modding')}
              >
                Modding
              </button>
              <button
                data-category="challenge"
                onClick={() => handleMenuClick('challenge')}
              >
                Challenges
              </button>
              <button
                data-category="speedrunning"
                onClick={() => handleMenuClick('speedrunning')}
              >
                Speedrunning
              </button>
              <button
                data-category="merch"
                onClick={() => handleMenuClick('merch')}
              >
                Merch
              </button>
              <button
                data-category="misc"
                onClick={() => handleMenuClick('misc')}
              >
                Misc.
              </button>
            </div>
          </div>
        </div>

        <p>
          The way I see it,
          <br />
          the Mountain can't bring out
          <br />
          anything that isn't already in you.
        </p>
        <small>- Celia -</small>
      </div>
      <Breathe />
      <List title="Official" category="official" />
      <Breathe />
      <List title="General" category="general" />
      <Breathe />
      <List title="Discord" category="discord-global" />
      <Breathe />
      <List title="Modding" category="modding" />
      <Breathe />
      <List title="Challenges" category="challenge" />
      <Breathe />
      <List title="Speedrunning" category="speedrunning" />
      <Breathe />
      <List title="Merch" category="merch" />
      <Breathe />
      <List title="Misc." category="misc" />
      <Breathe />
    </>
  );
}

export default Home;
