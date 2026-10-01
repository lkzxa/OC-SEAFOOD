# OCSEAFOOD Production Deployment Runbook

This runbook is for the future VPS/domain launch. It is a command template, not a record of an already deployed server.

Use placeholders until the VPS, domain, and production credentials are chosen:

- `<DOMAIN>`: final root domain, for example `ocseafood.vn`
- `<WWW_DOMAIN>`: `www.<DOMAIN>`
- `<REPO_URL>`: Git remote URL
- `<DB_PASSWORD>`: production PostgreSQL password
- `<JWT_SECRET>`: random secret of at least 64 characters
- `<GOOGLE_CLIENT_ID>` / `<GOOGLE_CLIENT_SECRET>`: Google OAuth production client
- `<EMAIL_*_OR_NOTIFICATION_SECRET>`: production email/notification secrets

Do not paste local `.env` secrets into tickets, reports, or public docs.

## 1. Production architecture

| Component | Production plan |
| --- | --- |
| VPS OS | Ubuntu LTS recommended |
| Runtime | Node.js LTS compatible with this repo |
| Frontend | Next.js, internal port `3000` |
| Backend | Express API, internal port `5000` |
| Database | PostgreSQL 18, local/private only |
| Media | Persistent local directory `/var/lib/ocseafood/uploads` |
| Reverse proxy | Nginx |
| Public traffic | HTTPS only on ports `80` and `443` |
| App user | Linux user `ocseafood` |
| Release path | `/srv/ocseafood/current` |
| Backend env | `/etc/ocseafood/backend.env` |
| Frontend env | `/etc/ocseafood/frontend.env` |

Nginx should send:

- `/api/*` to backend port `5000`, stripping the `/api` prefix.
- `/uploads/*` to backend port `5000`.
- all other routes to frontend port `3000`.

## 2. Local release gate before touching VPS

Run from the repo root on the local machine:

```powershell
npm ci
npm run prisma:validate --workspace=backend
npm run prisma:generate --workspace=backend
npm run lint
npm test
npm run build
npm run media:inventory:strict
npm audit --audit-level=high
```

Create fresh local backups before deployment:

```powershell
# Database: use PostgreSQL custom format.
& "C:\Program Files\PostgreSQL\18\bin\pg_dump.exe" `
  --format=custom `
  --no-owner `
  --no-acl `
  --file "D:\PROJECT\OC-SEAFOOD\deploy-artifacts\ocseafood-prod-candidate.dump" `
  "postgresql://postgres:<LOCAL_PASSWORD>@localhost:5432/ocseafood_local"

# Media.
npm run media:backup --workspace=backend
npm run media:verify-backup --workspace=backend
```

Keep these artifacts outside the repo if they contain real business/customer data:

- PostgreSQL dump
- media archive
- media manifest
- production env backup, encrypted or stored in a password manager

## 3. VPS base setup

Run on the VPS as a sudo-capable user:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl ca-certificates gnupg git unzip nginx ufw
```

Install Node.js LTS using the chosen package source or version manager. Confirm:

```bash
node -v
npm -v
```

Install PostgreSQL 18 using the official PostgreSQL apt repository for the VPS OS, then confirm:

```bash
psql --version
pg_dump --version
pg_restore --version
```

Create the app user and directories:

```bash
sudo adduser --system --group --home /srv/ocseafood ocseafood
sudo install -d -m 0755 -o ocseafood -g ocseafood /srv/ocseafood
sudo install -d -m 0750 -o ocseafood -g ocseafood /var/lib/ocseafood/uploads
sudo install -d -m 0750 -o ocseafood -g ocseafood /var/backups/ocseafood
sudo install -d -m 0750 -o root -g ocseafood /etc/ocseafood
```

## 4. PostgreSQL production database

Create a dedicated DB and user:

```bash
sudo -u postgres psql
```

Inside `psql`:

```sql
CREATE USER ocseafood WITH PASSWORD '<DB_PASSWORD>';
CREATE DATABASE ocseafood OWNER ocseafood;
GRANT ALL PRIVILEGES ON DATABASE ocseafood TO ocseafood;
\q
```

Keep PostgreSQL bound to local/private interfaces only. Do not expose port `5432` publicly.

## 5. Checkout source code

```bash
sudo -u ocseafood git clone <REPO_URL> /srv/ocseafood/current
cd /srv/ocseafood/current
sudo -u ocseafood npm ci
```

