# CLAUDE.md — память проекта

Память ведётся под этот репозиторий. Коротко и по делу: ориентиры, грабли,
неочевидное. Перед созданием файла — сверяйся с картой ниже.

## Рабочие правила сессии
- Ищи лучший вариант, а не первый: для нетривиальных задач сначала исследуй
  кодбазу/best practice, потом код. Сравнивай 2–3 подхода и давай рекомендацию.
- Код только под задачу. Без drive-by рефакторинга. Не плодить лишние файлы —
  переиспользуй существующее место (см. карту).
- Чини только воспроизводимые баги. Работающее не трогай.
- Не выдавай незавершённое за готовое — прямо говори, что осталось.

## Что это
Премиум сайт-визитка психолога **Анны Маловичко** (Пятигорск + онлайн).
**Статический сайт без сборки**: HTML5 + CSS (custom properties) + Vanilla JS.
Нет npm/бандлера/бэкенда (кроме gift-api.php). Дизайн-близнец подхода
dr-vlada-site, но светлая палитра: шалфей `#4A6151` + карамель `#C08A62` +
крем `#FBF9F4`. Домен ещё НЕ выбран — в robots.txt/sitemap.xml плейсхолдер
`annamalovichko.ru`.

ВАЖНО: фамилия «Маловичко» — возможно, девичья (Анна вышла замуж). Если
сменится: `assets/js/config.js` (name) + `<title>`/meta во всех HTML +
`intro__brand`/`card__brand` в gift.html, `lock__brand`/`top__title` в
gift-studio.html + перегенерировать og-обложку.

## Структура
- Страницы: `index.html`, `about.html`, `services.html`, `contacts.html`,
  `404.html` — общие шапка/футер/FAB скопированы в каждой (нет шаблонизатора).
- `gift.html` + `gift-studio.html` + `gift-api.php` — подарочные сертификаты
  (standalone, инлайн CSS/JS; см. ниже).
- `assets/css/styles.css` — единая дизайн-система, палитра в `:root`.
- `assets/js/config.js` — **единственный источник правды** по контактам/ценам
  (`window.AM_CONFIG`): телефон +7 962 003 6057, TG t.me/AnnaMalovichko,
  WhatsApp wa.me/79620036057. Адрес кабинета в Пятигорске пока не известен —
  «точный адрес после записи», вписать в config при появлении.
- `assets/js/main.js` — data-cfg/data-href подстановка, меню, FAB, reveal
  (IntersectionObserver), счётчики, карусель отзывов, FAQ-аккордеон,
  дыхательный виджет (подпись «вдох/выдох»), `window.__revealAll()` для
  скриншот-тестов.
- `assets/img/logo-mark.svg` — лого-монограмма «А» (кольцо + буква с
  дугой-перекладиной + листок). Он же favicon.
- `assets/img/anna/hero.jpg|about.jpg` — реальные фото Анны (в репо).
  Источник — Drive-папка заказчика `1LSftAizFCcdcjQUImD61tV4LcTmJmraf`:
  hero ← Анна1.jpg `1LxHB0ydj-5-3rlvggQDxXC9zLXF9hcfy` (кроп 4:5.05, центр x=370),
  about ← Анна3.jpg `1bNmLVYAb_4w9HVtF19Vh1XrtHnTiuqve` (кроп 4:4.7, центр x=330).
  Анна2.jpg `1YjLTJggDadb_Gs3mO9xnLDEHjWI_z0v3` (селфи в машине) НЕ использована —
  выбивается из премиум-стиля. Оригиналы всего 640×640 — если появятся
  версии больше, заменить (кроп через PIL, quality=92).
  `hero.svg|about.svg` — fallback-плейсхолдеры (`onerror` в img), не удалять.
- `scripts/generate-og.py` — генерит `assets/img/og-cover.png` (Pillow,
  системные DejaVu-шрифты).

## Контент-образцы (заменить на реальные по мере получения)
- about.html: таймлайн образования и карточки дипломов — ВЫДУМАННЫЙ образец
  (помечен HTML-комментарием). Анна пришлёт реальные дипломы.
- Отзывы на index.html, цифры trust-strip (500+ часов и т.п.), цены в
  config.js — образцы.

## Подарочные сертификаты
Схема как в dr-vlada-site: данные в самой ссылке
`gift.html#1.<base64url(JSON)>`, JSON `{n,a,t,e,m,k}`, номер `AM-ГГММ-XXXX`.
- Пин студии: **1234** (4 цифры; `atob('MTIzNA==')` в gift-studio.html,
  `PIN_HASH`=sha256 в gift-api.php — менять синхронно).
- Поводы (`THEMES` в gift.html == `TYPES` в студии, менять синхронно):
  universal («Забота о себе»), birthday, support («Поддержка», листья),
  newyear (тёмная тема, глубокая зелень), march8, love.
- История: gift-api.php → `gift-data/history.json` (папка создаётся сама,
  закрыта .htaccess). При деплое `gift-data` не перетирать. localStorage
  `am_gift_history` — кэш/fallback; sessionStorage `am_gift_auth` — пин.
- Обе страницы `noindex`, в sitemap их НЕ добавлять, ссылок с сайта на студию
  нет — Анна открывает `/gift-studio.html` напрямую.

## Брендинг отчётности (FutureFlow) — правило заказчика
Любой документ-деливерабл для заказчика (PDF-отчёты, инструкции, презентации
и т.п.) оформлять с лого его компании **FutureFlow** и пометкой
«Подготовлено FutureFlow · futureflow.ru». Лого в Drive, папка
`1H7vwU5hzOHmrxfwqz1PqRIE1HODliVMG` → актуальные в подпапке «Новое лого»
`1bzhwMnt0NT7E7UAYU2cGp_dZ49XgBzUf` (белый чип+надпись на синем #3B82C4~):
- с URL: png `1BoCeOv3OxMuTbMyNYivXnmxbFE45A34H` (2400×1043), svg
  `1GZappwZVwVbh-xkHhzlpnEsHtyTT_q5m`, pdf `1GE21i3m-xv6OoG_XwRpSL9cs6lcZCHfy`
- без URL: png `15OSPpPY2ly_E-7WAZEe69Nzhxwl4vqHa`, svg
  `17GmEhL_lf6ZMMaZN1j8-2V61r9MNxl4x`, pdf `1xwB3fGLwmUA9V_Lx8uQjolFI0wLzJay7`
- белый (для тёмного фона): png `1hYMX0iJHA-Fybi3bi1M_TVmHx0Jh3tGQ`
Качать через Google Drive MCP (download_file_content → base64 → decode).
Это про документы ОТ FutureFlow заказчику — не про сайт Анны.

## Грабли / неочевидное
- Песочница без внешнего интернета к произвольным хостам; Google Fonts
  грузятся на проде, локально в песочнице могут не резолвиться — это норм.
- Категории/секции не генерятся из JS (кроме типов в студии) — правки контента
  прямо в HTML.
- **Деплой: GitHub Pages** — Deploy from a branch, ветка `main`, папка `/` (root).
  Прод: https://adriaaante.github.io/ania-psychology-site/ — выкатка
  автоматически после push в `main`. Проверка: открыть URL.
  PHP на Pages не работает → gift-api.php мёртв, история сертификатов
  только в localStorage браузера (сами сертификаты работают — всё в ссылке).
  Для общей истории нужен PHP-хостинг. Custom domain не настроен.
- Локальный запуск: `python3 -m http.server 8080`.
