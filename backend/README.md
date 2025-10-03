# Pharmacy Cache Backend

Bu backend API, eczane verilerini Redis cache ile yönetir. İlk önce Redis'te tarih bazlı olarak veri arar, yoksa web sitesinden indirir ve Redis'e kaydeder.

## Özellikler

- **Redis Caching**: Eczane verileri tarih bazlı olarak Redis'te cache'lenir
- **Otomatik TTL**: Cache verileri 24 saat sonra otomatik olarak silinir
- **Web Scraping**: İzmir Eczacı Odası web sitesinden veri çeker
- **RESTful API**: JSON formatında veri sağlar

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. `.env` dosyasında Redis URL'ini ayarlayın:
```
REDIS_URL="redis://default:password@host:port"
```

## Çalıştırma

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server varsayılan olarak `http://localhost:3001` adresinde çalışır.

## API Endpoints

### GET /api/pharmacies
Eczane verilerini getirir.

**Query Parameters:**
- `date` (optional): Tarih (YYYY-MM-DD formatında). Varsayılan: bugünün tarihi

**Response:**
```json
{
  "date": "2024-01-15",
  "count": 25,
  "cached": true,
  "data": [
    {
      "name": "ECZANE ADI",
      "location": "BÖLGE",
      "address": "Adres",
      "phone": "02321234567",
      "notes": "Notlar",
      "coordinates": {
        "latitude": 38.4237,
        "longitude": 27.1428
      },
      "mapLink": "https://maps.google.com/...",
      "extractedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /health
Server sağlık durumunu kontrol eder.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "redis": true
}
```

### DELETE /api/cache/:date
Belirli bir tarih için cache'i temizler.

**Path Parameters:**
- `date`: Tarih (YYYY-MM-DD formatında)

**Response:**
```json
{
  "message": "Cache cleared for date: 2024-01-15",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/cache/stats
Cache istatistiklerini getirir.

**Response:**
```json
{
  "connected": true,
  "memoryInfo": "...",
  "cachedDates": 5,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Cache Stratejisi

- **Cache Key Format**: `pharmacies:YYYY-MM-DD`
- **TTL**: 24 saat (86400 saniye)
- **Fallback**: Redis bağlantısı yoksa doğrudan web sitesinden veri çeker
- **Error Handling**: Redis hatalarında uygulama çalışmaya devam eder

## Geliştirme

### Yeni Özellik Ekleme
1. `src/` klasöründe yeni dosyalar oluşturun
2. `server.js`'e yeni endpoint'leri ekleyin
3. Redis cache işlemleri için `redis.js`'i kullanın

### Test Etme
```bash
# Health check
curl http://localhost:3001/health

# Eczane verilerini getir
curl http://localhost:3001/api/pharmacies

# Belirli tarih için veri getir
curl http://localhost:3001/api/pharmacies?date=2024-01-15

# Cache istatistikleri
curl http://localhost:3001/api/cache/stats
```

## Sorun Giderme

### Redis Bağlantı Sorunu
- `.env` dosyasındaki `REDIS_URL`'i kontrol edin
- Redis server'ın çalıştığından emin olun
- Network bağlantısını kontrol edin

### Web Scraping Sorunu
- İzmir Eczacı Odası web sitesinin erişilebilir olduğunu kontrol edin
- User-Agent ve header'ları güncelleyin
- Rate limiting olup olmadığını kontrol edin
