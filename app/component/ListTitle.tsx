import * as React from 'react';
import Search from './Search';

type Props = { title: string | React.ReactNode; count?: number; searchable?: boolean };

export const ListTitle = ({ title, count, searchable }: Props) => {
  return (
    <h2 className="text-xl m-4 flex justify-between">
      <span>
        {title}
        <span className="ml-2 opacity-50 select-none">{count !== undefined ? <>({count})</> : null}</span>
      </span>
      {searchable && <Search />}
    </h2>
  );
};

export default ListTitle;
