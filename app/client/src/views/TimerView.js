import TimeStamp from "../components/TimeStamp/TimeStamp";
import Button from "../components/Button/Button";

const TimerView = () => {
  return (
    <>
      <TimeStamp time="00:00" />
      <Button text="Pause" href="#" />
      <Button text="Resume" href="#" />
      <Button text="Reset" href="#" />
      <Button text="Share" href="#" />
      <Button text="Back" href="#" />
    </>
  );
};

export default TimerView;
