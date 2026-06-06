// Shared line-icon set for the fitness app directions.
// Consistent 24x24 grid, 1.75 stroke, round caps, currentColor.
// Exported to window for use across direction files.

function mkIcon(paths, { fill = false } = {}) {
  return function Icon({ size = 24, stroke = 1.75, style = {}, ...rest }) {
    return (
      <svg
        width={size} height={size} viewBox="0 0 24 24"
        fill={fill ? 'currentColor' : 'none'}
        stroke={fill ? 'none' : 'currentColor'}
        strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
        style={{ display: 'block', flexShrink: 0, ...style }} {...rest}
      >
        {paths}
      </svg>
    );
  };
}

const IconDumbbell = mkIcon(<>
  <path d="M6.5 6.5v11M3 8.5v7M17.5 6.5v11M21 8.5v7M6.5 12h11" />
</>);

const IconFlame = mkIcon(<>
  <path d="M12 3c.7 2.5-1.2 3.8-2.4 5.4C8.3 10 8 11.5 8 13a4 4 0 0 0 8 0c0-1.6-.7-2.9-1.7-4 .2 1.2-.4 2-1.1 2.4.6-2.6-1.2-4.9-1.2-8.4Z" />
</>);

const IconClock = mkIcon(<>
  <circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" />
</>);

const IconChevron = mkIcon(<><path d="M9 5l7 7-7 7" /></>);

const IconPlus = mkIcon(<><path d="M12 5v14M5 12h14" /></>);

const IconCheck = mkIcon(<><path d="M5 12.5l4.5 4.5L19 6.5" /></>);

const IconArrowUp = mkIcon(<><path d="M7 17L17 7M9 7h8v8" /></>);

const IconBolt = mkIcon(<><path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" /></>);

const IconCalendar = mkIcon(<>
  <rect x="3.5" y="5" width="17" height="16" rx="3" /><path d="M3.5 9.5h17M8 3v4M16 3v4" />
</>);

const IconPulse = mkIcon(<><path d="M3 12h4l2.5 7 4-15 2.5 8H21" /></>);

const IconPlay = mkIcon(<><path d="M7 4.5l12 7.5-12 7.5V4.5Z" /></>, { fill: true });

const IconTarget = mkIcon(<>
  <circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
</>);

const IconTrend = mkIcon(<><path d="M3 17l5-5 3.5 3.5L20 7M20 7h-4.5M20 7v4.5" /></>);

const IconSettings = mkIcon(<>
  <circle cx="12" cy="12" r="3.2" />
  <path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3" />
</>);

const IconHome = mkIcon(<><path d="M4 11.5 12 4l8 7.5M6 10v9h12v-9" /></>);

const IconDot = mkIcon(<><circle cx="12" cy="12" r="9" /></>, { fill: true });

const IconMinus = mkIcon(<><path d="M5 12h14" /></>);
const IconX = mkIcon(<><path d="M6 6l12 12M18 6 6 18" /></>);
const IconBack = mkIcon(<><path d="M15 5l-7 7 7 7" /></>);
const IconPause = mkIcon(<><path d="M9 5v14M15 5v14" /></>);
const IconMore = mkIcon(<><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" /></>);
const IconEdit = mkIcon(<><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" /><path d="M14 7l3 3" /></>);
const IconAward = mkIcon(<><circle cx="12" cy="9" r="5.5" /><path d="M8.5 13.5 7 21l5-2.6L17 21l-1.5-7.5" /></>);
const IconSkip = mkIcon(<><path d="M6 5l9 7-9 7V5ZM18 5v14" /></>);
const IconChevronDown = mkIcon(<><path d="M5 9l7 7 7-7" /></>);
const IconRest = mkIcon(<><circle cx="12" cy="13" r="8" /><path d="M12 13V9M9 2.5h6" /></>);
const IconSwap = mkIcon(<><path d="M4 8h13l-3-3M20 16H7l3 3" /></>);

Object.assign(window, {
  IconDumbbell, IconFlame, IconClock, IconChevron, IconPlus, IconCheck,
  IconArrowUp, IconBolt, IconCalendar, IconPulse, IconPlay, IconTarget,
  IconTrend, IconSettings, IconHome, IconDot,
  IconMinus, IconX, IconBack, IconPause, IconMore, IconEdit, IconAward,
  IconSkip, IconChevronDown, IconRest, IconSwap,
});
