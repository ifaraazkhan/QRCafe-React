import React from "react";
import ErrorLayout from "../Components/Layouts/ErrorLayout";
import Page400 from "../pages/Error/Page400";

class MyErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false,error:null};
    }
  
    static getDerivedStateFromError(error) {
      // Update state so the next render will show the fallback UI.
      if(error){
        return { hasError: true,error: error }
      }
      
    }
  
    componentDidCatch(error, errorInfo) {
      // You can also log the error to an error reporting service
    //   logErrorToMyService(error, errorInfo);
    }
  
    render() {
      if (this.state.hasError) {
        // You can render any custom fallback UI
        return (
          <>
            <ErrorLayout>
                <Page400 />
            </ErrorLayout>
          </>
        );
      }else{
        return this.props.children; 
      }
    }
}
export default MyErrorBoundary