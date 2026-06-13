import { useCallback, useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AnimatedView, StyledWebView } from '@/components/uniwind';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';

type ChartWidgetProps = {
  colSpan: number;
  width: number;
};

function buildChartHtml(language: string): string {
  // Localized short month names injected into the chart's tick formatter
  const months = JSON.stringify(
    Array.from({ length: 12 }, (_, month) =>
      new Date(2024, month, 1).toLocaleDateString(language, {
        month: 'short',
      }),
    ),
  );

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
    /* Hide the TradingView watermark */
    a[href*="tradingview"], div[style*="absolute"] > a { display: none !important; }
  </style>
</head>
<body>
  <div id="chart"></div>
  <script src="https://unpkg.com/lightweight-charts@4.2.2/dist/lightweight-charts.standalone.production.js"></script>
  <script>
    const chart = LightweightCharts.createChart(document.getElementById('chart'), {
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
            var months = ${months};
            return parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1];
          }
          if (time && time.year) {
            var months2 = ${months};
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
      topColor: 'rgba(70, 88, 60, 0.35)',
      bottomColor: 'rgba(70, 88, 60, 0.0)',
      lineColor: '#46583C',
      lineWidth: 2,
      crosshairMarkerVisible: false,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // Generate uptrending data (last 30 days)
    var data = [];
    var value = 14200;
    var now = new Date();
    for (var i = 29; i >= 0; i--) {
      var d = new Date(now);
      d.setDate(d.getDate() - i);
      var year = d.getFullYear();
      var month = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      value += (Math.random() - 0.25) * 600;
      value = Math.max(value, 12000);
      data.push({ time: year + '-' + month + '-' + day, value: Math.round(value) });
    }

    areaSeries.setData(data);

    // Add price lines
    var allVals = data.map(function(d){ return d.value; });
    var minV = Math.min.apply(null, allVals);
    var maxV = Math.max.apply(null, allVals);
    var step = Math.round((maxV - minV) / 3 / 1000) * 1000;
    var base = Math.round(minV / 1000) * 1000;
    var levels = [base, base + step, base + step * 2];
    levels.forEach(function(price) {
      if (price < minV - 500 || price > maxV + 500) return;
      areaSeries.createPriceLine({
        price: price,
        color: 'rgba(146, 142, 126, 0.2)',
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: false,
        title: (price / 1000).toFixed(0) + 'k',
        lineVisible: true,
      });
    });

    chart.timeScale().fitContent();

    // Draw the line from left to right
    setTimeout(function() {
      document.getElementById('chart').classList.add('reveal');
      window.ReactNativeWebView.postMessage('ready');
    }, 100);
  </script>
</body>
</html>
`;
}

export function ChartWidget(_props: ChartWidgetProps) {
  const { t, i18n } = useTranslation();
  const chartHtml = useMemo(
    () => buildChartHtml(i18n.language),
    [i18n.language],
  );
  const chartOpacity = useSharedValue(0);
  const chartTranslateY = useSharedValue(8);

  const chartAnimStyle = useAnimatedStyle(() => ({
    opacity: chartOpacity.value,
    transform: [{ translateY: chartTranslateY.value }],
  }));

  const onMessage = useCallback(() => {
    // Y-labels fade in as the line draws across
    chartOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
    chartTranslateY.value = withTiming(0, { duration: 1 });
  }, [chartOpacity, chartTranslateY]);

  return (
    <View className="rounded-[22px] overflow-hidden bg-surface-card border border-border-hairline">
      {/* Title row */}
      <View className="flex-row items-center justify-between px-[15px] pt-[14px] pb-1">
        <View className="flex-row items-center gap-2">
          <ClayIcon name="trend" size={16} color={colors.sage} />
          <Text className="text-[12.5px] font-semibold text-muted">
            {t('widgets.chart.title')}
          </Text>
        </View>
        <View className="flex-row items-baseline gap-1">
          <Text className="text-[15px] font-bold text-foreground tabular-nums">
            24,840
          </Text>
          <Text className="text-[11px] font-medium text-sage">+18%</Text>
        </View>
      </View>

      {/* Chart with y-labels overlaid */}
      <View className="h-[130px] relative">
        <StyledWebView
          source={{ html: chartHtml }}
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
        {/* Y-axis labels — fade in after the line draws past them */}
        <AnimatedView
          className="absolute right-2 top-1.5 bottom-5 justify-between pointer-events-none"
          style={chartAnimStyle}
        >
          <Text className="text-[11px] font-medium text-text-secondary">
            18k
          </Text>
          <Text className="text-[11px] font-medium text-text-secondary">
            16k
          </Text>
          <Text className="text-[11px] font-medium text-text-secondary">
            14k
          </Text>
        </AnimatedView>
      </View>
    </View>
  );
}