If deploying from a release tag or commit:

```bash
sudo -u ocseafood git fetch --all --tags
sudo -u ocseafood git checkout <COMMIT_OR_TAG>
```

Record the deployed revision:

```bash
git rev-parse HEAD | sudo tee /srv/ocseafood/current/DEPLOYED_COMMIT
```

## 6. Production environment files

Create backend env:

```bash
sudo nano /etc/ocseafood/backend.env
```

Template:

```dotenv
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://ocseafood:<DB_PASSWORD>@127.0.0.1:5432/ocseafood?schema=public
JWT_SECRET=<JWT_SECRET>

FRONTEND_URL=https://<DOMAIN>
CORS_ORIGIN=https://<DOMAIN>,https://<WWW_DOMAIN>

HEALTHCHECK_TIMEOUT_MS=2000
SHUTDOWN_TIMEOUT_MS=10000

ALLOW_ADMIN_PASSWORD_LOGIN=false

GOOGLE_CLIENT_ID=<GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<GOOGLE_CLIENT_SECRET>
GOOGLE_CALLBACK_URL=https://<DOMAIN>/login

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
EMAIL_FROM=no-reply@<DOMAIN>
EMAIL_TO_ADMIN=

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
ZALO_OA_ACCESS_TOKEN=
ZALO_USER_ID=

RECRUITMENT_TELEGRAM_BOT_TOKEN=
RECRUITMENT_TELEGRAM_CHAT_ID=

NOTIFICATION_WORKER_INTERVAL_MS=10000
MAX_NOTIFICATION_RETRIES=5

MEDIA_PROVIDER=local
MEDIA_ROOT=/var/lib/ocseafood/uploads

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Create frontend env:

```bash
sudo nano /etc/ocseafood/frontend.env
```

Template:

```dotenv
BACKEND_URL=http://127.0.0.1:5000
NEXT_PUBLIC_SITE_URL=https://<DOMAIN>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<GOOGLE_CLIENT_ID>
```

Lock down env permissions:

```bash
sudo chown root:ocseafood /etc/ocseafood/backend.env /etc/ocseafood/frontend.env
sudo chmod 640 /etc/ocseafood/backend.env /etc/ocseafood/frontend.env
```

## 7. Restore database and media

Copy deployment artifacts to the VPS:

```bash
sudo install -d -m 0750 -o ocseafood -g ocseafood /var/backups/ocseafood/restore
```

Place these files under `/var/backups/ocseafood/restore/`:

- `ocseafood-prod-candidate.dump`
- media `.zip` archive
- media `.manifest.json`

Restore database:

```bash
sudo -u ocseafood pg_restore \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  --dbname "postgresql://ocseafood:<DB_PASSWORD>@127.0.0.1:5432/ocseafood" \
  /var/backups/ocseafood/restore/ocseafood-prod-candidate.dump
```

Restore media into a new directory first:

```bash
sudo install -d -m 0750 -o ocseafood -g ocseafood /var/lib/ocseafood/uploads-restored
sudo -u ocseafood unzip /var/backups/ocseafood/restore/<MEDIA_ARCHIVE>.zip -d /var/lib/ocseafood/uploads-restored
```

Switch media directory after inspection:

```bash
sudo rsync -a --delete /var/lib/ocseafood/uploads-restored/ /var/lib/ocseafood/uploads/
sudo chown -R ocseafood:ocseafood /var/lib/ocseafood/uploads
sudo chmod -R u=rwX,g=rX,o= /var/lib/ocseafood/uploads
```

## 8. Generate Prisma, migrate, and build

Run as app user:

```bash
cd /srv/ocseafood/current
sudo -u ocseafood env $(cat /etc/ocseafood/backend.env | xargs) npm run prisma:generate --workspace=backend
sudo -u ocseafood env $(cat /etc/ocseafood/backend.env | xargs) npm run prisma:migrate:deploy --workspace=backend
sudo -u ocseafood env $(cat /etc/ocseafood/backend.env | xargs) npm run prisma:validate --workspace=backend
sudo -u ocseafood env $(cat /etc/ocseafood/backend.env | xargs) npm run build --workspace=backend
sudo -u ocseafood env $(cat /etc/ocseafood/frontend.env | xargs) npm run build --workspace=frontend
sudo -u ocseafood env $(cat /etc/ocseafood/backend.env | xargs) npm run media:inventory:strict --workspace=backend
```

If any step fails, stop and fix before creating services.

## 9. systemd services

Create backend service:

```bash
sudo nano /etc/systemd/system/ocseafood-backend.service
```

```ini
[Unit]
Description=OCSEAFOOD Backend API
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=ocseafood
Group=ocseafood
WorkingDirectory=/srv/ocseafood/current
EnvironmentFile=/etc/ocseafood/backend.env
ExecStart=/usr/bin/npm run start --workspace=backend
Restart=always
RestartSec=5
TimeoutStopSec=15
KillSignal=SIGTERM
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Create frontend service:

