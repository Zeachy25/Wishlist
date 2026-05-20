import { CircularBuffer, calculateAnomaly, filterByTimeWindow } from '../src/algorithms/priceProcessor';

describe('PriceProcessor Engine', () => {
  test('CircularBuffer should maintain correct size', () => {
    const buffer = new CircularBuffer(2);
    buffer.add({ price: 100, timestamp: '2023-01-01T10:00:00Z' });
    buffer.add({ price: 110, timestamp: '2023-01-01T11:00:00Z' });
    buffer.add({ price: 120, timestamp: '2023-01-01T12:00:00Z' });
    expect(buffer.data.length).toBe(2);
    expect(buffer.data[0].price).toBe(110);
    expect(buffer.data[1].price).toBe(120);
  });

  test('calculateAnomaly should detect significant price drops', () => {
    const buffer = [
      { price: 100, timestamp: '2023-01-01T08:00:00Z' },
      { price: 102, timestamp: '2023-01-01T09:00:00Z' },
      { price: 98, timestamp: '2023-01-01T10:00:00Z' },
    ];
    // A drop to 50 is a significant anomaly (Z-score >> 1.5)
    const result = calculateAnomaly(buffer, 50);
    expect(result.isAnomaly).toBe(true);
    expect(result.zScore).toBeGreaterThan(1.5);
  });

  test('calculateAnomaly should not flag stable prices', () => {
    const buffer = [
      { price: 100, timestamp: '2023-01-01T08:00:00Z' },
      { price: 101, timestamp: '2023-01-01T09:00:00Z' },
      { price: 99, timestamp: '2023-01-01T10:00:00Z' },
    ];
    const result = calculateAnomaly(buffer, 100);
    expect(result.isAnomaly).toBe(false);
  });

  test('filterByTimeWindow should correctly filter snapshots', () => {
    const now = new Date().getTime();
    const snapshots = [
      { price: 100, timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString() }, // 2 hours ago
      { price: 110, timestamp: new Date(now - 1000 * 60 * 60 * 50).toISOString() }, // 50 hours ago
    ];
    const filtered = filterByTimeWindow(snapshots, 48);
    expect(filtered.length).toBe(1);
    expect(filtered[0].price).toBe(100);
  });
});
