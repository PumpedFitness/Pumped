import Svg, { Path } from 'react-native-svg';

const PATHS: Record<string, string[]> = {
  dumbbell: ['M6.5 6.5v11M3 8.5v7M17.5 6.5v11M21 8.5v7M6.5 12h11'],
  flame: [
    'M12 3c.7 2.5-1.2 3.8-2.4 5.4C8.3 10 8 11.5 8 13a4 4 0 0 0 8 0c0-1.6-.7-2.9-1.7-4 .2 1.2-.4 2-1.1 2.4.6-2.6-1.2-4.9-1.2-8.4Z',
  ],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7.5V12l3 2'],
  chevron: ['M9 5l7 7-7 7'],
  chevronDown: ['M5 9l7 7 7-7'],
  back: ['M15 5l-7 7 7 7'],
  plus: ['M12 5v14M5 12h14'],
  minus: ['M5 12h14'],
  check: ['M5 12.5l4.5 4.5L19 6.5'],
  x: ['M6 6l12 12M18 6 6 18'],
  arrowUp: ['M7 17L17 7M9 7h8v8'],
  bolt: ['M13 3 5 13h6l-1 8 8-10h-6l1-8Z'],
  calendar: [
    'M6.5 5h11a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z',
    'M3.5 9.5h17M8 3v4M16 3v4',
  ],
  pulse: ['M3 12h4l2.5 7 4-15 2.5 8H21'],
  play: ['M7 4.5l12 7.5-12 7.5V4.5Z'],
  target: [
    'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z',
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  ],
  trend: ['M3 17l5-5 3.5 3.5L20 7M20 7h-4.5M20 7v4.5'],
  settings: [
    'M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z',
    'M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3',
  ],
  home: ['M4 11.5 12 4l8 7.5M6 10v9h12v-9'],
  history: ['M4.5 8.5A8.5 8.5 0 1 1 3.8 14', 'M4.5 4.5v4h4', 'M12 7.5V12l3 2'],
  award: [
    'M12 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z',
    'M8.5 13.5 7 21l5-2.6L17 21l-1.5-7.5',
  ],
  skip: ['M6 5l9 7-9 7V5ZM18 5v14'],
  rest: ['M12 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z', 'M12 13V9M9 2.5h6'],
  swap: ['M4 8h13l-3-3M20 16H7l3 3'],
  edit: ['M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z', 'M14 7l3 3'],
  trash: [
    'M4.5 7h15',
    'M9 3.5h6l1 3.5H8l1-3.5Z',
    'M7 7l.8 13h8.4L17 7',
    'M10 10.5v6M14 10.5v6',
  ],
  search: [
    'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z',
    'M15.2 15.2 20 20',
  ],
  archive: ['M4 7.5h16v12H4v-12Z', 'M3 4h18v3.5H3V4Z', 'M9 11h6'],
  more: ['M5 12h.01M12 12h.01M19 12h.01'],
  pause: ['M8 5v14M16 5v14'],
  dot: ['M12 12h.01'],
  user: [
    'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
    'M5 20c0-3.3 2.7-6 7-6s7 2.7 7 6',
  ],
  scale: ['M4 18h16', 'M5 18v-2a7 7 0 0 1 14 0v2', 'M12 4v3'],
  percent: [
    'M19 5 5 19',
    'M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    'M17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  ],
  ruler: ['M3 5v14h4V5H3Z', 'M7 8h3M7 12h5M7 16h3'],
  warning: ['M12 3 2 21h20L12 3Z', 'M12 10v4M12 17h.01'],
};

export type IconName = keyof typeof PATHS;

type ClayIconProps = {
  name: IconName;
  size?: number;
  stroke?: number;
  color?: string;
};

export function ClayIcon({
  name,
  size = 24,
  stroke = 1.75,
  color = 'currentColor',
}: ClayIconProps) {
  const paths = PATHS[name];
  if (!paths) return null;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((d, i) => (
        <Path key={i} d={d} />
      ))}
    </Svg>
  );
}
