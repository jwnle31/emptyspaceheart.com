import styles from '../../Deathless.module.css';

type DifferenceValueProps = {
  value?: number;
  show: boolean;
  invert?: boolean;
  className?: string;
  decimals?: number;
};

function formatDifferenceLabel(value: number, decimals: number) {
  const rounded = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${value > 0 ? '+' : '-'}${rounded}`;
}

export default function DifferenceValue({
  value,
  show,
  invert = false,
  className,
  decimals = 0,
}: DifferenceValueProps) {
  if (!show || !value) {
    return null;
  }

  const positive = value > 0;
  const improving = invert ? value < 0 : positive;
  const label = formatDifferenceLabel(value, decimals);

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
