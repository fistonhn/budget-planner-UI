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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectInfo, setProjectInfo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [accessRight, setAccessRight] = useState("");
  const [projectId, setProjectId] = useState(null);
  const [projectName, setProjectName] = useState("")
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

  const handleAssign = (id, projectName) => {
    setProjectId(id); // Save the project ID
    setShowModal(true); // Open the modal
    setProjectName(projectName)
  };

  const handleSubmitAssigns = async(e) => {
    e.preventDefault();
    if (!email || !accessRight) {
      setErrorMessage("Both fields are required!");
      setIsError(true);
      return;
    }
    console.log("Assigned Project ID:", projectId);
    console.log("User Email:", email);
    console.log("Access Right:", accessRight);
    console.log("projectName", projectName)

    const assignData = {
      userEmail: email,
      accessRight: accessRight,
      projectId: projectId,
      projectName: projectName,
    }
    try {
     setIsLoading(true);
     const assigningProject = await axios.post(`${BASE_URL}/users/assignProject`, assignData,
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('assigningProject', assigningProject)

      setIsLoading(false);
      setIsSuccess(true);
      setSuccessMessage(assigningProject.data.message);
      fetchProjects();

      setAccessRight("")
      setEmail("")

      setTimeout(() => {
        setIsSuccess(false); 
        setSuccessMessage(" ");

        setFormData(prevKey => prevKey + 1);
      }, 3000);
      
    } catch (error) {
      console.log('error', error.response.data.message)

      setIsLoading(false);
      setErrorMessage(error.response.data.message);
      setIsError(true);

      setTimeout(() => {
        setIsError(false);
      }, 4000);
      console.error("There was an error creating the transaction:", error);
    }
  };

  const showHandleDelete = (project) => {
    setShowDeleteModal(true);
    setProjectInfo(project);
  }

  const handleDelete = async () => {
      try {
        // console.log(`vvvvv ${BASE_URL}/projects/delete/${projectInfo._id}`);
        setIsLoading(true);
  
        await axios.delete(`${BASE_URL}/projects/delete/${projectInfo._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setShowDeleteModal(false);
        setIsLoading(false);
        setIsSuccess(true);
        setSuccessMessage("Project deleted successfully");
        localStorage.removeItem("projectName");
        fetchProjects();
  
  
        setTimeout(() => {
          setIsSuccess(false); 
       }, 3000);
  
  
        fetchTransactionData();
      } catch (error) {
        setIsLoading(false);
        setErrorMessage(error.response.data.message);
        setIsError(true);
  
        setTimeout(() => {
          setIsError(false);
  
        }, 5000);
      }
    }; 
  

  return (
    <div style={{
      padding: '1rem',
      '@media (min-width: 768px)': { padding: '1.5rem' },
      maxWidth: '88%',
      minWidth: '30%',
      marginLeft: '3%',
      marginRight: '5%'
    }}>    
      {/* Buttons Section */}

      <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded-lg text-white ${
            activeTab === "projects" ? "bg-blue-600" : "bg-[#003366]"
          }`}
          onClick={() => setActiveTab("projects")}
        >
          Projects
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-white ${
            activeTab === "importBOQ" ? "bg-blue-600" : "bg-[#003366]"
          }`}
          onClick={() => setActiveTab("importBOQ")}
        >
          Import Contract BOQ
        </button>
      </div>


      <div className='alert-message-container' style={{zIndex: '100000'}}>
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
              <h2 className="text-xl font-bold">All Projects</h2>
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
                    <th className="px-4 py-2 border border-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects
                  ?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  ?.map((project) => (
                    <tr key={project._id} className="bg-gray-50 hover:bg-gray-100">
                      <td className="px-4 py-2 border border-gray-300">{project.projectCode}</td>
                      <td className="px-4 py-2 border border-gray-300">{project.name.charAt(0).toUpperCase() + project.name.slice(1)}</td>
                      <td className="px-4 py-2 border border-gray-300">{project.location}</td>
                      <td className="px-4 py-2 border border-gray-300">{formatDate(project.startDate)}</td>
                      <td className="px-4 py-2 border border-gray-300">{formatDate(project.endDate)}</td>
                      <td className="px-4 py-2 border border-gray-300">{project?.manager?.charAt(0).toUpperCase() + project?.manager?.slice(1)}</td>
                      <td className="px-4 py-2 border border-gray-300">{project?.description?.charAt(0).toUpperCase() + project?.description?.slice(1) || "No description"}</td>
                      <td className="px-4 py-2 border border-gray-300" style={{display: 'flex', justifyContent: 'space-between'}}>
                        <button
                          onClick={() => handleAssign(project._id, project.name)}
                          style={{fontSize: '12px', whiteSpace: 'nowrap' ,backgroundColor: '#3d8c40', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', marginRight: '5px'}}
                        >
                          Assign To user
                        </button>
                        <button
                          onClick={() => showHandleDelete(project)}
                          style={{fontSize: '12px', whiteSpace: 'nowrap' ,backgroundColor: '#f44336', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px'}}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">No projects available.</p>
            )}
          </div>
        )}

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3 style={{margin: '10px', fontSize: '18px', textAlign: 'center'}}>Assign Project Access Rights to user </h3>
            <h3 style={{margin: '10px', fontSize: '14px', textAlign: 'center'}}>Project name: {projectName}</h3>

            <form onSubmit={handleSubmitAssigns}>
              <div style={{ marginBottom: "10px" }}>
                
                <label
                  htmlFor="email"
                  style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}
                >
                  User Email:
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter user email"
                  style={{
                    width: "100%",
                    padding: "8px",
                    fontSize: "14px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label
                  htmlFor="accessRight"
                  style={{ display: "block", fontWeight: "bold", marginBottom: "5px" }}
                >
                  Access Right:
                </label>
                <select
                  id="accessRight"
                  value={accessRight}
                  onChange={(e) => setAccessRight(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "8px",
                    fontSize: "14px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                >
                  <option value="">Select Access Right</option>
                  <option value="ReadOnly">ReadOnly</option>
                  <option value="Write">Write</option>
                </select>
              </div>

              <label
                  htmlFor="email"
                  style={{ display: "block", fontStyle: 'italic', marginBottom: "5px", fontSize: '14px', textAlign: 'center', margin: '30px 0px' }}
                >
                  ⚠️ If new User assigned the project, His/Her password will be the same as the user email.
                </label>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    backgroundColor: "#f44336",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
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
       {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent background
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1000',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '10px',
              width: '300px',
              textAlign: 'center',
            }}
          >
          <h3 style={{margin: '10px', fontSize: '18px', textAlign: 'center'}}>
            {`Are you sure you want to delete this Project (`}
            <span className="text-2xl font-bold text-blue-600">{projectInfo.name.charAt(0).toUpperCase() + projectInfo.name.slice(1)}</span>
            {`) ?`}
          </h3>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {/* Yes Button */}
              <button
                onClick={handleDelete}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginTop: '20px',
                }}
              >
                Yes
              </button>

              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'gray',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginTop: '20px',
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectBOQ;
