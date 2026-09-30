import * as React from 'react';
import { Form, useLocation } from 'react-router';

export const Search = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  searchParams.delete('q');
  const action = `${location.pathname}?${searchParams.toString()}`;

  return (
    <Form action={action}>
      <input name="q" type="text" placeholder="Search" className="input input-sm" />
    </Form>
  );
};

export default Search;
