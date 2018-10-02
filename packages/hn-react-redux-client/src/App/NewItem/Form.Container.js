import {always, both, complement, lt} from 'ramda';
import {compose, withProps} from 'recompose';
import {connect} from 'react-redux-lean';

import {onSubmit, onItemSubmitted} from 'modules/items';
import {createValidations} from 'utils';
import {withForm} from 'hocs';
import FormComponent from './Form.Component';

const isNotEmpty = x => !!x;
const isValidPrice = compose(
  both(complement(Number.isNaN), lt(0)),
  parseFloat
);

export default compose(
  withProps({onItemSubmitted}),
  connect(
    null,
    {onSubmit}
  ),
  withForm({
    mapPropsToValues: always({
      title: '',
      author: '',
      price: '',
    }),
    validate: createValidations({
      title: [isNotEmpty, `Title can't be blank`],
      author: [isNotEmpty, `Please enter the author's name`],
      price: [isValidPrice, 'Please enter a valid price'],
    }),
    handleSubmit(values, {props, resetForm}) {
      props.onSubmit(values);
      props.onItemSubmitted(() => {
        resetForm();
      });
    },
  })
)(FormComponent);
