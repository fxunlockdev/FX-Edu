import { redirect } from 'next/navigation';

/**
 * Bare `/affiliate` entry — redirect to the portal's canonical first screen.
 * The layout's auth + role gate has already run by the time this resolves.
 */
export default function AffiliateIndex() {
  redirect('/affiliate/overview');
}
