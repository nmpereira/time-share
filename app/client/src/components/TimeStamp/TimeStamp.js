import "./TimeStamp.css";
import PropTypes from "prop-types";

const TimeStamp = ({ time }) => {
  return (
    <header>
      <h1>{time}</h1>
    </header>
  );
};

TimeStamp.defaultProps = {
  time: "00:00:00",
};

TimeStamp.propTypes = {
  time: PropTypes.string.isRequired,
};

export default TimeStamp;
