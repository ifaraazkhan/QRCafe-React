import Footer from "../../Components/Partials/PublicFooter"
import PublicHeader from "../../Components/Partials/PublicHeader"
import logo from "../../assets/images/error400-cover.png";
const Page404 = (props) => {
  return (
    <>
      <div className="header_block">
          <PublicHeader />
        </div>
      <div className=" container-fluid">
        <section className="w-100">
          <div className="page404block d-flex align-items-center justify-content-center w-100">
            <img alt="404 img" src={logo} className="img-fluid page404_img" />
          </div>
        </section>
      </div>
      <Footer />
    </> 
  )
}

export default Page404