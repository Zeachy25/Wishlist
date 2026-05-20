/**
 * Price Processor Engine
 * Handles circular buffering and Z-Score anomaly detection for price history.
 */

export interface PriceSnapshot {
  price: number;
  timestamp: string;
}

export class CircularBuffer {
  private buffer: PriceSnapshot[];
  private maxSize: number;

  constructor(size: number) {
    this.maxSize = size;
    this.buffer = [];
  }

  add(snapshot: PriceSnapshot) {
    if (this.buffer.length >= this.maxSize) {
      this.buffer.shift();
    }
    this.buffer.push(snapshot);
  }

  get data(): PriceSnapshot[] {
    return this.buffer;
  }
}

/**
 * Calculates the mean and standard deviation to determine if a price is an anomaly.
 * An anomaly is flagged if (mean - price) / stdDev > threshold (e.g., 1.5).
 */
export const calculateAnomaly = (
  buffer: PriceSnapshot[],
  currentPrice: number,
  threshold: number = 1.5
): { isAnomaly: boolean; zScore: number } => {
  if (buffer.length < 2) return { isAnomaly: false, zScore: 0 };

  const prices = buffer.map((s) => s.price);
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance =
    prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return { isAnomaly: false, zScore: 0 };

  const zScore = (mean - currentPrice) / stdDev;
  return { isAnomaly: zScore >= threshold, zScore };
};

/**
 * Filters snapshots within a specific time window.
 */
export const filterByTimeWindow = (
  snapshots: PriceSnapshot[],
  hours: number
): PriceSnapshot[] => {
  const now = new Date();
  const limit = new Date(now.getTime() - hours * 60 * 60 * 1000);
  return snapshots.filter((s) => new Date(s.timestamp) >= limit);
};
