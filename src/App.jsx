import { Routes, Route } from "react-router-dom";
import Sidebar from "./shared/Sidebar";
import Registration from "./components/Registration";
import ThankYou from "./components/ThankYou";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Sidebar />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/thankyou" element={<ThankYou />} />
    </Routes>
  );
}

export default App;