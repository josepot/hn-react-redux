import R from 'ramda';
import {createSelector} from 'reselect';
import {LOCATION_CHANGE} from 'connected-react-router';

const getLocation = R.pathOr({}, ['router', 'location']);
export const getLocationPath = createSelector(getLocation, R.prop('pathname'));
export const LOCATION_CHANGED = LOCATION_CHANGE;
