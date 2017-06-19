import R from 'ramda';
import {compose, mapProps} from 'recompose';
import withNow from 'lib/withNow';

const getText = nSecsAgo => {
  if (nSecsAgo < 30) return 'just now';
  if (nSecsAgo < 60) return 'less than a minute ago';

  const getUnitsText = (divisor, unit) => {
    const n = Math.floor(nSecsAgo / divisor);
    const units = n === 1 ? unit : `${unit}s`;
    return `${n} ${units} ago`;
  };

  const days = {unit: 'day', divisor: 86400, limit: Infinity};
  const hours = {unit: 'hour', divisor: 3600, limit: days.divisor};
  const minutes = {unit: 'minute', divisor: 60, limit: hours.divisor};

  const {divisor, unit} = R.find(R.propSatisfies(R.lt(nSecsAgo), 'limit'), [
    minutes,
    hours,
    days,
  ]);

  return getUnitsText(divisor, unit);
};

export default compose(
  withNow,
  mapProps(({time, now, ...props}) => ({
    ...props,
    children: time ? getText(now - time) : '',
  }))
)('span');
