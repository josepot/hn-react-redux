import React from 'react';
import PropTypes from 'prop-types';

class WithDiffProps extends React.Component {
  static propTypes = {
    Component: PropTypes.any.isRequired,
    componentProps: PropTypes.object.isRequired,
    fn: PropTypes.func.isRequired,
  };

  state = {extraProps: {}};

  componentWillReceiveProps({componentProps}) {
    this.setState({
      extraProps: this.props.fn(this.props.componentProps, componentProps, this.state.extraProps),
    });
  }

  render() {
    const {Component, componentProps} = this.props;

    return <Component {...componentProps} {...this.state.extraProps} />;
  }
}

export default fn => Component =>
  function WithDiffPropsHOC(props) {
    return (
      <WithDiffProps Component={Component} fn={fn} componentProps={props} />
    );
  };
