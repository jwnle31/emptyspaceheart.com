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
    <div id={category} className={styles['list-container']}>
      <h5 className={styles.title}>{title}</h5>
      <ul>
        {categoryData.map((link) => (
          <Link
            icon={link.icon}
            text={link.text}
            url={link.url}
            flag={link.flag || ''}
            internal={false}
          />
        ))}
      </ul>
    </div>
  );
}

export default List;
