/**
 * The aperture mark: a rounded viewport with the page held in focus at its
 * centre. Stroke weight is fixed at the 40x40 viewBox so the mark keeps the
 * same optical weight at every render size.
 */
export function Mark({
  size = 30,
  tone = 'ink',
}: {
  size?: number;
  tone?: 'ink' | 'inverse' | 'muted';
}) {
  const stroke =
    tone === 'inverse'
      ? 'oklch(0.97 0.004 95)'
      : tone === 'muted'
        ? 'oklch(0.45 0.015 250)'
        : 'oklch(0.24 0.015 250)';
  const dot =
    tone === 'inverse' ? 'oklch(0.72 0.14 218)' : 'oklch(0.68 0.14 218)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className="flex-none"
    >
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="10"
        stroke={stroke}
        strokeWidth="3"
      />
      <circle cx="20" cy="20" r="6.5" fill={dot} />
    </svg>
  );
}

export default function Logo({
  size = 30,
  fontSize = 21,
  inverse = false,
}: {
  size?: number;
  fontSize?: number;
  inverse?: boolean;
}) {
  return (
    <span className="flex items-center gap-[11px]">
      <Mark size={size} tone={inverse ? 'inverse' : 'ink'} />
      <span
        className={`font-display font-bold tracking-[-0.02em] ${
          inverse ? 'text-on-dark' : 'text-ink-800'
        }`}
        style={{ fontSize }}
      >
        Crawl
        <span
          className={`font-medium ${
            inverse ? 'text-on-dark-dim' : 'text-ink-300'
          }`}
        >
          IQ
        </span>
      </span>
    </span>
  );
}
