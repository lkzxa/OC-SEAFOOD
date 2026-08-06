const dns = require('dns');
// Render's outbound network has no IPv6 route, so DNS lookups that resolve to an
// AAAA (IPv6) address first (e.g. smtp.gmail.com) fail with ENETUNREACH. Prefer
// IPv4 results so outbound SMTP/HTTPS connections use a reachable address.
dns.setDefaultResultOrder('ipv4first');

const env = require('./config/env');
const app = require('./app');
const { startNotificationWorker } = require('./workers/notificationWorker');
const { seedCombos } = require('./config/seedCombos');

app.listen(env.PORT, async () => {
  console.log(`Backend server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  await seedCombos();
  startNotificationWorker();
});
