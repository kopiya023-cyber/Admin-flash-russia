# FLASH RUSSIA — панель заявок (Vercel)

## Что есть
- Отдельная панель заявок с поиском, фильтрами, статусами.
- Кнопки «Принять», «Отклонить», «Вернуть в новые».
- Хранение в Supabase PostgreSQL.
- Секретная ссылка `/panel/ВАШ-СЕКРЕТ`.
- Серверный ключ Supabase хранится только в настройках Vercel.

## 1. Supabase
Таблица `public.applications` должна быть создана в SQL Editor (если уже создали — повторять не нужно).

## 2. Загрузить проект в GitHub
1. Скачайте ZIP и распакуйте его.
2. Откройте https://github.com/ в браузере и создайте репозиторий.
3. Загрузите файлы и папки из архива в корень репозитория. Важно: папка `api` должна лежать в корне.
   На телефоне GitHub может быть неудобен; если интерфейс не позволяет загрузить папку целиком, используйте «Add file → Upload files» и загружайте содержимое папки. Не загружайте ZIP как единственный файл.

## 3. Развернуть на Vercel
1. Откройте https://vercel.com/ и войдите через GitHub.
2. Нажмите Add New → Project и импортируйте созданный репозиторий.
3. Framework Preset: Other. Build Command и Output Directory оставьте пустыми, если Vercel сам их не заполнит.
4. В настройках проекта найдите Environment Variables и добавьте для Production:
   - `SUPABASE_URL` — URL проекта Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` — секретный серверный ключ Supabase (не publishable)
   - `PANEL_SLUG` — длинная случайная секретная строка, лучше 32+ символа. Создайте свою, не используйте очевидное слово.
5. Нажмите Deploy. Если добавляли/меняли переменные после Deploy, сделайте Redeploy.

## 4. Адрес панели
`https://ИМЯ-ПРОЕКТА.vercel.app/panel/ВАШ-PANEL_SLUG`

Вместо `ВАШ-PANEL_SLUG` укажите точно значение переменной `PANEL_SLUG`.

## 5. Подключить форму заявок
Форма должна отправлять POST JSON на:
`https://ИМЯ-ПРОЕКТА.vercel.app/api/ВАШ-PANEL_SLUG/applications`
Поля: `application_id`, `nickname`, `age`, `telegram`, `level`, `role`, `experience`, `reason`, `online`, `conflicts`.

Пример:
```js
fetch("https://ИМЯ-ПРОЕКТА.vercel.app/api/ВАШ-PANEL_SLUG/applications", {
  method: "POST",
  headers: {"Content-Type":"application/json"},
  body: JSON.stringify(application)
});
```

## Безопасность
Секретная ссылка — это ключ доступа. Не публикуйте её. Если ссылка утекла, поменяйте `PANEL_SLUG` в Vercel и выполните Redeploy. Серверный ключ Supabase никогда не вставляйте в HTML и не отправляйте в чат. Для более сильной защиты можно позже добавить логин/пароль.
