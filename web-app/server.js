const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const { pool, testConnection, initDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 8003;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https://bank.gov.ua", "https://api.coingecko.com"],
    },
  },
}));

app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/storage', express.static(path.join(__dirname, 'storage')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsRoot = path.join(__dirname, 'uploads');
['video', 'audio', 'image', 'thumbnails'].forEach((dir) => {
  const full = path.join(uploadsRoot, dir);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
  }
});

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || 'image';
    const dir = ['video', 'audio', 'image'].includes(type) ? type : 'image';
    cb(null, path.join(uploadsRoot, dir));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${timestamp}_${safeName}`);
  }
});
const upload = multer({ storage });

// Basic admin auth middleware (use env or defaults)
function adminAuth(req, res, next) {
  const user = process.env.ADMIN_USERNAME || 'admin';
  const pass = process.env.ADMIN_PASSWORD || 'zenua_admin_2025';

  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="ZenUA Admin"');
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const base64 = header.replace('Basic ', '');
  const decoded = Buffer.from(base64, 'base64').toString('utf8');
  const [u, p] = decoded.split(':');
  if (u === user && p === pass) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized' });
}

// In-memory storage for currency rates
let currencyRates = {
  USD: { rate: 0, lastUpdate: null },
  EUR: { rate: 0, lastUpdate: null },
  BTC: { rate: 0, lastUpdate: null }
};

// Sample media data
const mediaData = [
  {
    id: '0',
    type: 'video',
    url: '/storage/video/ocean.mp4',
    title: 'Океан (за замовчуванням)',
    thumbnail: 'https://via.placeholder.com/400x300/4ecdc4/ffffff?text=Ocean+Default',
    duration: 30
  },
  {
    id: '1',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'Релакс відео 1',
    thumbnail: 'https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Relax+Video+1',
    duration: 596
  },
  {
    id: '2',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    title: 'Релакс відео 2',
    thumbnail: 'https://via.placeholder.com/400x300/4ecdc4/ffffff?text=Relax+Video+2',
    duration: 653
  },
  {
    id: '3',
    type: 'audio',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    title: 'Медитативна музика 1',
    thumbnail: 'https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Meditation+Music+1',
    duration: 180
  },
  {
    id: '4',
    type: 'image',
    url: 'https://picsum.photos/800/600?random=1',
    title: 'Природа 1',
    thumbnail: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: '5',
    type: 'image',
    url: 'https://picsum.photos/800/600?random=2',
    title: 'Природа 2',
    thumbnail: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: '6',
    type: 'image',
    url: 'https://picsum.photos/800/600?random=3',
    title: 'Абстракція 1',
    thumbnail: 'https://picsum.photos/400/300?random=3'
  }
];

// Fetch currency rates from NBU API
async function fetchCurrencyRates() {
  try {
    // Fetch NBU rates
    const nbuResponse = await axios.get('https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json');
    const nbuData = nbuResponse.data;
    
    const usdRate = nbuData.find(item => item.cc === 'USD');
    const eurRate = nbuData.find(item => item.cc === 'EUR');
    
    if (usdRate) {
      currencyRates.USD = {
        rate: parseFloat(usdRate.rate),
        lastUpdate: new Date().toISOString()
      };
    }
    
    if (eurRate) {
      currencyRates.EUR = {
        rate: parseFloat(eurRate.rate),
        lastUpdate: new Date().toISOString()
      };
    }
    
    // Fetch Bitcoin rate from CoinGecko API
    try {
      const btcResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=uah');
      if (btcResponse.data.bitcoin && btcResponse.data.bitcoin.uah) {
        currencyRates.BTC = {
          rate: parseFloat(btcResponse.data.bitcoin.uah),
          lastUpdate: new Date().toISOString()
        };
      }
    } catch (btcError) {
      console.error('Error fetching Bitcoin rate:', btcError.message);
    }
    
    console.log('Currency rates updated:', currencyRates);
  } catch (error) {
    console.error('Error fetching currency rates:', error.message);
  }
}

// Schedule currency updates every 15 minutes
cron.schedule('*/15 * * * *', fetchCurrencyRates);

// Initial currency fetch
fetchCurrencyRates();

// API Routes
app.get('/api/currency', (req, res) => {
  res.json({
    success: true,
    data: currencyRates,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/media', async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM media ORDER BY created_at DESC';
    let params = [];
    
    if (type) {
      query = 'SELECT * FROM media WHERE type = ? ORDER BY created_at DESC';
      params = [type];
    }
    
    const [rows] = await pool.execute(query, params);
    
    // If database is empty, return sample data
    const data = rows.length > 0 ? rows : mediaData;
    
    res.json({
      success: true,
      data: data,
      total: data.length
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    // Fallback to sample data
    res.json({
      success: true,
      data: mediaData,
      total: mediaData.length
    });
  }
});

app.get('/api/media/:id', (req, res) => {
  const { id } = req.params;
  const media = mediaData.find(item => item.id === id);
  
  if (!media) {
    return res.status(404).json({
      success: false,
      message: 'Media not found'
    });
  }
  
  res.json({
    success: true,
    data: media
  });
});

// Admin: upload media
app.post('/api/admin/media', adminAuth, upload.single('file'), async (req, res) => {
  try {
    const { type = 'image', title = null } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }
    const filename = req.file.filename;
    const relPath = `/uploads/${['video', 'audio', 'image'].includes(type) ? type : 'image'}/${filename}`;
    const fileSize = req.file.size || null;
    const mimeType = req.file.mimetype || null;

    // Insert into DB
    const [result] = await pool.execute(
      'INSERT INTO media (type, url, filename, title, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?)',
      [type, relPath, filename, title, fileSize, mimeType]
    );

    return res.json({ success: true, id: result.insertId, url: relPath });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// Admin: update media metadata
app.put('/api/admin/media/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const [result] = await pool.execute('UPDATE media SET title = ? WHERE id = ?', [title, id]);
    return res.json({ success: true, affected: result.affectedRows });
  } catch (err) {
    console.error('Update media error:', err);
    return res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// Admin: delete media
app.delete('/api/admin/media/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    // Get current record to remove file
    const [rows] = await pool.execute('SELECT * FROM media WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    const record = rows[0];
    if (record.url) {
      const filePath = path.join(__dirname, record.url.replace('/uploads', 'uploads'));
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('File delete warning:', e.message);
      }
    }
    const [result] = await pool.execute('DELETE FROM media WHERE id = ?', [id]);
    return res.json({ success: true, affected: result.affectedRows });
  } catch (err) {
    console.error('Delete media error:', err);
    return res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  
  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
  
  // In a real app, you would send an email here
  console.log('Contact form submission:', { name, email, message });
  
  res.json({
    success: true,
    message: 'Thank you for your message! We will get back to you soon.'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ZenUA API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 ZenUA server running on port ${PORT}`);
  console.log(`📊 Currency rates will be updated every 15 minutes`);
  console.log(`🌐 Open http://localhost:${PORT} to view the app`);
  
  // Test and initialize database
  const dbConnected = await testConnection();
  if (dbConnected) {
    await initDatabase();
  }
});

module.exports = app;
