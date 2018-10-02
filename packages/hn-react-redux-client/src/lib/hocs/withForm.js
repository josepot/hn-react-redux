import {always, assoc, assocPath, map} from 'ramda';
import React, {Component} from 'react';

const resetState = (props, mapPropsToValues) => ({
  values: mapPropsToValues(props),
  errors: {},
  touched: {},
  isSubmitting: false,
});

export default ({mapPropsToValues, validate, handleSubmit}) => BaseComponent =>
  class WithForm extends Component {
    constructor(props) {
      super(props);
      this.state = resetState(props, mapPropsToValues);
    }

    onBlur = e => {
      const {name} = e.target;
      const {touched} = this.state;
      if (touched[name]) return;
      this.setState(assocPath(['touched', name], true));
    };

    onChange = e => {
      const {name, value} = e.target;
      this.setState(({values}) => {
        const nextValues = assoc(name, value, values);
        const nextErrors = validate(nextValues);
        return {
          values: nextValues,
          errors: nextErrors,
        };
      });
    };

    reset = () => {
      this.setState(resetState(this.props, mapPropsToValues));
    };

    onSubmit = e => {
      e.preventDefault();

      const {values} = this.state;
      const errors = validate(values);
      const touched = map(always(true), values);
      const hasErrors = Object.keys(errors).length > 0;

      this.setState({errors, touched, isSubmitting: !hasErrors});
      if (hasErrors) return;
      handleSubmit(values, {
        props: this.props,
        resetForm: this.reset,
      });
    };

    render() {
      return (
        <form onSubmit={this.onSubmit}>
          <BaseComponent
            {...this.state}
            onChange={this.onChange}
            onBlur={this.onBlur}
          />
        </form>
      );
    }
  };
