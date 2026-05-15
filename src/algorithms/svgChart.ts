import { PriceSnapshot } from '../types';

export interface Point {
  x: number;
  y: number;
  price: number;
  date: string;
}

export interface ChartData {
  points: Point[];
  pathD: string;
  minPrice: number;
  maxPrice: number;
}

export function generateChartData(
  snapshots: PriceSnapshot[],
  width: number,
  height: number,
  padding: number = 20
): ChartData {
  if (!snapshots || snapshots.length === 0) {
    return { points: [], pathD: '', minPrice: 0, maxPrice: 0 };
  }

  if (snapshots.length === 1) {
    const point = {
      x: width / 2,
      y: height / 2,
      price: snapshots[0].price,
      date: new Date(snapshots[0].timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    };
    return {
      points: [point],
      pathD: `M ${point.x} ${point.y}`,
      minPrice: point.price,
      maxPrice: point.price
    };
  }

  // Sort chronologically just in case
  const sorted = [...snapshots].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  let minPrice = sorted[0].price;
  let maxPrice = sorted[0].price;
  let minTime = new Date(sorted[0].timestamp).getTime();
  let maxTime = new Date(sorted[sorted.length - 1].timestamp).getTime();

  for (const s of sorted) {
    if (s.price < minPrice) minPrice = s.price;
    if (s.price > maxPrice) maxPrice = s.price;
  }

  // Handle flat line
  if (minPrice === maxPrice) {
    minPrice = minPrice * 0.9;
    maxPrice = maxPrice * 1.1;
    if (minPrice === 0) {
      maxPrice = 10;
    }
  }

  // Handle single time point (shouldn't happen with sorted length > 1, but safe)
  if (minTime === maxTime) {
    minTime -= 1000;
    maxTime += 1000;
  }

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points: Point[] = sorted.map((s) => {
    const time = new Date(s.timestamp).getTime();
    
    // Scale X
    const xPct = (time - minTime) / (maxTime - minTime);
    const x = padding + (xPct * chartWidth);
    
    // Scale Y (invert because SVG y=0 is at top)
    const yPct = (s.price - minPrice) / (maxPrice - minPrice);
    const y = padding + chartHeight - (yPct * chartHeight);

    return {
      x,
      y,
      price: s.price,
      date: new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    };
  });

  const pathD = points.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, '');

  return { points, pathD, minPrice, maxPrice };
}
