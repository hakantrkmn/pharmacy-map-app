# Deployment Guide - Pharmacy Map App

Bu rehber, Redis cache'li eczane harita uygulamasını Vercel'de nasıl deploy edeceğinizi açıklar.

## 🚀 Vercel Deployment

### 1. Proje Hazırlığı

Proje zaten Vercel için hazırlanmış durumda:
- ✅ `vercel.json` konfigürasyonu
- ✅ Backend API endpoints
- ✅ Redis cache entegrasyonu
- ✅ Frontend build konfigürasyonu

### 2. Vercel'de Proje Oluşturma

1. **Vercel Dashboard'a gidin**: https://vercel.com/dashboard
2. **"New Project"** butonuna tıklayın
3. **GitHub repository'nizi seçin**: `pharmacy-map-app`
4. **Import** butonuna tıklayın

### 3. Environment Variables Ayarlama

Vercel dashboard'da proje ayarlarına gidin ve şu environment variable'ları ekleyin:

```
REDIS_URL=redis://default:password@host:port
```

**Önemli**: Redis URL'inizi Vercel'de environment variable olarak eklemelisiniz.

### 4. Build Settings

Vercel otomatik olarak şu ayarları algılayacak:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Backend API Deployment

Backend API'niz Vercel'de otomatik olarak deploy edilecek:
- **API Routes**: `/api/*` endpoint'leri
- **Serverless Functions**: Her API endpoint bir serverless function olarak çalışır

### 6. Redis Cloud Setup

Vercel'de Redis kullanmak için harici bir Redis servisi gereklidir:

#### Option 1: Redis Cloud (Önerilen)
1. https://redis.com/cloud/ adresine gidin
2. Ücretsiz hesap oluşturun
3. Yeni database oluşturun
4. Connection string'i alın
5. Vercel environment variables'a ekleyin

#### Option 2: Upstash Redis
1. https://upstash.com/ adresine gidin
2. Ücretsiz Redis database oluşturun
3. Connection string'i alın
4. Vercel environment variables'a ekleyin

### 7. Deployment Adımları

1. **GitHub'a push edin**:
   ```bash
   git add .
   git commit -m "Add Redis caching and Vercel config"
   git push origin main
   ```

2. **Vercel otomatik deploy edecek**

3. **Deploy URL'ini kontrol edin**

### 8. Test Etme

Deploy sonrası test edin:
- ✅ Frontend: `https://your-app.vercel.app`
- ✅ API Health: `https://your-app.vercel.app/api/health`
- ✅ Pharmacy Data: `https://your-app.vercel.app/api/pharmacies`

## 🔧 Local Development

### Hızlı Başlatma
```bash
npm run dev
```

Bu komut hem frontend hem backend'i başlatır:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Manuel Başlatma
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 📊 API Endpoints

### Production (Vercel)
- `GET /api/pharmacies?date=YYYY-MM-DD` - Eczane verileri
- `GET /api/health` - Health check
- `GET /api/cache/stats` - Cache istatistikleri
- `DELETE /api/cache/:date` - Cache temizleme

### Local Development
- `GET http://localhost:3001/api/pharmacies?date=YYYY-MM-DD`
- `GET http://localhost:3001/api/health`
- `GET http://localhost:3001/api/cache/stats`
- `DELETE http://localhost:3001/api/cache/:date`

## 🐛 Troubleshooting

### Redis Connection Issues
- Environment variable'ları kontrol edin
- Redis URL formatını doğrulayın
- Redis servisinin aktif olduğunu kontrol edin

### API Errors
- Vercel function logs'ları kontrol edin
- Network tab'ında request'leri inceleyin
- Backend console log'larını kontrol edin

### Build Errors
- `npm install` komutunu çalıştırın
- Node.js version'ını kontrol edin (v16+)
- Dependencies'leri güncelleyin

## 📈 Performance

### Cache Strategy
- **TTL**: 24 saat
- **Key Format**: `pharmacies:YYYY-MM-DD`
- **Fallback**: Redis yoksa doğrudan web sitesinden çeker

### Optimization Tips
- Redis connection pooling kullanın
- API response'larını compress edin
- CDN kullanın (Vercel otomatik sağlar)

## 🔒 Security

### Environment Variables
- Redis URL'ini public repository'de paylaşmayın
- Vercel'de environment variables kullanın
- Production ve development için farklı Redis instance'ları kullanın

### API Security
- Rate limiting ekleyin
- CORS ayarlarını kontrol edin
- Input validation yapın

## 📝 Monitoring

### Vercel Analytics
- Vercel dashboard'da analytics'i aktifleştirin
- Performance metrics'leri takip edin
- Error rates'leri monitör edin

### Redis Monitoring
- Redis Cloud dashboard'u kullanın
- Memory usage'ı takip edin
- Connection count'u monitör edin

## 🚀 Next Steps

1. **Domain Setup**: Custom domain ekleyin
2. **SSL Certificate**: Otomatik olarak sağlanır
3. **CDN**: Vercel Edge Network kullanın
4. **Monitoring**: Uptime monitoring ekleyin
5. **Backup**: Redis data backup stratejisi oluşturun
