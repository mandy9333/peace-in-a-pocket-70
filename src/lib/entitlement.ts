/** Shared membership entitlement rule used by server functions and API routes. */
export function isEntitled(status: string, periodEnd: string | null) {
  const inPeriod = periodEnd === null || new Date(periodEnd).getTime() > Date.now();
  return (["active", "trialing", "past_due"].includes(status) && inPeriod)
    || (status === "canceled" && periodEnd !== null && inPeriod);
}
