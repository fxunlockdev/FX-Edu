import { initials } from './community-data';

/**
 * Deterministic gradient avatar. The hue is derived from the name so a member's
 * avatar is stable across renders without storing a colour. Decorative only —
 * the accessible name is carried by the adjacent text, so the disc is aria-hidden.
 */
const PALETTE: ReadonlyArray<readonly [string, string]> = [
  ['#0f3218', '#436648'],
  ['#5b3d8a', '#7d5ab0'],
  ['#8a5a06', '#b6831f'],
  ['#1f6b8a', '#3f8fae'],
  ['#8a2c4d', '#b04f70'],
];

function hueIndex(name: string): number {
  let sum = 0;
  for (let i = 0; i < name.length; i += 1) sum += name.charCodeAt(i);
  return sum % PALETTE.length;
}

interface AvatarProps {
  readonly name: string;
  readonly size?: number;
}

export function Avatar({ name, size = 38 }: AvatarProps) {
  const [from, to] = PALETTE[hueIndex(name)]!;
  return (
    <span
      className="cm-avatar"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.34),
        background: `linear-gradient(150deg, ${from}, ${to})`,
      }}
    >
      {initials(name)}
    </span>
  );
}
