export const COLORS = Object.freeze({
  PRIMARY: Object.freeze({
    DARK: '#441e8b',
    NORMAL: '#764abc',
    LIGHT: '#a877ef',
  }),
  SECONDARY: Object.freeze({
    DARK: '#00a6cc',
    NORMAL: '#00d8ff',
    LIGHT: '#6dffff',
  }),
});

export const LISTS = Object.freeze({
  top: 'top',
  new: 'new',
  show: 'show',
  ask: 'ask',
  jobs: 'jobs',
});

export const LISTS_ORDER = [
  LISTS.top,
  LISTS.new,
  LISTS.show,
  LISTS.ask,
  LISTS.jobs,
];

export const BROWSERS = Object.freeze({
  CHROME: 'chrome',
  EDGE: 'edge',
  FALLBACK: 'fallback',
  FIREFOX: 'firefox',
  SAFARI: 'safari',
});

export const PAGE_SIZE = 30;

export const NOW_FREQUENCY = 30000;

export const MAX_API_TRIES = 4;

export const UPDATE_FREQUENCY = 4000;
