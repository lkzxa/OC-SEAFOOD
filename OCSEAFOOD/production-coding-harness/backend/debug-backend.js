const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log("Testing backend startup...");
  execSync('node src/server.js', { stdio: 'pipe' });
  console.log("Backend started successfully.");
} catch (e) {
  console.log("Backend failed to start. Error:");
  console.log(e.stderr.toString());
  console.log(e.stdout.toString());
  fs.writeFileSync('backend-error.log', e.stderr.toString() + '\n' + e.stdout.toString());
}
