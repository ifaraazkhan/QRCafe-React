import React from "react"
import MyErrorBoundary from "../../ErrorHandler/ErrorBoundary"

const PublicLayout = (props) => {
    return (
        <React.Fragment>
            <MyErrorBoundary>
                <div className="public_layout">{props.children}</div>
            </MyErrorBoundary>
        </React.Fragment>
    )
}

export default PublicLayout