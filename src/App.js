import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import MyTasks from './pages/MyTasks';
import AllTasks from './pages/AllTasks';
import Profile from './pages/Profile';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-100">
      {!isLoginPage && <Navbar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/all-tasks" element={<AllTasks />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}
