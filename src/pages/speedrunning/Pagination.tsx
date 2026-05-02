import styles from '../Speedrunning.module.css';

type PaginationProps = {
  currentPage: number;
  pageCount: number;
  onPrevious: () => void;
  onNext: () => void;
};

function Pagination({
  currentPage,
  pageCount,
  onPrevious,
  onNext,
}: PaginationProps) {
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

export default Pagination;
