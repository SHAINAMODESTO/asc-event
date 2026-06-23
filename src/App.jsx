import { Routes, Route } from "react-router-dom";
import Sidebar from "./shared/Sidebar";
import Registration from "./components/Registration";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Sidebar />} />
      <Route path="/registration" element={<Registration />} />
    </Routes>
  );
}

export default App;