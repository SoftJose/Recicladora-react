import Header from "./Header.jsx";
import "./MainLayout.css";
import PropTypes from "prop-types";

function MainLayout({ children }) {
  return (
    <div id="main-layout" className="layout d-flex flex-column min-vh-100">
      <Header />
      <main className="layout__main flex-fill">{children}</main>
    </div>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node,
};

export default MainLayout;
