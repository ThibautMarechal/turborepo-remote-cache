import * as React from 'react';
import { SchemaForm, type FormSchema, type SchemaFormProps } from 'remix-forms';
import cn from 'classnames';

import { Form as FrameworkForm } from '@remix-run/react';

export function Form<Schema extends FormSchema>(props: SchemaFormProps<Schema>) {
  return (
    <SchemaForm<Schema>
      component={FrameworkForm as SchemaFormProps<Schema>['component']}
      fieldComponent={Field}
      labelComponent={Label}
      inputComponent={Input}
      multilineComponent={TextArea}
      selectComponent={Select}
      checkboxComponent={Checkbox}
      buttonComponent={Button}
      fieldErrorsComponent={Error}
      globalErrorsComponent={Errors}
      errorComponent={Error}
      {...props}
    />
  );
}

export const Field = ({ className, ...props }: React.JSX.IntrinsicElements['div']) => <div className={cn('form-control w-full', className)} {...props} />;

export const Label = ({ children, ...props }: React.JSX.IntrinsicElements['label']) => (
  <label className="label" {...props}>
    <span className="label-text">{children}</span>
  </label>
);

export const Input = React.forwardRef<HTMLInputElement, React.JSX.IntrinsicElements['input']>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn('input input-bordered w-full', className)} {...props} />
));
Input.displayName = 'Input';

export const TextArea = React.forwardRef<HTMLTextAreaElement, React.JSX.IntrinsicElements['textarea']>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('textarea textarea-bordered w-full', className)} rows={5} {...props} />
));
TextArea.displayName = 'TextArea';

export const Select = React.forwardRef<HTMLSelectElement, React.JSX.IntrinsicElements['select']>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn('select select-bordered w-full', className)} {...props} />
));
Select.displayName = 'Select';

export const Checkbox = React.forwardRef<HTMLInputElement, React.JSX.IntrinsicElements['input']>(({ type = 'checkbox', className, ...props }, ref) => (
  <input ref={ref} type={type} className={cn('checkbox', className)} {...props} />
));
Checkbox.displayName = 'Checkbox';

export const Button = ({ className, ...props }: React.JSX.IntrinsicElements['button']) => (
  <div className="w-full mt-5 form-control">
    <button className={cn('btn btn-primary', className)} {...props} />
  </div>
);

export const Error = ({ className, ...props }: React.JSX.IntrinsicElements['div']) => <div className={cn('text-sm text-red-600', className)} {...props} />;

export const Errors = ({ className, ...props }: React.JSX.IntrinsicElements['div']) => <div className="flex flex-col space-y-2 text-center" {...props} />;
