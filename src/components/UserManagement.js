import React, { useState, useEffect } from "react";
import UserModal from "./UserModal";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
  });
  const [showEmail, setShowEmail] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/dashboard/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
    };

    if (!newUser.username) newErrors.username = "Username is required";
    if (!newUser.password) newErrors.password = "Password is required";
    if (newUser.password !== newUser.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (showEmail && !newUser.email) newErrors.email = "Email is required";

    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => !error)) {
      try {
        const response = await fetch(
          "http://localhost:5000/dashboard/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: newUser.username,
              password: newUser.password,
              isAdmin: false,
              email: showEmail ? newUser.email : null,
            }),
          }
        );

        if (response.ok) {
          setNewUser({
            username: "",
            password: "",
            confirmPassword: "",
            email: "",
          });
          setShowEmail(false);
          fetchUsers();
        } else {
          console.error("Failed to create user");
        }
      } catch (error) {
        console.error("Error creating user:", error);
      }
    }
  };

  const handleHover = (index) => {
    const updatedUsers = [...users];
    updatedUsers[index].showPassword = true;
    setUsers(updatedUsers);
  };

  const handleMouseLeave = (index) => {
    const updatedUsers = [...users];
    updatedUsers[index].showPassword = false;
    setUsers(updatedUsers);
  };

  const handleRowClick = (user) => {
    if (!user.isAdmin) {
      setSelectedUser(user);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    fetchUsers();
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 flex space-x-6">
      <form onSubmit={handleSubmit} className="w-1/3 space-y-4">
        <h2 className="text-2xl font-bold">Add New User</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            value={newUser.username}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            className={`block w-full p-2 border ${
              errors.username ? "border-red-500" : "border-gray-300"
            } rounded-md`}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
            className={`block w-full p-2 border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } rounded-md`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            value={newUser.confirmPassword}
            onChange={(e) =>
              setNewUser({ ...newUser, confirmPassword: e.target.value })
            }
            className={`block w-full p-2 border ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            } rounded-md`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={showEmail}
            onChange={(e) => setShowEmail(e.target.checked)}
            className="mr-2"
          />
          <label className="text-sm font-medium text-gray-700">
            Alert user via email
          </label>
        </div>
        {showEmail && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              className={`block w-full p-2 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-md`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
        )}
        <button
          type="submit"
          className="w-full p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
        >
          Add User
        </button>
      </form>

      <div className="w-2/3">
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <table className="min-w-full bg-white border border-gray-200 rounded-md">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border-b text-center">ID</th>
              <th className="p-2 border-b text-center">Username</th>
              <th className="p-2 border-b text-center">Password</th>
              <th className="p-2 border-b text-center">Created At</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, index) => (
              <tr
                key={user.id}
                className={`hover:bg-gray-100 cursor-pointer ${
                  user.isAdmin ? "cursor-not-allowed" : ""
                }`}
                onClick={() => handleRowClick(user)}
              >
                <td className="p-2 border-b text-center">{user.id}</td>
                <td className="p-2 border-b text-center flex items-center justify-center">
                  {user.username}{" "}
                  {user.isAdmin ? (
                    <span className="text-yellow-500 ml-2">★</span>
                  ) : null}
                </td>
                <td
                  className="py-2 px-4 text-center relative"
                  onMouseEnter={() => handleHover(index)}
                  onMouseLeave={() => handleMouseLeave(index)}
                >
                  {user.showPassword ? (
                    <span>{user.password}</span>
                  ) : (
                    "••••••••"
                  )}
                </td>
                
                <td className="p-2 border-b text-center">
                  {new Date(user.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="space-x-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-2 py-1 rounded ${
                  currentPage === index + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedUser && (
        <UserModal user={selectedUser} onClose={closeModal} />
      )}
    </div>
  );
};

export default UserManagement;
