import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Summarizer from './pages/Summarizer.jsx';
import History from './pages/History.jsx';
import SummaryDetails from './pages/SummaryDetails.jsx';
import Help from './pages/Help.jsx';

function NotFound() {
  return (
    <div className="empty">
      <h1>We couldn't find that page</h1>
      <p>The link may be old or mistyped.</p>
      <Link className="btn" to="/">Back to Home</Link>
    </div>
  );
}

export default function App() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Navbar />
      <main id="main" className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/summarize" element={<Summarizer />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:id" element={<SummaryDetails />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
