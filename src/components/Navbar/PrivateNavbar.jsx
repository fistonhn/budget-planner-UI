import { useEffect, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { IoLogOutOutline } from "react-icons/io5";
import { SiAuthy } from "react-icons/si";
import { logoutAction } from "../../redux/slice/authSlice";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function PrivateNavbar() {
  const [selectedItem, setSelectedItem] = useState("");

  // Dispatch
  const dispatch = useDispatch();

  // Logout handler
  const logoutHandler = () => {
    dispatch(logoutAction());
    // Remove the user from storage
    localStorage.removeItem("userInfo");
    localStorage.removeItem("projectName");

  };

  // Handle Item Click
  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  return (
    <Disclosure as="nav" className="bg-white">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-start items-center">
              <div className="flex justify-center flex-row w-full">
                <div className="-ml-2 mr-2 flex items-left md:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex flex-shrink-0 items-center">
                  {/* Logo */}
                  <SiAuthy className="h-8 w-auto text-green-500" />
                </div>

                <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                    to="/dashboard"
                    onClick={() => handleItemClick("dashboard")}
                    className={`inline-flex items-center border-b-2 ${selectedItem === "dashboard" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/project"
                    onClick={() => handleItemClick("project")}
                    className={`inline-flex items-center border-b-2 ${selectedItem === "project" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}
                  >
                    Projects
                  </Link>
                  <Link
                    to="/income"
                    onClick={() => handleItemClick("income")}
                    className={`inline-flex items-center border-b-2 ${selectedItem === "income" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}
                  >
                    Income
                  </Link>
                </div>

                <div className="hidden md:ml-6 md:flex md:space-x-8">
                  <Link
                    to="/add-transaction"
                    onClick={() => handleItemClick("addTransaction")}
                    className={`inline-flex items-center border-b-2 ${selectedItem === "addTransaction" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}
                  >
                    Transactions
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => handleItemClick("profile")}
                    className={`inline-flex items-center border-b-2 ${selectedItem === "profile" ? "border-indigo-500 text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}
                  >
                    Profile
                  </Link>
                  
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <button
                    onClick={logoutHandler}
                    type="button"
                    className="relative m-2 inline-flex items-center gap-x-1.5 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                  >
                    <IoLogOutOutline className="h-5 w-5" aria-hidden="true" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navs private links */}
          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 pb-3 pt-2">
              <Link to="/dashboard" onClick={() => handleItemClick("dashboard")}>
                <Disclosure.Button
                  as="button"
                  className={`block border-l-4 ${selectedItem === "dashboard" ? "border-indigo-500 text-gray-700" : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"}`}
                >
                  My Dashboard
                </Disclosure.Button>
              </Link>
              <Link
                to="/project"
                onClick={() => handleItemClick("project")}
                className={`block border-l-4 ${selectedItem === "project" ? "border-indigo-500 text-gray-700" : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"}`}
              >
                Projects
              </Link>
              <Link
                to="/income"
                onClick={() => handleItemClick("income")}
                className={`block border-l-4 ${selectedItem === "income" ? "border-indigo-500 text-gray-700" : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"}`}
              >
                Income
              </Link>
              <Link to="/add-transaction" onClick={() => handleItemClick("addTransaction")}>
                <Disclosure.Button
                  as="button"
                  className={`block border-l-4 ${selectedItem === "addTransaction" ? "border-indigo-500 text-gray-700" : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"}`}
                >
                  Transactions
                </Disclosure.Button>
              </Link>
              <Link to="/profile" onClick={() => handleItemClick("profile")}>
                <Disclosure.Button
                  as="button"
                  className={`block border-l-4 ${selectedItem === "profile" ? "border-indigo-500 text-gray-700" : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"}`}
                >
                  Profile
                </Disclosure.Button>
              </Link>
  
            </div>
            
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
