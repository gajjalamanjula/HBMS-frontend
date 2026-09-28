import { forwardRef } from 'react';
import FormInput from './FormInput';

const FormDatePicker = forwardRef(function FormDatePicker(props, ref) {
  return <FormInput ref={ref} type="date" {...props} />;
});

export default FormDatePicker;
