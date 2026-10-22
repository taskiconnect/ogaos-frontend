/** Keep an operation key across network failures; clear only after success. */
const pending = new Map<string, string>();
export async function requestKey(
  scope: string,
  method: string,
  path: string,
  body: unknown,
) {
  const bytes = new TextEncoder().encode(
    JSON.stringify([scope, method, path, body ?? null]),
  );
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash =
    "oga-operation:" +
    Array.from(new Uint8Array(digest), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
  let key = pending.get(hash);
  try {
    key ??= sessionStorage.getItem(hash) ?? undefined;
  } catch {
    /* private storage unavailable */
  }
  if (!key) key = crypto.randomUUID();
  pending.set(hash, key);
  try {
    sessionStorage.setItem(hash, key);
  } catch {
    /* memory fallback */
  }
  return { hash, key };
}
export function completeRequest(hash: string) {
  pending.delete(hash);
  try {
    sessionStorage.removeItem(hash);
  } catch {
    /* memory fallback */
  }
}
export function requiresIdempotency(method: string, path: string) {
  return (
    ["post", "put", "patch", "delete"].includes(method.toLowerCase()) &&
    /^\/(?:api\/)?(?:sales|debts|invoices|products|customers|expenses|stores|admin\/messages|subscriptions\/initiate)(?:\/|\?|$)/.test(
      path,
    )
  );
}
