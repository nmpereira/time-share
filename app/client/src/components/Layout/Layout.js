import NavBar from "./NavBar";
import { Outlet, Link } from "react-router-dom";
const Layout = () => {
  return (
    <>
      {/* <Link to="/">Home</Link>
      <Link to="/reset">reset</Link>
      <Link to="/timer">timer</Link> */}
      <Outlet />
    </>
  );
};

export default Layout;
