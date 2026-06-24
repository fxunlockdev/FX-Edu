interface IconProps {
  /** SVG path `d` data drawn with the shared stroke style. */
  path: string;
  size?: number;
}

/**
 * Shared 24x24 stroked line icon used across the Partners sections.
 * Decorative — always paired with a visible text label, so `aria-hidden`.
 */
export function Icon({ path, size = 22 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
