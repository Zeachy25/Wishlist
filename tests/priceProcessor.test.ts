import { CircularBuffer, calculateAnomaly, filterByTimeWindow } from '../src/algorithms/priceProcessor';

describe('CircularBuffer', () => {
  test('should maintain correct size when full', () => {
    const buffer = new CircularBuffer(2);
    buffer.add({ price: 100, timestamp: '2023-01-01T10:00:00Z' });
    buffer.add({ price: 110, timestamp: '2023-01-01T11:00:00Z' });
    buffer.add({ price: 120, timestamp: '2023-01-01T12:00:00Z' });
    expect(buffer.data.length).toBe(2);
    expect(buffer.data[0].price).toBe(110);
    expect(buffer.data[1].price).toBe(120);
  });

  test('should return empty array before any additions', () => {
    const buffer = new CircularBuffer(5);
    expect(buffer.data).toEqual([]);
  });

  test('should work with capacity of 1', () => {
    const buffer = new CircularBuffer(1);
    buffer.add({ price: 100, timestamp: '2023-01-01T10:00:00Z' });
    expect(buffer.data.length).toBe(1);
    expect(buffer.data[0].price).toBe(100);
    buffer.add({ price: 200, timestamp: '2023-01-01T11:00:00Z' });
    expect(buffer.data.length).toBe(1);
    expect(buffer.data[0].price).toBe(200);
  });

  test('should preserve all items when under capacity', () => {
    const buffer = new CircularBuffer(10);
    buffer.add({ price: 100, timestamp: '2023-01-01T10:00:00Z' });
    buffer.add({ price: 110, timestamp: '2023-01-01T11:00:00Z' });
    buffer.add({ price: 120, timestamp: '2023-01-01T12:00:00Z' });
    expect(buffer.data.length).toBe(3);
    expect(buffer.data[0].price).toBe(100);
    expect(buffer.data[2].price).toBe(120);
  });
});

describe('calculateAnomaly', () => {
  const makeSnapshots = (prices: number[]) =>
    prices.map((price, i) => ({
      price,
      timestamp: `2023-01-01T${String(8 + i).padStart(2, '0')}:00:00Z`,
    }));

  test('should detect significant price drops exceeding threshold', () => {
    const buffer = makeSnapshots([100, 102, 98]);
    const result = calculateAnomaly(buffer, 50);
    expect(result.isAnomaly).toBe(true);
    expect(result.zScore).toBeGreaterThan(1.5);
  });

  test('should not flag stable prices', () => {
    const buffer = makeSnapshots([100, 101, 99]);
    const result = calculateAnomaly(buffer, 100);
    expect(result.isAnomaly).toBe(false);
  });

  test('should return isAnomaly false for empty buffer', () => {
    const result = calculateAnomaly([], 100);
    expect(result.isAnomaly).toBe(false);
    expect(result.zScore).toBe(0);
  });

  test('should handle single-item buffer with small drop', () => {
    const buffer = makeSnapshots([100]);
    const result = calculateAnomaly(buffer, 95);
    expect(result.isAnomaly).toBe(false);
  });

  test('should handle single-item buffer with large drop', () => {
    const buffer = makeSnapshots([100]);
    const result = calculateAnomaly(buffer, 80);
    expect(result.isAnomaly).toBe(true);
  });

  test('should return isAnomaly false when stdDev is zero', () => {
    const buffer = makeSnapshots([100, 100, 100]);
    const result = calculateAnomaly(buffer, 100);
    expect(result.isAnomaly).toBe(false);
    expect(result.zScore).toBe(0);
  });

  test('should respect custom threshold parameter', () => {
    const buffer = makeSnapshots([100, 110, 90, 105, 95]);
    const strictResult = calculateAnomaly(buffer, 80, 3.0);
    const lenientResult = calculateAnomaly(buffer, 80, 0.5);
    expect(strictResult.isAnomaly).toBe(false);
    expect(lenientResult.isAnomaly).toBe(true);
  });

  test('should detect extreme price drops with very high z-score', () => {
    const buffer = makeSnapshots([100, 101, 99, 100, 102]);
    const result = calculateAnomaly(buffer, 1);
    expect(result.isAnomaly).toBe(true);
    expect(result.zScore).toBeGreaterThan(10);
  });
});

describe('filterByTimeWindow', () => {
  test('should correctly filter snapshots within window', () => {
    const now = new Date().getTime();
    const snapshots = [
      { price: 100, timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString() },
      { price: 110, timestamp: new Date(now - 1000 * 60 * 60 * 50).toISOString() },
    ];
    const filtered = filterByTimeWindow(snapshots, 48);
    expect(filtered.length).toBe(1);
    expect(filtered[0].price).toBe(100);
  });

  test('should return all snapshots when all within window', () => {
    const now = new Date().getTime();
    const snapshots = [
      { price: 100, timestamp: new Date(now - 1000 * 60 * 5).toISOString() },
      { price: 110, timestamp: new Date(now - 1000 * 60 * 30).toISOString() },
      { price: 120, timestamp: new Date(now - 1000 * 60 * 55).toISOString() },
    ];
    const filtered = filterByTimeWindow(snapshots, 48);
    expect(filtered.length).toBe(3);
  });

  test('should return empty array when all snapshots are expired', () => {
    const now = new Date().getTime();
    const snapshots = [
      { price: 100, timestamp: new Date(now - 1000 * 60 * 60 * 72).toISOString() },
      { price: 110, timestamp: new Date(now - 1000 * 60 * 60 * 96).toISOString() },
    ];
    const filtered = filterByTimeWindow(snapshots, 48);
    expect(filtered.length).toBe(0);
  });

  test('should return empty array for empty input', () => {
    const filtered = filterByTimeWindow([], 48);
    expect(filtered).toEqual([]);
  });

  test('should handle exact boundary timestamps', () => {
    const now = new Date().getTime();
    const atBoundary = new Date(now - 48 * 60 * 60 * 1000).toISOString();
    const snapshots = [
      { price: 100, timestamp: atBoundary },
    ];
    const filtered = filterByTimeWindow(snapshots, 48);
    expect(filtered.length).toBe(1);
  });
});
