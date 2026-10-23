import styles from './List.module.css';
import type { Category } from '../types/Category';
import linksData from '../data/links.json';
import Link from './Link';

type ListProps = {
  category: Category;
  title: string;
};

function List({ category, title }: ListProps) {
  const categoryData = linksData.filter((link) => link.type === category);
  return (
    <section id={category} className={styles['list-container']}>
      <div className={styles.heading}>
        <h3 className={styles.title}>{title}</h3>
        <span>{categoryData.length} links</span>
      </div>
      <ul className={styles.list}>
        {categoryData.map((link) => (
          <Link
            key={link.url}
            icon={link.icon}
            text={link.text}
            url={link.url}
            flag={link.flag || ''}
            internal={false}
          />
        ))}
      </ul>
    </section>
  );
}

export default List;
