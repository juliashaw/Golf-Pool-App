import { Link } from "react-router-dom";

function NavigationBar() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/teams">Teams</Link>
        </li>
        <li>
          <Link to="/standings">Standings</Link>
        </li>
        <li>
          <Link to="/player-salaries">Player Salaries</Link>
        </li>
        <li>
          <Link to="/rules">Rules</Link>
        </li>
      </ul>
    </nav>
  );
}
export default NavigationBar;
