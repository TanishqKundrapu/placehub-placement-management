// Initials avatar with a stable colour derived from the name
const hues = [158, 200, 32, 262, 340, 12, 188, 45, 286, 120];

export const hueFor = (name = '') => {
  let h = 0;
  for (const ch of name) h = (h * 7 + ch.charCodeAt(0)) >>> 0;
  return hues[h % hues.length];
};

export default function Avatar({ name = '?', size = 40, square = false }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const hue = hueFor(name);
  return (
    <span
      className={`avatar ${square ? 'avatar-square' : ''}`}
      style={{ width: size, height: size, fontSize: size * 0.38, '--h': hue }}
      aria-hidden="true"
    >
      {initials || '?'}
    </span>
  );
}
