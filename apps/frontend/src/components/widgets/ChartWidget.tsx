import { View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { ClayIcon } from '../icons/ClayIcon';
import { colors, typography, radii } from '../../theme/tokens';

type ChartWidgetProps = {
  colSpan: number;
  width: number;
};

const CHART_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: transparent; overflow: hidden; }
    #chart { width: 100%; height: 100vh; padding: 0 6px; }
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

    // Add subtle price lines as inline y-labels on the chart
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
  </script>
</body>
</html>
`;

export function ChartWidget(_props: ChartWidgetProps) {
  return (
    <View
      style={{
        borderRadius: radii.lg,
        overflow: 'hidden',
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.line,
      }}
    >
      {/* Title row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 15,
          paddingTop: 14,
          paddingBottom: 4,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ClayIcon name="trend" size={16} color={colors.sage} />
          <Text
            style={{
              fontSize: typography.caption,
              fontWeight: '600',
              color: colors.muted,
            }}
          >
            Volume Trend
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          <Text
            style={{
              fontSize: typography.body,
              fontWeight: '700',
              color: colors.ink,
              fontVariant: ['tabular-nums'],
            }}
          >
            24,840
          </Text>
          <Text
            style={{
              fontSize: typography.micro,
              fontWeight: '500',
              color: colors.sage,
            }}
          >
            +18%
          </Text>
        </View>
      </View>

      {/* Chart with y-labels overlaid */}
      <View style={{ height: 130, position: 'relative' }}>
        <WebView
          source={{ html: CHART_HTML }}
          style={{ flex: 1, backgroundColor: 'transparent' }}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled
          originWhitelist={['*']}
        />
        {/* Y-axis labels — floating over the chart */}
        <View
          style={{
            position: 'absolute',
            right: 8,
            top: 6,
            bottom: 20,
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '500', color: colors.ink2 }}>18k</Text>
          <Text style={{ fontSize: 11, fontWeight: '500', color: colors.ink2 }}>16k</Text>
          <Text style={{ fontSize: 11, fontWeight: '500', color: colors.ink2 }}>14k</Text>
        </View>
      </View>
    </View>
  );
}
