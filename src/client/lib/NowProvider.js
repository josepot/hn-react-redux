import React from 'react';
import PropTypes from 'prop-types';

import getNow from 'lib/get-now-unix-time';
import {NOW_FREQUENCY} from 'config';

const createSubscription = initialState => {
  const listeners = {};
  const availableIds = [];
  let latestId = 0;

  let state = initialState;

  const getState = () => state;
  const setState = newState => {
    state = newState;
    Object.values(listeners).forEach(listener => listener(state));
  };

  const subscribe = listener => {
    // eslint-disable-next-line no-plusplus
    const id = availableIds.shift() || ++latestId;
    listeners[id] = listener;

    return () => {
      delete listeners[id];
      availableIds.push(id);
    };
  };

  return {
    getState,
    setState,
    subscribe,
  };
};

export default class NowProvider extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  static childContextTypes = {
    nowSubscription: PropTypes.object.isRequired,
  };

  getChildContext() {
    return {
      nowSubscription: this.subscription,
    };
  }

  componentDidMount() {
    setInterval(() => this.subscription.setState(getNow()), NOW_FREQUENCY);
  }

  subscription = createSubscription(getNow());

  render() {
    const {children} = this.props;
    return children ? React.Children.only(children) : null;
  }
}
