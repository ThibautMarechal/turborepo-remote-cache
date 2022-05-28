import * as React from 'react';
import { Link } from 'remix';
import cn from 'classnames';

export function createPagination(current: number, total: number, closePage: number = 3): number[] {
  const center = new Array(closePage * 2 + 1).fill(null).map((_, i) => i - closePage + current);
  const lastIndex = total - 1;
  const filteredCenter = center.filter((p) => p > 0 && p < lastIndex);
  const includeStart = current === closePage + 2;
  const includeEnd = current === lastIndex - closePage - 2;
  const includeLeftDots = current > closePage + 1;
  const includeRightDots = current < lastIndex - closePage - 1;
  if (includeStart) {
    filteredCenter.unshift(1);
  }
  if (includeEnd) {
    filteredCenter.push(lastIndex - 1);
  }
  if (!includeStart && includeLeftDots) {
    filteredCenter.unshift(NaN);
  }
  if (!includeEnd && includeRightDots) {
    filteredCenter.push(NaN);
  }
  return [0, ...filteredCenter, lastIndex];
}

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
  const numberOfPages = Math.ceil(count / take);
  return (
    <div className="btn-group">
      <Link className={cn('btn btn-sm', { 'btn-disabled': skip <= 0 })} to={previousUrl}>
        Previous
      </Link>
      {createPagination(currentPage, numberOfPages).map((page, index) => (
        <Link
          key={`${page}_${index}`}
          className={cn('btn btn-sm', { 'btn-active': currentPage === page, 'btn-disabled': currentPage === page || isNaN(page) })}
          to={getUrlAtPage(page)}
        >
          {isNaN(page) ? '...' : page}
        </Link>
      ))}
      <Link className={cn('btn btn-sm', { 'btn-disabled': currentPageCount < take })} to={nextUrl}>
        Next
      </Link>
    </div>
  );
};

export default Pagination;