```bash
sudo nano /etc/systemd/system/ocseafood-frontend.service
```

```ini
[Unit]
Description=OCSEAFOOD Frontend
After=network.target ocseafood-backend.service
Wants=ocseafood-backend.service

[Service]
Type=simple
User=ocseafood
Group=ocseafood
WorkingDirectory=/srv/ocseafood/current
EnvironmentFile=/etc/ocseafood/frontend.env
ExecStart=/usr/bin/npm run start --workspace=frontend
Restart=always
RestartSec=5
TimeoutStopSec=15
KillSignal=SIGTERM
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Start services:

```bash
sudo systemctl daemon-reload
sudo systemctl enable ocseafood-backend ocseafood-frontend
sudo systemctl start ocseafood-backend
sudo systemctl start ocseafood-frontend
sudo systemctl status ocseafood-backend --no-pager
sudo systemctl status ocseafood-frontend --no-pager
```

Local service checks:

```bash
curl -fsS http://127.0.0.1:5000/health/ready
curl -I http://127.0.0.1:3000/
```

Logs:

```bash
journalctl -u ocseafood-backend -n 100 --no-pager
journalctl -u ocseafood-frontend -n 100 --no-pager
```

## 10. Nginx reverse proxy

Create site:

```bash
sudo nano /etc/nginx/sites-available/ocseafood
```

Initial HTTP config:

```nginx
server {
    listen 80;
    server_name <DOMAIN> <WWW_DOMAIN>;

    client_max_body_size 6m;

    location = /api {
        return 308 /api/;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/ocseafood /etc/nginx/sites-enabled/ocseafood
sudo nginx -t
sudo systemctl reload nginx
```

Before DNS cutover, test by pointing a local hosts file to the VPS IP or by using Nginx server IP checks where possible.

## 11. Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status verbose
```

Do not open PostgreSQL port `5432` publicly.

## 12. DNS and TLS

After the VPS is ready:

1. Point DNS `A` record for `<DOMAIN>` to the VPS IP.
2. Point DNS `A` or `CNAME` for `<WWW_DOMAIN>`.
3. Wait for DNS propagation.
4. Install and run Certbot for Nginx.

Example:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d <DOMAIN> -d <WWW_DOMAIN>
sudo certbot renew --dry-run
```

After TLS, confirm:

```bash
curl -I https://<DOMAIN>/
curl -fsS https://<DOMAIN>/api/health/ready
```

If choosing one canonical host, configure Nginx/Certbot redirect so `www` and non-`www` are consistent.

## 13. Google OAuth production update

In Google Cloud Console, add the production redirect URI:

```text
https://<DOMAIN>/login
```

Then ensure:

- backend `GOOGLE_CALLBACK_URL=https://<DOMAIN>/login`
- frontend `NEXT_PUBLIC_GOOGLE_CLIENT_ID=<GOOGLE_CLIENT_ID>`
- backend `GOOGLE_CLIENT_ID` matches frontend public client ID
- admin Google email already exists as an ADMIN account
- `ALLOW_ADMIN_PASSWORD_LOGIN=false`

Restart services after env changes:

```bash
sudo systemctl restart ocseafood-backend ocseafood-frontend
```

## 14. Production smoke test

Run before public announcement or ads:

```bash
curl -fsS https://<DOMAIN>/api/health/live
curl -fsS https://<DOMAIN>/api/health/ready
curl -I https://<DOMAIN>/
```

Browser checks:

- Home opens.
- Menu/category opens.
- Product detail opens.
- Product image loads from `/uploads`.
- Blog opens.
- Combo page opens.
- Cart add/remove works.
- Guest checkout creates one order.
- Customer register/login/logout works.
- Customer order history only shows their own orders.
- Admin Google login works.
- Admin sees new order.
- Admin updates order status/note.
- Admin product/category/combo/post pages load.
- Upload image in admin works.

Database checks:

```bash
sudo -u postgres psql ocseafood -c 'SELECT COUNT(*) FROM "Order";'
sudo -u postgres psql ocseafood -c 'SELECT COUNT(*) FROM "NotificationOutbox";'
```

Log checks:

```bash
journalctl -u ocseafood-backend -n 200 --no-pager
journalctl -u ocseafood-frontend -n 100 --no-pager
sudo tail -n 100 /var/log/nginx/error.log
```

There should be no repeated 5xx errors, database connection failures, or upload/media failures.

## 15. Backup schedule

Create backup scripts under `/usr/local/bin` or `/srv/ocseafood/current/scripts/ops` after deployment. Minimum daily plan:

- PostgreSQL custom dump.
- Media archive + manifest.
- Copy DB dump/media archive/media manifest off the VPS.
- Keep a retention policy, for example daily 7, weekly 4, monthly 3.

Example database backup:

```bash
sudo -u ocseafood pg_dump \
  --format=custom \
  --no-owner \
  --no-acl \
  --file "/var/backups/ocseafood/db-$(date +%F-%H%M%S).dump" \
  "postgresql://ocseafood:<DB_PASSWORD>@127.0.0.1:5432/ocseafood"
```

Example media backup:

```bash
cd /srv/ocseafood/current
sudo -u ocseafood env $(cat /etc/ocseafood/backend.env | xargs) npm run media:backup --workspace=backend
sudo -u ocseafood env $(cat /etc/ocseafood/backend.env | xargs) npm run media:verify-backup --workspace=backend
```

Cron example:

```cron
15 2 * * * /usr/local/bin/ocseafood-backup.sh >> /var/log/ocseafood-backup.log 2>&1
```

The off-server copy is required. A backup stored only on the same VPS does not protect against VPS disk loss.

## 16. Monitoring minimum

Before real traffic, configure at least:

- uptime monitor for `https://<DOMAIN>/api/health/ready`
- disk usage alert
- CPU/RAM alert
- service down alert for `ocseafood-backend` and `ocseafood-frontend`
- PostgreSQL availability alert
- log review for repeated 5xx errors
- SSL expiry alert

Low-cost options include provider monitoring, UptimeRobot/Better Stack, or a simple external cron hitting `/api/health/ready`.

## 17. Rollback

Before every deployment:

```bash
cd /srv/ocseafood/current
git rev-parse HEAD
sudo -u ocseafood pg_dump --format=custom --no-owner --no-acl --file "/var/backups/ocseafood/predeploy-$(date +%F-%H%M%S).dump" "postgresql://ocseafood:<DB_PASSWORD>@127.0.0.1:5432/ocseafood"
sudo -u ocseafood env $(cat /etc/ocseafood/backend.env | xargs) npm run media:backup --workspace=backend
```

Rollback code:

```bash
cd /srv/ocseafood/current
sudo -u ocseafood git checkout <PREVIOUS_GOOD_COMMIT>
sudo -u ocseafood npm ci
sudo -u ocseafood env $(cat /etc/ocseafood/backend.env | xargs) npm run prisma:generate --workspace=backend
sudo -u ocseafood env $(cat /etc/ocseafood/frontend.env | xargs) npm run build --workspace=frontend
sudo systemctl restart ocseafood-backend ocseafood-frontend
```

Rollback database only if the failed deployment changed data/schema and the rollback plan explicitly requires it. Database rollback can lose real customer orders created after the backup, so stop traffic first and preserve a post-failure dump before restoring an older one.

## 18. Launch checklist

Do not announce launch until all P0 items pass:

- `npm audit --audit-level=high` passes.
- Backend and frontend services restart cleanly.
- `/api/health/ready` returns 200 through HTTPS.
- PostgreSQL is not public.
- Nginx serves HTTPS and redirects HTTP.
- Domain and `www` behavior are decided and tested.
- Admin Google login works.
- Admin password login is disabled in production.
- Guest checkout creates one order.
- Customer checkout/history works.
- Admin sees and updates orders.
- Product/category/blog/combo images load.
- Media inventory strict passes on VPS.
- Backup job has run at least once.
- Restore procedure has been rehearsed at least once.
- Uptime monitoring and service alerts exist.
- Current deployed commit is recorded.
