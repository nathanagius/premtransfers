const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

const transferAggregator = require('./src/services/transferAggregator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store for transfer data
let transfersData = {
  bbc: [],
  sky: [],
  twitter: [],
  lastUpdated: null
};

// API Routes
app.get('/api/transfers', (req, res) => {
  res.json(transfersData);
});

app.get('/api/transfers/:source', (req, res) => {
  const source = req.params.source.toLowerCase();
  if (transfersData[source]) {
    res.json({
      source,
      data: transfersData[source],
      lastUpdated: transfersData.lastUpdated
    });
  } else {
    res.status(404).json({ error: 'Source not found' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Update transfer data
async function updateTransfers() {
  try {
    console.log('Updating transfer data...');
    
    const [bbcData, skyData, twitterData] = await Promise.all([
      transferAggregator.getBBCTransfers(),
      transferAggregator.getSkyTransfers(),
      transferAggregator.getTwitterTransfers()
    ]);

    transfersData = {
      bbc: bbcData,
      sky: skyData,
      twitter: twitterData,
      lastUpdated: new Date().toISOString()
    };

    console.log(`Updated: ${bbcData.length} BBC, ${skyData.length} Sky, ${twitterData.length} Twitter transfers`);
  } catch (error) {
    console.error('Error updating transfers:', error);
  }
}

// Schedule updates
cron.schedule('*/15 * * * *', updateTransfers); // Every 15 minutes

// Initial data load
updateTransfers();

app.listen(PORT, () => {
  console.log(`Premier League Transfers server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the website`);
});