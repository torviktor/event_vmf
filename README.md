# 🎓 Встреча выпускников — веб-сайт

Сайт для организации встречи выпускников института.

**Стек:** FastAPI · React + Vite · PostgreSQL · Docker · Nginx

---

## Что умеет сайт

| Функция | Описание |
|---|---|
| Регистрация | Гость заполняет форму: ФИО, телефон, состав семьи, программа |
| Список участников | Статистика: взрослые, дети, кто идёт куда |
| Голосование | Опрос по удобным датам |
| Информация | Дата, ресторан, бюджет — редактируется через панель |
| Панель оргкомитета | Просмотр и подтверждение участников, настройки, создание опросов |

---

## Первый запуск на сервере

```bash
# 1. Клонировать репозиторий
git clone https://github.com/ВАШ_НИК/reunion.git /opt/reunion
cd /opt/reunion

# 2. Создать .env
cp .env.example .env
nano .env   # задать пароли

# 3. Запустить
docker compose up -d --build

# 4. Открыть в браузере
# Сайт:  http://185.152.92.101:8080
# API:   http://185.152.92.101:8080/api/health
```

---

## Настройка домена (опционально)

Если хотите использовать домен вместо IP — добавьте в основной nginx сервера (из проекта taipan) блок:

```nginx
server {
    listen 80;
    server_name reunion.yourdomain.ru;
    location / {
        proxy_pass http://127.0.0.1:8080;
    }
}
```

---

## GitHub Actions (автодеплой)

В настройках репозитория → Secrets добавить:
- `REUNION_HOST` = `185.152.92.101`
- `REUNION_SSH_KEY` = приватный SSH-ключ сервера

После этого `git push` в `main` автоматически обновит сайт.

---

## Панель администратора

Открыть: `/admin`

По умолчанию пароль задаётся в `.env` → `ADMIN_PASSWORD`.

В панели можно:
- Смотреть и подтверждать участников
- Редактировать информацию о встрече (дата, ресторан, бюджет, ...)
- Создавать опросы по датам

---

## Структура проекта

```
reunion/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── core/            # БД, безопасность, конфиг
│   │   ├── models/          # SQLAlchemy модели
│   │   └── routes/          # API эндпоинты
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/           # Home, Register, Vote, Program, Admin
│   │   ├── components/      # Navbar
│   │   └── api.js           # Обёртка над API
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
└── .env.example
```

---

## API

| Метод | URL | Описание |
|---|---|---|
| POST | /api/guests/register | Регистрация участника |
| GET | /api/guests/ | Список (admin) |
| GET | /api/guests/stats | Статистика (публично) |
| PATCH | /api/guests/{id}/confirm | Подтвердить участника (admin) |
| DELETE | /api/guests/{id} | Удалить (admin) |
| POST | /api/auth/login | Получить токен |
| GET | /api/vote/ | Текущий опрос |
| POST | /api/vote/{id}/vote | Проголосовать |
| GET | /api/info/ | Настройки сайта |
| POST | /api/info/ | Обновить настройку (admin) |
