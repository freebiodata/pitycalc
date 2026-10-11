/** Site-wide constants shared by every page. */
export const SITE_NAME = 'PityHub';
export const SITE_URL = 'https://pitycalc.top';
export const SITE_TAGLINE = 'Free Genshin Impact pity & wish calculators';
/** When the documented rates below were last checked against sources. */
export const RATES_SNAPSHOT = 'October 2026';

export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: '/pity-calculator/', label: 'Pity Calculator' },
  { href: '/wishes-needed/', label: 'Wishes Needed' },
  { href: '/savings-planner/', label: 'Savings Planner' },
  { href: '/simulator/', label: '50/50 Simulator' },
  { href: '/guides/', label: 'Guides' },
  { href: '/faq/', label: 'FAQ' },
];

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
