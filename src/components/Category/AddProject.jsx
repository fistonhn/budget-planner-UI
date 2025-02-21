import React, { useState, useEffect } from "react";
import AlertMessage from "../Alert/AlertMessage";
import { getUserFromStorage } from "../../utils/getUserFromStorage";

import { BASE_URL } from "../../utils/url";
import axios from "axios";

const token = getUserFromStorage();

// Main Component for Project Selection
const ProjectSelection = ({ selectedProject, setSelectedProject }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [transactionDatProjects, setTransactionDataProjects] = useState([]);


  useEffect(() => {
    fetchProjects();
    fetchTransactionProjects();
    allAvProjects();
  }, []);


  const allAvProjects = () => {
    const array1 = transactionDatProjects;
    
    const array2 = filteredProjects
    
    // Convert array2 objects to have 'projectName' field
    const formattedArray2 = array2.map(item => ({
      ...item,
      projectName: item.name
    }));
    
    // Combine both arrays
    const combinedArray = [...array1, ...formattedArray2];
    // Remove duplicates based on projectName
    const uniqueArray = Array.from(new Map(combinedArray.map(item => [item.projectName, item])).values());
    setFilteredProjects(uniqueArray)
    setProjects(uniqueArray)
        
  }

  const openDropDown = () => {
    setDropdownOpen(!dropdownOpen)
    allAvProjects()
  }

  const fetchTransactionProjects = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/transactions/lists`, 
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTransactionDataProjects(response.data);
      // setSelectableCategories(response.data)

    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/projects/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProjects(response.data.myProjects);
      setFilteredProjects(response.data.myProjects);
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setDropdownOpen(false);
    localStorage.setItem("projectName", project);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);

    const filtered = projects?.filter((project) =>
      project.projectName.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredProjects(filtered);
  };

  return (
    <div className="container">
      
      <h2>Select Project</h2>

      {/* Custom Dropdown for Projects with Search */}
      <div className="dropdown-container">
        <div
          className="dropdown-toggle"
          onClick={openDropDown}
        >
          {selectedProject ? selectedProject : "Search or select a project"}
        </div>

        {dropdownOpen && (
          <div className="dropdown-menu">
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
      <style jsx>{`
        .container {
          font-family: Arial, sans-serif;
        }

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
      `}</style>
    </div>
  );
};

export default ProjectSelection;
