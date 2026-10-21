# JurnalKu

JurnalKu is a Laravel 12 and React application for personal tasks, financial transactions, and journal entries. Data belongs to the signed-in account and is stored in SQLite by default.

## Requirements

- PHP 8.3 with `curl`, `fileinfo`, `mbstring`, `openssl`, `pdo_sqlite`, and `zip`
- Composer
- Node.js 20 or newer and npm

For Laragon on Windows, you can install PHP 8.3 alongside the active PHP version. Do not switch Laragon's global PHP version: run the commands below from PowerShell to use PHP 8.3 for this project only.

## First-time setup

```powershell
$env:Path = "C:\laragon\bin\php\php-8.3.35-nts-Win32-vs16-x64;$env:Path"
composer install
Copy-Item .env.example .env
New-Item -ItemType File -Path database\database.sqlite -Force
php artisan key:generate
php artisan migrate
npm install
npm run build
```

If you installed PHP 8.3 in a different folder, replace the path in `$env:Path` with that folder. Keep `.env` and `database\database.sqlite` local; they are excluded from Git.

## Run locally

```powershell
$env:Path = "C:\laragon\bin\php\php-8.3.35-nts-Win32-vs16-x64;$env:Path"
php artisan serve
```

Open the local URL printed by Artisan. Create an account to begin; tasks, transactions, and journal entries are stored in the database and scoped to that account.

For frontend development, run `npm run dev` in a second terminal while the Laravel server is running. Build deployable frontend assets with `npm run build`.

## Tests

```powershell
$env:Path = "C:\laragon\bin\php\php-8.3.35-nts-Win32-vs16-x64;$env:Path"
php artisan test
```
