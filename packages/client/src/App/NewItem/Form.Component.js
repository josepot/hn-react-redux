import React from 'react';
import {Loader, FormField, Button} from 'components';

const AddItemForm = ({isSubmitting, ...rest}) => (
  <>
    <FormField name="title" {...rest} />
    <FormField name="author" {...rest} />
    <FormField name="price" type="number" {...rest} />
    <Button type="submit" disabled={isSubmitting}>
      Submit <Loader color="white" size={9} hidden={!isSubmitting} />
    </Button>
  </>
);

export default AddItemForm;
