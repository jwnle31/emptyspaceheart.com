import styles from '../../Deathless.module.css';

export default function Pagination({
  currentPage,
  pageCount,
  onPrevious,
  onNext,
}: {
  currentPage: number;
  pageCount: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className={styles.pagination}>
      <button type="button" onClick={onPrevious} disabled={currentPage === 1}>
        Previous
      </button>
      <span>
        Page {currentPage} of {pageCount}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={currentPage === pageCount}
      >
        Next
      </button>
    </div>
  );
}
