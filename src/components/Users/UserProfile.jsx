// import React, { useEffect, useState } from "react";
// import { FaUserCircle, FaEnvelope, FaLock } from "react-icons/fa";
// import { useFormik } from "formik";
// import { useMutation } from "@tanstack/react-query";
// import UpdatePassword from "./UpdatePassword";
// import { updateProfileAPI } from "../../services/users/userService";
// import AlertMessage from "../Alert/AlertMessage";

// const UserProfile = () => {
//   // Assuming user is passed as a prop (username, email)

//   const [initialValues, setInitialValues] = useState({
//     username: '',
//     email: '',
//   });

//   const userInfo = localStorage.getItem("userInfo");
//   const parsedUserInfo = JSON.parse(userInfo);

//   console.log('userInfo', parsedUserInfo.username);


//   useEffect(() => {
//       setInitialValues({
//         username: parsedUserInfo.username || '',
//         email: parsedUserInfo.email || '',
//       });
//   }, [userInfo]);

//   // Mutation for updating profile
//   const { mutateAsync, isPending, isError, error, isSuccess } = useMutation({
//     mutationFn: updateProfileAPI,
//     mutationKey: ["change-password"],
//   });

//   const formik = useFormik({
//     initialValues: initialValues,
//     enableReinitialize: true, // This is important to ensure values update when user prop changes

//     onSubmit: (values) => {
//       mutateAsync(values)
//         .then((data) => {
//           console.log(data);
//         })
//         .catch((e) => console.log(e));
//     },
//   });

//   return (
//     <>
//       <div className="max-w-3xl mx-auto my-10 p-8 bg-white rounded-xl shadow-lg">
//         <h1 className="mb-6 text-3xl font-extrabold text-center text-gray-800">
//           Welcome Back!
//         </h1>
//         <h3 className="text-xl font-semibold text-gray-700 mb-6">Update Profile</h3>

//         {/* Display message */}
//         {isPending && <AlertMessage type="loading" message="Updating...." />}
//         {isError && (
//           <AlertMessage type="error" message={error.response?.data?.message || "An error occurred"} />
//         )}
//         {isSuccess && (
//           <AlertMessage type="success" message="Profile updated successfully!" />
//         )}

//         <form onSubmit={formik.handleSubmit} className="space-y-6">
//           {/* Username Field */}
//           <div className="flex items-center space-x-4">
//             <FaUserCircle className="text-3xl text-gray-400" />
//             <div className="flex-1">
//               <label htmlFor="username" className="text-sm font-medium text-gray-700">
//                 Username
//               </label>
//               <input
//                 {...formik.getFieldProps("username")}
//                 type="text"
//                 id="username"
//                 className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Your username"
//               />
//             </div>
//             {formik.touched.username && formik.errors.username && (
//               <span className="text-xs text-red-500">{formik.errors.username}</span>
//             )}
//           </div>

//           {/* Email Field */}
//           <div className="flex items-center space-x-4">
//             <FaEnvelope className="text-3xl text-gray-400" />
//             <div className="flex-1">
//               <label htmlFor="email" className="text-sm font-medium text-gray-700">
//                 Email
//               </label>
//               <input
//                 {...formik.getFieldProps("email")}
//                 type="email"
//                 id="email"
//                 className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Your email"
//               />
//             </div>
//             {formik.touched.email && formik.errors.email && (
//               <span className="text-xs text-red-500">{formik.errors.email}</span>
//             )}
//           </div>

//           {/* Save Changes Button */}
//           <div className="flex justify-end mt-6">
//             <button
//               type="submit"
//               className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
//             >
//               Save Changes
//             </button>
//           </div>
//         </form>
//       </div>
//       <UpdatePassword />
//     </>
//   );
// };

// export default UserProfile;


import React, { useEffect, useState } from "react";
import { FaUserCircle, FaEnvelope, FaLock } from "react-icons/fa";
import { useFormik } from "formik";
import { useMutation } from "@tanstack/react-query";
import UpdatePassword from "./UpdatePassword";
import { updateProfileAPI } from "../../services/users/userService";
import AlertMessage from "../Alert/AlertMessage";

const UserProfile = () => {
  const [initialValues, setInitialValues] = useState({
    username: '',
    email: '',
    password: '',
  });

  const userInfo = localStorage.getItem("userInfo");
  const parsedUserInfo = JSON.parse(userInfo);

  useEffect(() => {
    setInitialValues({
      username: parsedUserInfo.username || '',
      email: parsedUserInfo.email || '',
      password: '',  // password will remain empty for the update form
    });
  }, [userInfo]);

  // Mutation for updating profile
  const { mutateAsync, isPending, isError, error, isSuccess } = useMutation({
    mutationFn: updateProfileAPI,
    mutationKey: ["change-password"],
  });

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true, // This is important to ensure values update when user prop changes
    onSubmit: (values) => {
      mutateAsync(values)
        .then((data) => {
          console.log(data);
        })
        .catch((e) => console.log(e));
    },
  });

  return (
    <>
      <div className="max-w-3xl mx-auto my-10 p-8 bg-white rounded-xl shadow-lg">
        <h1 className="mb-6 text-3xl font-extrabold text-center text-gray-800">
          Welcome Back, {parsedUserInfo.username}!
        </h1>
        <h3 className="text-xl font-semibold text-gray-700 mb-6">Profile Details</h3>

        {/* Display message */}
        {isPending && <AlertMessage type="loading" message="Updating...." />}
        {isError && (
          <AlertMessage type="error" message={error.response?.data?.message || "An error occurred"} />
        )}
        {isSuccess && (
          <AlertMessage type="success" message="Profile updated successfully!" />
        )}

        <div className="space-y-6">
          {/* Username Display */}
          <div className="flex items-center space-x-4">
            <FaUserCircle className="text-3xl text-gray-400" />
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>
              <p className="mt-1 text-gray-800">{parsedUserInfo.username}</p>
            </div>
          </div>

          {/* Email Display */}
          <div className="flex items-center space-x-4">
            <FaEnvelope className="text-3xl text-gray-400" />
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-gray-800">{parsedUserInfo.email}</p>
            </div>
          </div>

          {/* Password Field for Update */}
          <UpdatePassword />

          {/* Save Changes Button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
