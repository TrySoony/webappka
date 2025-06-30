# GiftWins — Рулетка подарков на Vercel + MongoDB Atlas

## Как запустить

1. **Создайте базу данных MongoDB Atlas**
   - Создайте базу `giftwins` и коллекции `prizes`, `users`.
   - Добавьте призы и пользователей через Atlas UI.
2. **Склонируйте этот проект и создайте package.json:**
   - В корне должен быть файл package.json с зависимостью mongodb.
3. **Создайте папку `/api` и добавьте serverless-функции:**
   - `/api/get_prizes.js` — получить призы
   - `/api/admin_user_data.js` — получить пользователей
   - `/api/add_user.js` — добавить пользователя (POST)
   - `/api/update_user_attempts.js` — сбросить попытки (POST)
4. **Добавьте переменную окружения на Vercel:**
   - `MONGODB_URI` — строка подключения к вашей базе MongoDB Atlas
5. **Деплойте проект на Vercel**
6. **Используйте API в вашем frontend и админке**

## Пример запроса к API

- Получить призы: `GET /api/get_prizes`
- Получить пользователей: `GET /api/admin_user_data`
- Добавить пользователя: `POST /api/add_user` (body: JSON)
- Сбросить попытки: `POST /api/update_user_attempts` (body: `{ "user_id": "..." }`)

---

**Вопросы? Пиши в issues или в Telegram!** 