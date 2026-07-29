const env = require('./config/env');
const app = require('./app');
const { startNotificationWorker } = require('./workers/notificationWorker');
const { seedCombos } = require('./config/seedCombos');

app.listen(env.PORT, async () => {
  console.log(`Backend server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  await seedCombos();
  startNotificationWorker();
});
