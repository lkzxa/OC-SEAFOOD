const env = require('./config/env');
const app = require('./app');
const { startNotificationWorker } = require('./workers/notificationWorker');

app.listen(env.PORT, () => {
  console.log(`Backend server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  startNotificationWorker();
});
