import LoaderImg from "./assets/images/loader.svg"
export const api = {
    API_URL: process.env.REACT_APP_API_URL,
    // API_URL: "http://localhost:8000",
};
export const configs = {
    DATE_SORT_ARR: ["date_expensed", "start_date", "end_date","clearance_date", "invoice_date","received_date","request_date","transaction_date"],
    LoaderImg: LoaderImg,
    QRPath: "https://happyvibes-assets.s3.amazonaws.com/HV-QRC"
}