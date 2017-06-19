import React from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';

const FirstChild = props =>
  React.Children.toArray(props.children)[0] || null;

export const STATES = Object.freeze({
  NORMAL: 'NORMAL',
  INIT: 'INIT',
  ENDING: 'ENDING',
});

export default (msIn, msOut) => (Component) =>
  class WithTransitions extends React.Component {
    constructor(props, ctx) {
      super(props, ctx);
      this.state = {state: STATES.NORMAL};
    }

    componentDidUpdate() {
      if (this.state.state === STATES.INIT) {
        this.setState({ state: STATES.NORMAL });
        setTimeout(this.enterCb, msIn);
      }
    }

    componentWillEnter(callback) {
      this.enteringCb = () => {
        this.enteringCb = undefined;
        this.enterCb = callback;
        this.setState({state: STATES.INIT});
      };

      if (this.state.state === STATES.NORMAL) this.enteringCb();
    }

    componentDidEnter() {
      if (this.leavingCb) this.leavingCb();
    }

    componentWillLeave(cb) {
      this.leavingCb = () => {
        this.leavingCb = undefined;
        this.setState({state: STATES.ENDING});
        setTimeout(() => {
          const call = this.enteringCb || cb;
          call();
        }, msOut);
      };

      if (this.state.state === STATES.NORMAL) {
        this.leavingCb();
      }
    }

    render() {
      return <Component {...this.props} transitionState={this.state.state} />;
    }
  };
