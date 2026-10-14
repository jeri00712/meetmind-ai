import { NavLink, Link } from 'react-router-dom';
import Logo from './Logo.jsx';

const links = [
  ['/', 'Home', '🏠'],
  ['/summarize', 'Summarize', '✍️'],
  ['/history', 'History', '🗂️'],
  ['/help', 'Help', '💡'],
];

export default function Navbar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" aria-label="MeetMind AI home"><Logo /></Link>
        <nav aria-label="Main" className="nav">
          {links.map(([to, label, icon]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
