import * as React from 'react';

type Props = { title: string; count?: number };

export const ListTitle = ({ title, count }: Props) => {
  return (
    <h2 className="text-xl m-4">
      {title}
      {count ? <> ({count})</> : null}
    </h2>
  );
};

export default ListTitle;
