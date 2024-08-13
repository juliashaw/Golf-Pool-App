import Header from "./components/Header";
import NavigationBar from "./components/NavigationBar";
import Footer from "./components/Footer";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import PlayerSalaries from "./pages/PlayerSalaries";
import Rules from "./pages/Rules";
import Home from "./pages/Home";
import Teams from "./pages/Teams";
import Standings from "./pages/Standings";
import AboutTheDeveloper from "./pages/AboutTheDeveloper";
import PasswordProtected from "./pages/PasswordProtected.tsx";

function App() {
  return (
    <div className="components">
      <Header />
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/player-salaries" element={<PlayerSalaries />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/about-the-developer" element={<AboutTheDeveloper />} />
        <Route path="/passwordProtected" element={<PasswordProtected />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
