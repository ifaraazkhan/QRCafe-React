import React from 'react';
import { useMemo } from 'react';

export const DOTS = '...';

const range = (start, end) => {
  let length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

export const usePagination = ({ totalCount, pageSize, siblingCount = 1, currentPage, prevRange }) => {
  
  const paginationRange = useMemo(() => {
    const totalPageCount = Math.ceil(totalCount / pageSize);
    const totalPageNumbers = 5;

    /*
      If the number of pages is less than the page numbers we want to show in our
      paginationComponent, we return the range [1..totalPageCount]
    */
    if (totalPageNumbers >= totalPageCount) {
      return range(1, totalPageCount);
    }

    if(!prevRange) return range(currentPage, currentPage+4);

    if(currentPage === prevRange[0] && prevRange[0] > 1) return range(prevRange[0]-1, prevRange[4]-1);
    else if(currentPage === prevRange[4] && prevRange[4] < totalPageCount) return range(prevRange[0]+1, prevRange[4]+1);
    else return prevRange;
  }, [totalCount, pageSize, siblingCount, currentPage]);

  return paginationRange;
};
