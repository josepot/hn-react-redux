import React from 'react';
import PropTypes from 'prop-types';

class WithNow extends React.Component {
  static propTypes = {
    Component: PropTypes.any.isRequired,
    componentProps: PropTypes.object.isRequired,
  };

  static contextTypes = {
    nowSubscription: PropTypes.object.isRequired,
  };

  state = {value: null};

  componentWillMount() {
    this.setState({value: this.context.nowSubscription.getState()});
  }

  componentDidMount() {
    this.unsubscribe = this.context.nowSubscription.subscribe(newValue => {
      this.setState({value: newValue});
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const {Component, componentProps} = this.props;

    return <Component {...componentProps} now={this.state.value} />;
  }
}

export default Component =>
  function WithNowHOC(props) {
    return <WithNow Component={Component} componentProps={props} />;
  };
