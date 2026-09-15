import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border px-6 py-10 text-center">
      <p className="text-sm font-medium text-foreground">Mandy's Meditation Space</p>
      <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <Link to="/pricing" className="hover:text-foreground hover:underline">
          Pricing
        </Link>
        <Link to="/terms" className="hover:text-foreground hover:underline">
          Terms &amp; Conditions
        </Link>
        <Link to="/refunds" className="hover:text-foreground hover:underline">
          Refund Policy
        </Link>
        <Link to="/privacy" className="hover:text-foreground hover:underline">
          Privacy Notice
        </Link>
      </nav>
      <p className="mt-4 text-[11px] text-muted-foreground">
        Our order process is conducted by our online reseller Paddle.com. Paddle.com is the
        Merchant of Record for all our orders.
      </p>
    </footer>
  );
}
