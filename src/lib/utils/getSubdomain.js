export function getSubdomain(hostname) {
  const domain = "menubuddy.co.in"; // You can also fetch from env
  const parts = hostname.split(".");

  if (hostname.endsWith(domain) && parts.length >= 3) {
    return parts[0].toLowerCase(); // e.g., 'lha-kitchen'
  }

  return null;
}
