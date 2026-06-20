import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { StyledWebView } from '@/components/uniwind';

type DataPoint = {
  time: string; // 'YYYY-MM-DD'
  value: number;
};

type MetricChartProps = {
  data: DataPoint[];
  height?: number;
  lineColor?: string;
  areaTopColor?: string;
  areaBottomColor?: string;
  yAxisUnit?: string;
};

function buildMonthLabels(language: string): string[] {
  return Array.from({ length: 12 }, (_, month) =>
    new Date(2024, month, 1).toLocaleDateString(language, { month: 'short' }),
  );
}

function buildChartHtml(
  data: DataPoint[],
  lineColor: string,
  areaTopColor: string,
  areaBottomColor: string,
  monthLabels: string[],
  yAxisUnit: string,
): string {
  const serialized = JSON.stringify(data);
  const serializedMonths = JSON.stringify(monthLabels);
  const serializedUnit = JSON.stringify(yAxisUnit);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: transparent; overflow: hidden; }
    #chart {
      width: 100%; height: 100vh; padding: 0 6px;
      clip-path: inset(0 100% 0 0);
    }
    #chart.reveal {
      animation: draw 1s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
    }
    @keyframes draw {
      from { clip-path: inset(0 100% 0 0); }
      to   { clip-path: inset(0 0 0 0); }
    }
    a[href*="tradingview"], div[style*="absolute"] > a { display: none !important; }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script src="https://unpkg.com/lightweight-charts@4.2.2/dist/lightweight-charts.standalone.production.js"></script>
  <script>
    var chart = LightweightCharts.createChart(document.getElementById('chart'), {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#928E7E',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: 10,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: 'rgba(52, 54, 44, 0.06)', style: 2 },
      },
      leftPriceScale: { visible: false },
      rightPriceScale: {
        visible: true,
        borderVisible: false,
        textColor: '#928E7E',
        scaleMargins: { top: 0.18, bottom: 0.18 },
      },
      timeScale: {
        visible: true,
        borderVisible: false,
        tickMarkFormatter: function(time) {
          var months = ${serializedMonths};
          if (typeof time === 'string') {
            var parts = time.split('-');
            return parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1];
          }
          if (time && time.year) {
            return time.day + ' ' + months[time.month - 1];
          }
          return '';
        },
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      autoSize: true,
      handleScroll: false,
      handleScale: false,
      crosshair: {
        mode: 0,
        vertLine: { visible: false, labelVisible: false },
        horzLine: { visible: false, labelVisible: false },
      },
    });

    var areaSeries = chart.addAreaSeries({
      topColor: '${areaTopColor}',
      bottomColor: '${areaBottomColor}',
      lineColor: '${lineColor}',
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
      priceFormat: {
        type: 'custom',
        formatter: function(price) {
          var unit = ${serializedUnit};
          var value = Math.abs(price) >= 100
            ? Math.round(price).toLocaleString()
            : Math.round(price * 10) / 10;
          return unit ? value + ' ' + unit : '' + value;
        },
      },
    });

    var data = ${serialized};
    areaSeries.setData(data);
    chart.timeScale().fitContent();

    setTimeout(function() {
      document.getElementById('chart').classList.add('reveal');
      window.ReactNativeWebView.postMessage('ready');
    }, 100);
  </script>
</body>
</html>`;
}

export function MetricChart({
  data,
  height = 160,
  lineColor = '#46583C',
  areaTopColor = 'rgba(70, 88, 60, 0.35)',
  areaBottomColor = 'rgba(70, 88, 60, 0.0)',
  yAxisUnit = '',
}: MetricChartProps) {
  const { i18n } = useTranslation();
  const opacity = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const onMessage = useCallback(() => {
    opacity.value = withDelay(
      200,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }),
    );
  }, [opacity]);

  const html = buildChartHtml(
    data,
    lineColor,
    areaTopColor,
    areaBottomColor,
    buildMonthLabels(i18n.language),
    yAxisUnit,
  );

  if (data.length < 2) {
    return null;
  }

  return (
    <Animated.View style={[{ height }, animStyle]}>
      <StyledWebView
        source={{ html }}
        className="flex-1 bg-transparent"
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        javaScriptEnabled
        originWhitelist={['*']}
        onMessage={onMessage}
      />
    </Animated.View>
  );
}
