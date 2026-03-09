# Інструкції для Cursor AI

## 🎯 Мета проекту

Створити український аналог сайту zenrus.ru - мінімалістичний медитативний фінансовий портал з курсами валют та мультимедійним контентом.

## 📋 Основні вимоги

### Технологічний стек
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **База даних**: PostgreSQL + Prisma ORM
- **Стилізація**: CSS Modules
- **Контейнеризація**: Docker + Docker Compose

### Ключові компоненти
1. **CurrencyWidget** - відображення курсів валют (USD/UAH, EUR/UAH)
2. **MediaPlayer** - плеєр для відео/фото/музики з випадковим відтворенням
3. **SettingsPanel** - налаштування інтерфейсу (приховування елементів)
4. **Header/Footer** - навігація та контакти
5. **Admin Panel** - управління контентом

## 🏗 Структура проекту

```
zenua/
├── frontend/                 # React додаток
│   ├── src/
│   │   ├── components/      # React компоненти
│   │   │   ├── CurrencyWidget/
│   │   │   ├── MediaPlayer/
│   │   │   ├── SettingsPanel/
│   │   │   ├── Header/
│   │   │   └── Footer/
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Утиліти
│   │   ├── types/           # TypeScript типи
│   │   ├── locales/         # Локалізація (ua.json, en.json)
│   │   └── styles/          # Глобальні стилі
│   ├── public/              # Статичні файли
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── controllers/     # Контролери
│   │   ├── services/        # Бізнес-логіка
│   │   ├── models/          # Моделі даних
│   │   ├── middleware/      # Middleware
│   │   ├── routes/          # API маршрути
│   │   └── utils/           # Утиліти
│   ├── uploads/             # Завантажені файли
│   ├── package.json
│   └── prisma/
├── admin/                   # Адмін-панель
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
├── cursor-templates/        # Готові шаблони компонентів
├── docker-compose.yml
├── package.json
└── README.md
```

## 🎨 Дизайн-система

### Кольорова палітра
```css
:root {
  --primary-color: #ff6b6b;      /* Червоний акцент */
  --secondary-color: #4ecdc4;    /* Бірюзовий */
  --background-color: #1a1a1a;   /* Темний фон */
  --surface-color: rgba(0, 0, 0, 0.8); /* Поверхня */
  --text-color: #ffffff;         /* Білий текст */
  --text-muted: rgba(255, 255, 255, 0.6); /* Приглушений текст */
}
```

### Типографіка
- **Основний шрифт**: Inter, -apple-system, BlinkMacSystemFont
- **Моноширинний**: JetBrains Mono (для цифр)
- **Розміри**: 12px, 14px, 16px, 18px, 20px, 24px

### Компоненти
- **Кнопки**: Закруглені, з hover ефектами
- **Картки**: З backdrop-filter blur та прозорістю
- **Форми**: Мінімалістичні, з фокусом на UX

## 🔧 Налаштування Cursor

### 1. Створення проекту

```bash
# Створити структуру папок
mkdir -p zenua/{frontend,backend,admin,cursor-templates,nginx,docs}
mkdir -p zenua/frontend/src/{components,hooks,utils,types,locales,styles}
mkdir -p zenua/backend/src/{controllers,services,models,middleware,routes,utils}
mkdir -p zenua/admin/src/{components,pages,utils}
mkdir -p zenua/backend/prisma
mkdir -p zenua/backend/uploads
```

### 2. Frontend налаштування

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install
npm install @types/node
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

### 3. Backend налаштування

```bash
cd backend
npm init -y
npm install express cors helmet morgan dotenv
npm install -D @types/express @types/cors @types/morgan @types/node
npm install typescript ts-node nodemon
npm install prisma @prisma/client
npm install bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### 4. База даних (Prisma)

```bash
cd backend
npx prisma init
```

**prisma/schema.prisma:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Media {
  id          String   @id @default(cuid())
  type        String   // video, audio, image
  url         String
  title       String?
  thumbnail   String?
  duration    Int?
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Admin {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}

model CurrencyLog {
  id        String   @id @default(cuid())
  currency  String
  rate      Float
  timestamp DateTime @default(now())
}
```

## 🚀 Генерація коду

### 1. Використання готових шаблонів

Скопіюйте файли з `cursor-templates/` в відповідні папки:

