import React from 'react';
import styled from 'react-emotion';
import Input from './Input';

const FieldWrapper = styled('div')`
  margin: 10px 0;
`;

const ErrorMessage = styled('span')`
  display: inline-block;
  color: red;
`;

// eslint-disable-next-line react/prop-types
const FormField = ({errors, touched, name, type, values, ...rest}) => (
  <FieldWrapper>
    <Input
      type={type}
      name={name}
      placeholder={name}
      value={values[name]}
      {...rest}
    />
    {errors[name] && touched[name] ? (
      <ErrorMessage>{errors[name]}</ErrorMessage>
    ) : null}
  </FieldWrapper>
);

FormField.defaultValues = {
  type: 'text',
};
FormField.displayName = 'FormField';
export default FormField;
