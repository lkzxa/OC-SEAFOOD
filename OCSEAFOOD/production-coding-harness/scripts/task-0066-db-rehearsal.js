const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const projectRoot = path.resolve(__dirname, '..');
const backupRoot = path.join(projectRoot, 'backend', 'backups', 'db');
const reportPath = path.join(projectRoot, 'reports', 'task-0066-db-restore.json');
const restoreDatabase = 'ocseafood_restore_task0066';
const pgBin = process.env.PG_BIN || 'C:\\Program Files\\PostgreSQL\\18\\bin';
const pgDump = path.join(pgBin, 'pg_dump.exe');
const pgRestore = path.join(pgBin, 'pg_restore.exe');
const psql = path.join(pgBin, 'psql.exe');

const tableNames = [
  'User',
  'Category',
  'Product',
  'BlogPost',
  'Order',
  'OrderItem',
  'OrderAuditLog',
  'NotificationOutbox',
  'SystemSetting',
  'PasswordResetToken',
  'Combo',
  'JobOpening',
];

function fail(message) {
  throw new Error(message);
}

function assertFile(filePath) {
  if (!fs.existsSync(filePath)) fail(`Required PostgreSQL tool not found: ${filePath}`);
}

function parseDatabaseUrl(raw) {
  if (!raw) fail('DATABASE_URL is missing from backend/.env');
  const url = new URL(raw);
  return {
    raw,
    protocol: url.protocol,
    host: url.hostname,
    port: url.port || '5432',
    database: url.pathname.slice(1),
    username: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  };
}

function makeUrl(base, database) {
  const url = new URL(base.raw);
  url.pathname = `/${database}`;
  url.search = '';
  return url.toString();
}

function cliUrl(base) {
  const url = new URL(base.raw);
  url.search = '';
  return url.toString();
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    env: { ...process.env, PGPASSWORD: options.password || process.env.PGPASSWORD || '' },
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const stderr = result.stderr ? `\n${result.stderr}` : '';
    fail(`${path.basename(command)} failed with exit code ${result.status}${stderr}`);
  }
  return result.stdout || '';
}

function psqlExec(connectionUrl, sql, password, capture = true) {
  return run(psql, [connectionUrl, '-v', 'ON_ERROR_STOP=1', '-c', sql], { password, capture });
}

function countSql() {
  return tableNames
    .map((name) => `SELECT '${name}' AS table_name, COUNT(*)::int AS row_count FROM "${name}"`)
    .join(' UNION ALL ');
}

function parseCounts(output) {
  const counts = {};
  output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [name, count] = line.split('|');
      if (name && count !== undefined) counts[name] = Number(count);
    });
  return counts;
}

function readCounts(connectionUrl, password) {
  const output = run(psql, [connectionUrl, '-v', 'ON_ERROR_STOP=1', '-t', '-A', '-F', '|', '-c', countSql()], {
    password,
    capture: true,
  });
  return parseCounts(output);
}

function compareCounts(source, restored) {
  return tableNames.map((name) => ({
    table: name,
    source: source[name],
    restored: restored[name],
    match: source[name] === restored[name],
  }));
}

function main() {
  assertFile(pgDump);
  assertFile(pgRestore);
  assertFile(psql);

  const db = parseDatabaseUrl(process.env.DATABASE_URL);
  if (db.database === restoreDatabase) fail('Active DATABASE_URL points to the restore database; refusing to continue.');

  fs.mkdirSync(backupRoot, { recursive: true });
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dumpPath = path.join(backupRoot, `task-0066-${stamp}.dump`);
  const sourceUrl = cliUrl(db);
  const postgresUrl = makeUrl(db, 'postgres');
  const restoreUrl = makeUrl(db, restoreDatabase);

  const sourceCounts = readCounts(sourceUrl, db.password);

  run(pgDump, ['--format=custom', '--no-owner', '--no-acl', '--file', dumpPath, sourceUrl], {
    password: db.password,
  });

  psqlExec(
    postgresUrl,
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${restoreDatabase}';`,
    db.password,
    true,
  );
  psqlExec(postgresUrl, `DROP DATABASE IF EXISTS ${restoreDatabase};`, db.password, true);
  psqlExec(postgresUrl, `CREATE DATABASE ${restoreDatabase};`, db.password, true);

  run(pgRestore, ['--no-owner', '--no-acl', '--dbname', restoreUrl, dumpPath], {
    password: db.password,
  });

  const restoredCounts = readCounts(restoreUrl, db.password);
  const comparison = compareCounts(sourceCounts, restoredCounts);
  const allCountsMatch = comparison.every((row) => row.match);
  const dumpStats = fs.statSync(dumpPath);

  const report = {
    generatedAt: new Date().toISOString(),
    source: {
      host: db.host,
      port: db.port,
      database: db.database,
      username: db.username,
      password: '***',
    },
    restoreDatabase,
    dumpPath,
    dumpBytes: dumpStats.size,
    sourceCounts,
    restoredCounts,
    comparison,
    allCountsMatch,
  };

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ reportPath, dumpPath, dumpBytes: dumpStats.size, restoreDatabase, allCountsMatch, comparison }, null, 2));

  if (!allCountsMatch) process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
