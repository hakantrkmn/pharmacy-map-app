# Nöbetçi Eczane Harita Uygulaması

Bu React uygulaması, İzmir Eczacı Odası'nın günlük nöbetçi eczane verilerini Redis cache ile yöneterek harita üzerinde gösterir.

## 🚀 Özellikler

- **Redis Caching**: Eczane verileri tarih bazlı olarak Redis'te cache'lenir
- **Hızlı Veri Erişimi**: İlk istekte web sitesinden çeker, sonraki isteklerde cache'den döner
- **Otomatik Veri Ön Yükleme**: Her gün sabah 8'de önümüzdeki 3 günün verileri otomatik olarak yüklenir (Vercel Cron Jobs)
- **Harita Görünümü**: Leaflet haritası üzerinde eczaneleri gösterir
- **Konum Tabanlı Sıralama**: Kullanıcının konumuna göre eczaneleri sıralar
- **Detaylı Bilgiler**: Eczane adı, adres, telefon, harita koordinatları
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **Backend API**: Express.js ile RESTful API

## 🔧 Teknik Detaylar

### Veri Çekme ve Caching
- **Kaynak**: İzmir Eczacı Odası web sitesi
- **Yöntem**: POST isteği ile form submit
- **Tarih**: Otomatik olarak bugünün tarihi
- **Parsing**: JSDOM ile HTML'den veri çıkarma
- **Cache**: Redis ile tarih bazlı caching (24 saat TTL)
- **Backend**: Express.js API server

### Cache Stratejisi
- **Cache Key**: `pharmacies:YYYY-MM-DD` formatında
- **TTL**: 24 saat (86400 saniye)
- **Fallback**: Redis bağlantısı yoksa doğrudan web sitesinden veri çeker
- **Error Handling**: Redis hatalarında uygulama çalışmaya devam eder

### Otomatik Veri Ön Yükleme (Cron Jobs)
- **Zamanlama**: Her gün 08:00'da çalışır
- **Kapsam**: Bugün + önümüzdeki 2 gün (toplam 3 gün)
- **Strateji**: Mevcut verileri kontrol eder, eksik olanları yükler
- **Platform**: Vercel Cron Jobs ile serverless execution
- **Loglama**: Detaylı çalışma raporları

### Veri Yapısı
```typescript
interface Pharmacy {
  name: string;
  location: string;
  address: string;
  phone: string;
  notes: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  mapLink: string;
  extractedAt: string;
}
```

## 🛠️ Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v16 veya üzeri)
- Redis server (local veya cloud)

### Kurulum

1. **Frontend bağımlılıklarını yükle:**
```bash
npm install
```

2. **Backend bağımlılıklarını yükle:**
```bash
cd backend
npm install
cd ..
```

3. **Redis URL'ini ayarla:**
`backend/.env` dosyasında Redis URL'ini ayarlayın:
```
REDIS_URL="redis://default:password@host:port"
```

### Çalıştırma

#### Hızlı Başlatma (Her iki server'ı birlikte)
```bash
./start-dev.sh
```

#### Manuel Başlatma

**Backend server'ı başlat:**
```bash
cd backend
npm start
```

**Frontend server'ı başlat (yeni terminal):**
```bash
npm run dev
```

### Production Build
```bash
# Frontend build
npm run build

# Backend production
cd backend
npm start
```

## 📱 Kullanım

1. Uygulama açıldığında otomatik olarak bugünün nöbetçi eczane verilerini çeker
2. Konum izni verilirse, eczaneler mesafeye göre sıralanır
3. Harita üzerinde eczaneleri görebilir ve detaylarını inceleyebilirsiniz
4. Liste görünümünde de eczaneleri görebilirsiniz

## 🔄 Veri Güncelleme

- Veriler her sayfa yüklendiğinde otomatik olarak güncellenir
- Bugünün tarihi otomatik olarak kullanılır
- Tüm İzmir ilçelerinden veri çekilir

## 🌐 API Endpoints

### Backend API (Express.js)

#### GET /api/pharmacies
Eczane verilerini getirir (Redis cache ile).

**Query Parameters:**
- `date` (optional): Tarih (YYYY-MM-DD formatında). Varsayılan: bugünün tarihi

**Response:**
```json
{
  "date": "2024-01-15",
  "count": 25,
  "cached": true,
  "data": [...],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### GET /health
Server sağlık durumunu kontrol eder.

#### DELETE /api/cache/:date
Belirli bir tarih için cache'i temizler.

#### GET /api/cache/stats
Cache istatistiklerini getirir.

#### GET /api/cron/preload-pharmacies
**Otomatik Çalışan Cron Job**: Önümüzdeki 3 günün eczane verilerini önceden yükler.

**Zamanlama**: Her gün 08:00'da Vercel Cron Jobs ile otomatik çalışır.

**Response:**
```json
{
  "message": "Cron job completed",
  "timestamp": "2024-01-15T08:00:00.000Z",
  "results": [
    {
      "date": "2024-01-15",
      "status": "fetched",
      "count": 73
    }
  ],
  "summary": {
    "total": 3,
    "fetched": 2,
    "already_cached": 1,
    "errors": 0
  }
}
```

### Kaynak Web Sitesi
- **URL**: `https://www.izmireczaciodasi.org.tr/nobetci-eczaneler`
- **Method**: POST
- **Parameters**:
  - `tarih1`: Tarih (YYYY-MM-DD format)
  - `ilce`: İlçe kodu (boş = tüm ilçeler)
  - `gnr`: Submit button ("Kayıt Ara")

## 📊 Veri İşleme

### HTML Parsing (Backend)
- JSDOM ile HTML içeriği parse edilir
- Regex pattern'leri ile veri çıkarılır
- Duplicate kontrolü yapılır

### Veri Temizleme
- Whitespace karakterleri temizlenir
- Telefon numaraları standart formata çevrilir
- Türkçe karakter desteği

### Cache Yönetimi
- Redis ile tarih bazlı cache
- 24 saat TTL ile otomatik temizlik
- Cache miss durumunda web sitesinden veri çekme
- Error handling ile graceful fallback

## 🎯 Avantajlar

- ✅ **Güncel Veri**: Her zaman en güncel nöbetçi eczane listesi
- ✅ **Hızlı**: Redis cache ile çok hızlı veri erişimi
- ✅ **Güvenilir**: Resmi kaynaktan veri + cache fallback
- ✅ **Kullanıcı Dostu**: Modern ve responsive arayüz
- ✅ **Konum Tabanlı**: Mesafeye göre sıralama
- ✅ **Ölçeklenebilir**: Redis ile yüksek performans
- ✅ **Güvenli**: Backend API ile güvenli veri erişimi

## 🔧 Geliştirme

### Yeni Özellikler
- Farklı tarihler için veri çekme
- İlçe bazlı filtreleme
- Favori eczaneler
- Bildirim sistemi

### Teknik İyileştirmeler
- ✅ Caching mekanizması (Redis ile implement edildi)
- Error handling iyileştirmeleri
- Performance optimizasyonları
- Rate limiting
- API authentication
- Monitoring ve logging