import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import MyTasks from './pages/MyTasks';
import AllTasks from './pages/AllTasks';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import DropboxPage from './pages/DropboxPage';
import HomePage from './pages/HomePage';
import { AuthProvider, useAuth } from './components/AuthContext';
import AssetFetcherPage from './pages/AssetFetcherPage';
import QRCodeGenerator from './components/QRCodeGenerator';
import ColorPalettePicker from './components/ColorPalettePicker';


const ProtectedRoute = ({ element: Component, adminOnly, ...rest }) => {
  const { isAuthenticated } = useAuth();
  const isAdmin = localStorage.getItem("isAdmin") === "1";

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/my-tasks" />;
  }

  return <Component {...rest} />;
};
function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-100">
      {!isLoginPage && <Navbar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<ProtectedRoute element={HomePage} />} />
        <Route path="/my-tasks" element={<ProtectedRoute element={MyTasks} />} />
        <Route path="/all-tasks" element={<ProtectedRoute element={AllTasks} />} />
        <Route path="/profile" element={<ProtectedRoute element={Profile} />} />
        <Route path="/dropbox" element={<ProtectedRoute element={DropboxPage} />} /> 
        <Route path="/assets-fetcher" element={<ProtectedRoute element={AssetFetcherPage} />} /> 
        <Route path="/qr-code" element={<ProtectedRoute element={QRCodeGenerator} />} />
        <Route path="/color-palette" element={<ProtectedRoute element={ColorPalettePicker} />} />
        <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} adminOnly />} />
      </Routes>
    </div>
  );
}

export default function Root() {
  return (
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
}
