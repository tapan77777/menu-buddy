// src/lib/utils/getSubdomain.js
export function getSubdomain(hostname) {
  const base = "menubuddy.co.in";
  if (!hostname.endsWith(base)) return null;

  const sub = hostname.replace(`.${base}`, "");
  return sub === "www" || sub === "menubuddy" ? null : sub;
}
