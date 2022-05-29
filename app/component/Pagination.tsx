import * as React from 'react';
import { Link, useLocation, useMatches } from 'remix';
import cn from 'classnames';
import { useInView } from 'react-intersection-observer';
import NoSsr from './NoSsr';

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

export type PaginationProps = {
  skip: number;
  take: number;
  count: number;
  currentPageCount: number;
  getUrlAtPage: (page: number) => string;
  onLoadMore?: (url: string) => void;
};

export const Pagination = ({ count, getUrlAtPage, skip, take, currentPageCount, onLoadMore }: PaginationProps) => {
  const currentPage = skip / take;
  const numberOfPages = Math.ceil(count / take);
  const { pathname } = useLocation();
  const matches = useMatches();
  const { ref } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView) {
        const match = matches.find((m) => m.pathname === pathname);
        if (match) {
          const isIndexRoute = match.id.endsWith('index');
          // https://remix.run/docs/en/v1.5.1/guides/routing#what-is-the-index-query-param
          const remixRoutePath = `${match.pathname}${isIndexRoute ? '?index&' : ''}`;
          const fullpath = remixRoutePath + getUrlAtPage(currentPageCount / take).replace(/^\?/, isIndexRoute ? '?index&' : '?');
          currentPageCount % take === 0 && onLoadMore?.(fullpath);
        }
      }
    },
  });
  return numberOfPages > 1 ? (
    <>
      <noscript>
        <div className="flex justify-center m-5">
          <div className="btn-group">
            <Link className={cn('btn btn-sm', { 'btn-disabled': skip <= 0 })} to={getUrlAtPage(currentPage - 1)}>
              Previous
            </Link>
            {createPagination(currentPage, numberOfPages).map((page, index) => (
              <Link
                key={`${page}_${index}`}
                className={cn('btn btn-sm', { 'btn-active': currentPage === page, 'btn-disabled': currentPage === page || isNaN(page) })}
                to={getUrlAtPage(page)}
              >
                {isNaN(page) ? '...' : page + 1}
              </Link>
            ))}
            <Link className={cn('btn btn-sm', { 'btn-disabled': currentPageCount < take })} to={getUrlAtPage(currentPage + 1)}>
              Next
            </Link>
          </div>
        </div>
      </noscript>
      <NoSsr>
        {skip === 0 && currentPageCount < count && (
          <div className="w-full flex justify-center p-2" ref={ref}>
            <button className="btn btn-ghost loading btn-xs btn-disabled">loading</button>
          </div>
        )}
      </NoSsr>
    </>
  ) : null;
};

export default Pagination;
