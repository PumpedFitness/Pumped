import { useCallback } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

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
};

function buildChartHtml(
  data: DataPoint[],
  lineColor: string,
  areaTopColor: string,
  areaBottomColor: string,
): string {
  const serialized = JSON.stringify(data);
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
      rightPriceScale: { visible: false },
      timeScale: {
        visible: true,
        borderVisible: false,
        tickMarkFormatter: function(time) {
          if (typeof time === 'string') {
            var parts = time.split('-');
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1];
          }
          if (time && time.year) {
            var months2 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return time.day + ' ' + months2[time.month - 1];
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
}: MetricChartProps) {
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

  const html = buildChartHtml(data, lineColor, areaTopColor, areaBottomColor);

  if (data.length < 2) {
    return null;
  }

  return (
    <Animated.View style={[{ height }, animStyle]}>
      <WebView
        source={{ html }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
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
