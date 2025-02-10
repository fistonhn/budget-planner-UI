import React, { useState, useEffect } from "react";
import AlertMessage from "../Alert/AlertMessage";
import { getUserFromStorage } from "../../utils/getUserFromStorage";
import { BASE_URL } from "../../utils/url";
import axios from "axios";

const token = getUserFromStorage();

// Button Component
const Button = ({ onClick, label, isLoading, isDisabled, className }) => {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className={`btn ${className} ${isLoading ? "loading" : ""}`}
    >
      {isLoading ? "Loading..." : label}
    </button>
  );
};

// Main Component for Project Selection & Addition
const ProjectSelection = ({ selectedProject, setSelectedProject }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/budget/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
      setFilteredProjects(response.data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error("Error fetching projects", err);
    }
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project); // Update the parent component's selectedProject state
    setDropdownOpen(false); // Close the dropdown after selecting
  };

  const handleAddProject = async () => {
    if (!newProjectName) {
      setError("Please enter a project name.");
      return;
    }

    // const projectData = {
    //     projectName,
    //     teamEmails: emailArray,
    //     budgetData: data
    //   };

    const formData = { projectName: newProjectName, teamEmails: [], budgetData: [] };

    try {
      await axios.post(
        `${BASE_URL}/budget/create`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewProjectName("");
      setIsSuccess(true);
      setSuccessMessage("Project added successfully");
      setIsLoading(false);

      fetchProjects(); // Refresh the project list

      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      setError("Project already exists or is Invalid!");
      setIsLoading(false);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);

    console.log(e.target.value)

    const filtered = projects?.filter((project) =>
      project.projectName.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredProjects(filtered);
  };

  return (
    <div className="container">
      <h2>Projects</h2>

      {/* Custom Dropdown for Projects with Search */}
      <div className="dropdown-container">
        <div
          className="dropdown-toggle"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {selectedProject ? selectedProject : "Search or select a project"}
        </div>

        {dropdownOpen && (
          <div className="dropdown-menu">
            {/* Add Project Form */}
            <div className="add-project-form">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter new project name"
                className="form-input"
              />
              <Button
                onClick={handleAddProject}
                label="Add Project"
                isLoading={isLoading}
                isDisabled={!newProjectName}
                className="add-project-btn"
              />
            </div>

            {/* Search Field */}
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search projects..."
              className="dropdown-search"
            />
            {filteredProjects.length === 0 && (
              <div className="no-results">No results found</div>
            )}
            {filteredProjects
              ?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
              ?.map((project, index) => (
                <div
                  key={index}
                  className="dropdown-item"
                  onClick={() => handleSelectProject(project.projectName)}
                >
                  {project.projectName?.charAt(0)?.toUpperCase() + project?.projectName?.slice(1)}
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="alert-message-container">
        {error && <AlertMessage type="error" message={error} />}
        {isSuccess && <AlertMessage type="success" message={successMessage} />}
        {isLoading ? <AlertMessage type="loading" message="Loading" /> : null}
      </div>

      <style jsx>{`
        .container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .btn {
          background-color: #003366;
          color: white;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .btn:hover {
          background-color: #002244;
        }

        .loading {
          background-color: #7d7d7d;
          cursor: not-allowed;
        }

        .btn:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }

        .form-input {
          padding: 12px;
          font-size: 14px;
          width: 100%;
          border: 1px solid #ccc;
          border-radius: 5px;
          margin-bottom: 10px;
          transition: border-color 0.3s;
        }

        .form-input:focus {
          border-color: #003366;
          outline: none;
        }

        .add-project-btn {
          margin-top: 10px;
        }

        /* Custom Dropdown Styles */
        .dropdown-container {
          position: relative;
          margin-bottom: 20px;
          margin-top: 7px;
        }

        .dropdown-toggle {
          padding: 12px;
          background-color: #f0f0f0;
          border: 1px solid #ccc;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          border: 1px solid #ccc;
          border-radius: 5px;
          background-color: white;
          z-index: 10;
          max-height: 400px;
          overflow-y: auto;
          overflow-x: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .dropdown-search {
          width: 100%;
          padding: 10px;
          font-size: 14px;
          border: 1px solid #ccc;
          border-radius: 5px;
          margin-bottom: 10px;
          outline: none;
          transition: border-color 0.3s;
        }

        .dropdown-search:focus {
          border-color: #003366;
        }

        .dropdown-item {
          padding: 12px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .dropdown-item:hover {
          background-color: #f0f0f0;
        }

        .no-results {
          padding: 12px;
          font-size: 14px;
          color: #888;
        }

        .add-project-form {
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default ProjectSelection;
