# Finish and harden paid membership

## Goal
Make Stillpoint reliably paid-only, complete account management, and prepare the monthly and yearly plans for end-to-end test purchases.

## What will change

### Secure purchase and access
- Replace the browser-supplied buyer identity with an authenticated server-created Paddle transaction. Checkout will open that verified transaction, preventing one member from assigning a purchase to another account.
- Require a signed-in member with an active entitlement before generating fallback voice audio, closing the unauthenticated usage and cost gap.
- Move premium session scripts and session details behind an authenticated membership check so unpaid accounts do not receive the protected content payload.
- Keep the friendly client-side membership screen, while treating server checks as the source of truth.

### Reliable subscriptions and renewals
- Validate webhook environment and supported plan IDs, treat missing product metadata or database failures as retryable failures, and retain signature verification.
- Select the currently entitled subscription rather than simply the newest row, so an older active membership is not hidden by a newer inactive record.
- Continue access through a paid cancellation period and during Paddle payment retries; show payment problems without revoking access prematurely.
- Add a secure membership refresh from Paddle for recovery if a webhook is delayed or missed.
- Use Paddle’s billing portal for monthly/yearly switching, card updates, invoices, and cancellation, as requested.

### Account and support
- Add `Mandygudeman@gmail.com` as the visible support contact on the account, privacy, refund, terms, and footer areas.
- Add self-service account deletion with a clear confirmation. Renewable memberships must first be cancelled in Paddle; once cancellation is scheduled, the account can be deleted and server-held account/membership data removed. On-device voice recordings and practice data will also be cleared in that browser.
- Restore the intended destination after Google sign-in through a public callback page.

### Product catalog and checkout readiness
- Create the Stillpoint product and its `$2.99/month` and `$19/year` recurring prices with the required stable identifiers.
- Re-run purchase readiness after the catalog exists and verify pricing, policies, checkout, webhook setup, and account management together.

## Technical details
- Authenticated operations use the existing server authentication middleware and environment-specific subscription records.
- The public Paddle webhook remains signature-verified; privileged database writes remain isolated to that verified handler and tightly scoped account deletion.
- No private payment or service credentials are sent to the browser.

## Verification
- Check public landing, pricing, terms, refund, privacy, sign-up, sign-in, and Google return behavior.
- Confirm unpaid users cannot open a session or call voice generation directly.
- In Paddle test mode, buy each plan with `4242 4242 4242 4242`, any future expiry, and any CVC; confirm access unlocks and the account shows the correct renewal.
- Use `4000 0000 0000 0002` to confirm a declined payment does not unlock access.
- Open the billing portal to switch plans, update payment details, and cancel; confirm access lasts through the paid period and renewal messaging updates.
- Confirm deletion is blocked while a renewable membership exists, then succeeds after cancellation is scheduled and clears the local practice/voice data.
