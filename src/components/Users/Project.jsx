import React, { useState, useEffect } from "react";
import axios from 'axios';
import { BASE_URL } from "../../utils/url";
import { getUserFromStorage } from "../../utils/getUserFromStorage";
import ImportBOQ from "./Budget";
import AlertMessage from "../Alert/AlertMessage";

const token = getUserFromStorage();

const ProjectBOQ = () => {
  const [activeTab, setActiveTab] = useState("projects"); // Default view
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    projectCode: "",
    startDate: "",
    endDate: "",
    location: "",
    manager: "",
    description: "",
  });
  const [projects, setProjects] = useState([]);

  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/projects/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response?.data?.myProjects);
    } catch (err) {
      console.error("Error fetching Projects", err);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Reset form fields after submission
  const resetForm = () => {
    setFormData({
      name: "",
      projectCode: "",
      startDate: "",
      endDate: "",
      location: "",
      manager: "",
      description: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.location) {
      setErrorMessage("Please fill in all required fields!");
      setIsError(true);

      setTimeout(() => {
        setErrorMessage("");
        setIsError(false);
     }, 3000);

      return;
    }

    // Prepare data for submission
    const projectData = {
      name: formData.name,
      projectCode: formData.projectCode,
      startDate: formData.startDate,
      endDate: formData.endDate,
      location: formData.location,
      manager: formData.manager,
      description: formData.description,
    };

    console.log("projectData", projectData);

    try {
      setIsLoading(true);
      await axios.post(`${BASE_URL}/projects/create`, projectData,
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      setIsSuccess(true);
      setSuccessMessage("Project created successfully");
      resetForm();
      fetchProjects();

      setTimeout(() => {
        setIsSuccess(false); 
        setSuccessMessage(" ");

        setFormData(prevKey => prevKey + 1);
      }, 3000);
      
    } catch (error) {
      setIsLoading(false);
      setErrorMessage("Project Name already existed!");
      setIsError(true);

      setTimeout(() => {
        setIsError(false);
      }, 3000);
      console.error("There was an error creating the transaction:", error);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };
  

  return (
    <div className="p-4 md:p-6 w-full max-w-6xl mx-auto">
      {/* Buttons Section */}
      <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded-lg text-white bg-[#003366]`}
          onClick={() => setActiveTab("projects")}
        >
          Projects
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-white bg-[#003366]`}
          onClick={() => setActiveTab("importBOQ")}
        >
          Import Contract BOQ
        </button>
      </div>

      <div className='alert-message-container'>
        {isError && (
            <AlertMessage
              type="error"
              message={errorMessage}
            />                                                                                        )}
        {isSuccess && (
            <AlertMessage
              type="success"
              message={successMessage}
            />
        )}
        {isLoading ? <AlertMessage type="loading" message="Loading" /> : null}
      </div>

      {/* Content Section */}
      <div className="border rounded-lg bg-white shadow w-full">
        {/* Projects List */}
        {activeTab === "projects" && (
          <div className="p-4">
            <div className="flex flex-wrap justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Available Projects</h2>
              <button
                className="px-4 py-2 bg-[#003366] text-white rounded-lg"
                onClick={() => setIsModalOpen(true)}
              >
                Create
              </button>
            </div>
            {projects.length > 0 ? (
              <table className="min-w-full table-auto border-collapse border border-gray-300">
                <thead className="bg-[#003366] text-white">
                  <tr>
                    <th className="px-4 py-2 border border-gray-300">Project Code</th>
                    <th className="px-4 py-2 border border-gray-300">Project Name</th>
                    <th className="px-4 py-2 border border-gray-300">Location</th>
                    <th className="px-4 py-2 border border-gray-300">Start Date</th>
                    <th className="px-4 py-2 border border-gray-300">End Date</th>
                    <th className="px-4 py-2 border border-gray-300">Project Manager</th>
                    <th className="px-4 py-2 border border-gray-300">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {projects
                  ?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  ?.map((project) => (
                    <tr key={project.id} className="bg-gray-50 hover:bg-gray-100">
                      <td className="px-4 py-2 border border-gray-300">{project.projectCode}</td>
                      <td className="px-4 py-2 border border-gray-300">{project.name}</td>
                      <td className="px-4 py-2 border border-gray-300">{project.location}</td>
                      <td className="px-4 py-2 border border-gray-300">{formatDate(project.startDate)}</td>
                      <td className="px-4 py-2 border border-gray-300">{formatDate(project.endDate)}</td>
                      <td className="px-4 py-2 border border-gray-300">{project.manager}</td>
                      <td className="px-4 py-2 border border-gray-300">{project.description || "No description"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No projects available.</p>
            )}
          </div>
        )}


        {/* Import BOQ Section */}
        {activeTab === "importBOQ" && <div className="p-0"><ImportBOQ /></div>}
      </div>

      {/* Create Project Popup Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Create a New Project</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block mb-2">Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                    placeholder="Enter name"
                    required
                  />
                </div>

                {/* Project Code (Optional) */}
                <div>
                  <label className="block mb-2">Project Code:</label>
                  <input
                    type="text"
                    name="projectCode"
                    value={formData.projectCode}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                    placeholder="Enter project code (optional)"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block mb-2">Start Date:</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block mb-2">End Date:</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block mb-2">Location:</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                    placeholder="Enter location"
                    required
                  />
                </div>

                {/* Project Manager (Optional) */}
                <div>
                  <label className="block mb-2">Project Manager:</label>
                  <input
                    type="text"
                    name="manager"
                    value={formData.manager}
                    onChange={handleChange}
                    className="border p-2 w-full rounded"
                    placeholder="Enter project manager (optional)"
                  />
                </div>
              </div>

              {/* Description (Full Width) */}
              <div className="mt-4">
                <label className="block mb-2">Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                  placeholder="Enter project description (optional)"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#003366] text-white rounded">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectBOQ;
