// /lib/utils/getSubdomain.js
export function getSubdomain(hostname) {
  const baseDomain = "menubuddy.co.in"; // or from env if dynamic
  if (!hostname.endsWith(baseDomain)) return null;

  const sub = hostname.replace(`.${baseDomain}`, "");
  return sub === "www" || sub === "menubuddy" ? null : sub;
}
