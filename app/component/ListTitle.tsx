import * as React from 'react';

type Props = { title: string | React.ReactNode; count?: number };

export const ListTitle = ({ title, count }: Props) => {
  return (
    <h2 className="text-xl m-4">
      {title}
      <span className="ml-2 opacity-50 select-none">{count !== undefined ? <>({count})</> : null}</span>
    </h2>
  );
};

export default ListTitle;