```bash
# CurrencyWidget
cp cursor-templates/CurrencyWidget.tsx frontend/src/components/CurrencyWidget/
cp cursor-templates/CurrencyWidget.css frontend/src/components/CurrencyWidget/

# MediaPlayer
cp cursor-templates/MediaPlayer.tsx frontend/src/components/MediaPlayer/
cp cursor-templates/MediaPlayer.css frontend/src/components/MediaPlayer/

# SettingsPanel
cp cursor-templates/SettingsPanel.tsx frontend/src/components/SettingsPanel/
cp cursor-templates/SettingsPanel.css frontend/src/components/SettingsPanel/
```

### 2. Основні файли для генерації

**frontend/src/App.tsx:**
```typescript
import React, { useState } from 'react';
import CurrencyWidget from './components/CurrencyWidget/CurrencyWidget';
import MediaPlayer from './components/MediaPlayer/MediaPlayer';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  const [settings, setSettings] = useState({
    hideCurrency: false,
    hideCaptions: false,
    hideSmallNumbers: false,
    hideClock: false,
    randomizeVideos: true,
    randomizePhotos: true,
    enableMusic: true,
    language: 'ua' as 'ua' | 'en',
    autoplay: false,
    showTimestamp: true,
    volume: 0.7
  });

  const [media, setMedia] = useState([]);

  return (
    <div className="app">
      <SettingsPanel 
        settings={settings} 
        onSettingsChange={setSettings} 
      />
      
      <Header />
      
      <main className="main">
        <section className="hero">
          <h1>dzenua</h1>
          <p>Медитативний фінансовий портал</p>
        </section>
        
        {!settings.hideCurrency && (
          <section className="currency-section">
            <CurrencyWidget
              currencies={['USD', 'EUR']}
              refreshInterval={900000}
              showTimestamp={settings.showTimestamp}
              apiEndpoint="https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange"
            />
          </section>
        )}
        
        <section className="media-section">
          <MediaPlayer
            media={media}
            autoplay={settings.autoplay}
            randomize={settings.randomizeVideos}
            showControls={true}
            onMediaChange={(media) => console.log('Media changed:', media)}
          />
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
```

### 3. API ендпоінти

**backend/src/routes/currency.ts:**
```typescript
import express from 'express';
import { getCurrencyRates } from '../services/currencyService';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const rates = await getCurrencyRates();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch currency rates' });
  }
});

export default router;
```

**backend/src/services/currencyService.ts:**
```typescript
import axios from 'axios';

export async function getCurrencyRates() {
  const response = await axios.get('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
  
  return response.data
    .filter((item: any) => ['USD', 'EUR'].includes(item.cc))
    .map((item: any) => ({
      currency: item.cc,
      rate: parseFloat(item.rate),
      lastUpdate: item.exchangedate
    }));
}
```

## 🎯 Критерії успіху

### Функціональність
- [ ] Курси валют оновлюються автоматично
- [ ] Медіа-плеєр відтворює контент
- [ ] Випадкове відтворення працює
- [ ] Налаштування зберігаються в localStorage
- [ ] Адаптивний дизайн на всіх пристроях

### Технічні вимоги
- [ ] TypeScript без помилок
- [ ] ESLint без попереджень
- [ ] Час завантаження < 3s
- [ ] HTTPS підтримка
- [ ] Docker контейнеризація

### UX/UI
- [ ] Інтуїтивний інтерфейс
- [ ] Плавні анімації
- [ ] Контрастність для доступності
- [ ] Швидкий відгук на дії

## 🔄 Процес розробки

1. **Створіть базову структуру** з package.json файлами
2. **Налаштуйте базу даних** з Prisma схемой
3. **Згенеруйте API** для курсів валют та медіа
4. **Створіть React компоненти** з готових шаблонів
5. **Інтегруйте компоненти** в головний додаток
6. **Додайте стилізацію** та анімації
7. **Налаштуйте Docker** для деплою
8. **Протестуйте функціональність**

## 📝 Нотатки

- Використовуйте готові шаблони з `cursor-templates/`
- Дотримуйтесь TypeScript типів
- Додавайте коментарі українською мовою
- Тестуйте на різних розмірах екранів
- Оптимізуйте для швидкості завантаження

## 🆘 Підтримка

Якщо виникли питання:
1. Перевірте документацію в `TECHNICAL_SPECIFICATION_UA.md`
2. Подивіться приклади в `cursor-templates/`
3. Зверніться до README.md для деталей

---

**Готово до генерації! 🚀**
