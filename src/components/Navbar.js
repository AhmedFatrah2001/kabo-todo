import React, { useEffect, useState } from "react";
import {
  Disclosure,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import Notifications from "./NotificationBell";
import { Bars3Icon, UserIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTasks,
  faChartBar,
  faSignOutAlt,
  faUser,
  faHome,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const { logout } = useAuth();
  const [username, setUsername] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const userId = localStorage.getItem("userId");
  const isAdmin = localStorage.getItem("isAdmin") === "1";

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/dashboard/users/${userId}`
        );
        setUsername(response.data.username);
        if (response.data.profile_picture) {
          setProfilePicture(
            `data:image/jpeg;base64,${response.data.profile_picture}`
          );
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, [userId]);

  return (
    <Disclosure as="nav" className="bg-gray-900 shadow-lg">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block h-6 w-6" />
            </DisclosureButton>
          </div>

          {/* Main navigation */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex flex-shrink-0 items-center">
              <img
                alt="Logo"
                src="/assets/kabo.png"
                className="h-8 w-auto animate-spin-slow"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                <Link
                  to="/Home"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition-all"
                >
                  <FontAwesomeIcon icon={faHome} className="mr-2" />
                  Home
                </Link>
                <Link
                  to="/my-tasks"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition-all"
                >
                  <FontAwesomeIcon icon={faTasks} className="mr-2" />
                  My Tasks
                </Link>
                <Link
                  to="/all-tasks"
                  className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition-all"
                >
                  <FontAwesomeIcon icon={faChartBar} className="mr-2" />
                  All Tasks
                </Link>
                {isAdmin && (
                  <Link
                    to="/dashboard"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition-all"
                  >
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    Dashboard
                  </Link>
                )}

                {/* Tools Dropdown */}
                <Menu as="div" className="relative">
                  <MenuButton className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 transition-all">
                    Tools
                    <ChevronDownIcon
                      className="ml-2 h-5 w-5"
                      aria-hidden="true"
                    />
                  </MenuButton>

                  <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {[
                      "Dropbox",
                      "Assets Fetcher",
                      "Qr Code",
                      "Color Palette",
                    ].map((tool, idx) => (
                      <MenuItem key={idx}>
                        {({ active }) => (
                          <Link
                            to={`/${tool.replace(/\s+/g, "-").toLowerCase()}`}
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            {tool}
                          </Link>
                        )}
                      </MenuItem>
                    ))}
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>

          {/* User profile */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <Notifications />
            <Menu as="div" className="relative ml-3">
              <div>
                <MenuButton className="flex rounded-l-full rounded-r-full border-2 focus:outline-none  transition-all">
                  <span className="sr-only">Open user menu</span>
                  {profilePicture ? (
                    <img
                      alt="Profile"
                      src={profilePicture}
                      className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-gray-400" />
                  )}
                  <span className="ml-1 mr-2 text-white leading-8 p-1">
                    {username || "Loading..."}
                  </span>
                </MenuButton>
              </div>
              <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <MenuItem>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={logout}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    Logout
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          <DisclosureButton
            as={Link}
            to="/my-tasks"
            className="block text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-base font-medium"
          >
            My Tasks
          </DisclosureButton>
          <DisclosureButton
            as={Link}
            to="/all-tasks"
            className="block text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-base font-medium"
          >
            All Tasks
          </DisclosureButton>
          {isAdmin && (
            <DisclosureButton
              as={Link}
              to="/dashboard"
              className="block text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-base font-medium"
            >
              Dashboard
            </DisclosureButton>
          )}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
