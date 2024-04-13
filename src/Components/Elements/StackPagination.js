
import { useContext, useEffect, useRef, useState } from "react";
import Pagination from 'react-bootstrap/Pagination'
import { usePagination, DOTS } from './usePagination';
import classnames from 'classnames';
import React from "react";
const StackPagination = (props) => {
    const {
        layout = 1,
        totalItems = 0,
        totalPages = 10,
        currentPage = 1,
        showAllPages = false,
        showPrevNextBtn = false,
        disablePages = [],
        limit = 0,
        onChangeLimit = null,
        onClickFn = null,
        offset = (currentPage - 1) * limit,
        cClass = '',
        onPageChange,
        totalCount,
        siblingCount = 1,
        pageSize = 10,
        className,
        prevRange,
        offset2 = 0
    } = props

    

    const myRef = useRef();

    useEffect(() => {


    }, [])

    const getPages = (layout = 1) => {
        if (layout == 1) {
            return <Pagination.Item activeLabel={''} active={true} disabled={true} onClick={onClickFn}>{currentPage}</Pagination.Item>

        } else {
            return React.Children.toArray(Array.from(Array(totalPages).keys()).map((val, i) => {
                return <Pagination.Item activeLabel={''} active={currentPage == i + 1} disabled={disablePages.indexOf(i + 1) != -1 || currentPage == i + 1} onClick={onClickFn}>{i + 1}</Pagination.Item>
            })) 
        }

    }

    
    const totalPage = Math.ceil(totalItems / limit);
    
    const paginationRange = usePagination({
        currentPage,
        totalCount:(totalItems),
        siblingCount,
        pageSize:limit,
        prevRange
    });
    

    const onNext = () => {
        if (currentPage >= totalPage) onPageChange(currentPage, paginationRange);
        else onPageChange(currentPage + 1, paginationRange);
    };

    const onPrevious = () => {
        if (currentPage <= 1) onPageChange(currentPage, paginationRange);
        else onPageChange(currentPage - 1, paginationRange);
    };

    if (layout == 1) {
        return (
            <div id="pagination_sec">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                        <div className="page_limit_filter d-flex align-items-center justify-content-center">
                            <select className="form-control fw-600" defaultValue={limit} onChangeCapture={e => onChangeLimit(e.target.value)}>
                                <option value={''}>show entries</option>
                                <option value={1}>1</option>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div className="pagination_infon fs-13 d-flex align-items-center justify-content-center ms-3" style={{ color: "#05172A", fontWeight: "600" }}>
                            {/* <span>Showing {offset + 1} to {offset + limit <= totalItems ? offset + limit : totalItems} of {totalItems} entries </span> */}
                            <span>Showing {offset + 1} to {offset + limit <= totalItems ? offset + limit : totalItems} of {totalItems} entries </span>
                        </div>
                    </div>

                    <div className="pagination_block d-flex align-items-center justify-content-center">
                        <Pagination className="pagination_layout_1" size="sm">
                            {
                                showPrevNextBtn
                                    ? <><Pagination.First onClick={e => onClickFn(e, "first")} /><Pagination.Prev onClick={e => onClickFn(e, "prev")} /></>
                                    : ''
                            }
                            {getPages(layout)}
                            {
                                showPrevNextBtn
                                    ? <><Pagination.Next onClick={e => onClickFn(e, "next")} /> <Pagination.Last onClick={e => onClickFn(e, "last")} /></>
                                    : ''
                            }
                        </Pagination>
                    </div>

                </div>
            </div>

        )
    } else if (layout == 2) {
        return (
            <>
                <span>Showing {offset + 1} to {offset + limit <= totalItems ? offset + limit : totalItems} of {totalItems} entries </span>
                <ul className={`${classnames('pagination-container', { [className]: className })} pagination justify-content-end mt-3 mt-sm-0`} >
                    <li
                        className={"pagination-item page-item mr-10"}
                        onClick={onPrevious}
                    >
                        <a className={classnames('page-link', { disabled: currentPage === 1 })}>
                            {'<< Previous'}
                        </a>
                    </li>
                    {React.Children.toArray(paginationRange.map(pageNumber => {
                        return (
                            <li
                                className="pagination-item page-item"
                                onClick={() => {
                                    onPageChange(pageNumber, paginationRange);
                                }}
                            >
                                <a className={classnames({ active: pageNumber === currentPage }, 'page-link')}>{pageNumber}</a>
                            </li>
                        );
                    })) }
                    <li
                        className={"pagination-item page-item ml-10"}
                        onClick={onNext}
                    >
                        <a className={classnames('page-link', { disabled: currentPage === totalPage })}>
                            {' Next >> '}
                        </a>
                    </li>
                </ul>
            </>

        );
    } else {
        return (
            <Pagination>
                {
                    showPrevNextBtn
                        ? <><Pagination.First onClick={e => onClickFn(e, "first")} /><Pagination.Prev onClick={e => onClickFn(e, "prev")} /></>
                        : ''
                }
                {getPages(layout)}
                {
                    showPrevNextBtn
                        ? <><Pagination.Next onClick={e => onClickFn(e, "next")} /> <Pagination.Last onClick={e => onClickFn(e, "last")} /></>
                        : ''
                }
            </Pagination>
        )
    }



}





export default StackPagination