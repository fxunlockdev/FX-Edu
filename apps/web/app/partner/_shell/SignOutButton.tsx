import { Button } from '@fxunlock/ui';
import { signOut } from '@/app/auth/actions';

/**
 * Sign-out control for the partner portal. Renders a `<form action={signOut}>`
 * so it is a real POST and works without client JS — no accidental sign-out via
 * link prefetch. Mirrors the member SignOutButton; kept local so the partner
 * shell does not reach across route groups.
 */
export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="ghost" size="sm">
        Sign out
      </Button>
    </form>
  );
}
