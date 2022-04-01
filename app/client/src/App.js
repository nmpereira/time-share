import logo from "./logo.svg";
import "./App.css";
import TimeStamp from "./components/TimeStamp/TimeStamp";
import Button from "./components/Button/Button";
import PropTypes from "prop-types";

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <TimeStamp time="00:00" />
        <Button text="start" href="#" />
        <Button text="stop" href="#" />
        <Button text="reset" href="#" />
      </header>
    </div>
  );
};

TimeStamp.defaultProps = {
  time: "00:00:00",
};

TimeStamp.propTypes = {
  time: PropTypes.string.isRequired,
};
Button.propTypes = {
  text: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};

export default App;
