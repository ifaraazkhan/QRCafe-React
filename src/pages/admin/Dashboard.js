import React, { useContext, useEffect, useState } from "react";
import {Input , Label, Card, Container, Row, Col, Nav, NavDropdown, Tab} from '../../Helpers/UiHelper'

import { AuthContext } from "../../ContextProvider/AuthContext";
import C_MSG from "../../Helpers/MsgsList";
import { _Id, setDocumentTitle } from "../../Helpers/Helper";
import { ApiService } from "../../Services/ApiService";
import SweetAlert from "react-bootstrap-sweetalert";

const Dashboard = (props) => {
    const {user:authUser = null, isSuperAdmin = false} = useContext(AuthContext)
    const user = authUser?.user || {}
    const userId = user.user_id || null

    const [dashboardData, setDashboardData] = useState({})
    const [accountId, setAccountId] = useState(null)
    const [accounts, setAccounts] = useState([])

    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        setDocumentTitle(C_MSG.user_Dashboard_page_title)
    }, [])
    useEffect(() => {
        getAccounts()
    }, [])


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
            const el = _Id("selectAcc")
            if(el){
                console.log(el)
                const accId =  data[0].account_id;
                el.value = accId
                onChangeAccount(accId)
            }
        }else{
            toggleAlert({ show: true, type: 'danger', message: res.message })
        }
    }

    const onChangeAccount = async (accId = null) => {
        if(accId == null){
            return false
        }
        getDashboard(accId)
    }

    const getDashboard = async (accId) => {
        if(accId == null){
            return false
        }
        const payloadUrl = `admin/getDashboard/${accId}`
        const method = "GET"

        const res = await ApiService.fetchData(payloadUrl,method)
        if(res && process.env.REACT_APP_API_SC_CODE.includes(res.status_code)){
            let data = res.results[0]
            setDashboardData(oldVal => ({...data}))
        }
    }

    const toggleAlert = (val) => {
        setShowAlert(val)
    }

    return (
        <React.Fragment>
            
            <div className="page-content  mt-4 pt-5">
                <div className="">
                    <div className="row">
                        <div className="col-12">
                            <div className="listjs-table mt-3" id="customerList">
                                <div className="row m-0">
                                    <div className="col-sm-auto w320 px-0">
                                        <div className="form-group">
                                            <select id={"selectAcc"} className="form-control fw-600" onChangeCapture={(e) => onChangeAccount(e.target.value)}>
                                                <option value={''}>Select Account</option>
                                                {accounts && accounts.length > 0 && React.Children.toArray(accounts.map((item, uKey) => {
                                                    return <option value={item.account_id}>{item.title}</option>
                                                }))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                
                            </div>
                        </div>

                    </div>
                </div>
                <div className="row">
                    <div className="col-xl-3 col-md-6">
                        <div className="card card-animate">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1 overflow-hidden">
                                        <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Total Views</p>
                                    </div>
                                    
                                </div>
                                <div className="d-flex align-items-end justify-content-between mt-4">
                                    <div>
                                        <h4 className="fs-22 fw-semibold ff-secondary mb-4"><span className="counter-value" >{dashboardData?.view_counter}</span></h4>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-md-6">
                        <div className="card card-animate">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1 overflow-hidden">
                                        <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Total Feedbacks Received </p>
                                    </div>
                                    
                                </div>
                                <div className="d-flex align-items-end justify-content-between mt-4">
                                    <div>
                                        <h4 className="fs-22 fw-semibold ff-secondary mb-4"><span className="counter-value" >{dashboardData?.feedback_count}</span></h4>
                                        
                                    </div>
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
        </React.Fragment>
    )

}

export default Dashboard