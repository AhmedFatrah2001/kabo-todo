import { useState } from 'react';
import { useAuth } from '../components/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '' });
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = { username: '', password: '' };

    if (!username) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';

    setErrors(newErrors);

    if (!newErrors.username && !newErrors.password) {
      try {
        const response = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('userId', data.id);
          localStorage.setItem('username', data.username);
          localStorage.setItem('isAdmin', data.isAdmin);
          localStorage.setItem('token', data.token);
          login(data.token);
        } else {
          setErrors({ ...newErrors, username: 'Invalid credentials' });
          setTimeout(() => setErrors({ ...newErrors, username: '' }), 4000);
        }
      } catch (error) {
        console.error('Error logging in:', error);
        setErrors({ ...newErrors, username: 'Error logging in' });
        setTimeout(() => setErrors({ ...newErrors, username: '' }), 4000);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center items-center px-6 py-12 lg:px-8">
      <div className="relative bg-white/80 backdrop-blur-lg shadow-lg rounded-lg p-8 w-full max-w-md min-w-[300px]">
        <div className="text-center">
          <img
            alt="Kabo Logo"
            src="/assets/kabo.png"
            className="mx-auto h-24 w-24 rounded-full bg-black p-1"
          />
          <h2 className="mt-4 text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={`block w-full rounded-lg border ${errors.username ? 'border-red-500' : 'border-gray-300'} bg-white py-2 px-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`block w-full rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} bg-white py-2 px-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm`}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          </div>

          {Object.values(errors).some((error) => error) && (
            <div className="mt-4 rounded-md bg-red-500 p-3 text-white text-sm shadow-sm">
              <p>{errors.username || errors.password}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
