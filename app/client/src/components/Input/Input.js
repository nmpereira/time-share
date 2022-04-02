import "./Input.css";
import PropTypes from "prop-types";

const Input = ({ href, text }) => {
  return (
    <header>
      <input id="" type="input" />
    </header>
  );
};
Input.propTypes = {
  text: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};
export default Input;
