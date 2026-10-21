# Logistics Control

Ядро проекта: инфраструктура (Docker + Nginx + prerender) и аутентификация.
Одна страница — единственный роут `/`.

## Стек

- **Фронтенд:** Vue 3 + Vite + Pinia + Vue Router + Tailwind CSS
- **Бэкенд:** Express + Knex + better-sqlite3, JWT (access + refresh) и 2FA по email
- **Инфраструктура:** Docker Compose (backend + frontend/nginx + prerender)

## Требования

- Node.js 20+ и npm — для локальной разработки (в репозитории есть `.nvmrc`)
- Docker и Docker Compose — для деплоя

> **Версия Node важна.** Проект требует Node 20. Если установлена другая версия,
> `better-sqlite3` может не запуститься (`NODE_MODULE_VERSION` mismatch).
> Проще всего использовать nvm:
>
> ```bash
> curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
> nvm install 20
> nvm use            # подхватит версию из .nvmrc
> ```
>
> После смены версии Node переустанови зависимости: `npm install`.

## Локальный запуск

### 1. Backend (терминал №1)

```bash
cd backend
cp .env.example .env          # задать JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run migrate               # создать таблицы
npm run seed                  # создать админа и дефолтные settings
npm run dev                   # http://localhost:3001
```

- API: http://localhost:3001
- Swagger: http://localhost:3001/api/docs

> **Важно про `.env`.** Локальному backend нужен **свой** файл `backend/.env`
> (dotenv читает `.env` из рабочей папки запуска). Корневой `.env` в корне проекта
> используется только Docker Compose и для `npm run dev` в `backend/` не читается.
> Если удобнее держать настройки в одном месте — скопируй корневой: `cp ../.env .env`.

### 2. Frontend (терминал №2)

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

Vite проксирует `/api` и `/uploads` на `http://localhost:3001`
(`frontend/vite.config.js`), поэтому CORS настраивать не нужно.

## Вход в админку

1. Открыть http://localhost:5173 и нажать «Вход».
2. Ввести email и пароль администратора.
3. Ввести 4-значный 2FA-код.

- **Пароль:** из `ADMIN_PASSWORD` в `.env`. Если не задан — генерируется и сохраняется
  в `backend/temp-credentials-*.txt` (когда SMTP не настроен).
- **2FA-код:** при отсутствии SMTP пишется в лог backend: `2FA-код для <email>: <code>`.

## Docker

```bash
cp .env.example .env          # задать SERVER_NAME, CERT_DIR, JWT_SECRET, ENCRYPTION_KEY, ADMIN_EMAIL, SMTP
docker compose up --build -d
```

- Фронтенд слушает порты 80/443, backend доступен только внутри сети Compose.
- `SERVER_NAME` и `CERT_DIR` подставляются в `frontend/nginx.conf` через envsubst.
- При первом старте backend выполняет миграции, сид (только для пустой БД) и prerender.

## Переменные окружения

| Переменная | Обязательная | Описание |
|------------|--------------|----------|
| `JWT_SECRET` | да | Секрет подписи JWT (`openssl rand -hex 32`) |
| `ENCRYPTION_KEY` | да | Ключ шифрования секретов (`openssl rand -hex 32`) |
| `SERVER_NAME` | да (Docker) | Домен сервера |
| `CERT_DIR` | да (Docker) | Путь к сертификатам Let's Encrypt |
| `CORS_ORIGIN` | рекомендована | Разрешённые origins через запятую |
| `ADMIN_EMAIL` | да | Почта админа (пароль, 2FA-коды) |
| `ADMIN_PASSWORD` | нет | Если не задан — генерируется и отправляется на почту |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `MAIL_FROM` | нет | SMTP для писем (без него — temp-файл в лог) |
