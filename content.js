// Local development only. Never load this extension against a real server.
// The username and passwords live in the extension's settings page
// (chrome.storage.local), never in this file.
const DEFAULTS = { user: "Administrator", passwords: [] };
const GUARD = "frappe-autologin-tried";

// Only localhost, *.localhost and private LAN addresses (10.x, 172.16-31.x, 192.168.x).
function isLocalHost(h) {
  return (
    h === "localhost" ||
    h.endsWith(".localhost") ||
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h)
  );
}

function loggedIn() {
  const m = document.cookie.match(/(?:^|;\s*)user_id=([^;]*)/);
  return m && decodeURIComponent(m[1]) !== "Guest";
}

// Where the user was heading: /app itself, or the redirect-to on /login.
function target() {
  const { pathname, search } = location;
  if (pathname === "/login") {
    const to = new URLSearchParams(search).get("redirect-to");
    return to && /^\/(app|desk)(\/|$|\?)/.test(to) ? to : null;
  }
  return /^\/(app|desk)(\/|$)/.test(pathname) ? pathname + search : null;
}

// Every Frappe site answers /api/method/ping with {"message":"pong"}.
// Anything else (another app, a 404 page, nothing listening) is not Frappe.
async function isFrappe() {
  try {
    const res = await fetch("/api/method/ping", {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data && data.message === "pong";
  } catch {
    return false;
  }
}

async function tryLogin(user, pwd) {
  const res = await fetch("/api/method/login", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ usr: user, pwd }),
  });
  return res.ok;
}

(async () => {
  const to = target();
  if (!isLocalHost(location.hostname) || !to || loggedIn()) return;
  // One attempt per tab session, so a wrong password can't loop or lock the account.
  if (sessionStorage.getItem(GUARD)) return;
  const { user, passwords } = await chrome.storage.local.get(DEFAULTS);
  if (!user || !passwords.length) {
    console.info("[frappe-autologin] No passwords set. Open the extension's options to add them.");
    return;
  }
  // Never send the passwords to anything that isn't a Frappe server.
  if (!(await isFrappe())) return;
  sessionStorage.setItem(GUARD, "1");

  for (const pwd of passwords) {
    try {
      if (await tryLogin(user, pwd)) {
        sessionStorage.removeItem(GUARD);
        location.replace(to);
        return;
      }
    } catch (e) {
      console.warn("[frappe-autologin]", e);
    }
  }
  console.warn("[frappe-autologin] Every saved password failed for", user);
})();
