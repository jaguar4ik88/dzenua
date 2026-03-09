# ZenUA - Український медитативний фінансовий портал

Мінімалістичний односторінковий сайт, що поєднує відображення фінансових курсів з мультимедійним контентом для створення атмосфери релаксації та медитації.

## 🎯 Особливості

- **Курси валют** - поточні курси USD/UAH, EUR/UAH з API НБУ
- **Медіа-плеєр** - відео, фото, музика з випадковим відтворенням
- **Налаштування інтерфейсу** - приховування елементів за бажанням
- **Локалізація** - українська та англійська мови
- **Адаптивний дизайн** - працює на всіх пристроях
- **Адмін-панель** - управління контентом

## 🚀 Швидкий старт

### Передумови

- Node.js 18+
- npm 8+
- PostgreSQL 15+
- Redis (опціонально)

### Встановлення

1. **Клонуйте репозиторій**
   ```bash
   git clone https://github.com/your-username/zenua.git
   cd zenua
   ```

2. **Встановіть залежності**
   ```bash
   npm run install:all
   ```

3. **Налаштуйте змінні середовища**
   ```bash
   cp env.example .env
   # Відредагуйте .env файл з вашими налаштуваннями
   ```

4. **Запустіть базу даних**
   ```bash
   # За допомогою Docker
   docker-compose up db -d
   
   # Або встановіть PostgreSQL локально
   ```

5. **Запустіть проект**
   ```bash
   npm run dev
   ```

Проект буде доступний за адресами:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Admin Panel: http://localhost:3002

## 🐳 Docker

### Повний стек з Docker

```bash
# Збірка та запуск всіх сервісів
docker-compose up --build

# Запуск у фоновому режимі
docker-compose up -d

# Перегляд логів
docker-compose logs -f

# Зупинка
docker-compose down
```

### Тільки база даних

```bash
docker-compose up db redis -d
```

## 📁 Структура проекту

```
zenua/
├── frontend/          # React додаток
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── locales/
│   │   └── styles/
│   └── public/
├── backend/           # Node.js API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── routes/
│   └── uploads/
├── admin/             # Адмін-панель
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── public/
├── cursor-templates/  # Шаблони для Cursor
├── nginx/             # Nginx конфігурація
└── docs/              # Документація
```

## 🛠 Технології

### Frontend
- React 18 + TypeScript
- Vite (збірка)
- CSS Modules
- Context API (стейт)
- React Router

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma
- Redis (кешування)
- JWT автентифікація

### DevOps
- Docker + Docker Compose
- Nginx (проксі)
- GitHub Actions (CI/CD)

## 🔧 Налаштування

### Змінні середовища

Скопіюйте `env.example` в `.env` та налаштуйте:

```env
# База даних
DATABASE_URL=postgresql://postgres:password@localhost:5432/zenua

# API ключі
NBU_API_URL=https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange
SENDGRID_API_KEY=your_sendgrid_key
RECAPTCHA_SECRET_KEY=your_recaptcha_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=zenua-media
```

### База даних

```bash
# Міграції
cd backend
npx prisma migrate dev

# Seed дані
npx prisma db seed
```

## 📱 API Документація

### Публічні ендпоінти

- `GET /api/currency` - курси валют
- `GET /api/media` - список медіа
- `POST /api/contact` - контактна форма

### Адміністративні ендпоінти

- `POST /api/admin/login` - авторизація
- `GET /api/admin/media` - управління медіа
- `POST /api/admin/media` - завантаження медіа
- `PUT /api/admin/media/:id` - редагування
- `DELETE /api/admin/media/:id` - видалення

## 🎨 Кастомізація

### Кольорова схема

Змініть змінні CSS у `frontend/src/styles/variables.css`:

```css
:root {
  --primary-color: #ff6b6b;
  --secondary-color: #4ecdc4;
  --background-color: #1a1a1a;
  --text-color: #ffffff;
}
```

### Локалізація

Додайте переклади у `frontend/src/locales/`:

```json
{
  "common": {
    "play": "Грати",
    "pause": "Пауза"
  }
}
```

## 🚀 Деплой

### Vercel (рекомендовано)

1. Підключіть GitHub репозиторій
2. Налаштуйте змінні середовища
3. Деплой автоматично

### DigitalOcean App Platform

1. Підключіть репозиторій
2. Налаштуйте Docker Compose
3. Додайте змінні середовища

### VPS (Ubuntu)

```bash
# Встановлення
git clone https://github.com/your-username/zenua.git
cd zenua
docker-compose up -d

# Nginx конфігурація
sudo cp nginx/zenua.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/zenua.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🧪 Тестування

```bash
# Всі тести
npm test

# Frontend тести
cd frontend && npm test

# Backend тести
cd backend && npm test

# E2E тести
npm run test:e2e
```

## 📊 Моніторинг

### Логи

```bash
# Docker логи
docker-compose logs -f

# Backend логи
cd backend && npm run logs

# Nginx логи
sudo tail -f /var/log/nginx/access.log
```

### Метрики

- Google Analytics 4
- Prometheus + Grafana (опціонально)
- Uptime monitoring

## 🤝 Внесок

1. Fork репозиторій
2. Створіть feature branch (`git checkout -b feature/amazing-feature`)
3. Commit зміни (`git commit -m 'Add amazing feature'`)
4. Push до branch (`git push origin feature/amazing-feature`)
5. Відкрийте Pull Request

## 📄 Ліцензія

MIT License - дивіться [LICENSE](LICENSE) файл для деталей.

## 🆘 Підтримка

- 📧 Email: support@zenua.com
- 💬 Telegram: @zenua_support
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/zenua/issues)

## 🙏 Подяки

- [zenrus.ru](https://zenrus.ru/) - оригінальна ідея
- Національний банк України - API курсів валют
- Всі контрибутори проекту

---

**Зроблено з ❤️ для України**
