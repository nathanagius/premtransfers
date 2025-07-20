const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const Parser = require('rss-parser');
const { TwitterApi } = require('twitter-api-v2');

const parser = new Parser({
  customFields: {
    item: ['pubDate', 'description']
  }
});

// Initialize Twitter client if credentials are available
let twitterClient = null;
if (process.env.TWITTER_BEARER_TOKEN) {
  twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
}

class TransferAggregator {
  
  // BBC Sport transfers
  async getBBCTransfers() {
    try {
      console.log('Fetching BBC transfers...');
      
      // Try BBC Sport RSS feed first
      const rssUrl = 'https://feeds.bbci.co.uk/sport/football/rss.xml';
      const feed = await parser.parseURL(rssUrl);
      
      const transfers = [];
      
      for (const item of feed.items.slice(0, 20)) {
        if (this.isTransferRelated(item.title) || this.isTransferRelated(item.contentSnippet || item.description)) {
          transfers.push({
            id: this.generateId(item.title, 'bbc'),
            title: item.title,
            description: this.cleanDescription(item.contentSnippet || item.description || ''),
            url: item.link,
            source: 'BBC Sport',
            publishedAt: moment(item.pubDate).toISOString(),
            timestamp: moment(item.pubDate).unix()
          });
        }
      }
      
      return transfers.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching BBC transfers:', error.message);
      return [];
    }
  }

  // Sky Sports transfers
  async getSkyTransfers() {
    try {
      console.log('Fetching Sky Sports transfers...');
      
      // Try Sky Sports RSS feed
      const rssUrl = 'https://www.skysports.com/rss/football';
      const feed = await parser.parseURL(rssUrl);
      
      const transfers = [];
      
      for (const item of feed.items.slice(0, 20)) {
        if (this.isTransferRelated(item.title) || this.isTransferRelated(item.contentSnippet || item.description)) {
          transfers.push({
            id: this.generateId(item.title, 'sky'),
            title: item.title,
            description: this.cleanDescription(item.contentSnippet || item.description || ''),
            url: item.link,
            source: 'Sky Sports',
            publishedAt: moment(item.pubDate).toISOString(),
            timestamp: moment(item.pubDate).unix()
          });
        }
      }
      
      return transfers.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error fetching Sky Sports transfers:', error.message);
      return [];
    }
  }

  // Twitter/X transfers
  async getTwitterTransfers() {
    try {
      if (!twitterClient) {
        console.log('Twitter API not configured, returning mock data');
        return this.getMockTwitterData();
      }

      console.log('Fetching Twitter transfers...');
      
      const transferKeywords = [
        'premier league transfer',
        'premier league signing',
        'transfer confirmed',
        'joins premier league',
        'signs for'
      ];
      
      const transfers = [];
      
      for (const keyword of transferKeywords.slice(0, 2)) { // Limit API calls
        try {
          const tweets = await twitterClient.v2.search(keyword, {
            'tweet.fields': 'created_at,public_metrics,author_id',
            'user.fields': 'name,username,verified',
            'expansions': 'author_id',
            'max_results': 10
          });
          
          if (tweets.data) {
            for (const tweet of tweets.data) {
              if (this.isTransferRelated(tweet.text)) {
                const author = tweets.includes?.users?.find(user => user.id === tweet.author_id);
                
                transfers.push({
                  id: this.generateId(tweet.text, 'twitter'),
                  title: this.extractTransferTitle(tweet.text),
                  description: tweet.text,
                  url: `https://twitter.com/${author?.username}/status/${tweet.id}`,
                  source: `@${author?.username || 'Twitter'}`,
                  publishedAt: tweet.created_at,
                  timestamp: moment(tweet.created_at).unix(),
                  metrics: tweet.public_metrics
                });
              }
            }
          }
        } catch (twitterError) {
          console.error(`Twitter search error for "${keyword}":`, twitterError.message);
        }
      }
      
      return transfers.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
    } catch (error) {
      console.error('Error fetching Twitter transfers:', error.message);
      return this.getMockTwitterData();
    }
  }

  // Helper methods
  isTransferRelated(text) {
    if (!text) return false;
    
    const transferKeywords = [
      'transfer', 'signing', 'signs', 'joins', 'deal', 'agreement',
      'confirmed', 'announce', 'complete', 'agreed', 'move',
      'contract', 'fee', 'loan', 'permanent'
    ];
    
    const premierLeagueTeams = [
      'arsenal', 'aston villa', 'bournemouth', 'brentford', 'brighton',
      'burnley', 'chelsea', 'crystal palace', 'everton', 'fulham',
      'liverpool', 'luton', 'manchester city', 'manchester united',
      'newcastle', 'nottingham forest', 'sheffield united', 'tottenham',
      'west ham', 'wolves'
    ];
    
    const lowerText = text.toLowerCase();
    
    const hasTransferKeyword = transferKeywords.some(keyword => 
      lowerText.includes(keyword)
    );
    
    const hasPremierLeagueTeam = premierLeagueTeams.some(team => 
      lowerText.includes(team)
    );
    
    return hasTransferKeyword && (hasPremierLeagueTeam || lowerText.includes('premier league'));
  }

  extractTransferTitle(text) {
    const lines = text.split('\n');
    const firstLine = lines[0];
    
    if (firstLine.length > 100) {
      return firstLine.substring(0, 97) + '...';
    }
    
    return firstLine;
  }

  cleanDescription(description) {
    return description
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .substring(0, 300) + (description.length > 300 ? '...' : '');
  }

  generateId(text, source) {
    const hash = text.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    return `${source}_${hash}_${Date.now()}`;
  }

  getMockTwitterData() {
    return [
      {
        id: 'twitter_mock_1',
        title: 'Manchester United completes signing of new midfielder',
        description: 'BREAKING: Manchester United have confirmed the signing of a new midfielder for £50m. The player will join on a 4-year deal. #MUFC #Transfer',
        url: 'https://twitter.com/example/status/123',
        source: '@SkySportsNews',
        publishedAt: moment().subtract(2, 'hours').toISOString(),
        timestamp: moment().subtract(2, 'hours').unix(),
        metrics: { retweet_count: 150, like_count: 300 }
      },
      {
        id: 'twitter_mock_2',
        title: 'Arsenal close to completing striker deal',
        description: 'Arsenal are reportedly close to completing a deal for a new striker. Medical scheduled for tomorrow. #AFC #Transfers',
        url: 'https://twitter.com/example/status/124',
        source: '@FabrizioRomano',
        publishedAt: moment().subtract(4, 'hours').toISOString(),
        timestamp: moment().subtract(4, 'hours').unix(),
        metrics: { retweet_count: 200, like_count: 500 }
      }
    ];
  }
}

module.exports = new TransferAggregator();