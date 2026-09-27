# Roadmap

## Paid access (in progress)
- [x] Enable Lovable Cloud (accounts + database)
- [x] Enable email/password + Google sign-in
- [x] Enable built-in payments (test + live)
- [x] Create membership product: $2.99/month, $19/year
- [x] subscriptions table + RLS + has_active_subscription
- [x] Payments client utils, price resolver, webhook handler
- [x] Auth page (sign in / sign up)
- [x] Pricing / paywall page
- [x] Move app screens behind sign-in + active subscription
- [x] Account page: plan status, manage/cancel via customer portal
- [x] Test-mode banner

## Audit request (from user, 22:10 UTC)
- [x] Review catalog / auth / payment / entitlement / renewal setup and report gaps
- [x] Give preview test plan incl. test card numbers
- [x] Authenticate checkout identity server-side
- [x] Protect generated voice audio by active membership
- [x] Add missed-webhook membership refresh
- [x] Add self-service account deletion and support email
- [x] Restore intended page after Google sign-in

## Seller policy pages (readiness check, seller = "Mandy's Meditation Space")
- [x] Public /pricing page
- [x] /terms (incl. Paddle merchant-of-record disclosure)
- [x] /refunds (30-day money-back)
- [x] /privacy
- [x] Footer links to all four on public pages

## Contact page
- [x] Public /contact with question form (name, email, message) → contact_messages table
- [x] Linked from Account page support section + site footer

## Creator video (user request, Sep 16)
- [x] Draft personal message from Mandy (~45s of speech)
- [x] Generate 5 calm video scenes + TTS narration, stitch into 45s video
- [x] Add "A note from Mandy" video section on welcome page

## Shared creator voice (user request, Sep 19)
- [x] Creator/owner role table + owner check (creator account: mandygudeman@gmail.com)
- [x] Cloud storage for published voiceovers + clip catalogue
- [x] Publish/unpublish controls in the recording studio and the welcome-page note
- [x] Sessions play the published voice for every member, local recording next, generated voice last
- [ ] Mandy records and shares each session line from her account

## Later
- [ ] Go live: legal pages (terms, refund, privacy) + identity verification
- [ ] Moon session photos awaiting user uploads
- [ ] Move the complete meditation catalog and images to protected server storage (session narration and generated audio are protected now; static titles and images remain bundled)
