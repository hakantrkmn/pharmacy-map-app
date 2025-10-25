import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import redisCache from './redis.js';
import { getPharmacies } from './pharmacyFetcher.js';
import { serveSitemap } from './sitemapGenerator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Redis on startup
redisCache.connect().catch(console.error);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    redis: redisCache.isConnected
  });
});

// Sitemap endpoint
app.get('/sitemap.xml', (req, res) => {
  serveSitemap(req, res);
});

// Get pharmacy data endpoint
app.get('/api/pharmacies', async (req, res) => {
  try {
    const { date } = req.query;
    
    // Use provided date or default to today
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(targetDate)) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD format.' 
      });
    }
    
    console.log(`API request for pharmacy data on date: ${targetDate}`);
    
    const pharmacies = await getPharmacies(targetDate);
    
    res.json({
      date: targetDate,
      count: pharmacies.length,
      data: pharmacies,
      cached: await redisCache.getPharmacies(targetDate) !== null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in /api/pharmacies:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pharmacy data',
      message: error.message 
    });
  }
});

// Clear cache endpoint (for admin use)
app.delete('/api/cache/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD format.' 
      });
    }
    
    await redisCache.clearCache(date);
    
    res.json({ 
      message: `Cache cleared for date: ${date}`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ 
      error: 'Failed to clear cache',
      message: error.message 
    });
  }
});

// Cache statistics endpoint
app.get('/api/cache/stats', async (req, res) => {
  try {
    const stats = await redisCache.getStats();
    res.json({
      ...stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      error: 'Failed to get cache statistics',
      message: error.message
    });
  }
});

// Cron job endpoint - Preload pharmacy data for next 3 days
app.get('/api/cron/preload-pharmacies', async (req, res) => {
  try {
    console.log('Starting cron job: Preloading pharmacy data for next 3 days');

    const results = [];
    const today = new Date();

    // Preload data for today and next 2 days (3 days total)
    for (let i = 0; i < 3; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);

      // Format date as YYYY-MM-DD
      const dateString = targetDate.toISOString().split('T')[0];

      try {
        console.log(`Preloading pharmacy data for date: ${dateString}`);

        // Check if data already exists in cache
        const existingData = await redisCache.getPharmacies(dateString);

        if (existingData) {
          console.log(`Data already cached for ${dateString}, skipping...`);
          results.push({
            date: dateString,
            status: 'already_cached',
            count: existingData.length
          });
          continue;
        }

        // Fetch fresh data from website
        const pharmacies = await getPharmacies(dateString);

        results.push({
          date: dateString,
          status: 'fetched',
          count: pharmacies.length
        });

        console.log(`Successfully preloaded ${pharmacies.length} pharmacies for ${dateString}`);

      } catch (error) {
        console.error(`Error preloading data for ${dateString}:`, error);
        results.push({
          date: dateString,
          status: 'error',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'fetched').length;
    const alreadyCachedCount = results.filter(r => r.status === 'already_cached').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`Cron job completed: ${successCount} fetched, ${alreadyCachedCount} already cached, ${errorCount} errors`);

    res.json({
      message: 'Cron job completed',
      timestamp: new Date().toISOString(),
      results: results,
      summary: {
        total: results.length,
        fetched: successCount,
        already_cached: alreadyCachedCount,
        errors: errorCount
      }
    });

  } catch (error) {
    console.error('Error in cron job:', error);
    res.status(500).json({
      error: 'Cron job failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path 
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  await redisCache.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await redisCache.disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoint: http://localhost:${PORT}/api/pharmacies`);
});
