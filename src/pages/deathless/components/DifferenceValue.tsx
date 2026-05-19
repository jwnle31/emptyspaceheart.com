import styles from '../../Deathless.module.css';

type DifferenceValueProps = {
  value?: number;
  show: boolean;
  invert?: boolean;
  className?: string;
};

function formatDifferenceLabel(value: number) {
  const rounded = Math.abs(Math.round(value));
  return `${value > 0 ? '+' : '-'}${rounded.toLocaleString('en-US')}`;
}

export default function DifferenceValue({
  value,
  show,
  invert = false,
  className,
}: DifferenceValueProps) {
  if (!show || !value) {
    return null;
  }

  const positive = value > 0;
  const improving = invert ? value < 0 : positive;
  const label = formatDifferenceLabel(value);

  return (
    <span
      className={
        className
          ? `${className} ${
              improving
                ? styles['delta-bracket-positive']
                : styles['delta-bracket-negative']
            }`
          : improving
            ? styles['delta-bracket-positive']
            : styles['delta-bracket-negative']
      }
      aria-label={
        invert
          ? positive
            ? `${label} decline`
            : `${label} improvement`
          : positive
            ? `${label} increase`
            : `${label} decrease`
      }
    >
      {label}
    </span>
  );
}
