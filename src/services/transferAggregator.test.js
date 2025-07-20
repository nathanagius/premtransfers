const transferAggregator = require('./transferAggregator');

describe('TransferAggregator', () => {
  describe('isTransferRelated', () => {
    it('should return true for transfer-related text with a Premier League team', () => {
      expect(transferAggregator.isTransferRelated('Arsenal complete transfer for new striker')).toBe(true);
      expect(transferAggregator.isTransferRelated('Chelsea signs new player')).toBe(true);
    });
    it('should return false for unrelated text', () => {
      expect(transferAggregator.isTransferRelated('Random news about weather')).toBe(false);
    });
    it('should return true for transfer-related text mentioning "Premier League"', () => {
      expect(transferAggregator.isTransferRelated('Transfer confirmed for Premier League club')).toBe(true);
    });
  });

  describe('getMockTwitterData', () => {
    it('should return an array of mock Twitter transfer objects', () => {
      const data = transferAggregator.getMockTwitterData();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(data[0]).toHaveProperty('title');
      expect(data[0]).toHaveProperty('description');
    });
  });
}); 