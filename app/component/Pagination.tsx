import * as React from 'react';
import { Link } from 'remix';
import cn from 'classnames';

type Props = {
  skip: number;
  take: number;
  count: number;
  currentPageCount: number;
  previousUrl: string;
  nextUrl: string;
  getUrlAtPage: (page: number) => string;
};

export const Pagination = ({ count, getUrlAtPage, nextUrl, previousUrl, skip, take, currentPageCount }: Props) => {
  const currentPage = skip / take;
  const otherPages = new Array(Math.ceil(count / take)).fill(null).map((_, i) => i);

  return (
    <div className="btn-group">
      <Link className={cn('btn btn-sm', { 'btn-disabled': skip <= 0 })} to={previousUrl}>
        Previous
      </Link>
      {otherPages.map((i) => (
        <Link key={i} className={cn('btn btn-sm', { 'btn-disabled btn-active': currentPage === i })} to={getUrlAtPage(i)}>
          {i}
        </Link>
      ))}
      <Link className={cn('btn btn-sm', { 'btn-disabled': currentPageCount < take })} to={nextUrl}>
        Next
      </Link>
    </div>
  );
};

export default Pagination;
