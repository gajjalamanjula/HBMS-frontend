import { forwardRef } from 'react';
import Button from './Button';

const sizeMap = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  icon: 'icon',
};

const AppButton = forwardRef(function AppButton(
  { loading = false, leftIcon, children, size = 'md', ...props },
  ref
) {
  return (
    <Button
      ref={ref}
      isLoading={loading}
      leftIcon={leftIcon}
      size={sizeMap[size] || size}
      {...props}
    >
      {children}
    </Button>
  );
});

export default AppButton;
