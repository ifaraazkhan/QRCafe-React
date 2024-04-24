import React, { useContext, useEffect, useRef, useState } from "react";
import {Input , Label, Card, Container, Row, Col, Nav, NavDropdown, Tab} from '../../Helpers/UiHelper'

import { AuthContext } from "../../ContextProvider/AuthContext";
import C_MSG from "../../Helpers/MsgsList";
import { getFileName, setDocumentTitle, sortArr } from "../../Helpers/Helper";
import SweetAlert from "react-bootstrap-sweetalert";
import { ApiService } from "../../Services/ApiService";
import StackModal from "../../Components/Elements/StackModal";
import StackPagination from "../../Components/Elements/StackPagination";
import { configs } from "../../config";
import moment from "moment";

const UserFeedbacks = (props) => {
    const { user: authUser = null, projectId = null, isSuperAdmin = false } = useContext(AuthContext)
    const user = authUser?.user || {}
    const userId = user.user_id || null

    const [accounts, setAccounts] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [showAlert, setShowAlert] = useState(false);
    const [modalType, setModalType] = useState(null)
    const [modalData, setModalData] = useState({});
    const [openModal, setShowModal] = useState(false);
    const [viewFile, setViewFile] = useState(false);
    const [fileType, setFileType] = useState(false);

    /* pagination states start */
    let paginateObj = {totalItems: 0, totalPages: 10, currentPage: 1, showAllPages: false, showPrevNextBtn: true, disablePages: [], itemsLimit: 10};
    const [paginate, setPaginate] = useState(paginateObj);
    const [prevRange, setPrevRange] = useState(null);
    const keywordRef = useRef();
    // sorting data
    const [activeCol, setActiveCol] = useState("");
    const [activeSortOrder, setActiveSortOrder] = useState("ASC");
    /* pagination states end */

    useEffect(() => {
        setDocumentTitle(C_MSG.admin_feedbacks_settings_document_title)
    }, [])


    useEffect(() => {
        // if(projectId != null && feedbacks && feedbacks.length == 0){
            getAccounts()
        // }
    }, [])

    /* pagination sorting, searching function start */
    const searchByKeyword = (pgObj = null, searchArr = []) => {
        let paginateObj = pgObj || paginate;
        let keyword = keywordRef?.current?.value;
        keyword = keyword && keyword.replace(/ /g, "").length > 0 ? keyword : null;
        let items = [];
        let tmpArr = searchArr
        if (!keyword || keyword.length == 0 || keyword == null) {
          items = [...tmpArr];
            //   if (checkFilters) {
            //     items = getFilteredGrps(items, checkFilters, {}) || [];
            //   }
          paginateObj.totalPages = Math.ceil(items.length / paginateObj.itemsLimit);
          paginateObj.currentPage = (paginateObj.currentPage - 1) * paginateObj.itemsLimit < items.length ? paginateObj.currentPage : 1;
          getFilteredList(paginateObj, [...items]);
          return false;
        }
  
            // if (checkFilters) {
            //   tmpPnPArr = getFilteredGrps(tmpPnPArr, checkFilters, {}) || [];
            // }
        for (let item of tmpArr) {
          let feedback_text = item?.feedback_text ? item?.feedback_text.toLowerCase() : "";
          let created_on = item?.created_on ? item?.created_on.toLowerCase() : "";
          if (
            feedback_text.indexOf(keyword.toLowerCase()) != -1 ||
            created_on.indexOf(keyword.toLowerCase()) != -1 
          ) {
            items.push(item);
          }
        }
  
        paginateObj.totalPages = Math.ceil(items.length / paginateObj.itemsLimit);
        paginateObj.currentPage = (paginateObj.currentPage - 1) * paginateObj.itemsLimit < items.length ? paginateObj.currentPage : 1;
  
        getFilteredList(paginateObj, [...items]);
    };

    

    const onPageChangeFunc = async (currentPage, prevRange) => {
        let paginateObj = { ...paginate };
        paginateObj.currentPage = currentPage
        setPrevRange(prevRange);
        searchByKeyword(paginateObj,[...feedbacks]);
    }

    const onChangeLimit = async (newLimit = "") => {
        if (newLimit == "") {
          return false;
        }
        let items = [...feedbacks];
        let paginateObj = { ...paginate };
        paginateObj.itemsLimit = newLimit;
        paginateObj.currentPage = 1;
        paginateObj.totalPages = Math.ceil(items.length / paginateObj.itemsLimit);
        paginateObj.totalItems = items.length;
        setPaginate((oldVal) => {
          return { ...paginateObj };
        });
        searchByKeyword(paginateObj, items);
    };
  
    const onClickPaginationItem = async (event, page = "") => {
        if (page == "") {
          return false;
        }
  
        let paginateObj = { ...paginate };
        if (page == "first") {
          paginateObj.currentPage = 1;
        } else if (page == "last") {
          paginateObj.currentPage = paginateObj.totalPages;
        } else if (page == "next") {
          paginateObj.currentPage =
            paginateObj.currentPage + 1 <= paginateObj.totalPages
              ? paginateObj.currentPage + 1
              : paginateObj.totalPages;
        } else if (page == "prev") {
          paginateObj.currentPage =
            paginateObj.currentPage - 1 > 0 ? paginateObj.currentPage - 1 : 1;
        }
        setPaginate((oldVal) => {
          return { ...paginateObj };
        });
        searchByKeyword(paginateObj,[...feedbacks]);
    };

    const getFilteredList = (paginateObj = null, items = null, returnRes = false) => {
        if (paginateObj == null || items == null) {
          return false;
        }
        let currentPage = paginateObj.currentPage;
        let limit = paginateObj.itemsLimit || 10;
        let offset = (currentPage - 1) * limit;
        let fList = items.slice(offset, offset + limit);
        paginateObj.totalItems = items.length;
        setPaginate((oldVal) => {
          return { ...paginateObj };
        });
        if (!returnRes) {
          setFilteredList((oldVal) => {
            return [...fList];
          });
        }
        return fList
    };

    const sortData = async (column = "", type = "", items = []) => {
        if (column == "" || type == "" || items.length == 0) {
          return false;
        }
        let sortOpts = {
          sortBy: column,
          sortOrder: type,
          activeCol: activeCol,
          activeSortOrder: activeSortOrder,
          items: items,
        };
        let dataArr = sortArr(sortOpts);
        setFeedbacks(dataArr);
        setFilteredList((oldVal) => {
          return [...dataArr];
        });
        setActiveCol(column);
        setActiveSortOrder(type);
    };
    /* pagination sorting, searching function end */

    const getAccounts = async () => {
        let payloadUrl = `user/getAccountbyUserID/${user?.user_id}`
        if(isSuperAdmin){
            payloadUrl = `admin/listAccounts`
        }
        let method = "GET"
        
        const res = await ApiService.fetchData(payloadUrl,method)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            let data = Object.values(res.results)
            setAccounts(oldVal => ([...data]))
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message })
        }
    }

    const onChangeAccount = async (accountId = null) => {
        if(accountId == null){
            return false
        }
        getFeedbacks(accountId)
    }

    const getFeedbacks = async (accountId) => {
        let payloadUrl = `admin/feedbackbyAccountId/${accountId}`
        let method = "GET"
        
        const res = await ApiService.fetchData(payloadUrl,method)
        if( res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            let data = Object.values(res.results)
            if(data.length > 0){
                setFeedbacks(oldVal => ([...data]))
                getFilteredList(paginate,[...data])
            }else{
                setFeedbacks([])
                setFilteredList([])
            }
            
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message })
            setFeedbacks([])
            setFilteredList([])
        }
    }

   

    const toggleAlert = (val) => {
        setShowAlert(val)
    }

    const showModal = async (modalName = null, data = null) => {
        if (modalName == null) {
          return false;
        }
        setModalData({})
        switch (modalName) {
          case "view_documents":
            if(data != null){
                const {file_path = null} = data;
                if(file_path){
                    let fullPath = `${file_path}`
                    let filename = getFileName(file_path)
                    let fileExt = filename.split(".")[1]
                    setViewFile(fullPath)
                    setFileType(fileExt)
                    setModalType(modalName);
                    setShowModal(true);
                }
            }
            break;
          
        }
    };

    const hideModal = () => {
        setModalType(null);
        setShowModal(false);
    };

   
    

    return (
        <React.Fragment>
            <div className="page-content px-0 mt-4 pt-5">
                <div className="card">
                    <div className="row">
                        <div className="col-12">
                            <div className="listjs-table mt-3" id="customerList">
                                <div className="row m-0">
                                    <div className="col-sm-auto w320">
                                        <div className="form-group">
                                            <select className="form-control fw-600" onChangeCapture={(e) => onChangeAccount(e.target.value)}>
                                                <option value={''}>Select Account</option>
                                                {accounts && accounts.length > 0 && React.Children.toArray(accounts.map((item, uKey) => {
                                                    return <option value={item.account_id}>{item.title}</option>
                                                }))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-sm">
                                        <div className="d-flex justify-content-sm-end">
                                            <div className="search-box ms-2">
                                                <input type="text" className="form-control search" placeholder="Search..." ref={keywordRef} onChangeCapture={() => searchByKeyword(null, [...feedbacks])} />
                                                <i className="ri-search-line search-icon"></i>
                                            </div>
                                        </div>
                                    </div>
                                    

                                </div>

                                <div className="table-responsive table-card m-0 mt-3">
                                    {filteredList && filteredList.length > 0 &&
                                        <table className="table align-middle table-nowrap" id="customerTable">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="sort link_url" onClick={() => sortData('feedback_text', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', feedbacks)}>Feedback</th>
                                                    <th className="sort link_url" >Audio</th>
                                                    <th className="sort link_url" >Other File</th>
                                                    <th className="sort link_url" onClick={() => sortData('created_on', activeSortOrder == 'ASC' ? 'DESC' : 'ASC', feedbacks)}>Created On</th>
                                                </tr>
                                            </thead>
                                            <tbody className="list form-check-all">
                                                {React.Children.toArray(filteredList.map((item, index) => {
                                                    return (
                                                        <React.Fragment>
                                                            <tr>

                                                                {/* <td className="">{item.first_name} {item.last_name}</td> */}
                                                                <td className="">{item.feedback_text}</td>
                                                                <td className="">{item.audio_file_path && <audio id="audio" controls src={item.audio_file_path}></audio>}</td>
                                                                <td className="">{item.file_path && <span className="link_url" onClick={() => showModal("view_documents", item)}><i className="fa fa-file"></i></span>}</td>
                                                                <td className="">{item.created_on && moment(item.created_on).format("MMM DD, YYYY")}</td>
                                                            </tr>
                                                        </React.Fragment>
                                                    )
                                                }))}
                                            </tbody>
                                        </table>
                                    }

                                    {filteredList && filteredList.length > 0 &&
                                        <div className="pagination_sec px-3 mt-3 Page navigation example btm_pagination d-flex justify-content-between align-items-center mt-20 pb-20">
                                            <StackPagination
                                                layout={2}
                                                totalItems={Number(paginate?.totalItems)}
                                                totalPages={Number(paginate?.totalPages)}
                                                currentPage={Number(paginate?.currentPage)}
                                                showAllPages={paginate?.showAllPages}
                                                showPrevNextBtn={paginate?.showPrevNextBtn}
                                                disablePages={paginate?.disablePages}
                                                limit={Number(paginate?.itemsLimit)}
                                                onChangeLimit={onChangeLimit}
                                                onClickFn={onClickPaginationItem}
                                                onPageChange={onPageChangeFunc}
                                                prevRange={prevRange}
                                            />
                                        </div>
                                    }

                                    {filteredList && filteredList.length == 0 &&
                                        <div className="noresult">
                                            <div className="text-center">
                                                <h5 className="mt-2">Sorry! No Result Found</h5>
                                            </div>
                                        </div>
                                    }

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {(() => {
                if (showAlert && showAlert.show && showAlert.type == "success") {
                    return (
                        <SweetAlert
                            success
                            title={showAlert.message}
                            onConfirm={() => toggleAlert({ show: false, type: 'success', message: '' })}
                            confirmBtnCssClass={'btn_15'}
                            onCancel={() => toggleAlert({ show: false, type: 'success', message: '' })}
                            showConfirm={true}
                            focusCancelBtn={false}
                            customClass={'i_alert fs-10'}
                            timeout={3000}
                        />
                    )
                } else if (showAlert && showAlert.show && showAlert.type == "danger") {
                    return (
                        <SweetAlert
                            danger
                            title={showAlert.message}
                            onConfirm={() => toggleAlert({ show: false, type: 'success', message: '' })}
                            confirmBtnCssClass={'btn_15'}
                            onCancel={() => toggleAlert({ show: false, type: 'success', message: '' })}
                            showConfirm={true}
                            focusCancelBtn={false}
                            customClass={'i_alert fs-10'}
                            timeout={3000}
                        />
                    )
                }
            })()}

            {(() => {
                if (modalType && modalType != "" && modalType != null) {

                    if (modalType == "view_documents") {
                        return (
                            <StackModal
                                show={openModal}
                                modalType={modalType}
                                hideModal={hideModal}
                                modalData={{ ...modalData, viewFile, fileType }}
                                formSubmit={null}
                                customClass="bottom"
                                cSize="sm"
                            />
                        );
                    }
                }

            })()}

            
        </React.Fragment>
    )

}

export default UserFeedbacks