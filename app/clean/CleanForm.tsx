import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import classNames from 'classnames';
import { Form } from '~/component/Form';
import { cleanSchema } from './schema';

export function CleanForm() {
  return (
    <div className="flex justify-center">
      <Form schema={cleanSchema}>
        {({ Field, Button, formState }) => (
          <>
            <Field name="period" />
            <Button>
              <TrashIcon className={classNames('w-4 mr-2', { 'animate-spin': formState.isSubmitted })} />
              Clean
            </Button>
          </>
        )}
      </Form>
    </div>
  );
}
