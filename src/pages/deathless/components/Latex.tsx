import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function Latex({
  expression,
  displayMode = false,
  className,
}: {
  expression: string;
  displayMode?: boolean;
  className?: string;
}) {
  const html = useMemo(
    () =>
      katex.renderToString(expression, {
        displayMode,
        throwOnError: false,
        output: 'html',
      }),
    [displayMode, expression],
  );

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
