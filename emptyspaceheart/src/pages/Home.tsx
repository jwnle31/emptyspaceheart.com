import styles from './Home.module.css';
import Breathe from '../components/Breathe';
import List from '../components/List';
import SEO from '../components/SEO';
import EmptySpaceHeart from '../assets/gifs/emptyspaceheart.gif';

function Home() {
  return (
    <>
      <SEO />
      <div className={styles['quote']}>
        <div className={styles['placeholder']}>
          <div className={styles['heart-menu']}>
            <img src={EmptySpaceHeart} alt="Empty Space Heart" />
            <div className={styles['menu']}>
              <button data-category="official">Official</button>
              <button data-category="general">General</button>
              <button data-category="discord-global">Discord</button>
              <button data-category="modding">Modding</button>
              <button data-category="challenge">Challenges</button>
              <button data-category="speedrunning">Speedrunning</button>
              <button data-category="merch">Merch</button>
              <button data-category="misc">Misc.</button>
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
