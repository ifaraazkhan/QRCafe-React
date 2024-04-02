
import React, { useContext, useEffect, useRef, useState } from "react";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from "moment";

// import 'react-date-range/dist/styles.css'; // main style file
// import 'react-date-range/dist/theme/default.css'; // theme css file
import { ChangeDateFormat, FormatDate } from "../../Helpers/Helper";

const StackCalender = (props) => {
    let { type = 'date', sDate = null, eDate = null, markDate = null, aClass = '', changeFn = null, autoApply=false, defaultSettings = {}, dateFormat = "YYYY-MM-DD",setCurrentDate = false,showOldDate = false } = props

    
    const now = new Date()
    const numDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    let stDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    stDate = `${stDate.getFullYear()}-${('00' + stDate.getMonth()).slice(-2)}-${('00' + stDate.getDate()).slice(-2)}`
    let edDate = new Date(now.getFullYear(), now.getMonth() + 1, numDays)
    edDate = `${edDate.getFullYear()}-${('00' + edDate.getMonth()).slice(-2)}-${('00' + edDate.getDate()).slice(-2)}`
    const [startDate, setStartDate] = useState(FormatDate(null, stDate, 1))
    const [endDate, setEndDate] = useState(FormatDate(null, edDate, 1))
    const myRef = useRef();
    const [calInitSettings, setCalInitSettings] = useState({})

    useEffect(() => {
        if (Object.keys(calInitSettings).length == 0) {
            getInitialSettings()
        }


    })


    useEffect(() => {
        if (sDate || eDate || markDate) {
            let calStartDate = sDate ? ChangeDateFormat(sDate, 2, 2) : (markDate ? ChangeDateFormat(markDate, 2, 2) : FormatDate(null, stDate, 1))
            let calEndDate = eDate ? ChangeDateFormat(eDate, 2, 2) : (markDate ? ChangeDateFormat(markDate, 2, 2) : FormatDate(null, edDate, 1))
            if (startDate != calStartDate) {
                setStartDate(calStartDate)
                myRef.current?.setStartDate(calStartDate)
            }
            if (endDate != calEndDate) {
                setEndDate(calEndDate)
                myRef.current?.setEndDate(calEndDate)
            }
        }

    }, [sDate, eDate, markDate])




    const selectionRange = {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }

    const _ = (el) => {
        return document.getElementById(el);
    }


    const fetchData = (ev, picker = null) => {
        let sDate = startDate
        let eDate = endDate
        if (type == 'daterange') {
            sDate = `${picker.startDate.format(dateFormat)}`
            eDate = `${picker.endDate.format(dateFormat)}`
        } else {
            sDate = `${picker.startDate.format(dateFormat)}`
            eDate = null
        }
        changeFn(sDate, eDate)
    }
    const getInitialSettings = () => {
        let calStDate = startDate;
        let calEndDate = endDate

        if (sDate || eDate || markDate) {
            calStDate = sDate ? ChangeDateFormat(sDate, 2, 2) : (markDate ? ChangeDateFormat(markDate, 2, 2) : FormatDate(null, stDate, 1))
            calEndDate = eDate ? ChangeDateFormat(eDate, 2, 2) : (markDate ? ChangeDateFormat(markDate, 2, 2) : FormatDate(null, edDate, 1))
            if (startDate != calStDate) {

            }
            if (endDate != calEndDate) {

            }
        }
        if (setCurrentDate) {
            calStDate = ChangeDateFormat(now, 2, 2)
            setStartDate(calStDate)
        }

        setStartDate(calStDate)

        setEndDate(calEndDate)
        let obj = { startDate: calStDate, endDate: calEndDate, singleDatePicker: true, autoUpdateInput: true, autoApply }
        if(type == "date" && !showOldDate){
            obj.minDate = (defaultSettings && defaultSettings.minDate && ChangeDateFormat(defaultSettings.minDate, 2, 2)) || obj.startDate
        }
        setCalInitSettings(oldVal => {
            return { ...obj }
        })
        return obj;
    }
    if (type == 'date') {
        return (
            <React.Fragment>
                {(() => {
                    if (Object.keys(calInitSettings).length > 0) {
                        return <DateRangePicker
                            ref={myRef}
                            initialSettings={calInitSettings}
                            onApply={fetchData}
                        >
                            {
                                props.children
                                    ? props.children
                                    : <input id="dateCalender" type="text" className={`form-control border-0 ${aClass}`} name="date" placeholder="Select Date" />
                            }

                        </DateRangePicker>
                    }
                })()}

            </React.Fragment>

        )

    } else if (type == 'daterange') {
        return (<DateRangePicker
            initialSettings={{startDate:moment().startOf("month"),endDate:moment().endOf("month"),ranges: selectionRange,...defaultSettings }}
            onApply={fetchData}
        >
            {
                props.children
                    ? props.children
                    :<input id="drpicker" type="text" className={`form-control border-0 ${aClass}`} name="date" placeholder="Select Date" />
            }
        </DateRangePicker>)
    } else if (type == 'custom') {
        return (
            <DateRangePicker
                initialSettings={defaultSettings}
                onApply={fetchData}
            >
                {
                    props.children
                        ? props.children
                        : <input id="dateCalender" type="text" className={`form-control border-0 ${aClass}`} name="date" placeholder="Select Date" />
                }
            </DateRangePicker>
        )
    }
}





export default StackCalender