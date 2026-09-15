const dns = require('node:dns');

// Node 22 Happy Eyeballs (lookupall) times out on Docker's 127.0.0.11 AAAA
// path and surfaces as getaddrinfo EAI_AGAIN for the Compose service name.
dns.setDefaultResultOrder('ipv4first');
if (typeof dns.setDefaultAutoSelectFamily === 'function') {
  dns.setDefaultAutoSelectFamily(false);
}

module.exports = {
  '/api': {
    target: 'http://backend:3000',
    secure: false,
    changeOrigin: true,
  },
};
