# Premier League Transfers Website

A modern web application that aggregates the latest Premier League player transfers from multiple sources including BBC Sports, Sky Sports, and Twitter/X. The website provides real-time updates and a clean, responsive interface for staying up-to-date with transfer news.

## Features

- **Real-time Transfer Updates**: Automatically refreshes data every 15 minutes
- **Multiple Sources**: Aggregates news from BBC Sports, Sky Sports, and Twitter/X
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Source Filtering**: View transfers by specific sources or all combined
- **Modern UI**: Clean, professional design with smooth animations
- **Auto-refresh**: Client-side auto-refresh every 5 minutes
- **Error Handling**: Graceful error handling with retry options

## Data Sources

- **BBC Sport**: RSS feed from BBC Sports football section
- **Sky Sports**: RSS feed from Sky Sports football section  
- **Twitter/X**: Real-time tweets about Premier League transfers (requires API credentials)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Optional: Twitter/X API credentials for enhanced social media integration

## Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional for Twitter integration):
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and add your Twitter API credentials if you want X/Twitter integration:
   ```
   TWITTER_BEARER_TOKEN=your_bearer_token_here
   TWITTER_API_KEY=your_api_key_here
   TWITTER_API_SECRET=your_api_secret_here
   TWITTER_ACCESS_TOKEN=your_access_token_here
   TWITTER_ACCESS_SECRET=your_access_secret_here
   ```

4. **Start the server**:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Open your browser** and visit `http://localhost:3000`

## API Endpoints

- `GET /` - Main website
- `GET /api/transfers` - Get all transfers from all sources
- `GET /api/transfers/bbc` - Get BBC Sport transfers only
- `GET /api/transfers/sky` - Get Sky Sports transfers only
- `GET /api/transfers/twitter` - Get Twitter/X transfers only

## Configuration

### Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)
- `BBC_UPDATE_INTERVAL` - BBC update interval in minutes (default: 15)
- `SKY_UPDATE_INTERVAL` - Sky Sports update interval in minutes (default: 15)
- `TWITTER_UPDATE_INTERVAL` - Twitter update interval in minutes (default: 10)

### Twitter/X Integration

To enable Twitter/X integration, you need to:

1. Create a Twitter Developer account at https://developer.twitter.com/
2. Create a new app and generate API credentials
3. Add the credentials to your `.env` file
4. Restart the server

**Note**: Without Twitter credentials, the app will use mock Twitter data for demonstration purposes.

## File Structure

```
premier-league-transfers/
├── package.json                 # Dependencies and scripts
├── server.js                   # Main server file
├── .env.example                # Environment variables template
├── README.md                   # This file
├── src/
│   └── services/
│       └── transferAggregator.js # Data aggregation service
└── public/
    ├── index.html              # Main HTML page
    ├── styles.css              # Custom CSS styles
    └── script.js               # Frontend JavaScript
```

## How It Works

1. **Data Aggregation**: The server fetches transfer news from RSS feeds and APIs
2. **Filtering**: Content is filtered to show only Premier League-related transfers
3. **Real-time Updates**: Data is refreshed automatically every 15 minutes
4. **API Serving**: Clean REST API serves the aggregated data
5. **Frontend Display**: Modern web interface displays the transfers with filtering options

## Browser Compatibility

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lightweight design with minimal dependencies
- Efficient RSS parsing and data caching
- Responsive images and optimized assets
- Lazy loading for better performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Troubleshooting

### Common Issues

1. **No data showing**:
   - Check your internet connection
   - Verify the RSS feeds are accessible
   - Check the console for error messages

2. **Twitter data not working**:
   - Ensure Twitter API credentials are correctly set
   - Check if your Twitter app has the necessary permissions
   - Verify the credentials in the `.env` file

3. **Server won't start**:
   - Make sure Node.js is installed
   - Run `npm install` to install dependencies
   - Check if port 3000 is available

### Support

For issues or questions, please check the console logs for error messages and ensure all dependencies are properly installed.

## Future Enhancements

- Push notifications for major transfers
- Player statistics integration
- Transfer value tracking
- Email alerts for specific teams
- Historical transfer data
- Advanced filtering options
- Mobile app version

---

**Disclaimer**: This application aggregates publicly available transfer news for informational purposes. All content belongs to their respective sources (BBC, Sky Sports, Twitter/X).