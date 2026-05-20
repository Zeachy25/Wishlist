import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { PriceSnapshot } from '../types';
import { generateChartData } from '../algorithms/svgChart';

const { width: windowWidth } = Dimensions.get('window');
const CHART_WIDTH = windowWidth - 64; // Padding from screen edges and container
const CHART_HEIGHT = 180;
const PADDING = 20;

interface PriceHistoryChartProps {
  data: PriceSnapshot[];
}

export default function PriceHistoryChart({ data }: PriceHistoryChartProps) {
  const chartData = useMemo(() => {
    return generateChartData(data, CHART_WIDTH, CHART_HEIGHT, PADDING);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>No price history available</Text>
      </View>
    );
  }

  const { points, pathD, minPrice, maxPrice } = chartData;

  // Create area path for the gradient fill
  const areaPathD = `${pathD} L ${points[points.length - 1].x} ${CHART_HEIGHT} L ${points[0].x} ${CHART_HEIGHT} Z`;

  // Find min and max points to render labels
  let minPoint = points[0];
  let maxPoint = points[0];

  points.forEach(p => {
    if (p.price < minPoint.price) minPoint = p;
    if (p.price > maxPoint.price) maxPoint = p;
  });

  return (
    <View style={styles.container}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#3B82F6" stopOpacity="0.4" />
            <Stop offset="1" stopColor="#3B82F6" stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines (simplified) */}
        <Line x1="0" y1={CHART_HEIGHT / 2} x2={CHART_WIDTH} y2={CHART_HEIGHT / 2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <Line x1="0" y1={CHART_HEIGHT - PADDING} x2={CHART_WIDTH} y2={CHART_HEIGHT - PADDING} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

        {/* Current price dashed line */}
        <Line 
          x1="0" 
          y1={points[points.length - 1].y} 
          x2={CHART_WIDTH} 
          y2={points[points.length - 1].y} 
          stroke="rgba(255,255,255,0.4)" 
          strokeWidth="1" 
          strokeDasharray="4, 4" 
        />

        {/* Area Fill */}
        <Path d={areaPathD} fill="url(#gradient)" />

        {/* Line */}
        <Path d={pathD} fill="none" stroke="#60A5FA" strokeWidth="2" />

        {/* Min / Max Labels */}
        {maxPrice > minPrice && (
          <>
            <Circle cx={maxPoint.x} cy={maxPoint.y} r="4" fill="#FFFFFF" />
            <SvgText 
              x={maxPoint.x} 
              y={maxPoint.y - 10} 
              fill="#FFFFFF" 
              fontSize="10" 
              fontWeight="bold" 
              textAnchor="middle"
            >
              Highest ₱{maxPrice.toLocaleString()}
            </SvgText>

            <Circle cx={minPoint.x} cy={minPoint.y} r="4" fill="#27AE60" />
            <SvgText 
              x={minPoint.x} 
              y={minPoint.y - 10} 
              fill="#27AE60" 
              fontSize="10" 
              fontWeight="bold" 
              textAnchor="middle"
            >
              Lowest ₱{minPrice.toLocaleString()}
            </SvgText>
          </>
        )}

        {/* X Axis Dates */}
        {points.filter((_, i) => i % Math.floor(points.length / 4) === 0 || i === points.length - 1).map((p, i) => (
          <SvgText
            key={i}
            x={p.x}
            y={CHART_HEIGHT - 2}
            fill="rgba(255,255,255,0.5)"
            fontSize="9"
            textAnchor="middle"
          >
            {p.date}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    marginVertical: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
});
