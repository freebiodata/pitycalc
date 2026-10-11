/**
 * PityHub central inline-SVG icon set.
 *
 * 24×24 grid, stroke-based (currentColor) so icons inherit text color.
 * Consumed in two ways:
 *  - server-side: the <Icon> Astro component renders ICONS[name] directly;
 *  - client-side: iconSvg() produces the same markup as a string for
 *    dynamically generated DOM (simulator tags, stat tiles, button states).
 * Keeping one source guarantees header/footer/pages never drift apart.
 */
export const ICONS: Record<string, string> = {
  star4: '<path fill="currentColor" stroke="none" d="M12 1.6c1.1 7.4 3.9 10.2 11.3 11.3-7.4 1.1-10.2 3.9-11.3 11.3C10.9 16.8 8.1 14 .7 12.9 8.1 11.8 10.9 9 12 1.6Z"/>',
  sparkle:
    '<path fill="currentColor" stroke="none" d="M9 2.5c.6 3.9 2 5.3 5.9 5.9-3.9.6-5.3 2-5.9 5.9-.6-3.9-2-5.3-5.9-5.9 3.9-.6 5.3-2 5.9-5.9Z"/><path fill="currentColor" stroke="none" d="M17.5 13c.4 2.6 1.4 3.6 4 4-2.6.4-3.6 1.4-4 4-.4-2.6-1.4-3.6-4-4 2.6-.4 3.6-1.4 4-4Z"/><circle cx="18.5" cy="5.5" r="1" fill="currentColor" stroke="none"/>',
  calculator:
    '<rect x="5" y="3" width="14" height="18" rx="2.2"/><path d="M8.5 6.5h7M9 11h.01M12 11h.01M15 11h.01M9 14.5h.01M12 14.5h.01M15 14.5h.01M9 18h6"/>',
  scale:
    '<path d="M12 4v17M8 21h8M5 7h14"/><path d="M7 7 4.3 13a3 3 0 0 0 5.4 0L7 7ZM17 7l-2.7 6a3 3 0 0 0 5.4 0L17 7Z"/>',
  coins:
    '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v6.3c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V5.5"/><path d="M4.5 11.8v6.4c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-6.4"/>',
  dice:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.7" cy="8.7" r="1.15" fill="currentColor" stroke="none"/><circle cx="15.3" cy="8.7" r="1.15" fill="currentColor" stroke="none"/><circle cx="8.7" cy="15.3" r="1.15" fill="currentColor" stroke="none"/><circle cx="15.3" cy="15.3" r="1.15" fill="currentColor" stroke="none"/>',
  book:
    '<path d="M12 6.2C10.4 4.5 8.2 3.7 5.4 3.7H3.8v14.8h1.6c2.8 0 5 .8 6.6 2.5 1.6-1.7 3.8-2.5 6.6-2.5h1.6V3.7h-1.6c-2.8 0-5 .8-6.6 2.5Z"/><path d="M12 6.2V21"/>',
  'help-circle':
    '<circle cx="12" cy="12" r="9"/><path d="M9.3 9.3a2.7 2.7 0 0 1 5.4.5c0 1.8-2.7 2.3-2.7 3.9"/><circle cx="12" cy="17.3" r="0.7" fill="currentColor" stroke="none"/>',
  flask:
    '<path d="M9.5 3h5M10 3v5.8L4.6 17.6a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 8.8V3"/><path d="M7.6 14.5h8.8"/>',
  home: '<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5.5h4V20"/>',
  'arrow-right': '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
  'arrow-left': '<path d="M19.5 12h-15M10.5 6l-6 6 6 6"/>',
  external:
    '<path d="M14 4h6v6M20 4 11 13"/><path d="M19 14v5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V8a1.5 1.5 0 0 1 1.5-1.5H11"/>',
  check: '<path d="m4.5 12.8 5 5L19.5 6.5"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12.4 2.8 2.8 5.4-5.8"/>',
  'x-circle': '<circle cx="12" cy="12" r="9"/><path d="m9.2 9.2 5.6 5.6M14.8 9.2l-5.6 5.6"/>',
  'shield-check':
    '<path d="M12 2.8 19 5.7v5.6c0 4.6-2.9 7.8-7 9.7-4.1-1.9-7-5.1-7-9.7V5.7Z"/><path d="m8.8 12 2.3 2.3 4.4-4.8"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-1.9 5.7-5.7 1.9 1.9-5.7Z"/>',
  target:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>',
  users:
    '<circle cx="9" cy="8.2" r="3.4"/><path d="M3.3 20c.6-3.4 2.9-5.2 5.7-5.2s5.1 1.8 5.7 5.2"/><path d="M15.4 5.2a3.4 3.4 0 0 1 0 6M17.6 15.2c1.7.9 2.8 2.5 3.1 4.8"/>',
  sword:
    '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6"/><path d="m16 16 4 4"/><path d="m19 21 2-2"/><path d="M17.5 14.5 20 12l-2-2"/><path d="M9.5 8.5 7 6 5 8l2.5 2.5"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.7 3.9 5.7 3.9 9s-1.4 6.3-3.9 9c-2.5-2.7-3.9-5.7-3.9-9s1.4-6.3 3.9-9Z"/>',
  copy: '<rect x="9" y="9" width="11.5" height="11.5" rx="2"/><path d="M5.5 14.5V6a2 2 0 0 1 2-2h8.5"/>',
  link: '<path d="M9.5 14.5a4.2 4.2 0 0 0 6.3.4l2.8-2.8a4.2 4.2 0 0 0-6-6l-1.4 1.4"/><path d="M14.5 9.5a4.2 4.2 0 0 0-6.3-.4l-2.8 2.8a4.2 4.2 0 0 0 6 6l1.4-1.4"/>',
  play: '<path d="M7.5 5.2v13.6a.6.6 0 0 0 .9.5l11-6.8a.6.6 0 0 0 0-1l-11-6.8a.6.6 0 0 0-.9.5Z"/>',
  layers:
    '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m4.2 12.6-1.2.7 9 5 9-5-1.2-.7"/><path d="m4.2 16.6-1.2.7 9 5 9-5-1.2-.7"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M8 3v4M16 3v4M3.5 10.5h17"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.4 2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r="0.8" fill="currentColor" stroke="none"/>',
  alert:
    '<path d="M12 3.6 2.7 19.4a1.2 1.2 0 0 0 1 1.8h16.6a1.2 1.2 0 0 0 1-1.8Z"/><path d="M12 9.5v4.5"/><circle cx="12" cy="17.3" r="0.8" fill="currentColor" stroke="none"/>',
  bulb: '<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 1 3.5 10.9c-.8.6-1 1.2-1 2.1h-5c0-.9-.2-1.5-1-2.1A6 6 0 0 1 12 3Z"/>',
  zap: '<path d="M13 2.5 4.8 13.4h6L9.8 21.5 18.2 10.6h-6Z"/>',
  'trending-up': '<path d="m3 17 6.2-6.2 3.8 3.8L20.5 7"/><path d="M14.5 7h6v6"/>',
  list: '<path d="M9.5 6H20M9.5 12H20M9.5 18H20"/><circle cx="4.8" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4.8" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4.8" cy="18" r="1" fill="currentColor" stroke="none"/>',
  hash: '<path d="M5 9.5h14M4.5 15h14M10.5 3.5 8.5 20.5M15.5 3.5l-2 17"/>',
  gem: '<path d="M7.5 3.5h9l4 5.5-8.5 11L3.5 9Z"/><path d="M3.5 9h17"/><path d="m8.5 9 3.5 11L15.5 9"/><path d="M9.5 3.5 8.5 9M14.5 3.5l1 5.5"/>',
  percent:
    '<path d="M19 5 5 19"/><circle cx="7.2" cy="7.2" r="2.4"/><circle cx="16.8" cy="16.8" r="2.4"/>',
  table:
    '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M9.5 9.5V19.5"/>',
  'chevron-right': '<path d="m9 5.5 6.5 6.5L9 18.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
};

/** Render an icon as an inline SVG string (for client-side DOM injection). */
export function iconSvg(name: string, size = 16, cls = ''): string {
  const body = ICONS[name] ?? ICONS.star4;
  const c = cls ? ` class="${cls}"` : '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"${c} aria-hidden="true">${body}</svg>`;
}
