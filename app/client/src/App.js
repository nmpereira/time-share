// import logo from "./logo.svg";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import TimerView from "./views/TimerView";
import ResetView from "./views/ResetView";
import InputView from "./views/InputView";
import NavBar from "./components/Layout/NavBar";
// import Button from "../components/Button/Button";
import "./App.css";
import Layout from "./components/Layout/Layout";

const App = () => {
  return (
    <div className="App">
      <NavBar />
      <header className="App-header">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/reset/:id" element={<TimerView />} />
            <Route index element={<InputView />} />
            <Route path="/timer" element={<TimerView />} />
            <Route path="/reset" element={<ResetView />} />
          </Route>

          {/* <Button text="reset" href="/reset" /> */}
        </Routes>
      </header>
    </div>
  );
};

export default App;
