import React, { useState, useEffect } from "react";
import ProjectSelection from "../Category/AddProject";

import axios from "axios";
import { BASE_URL } from "../../utils/url";
import AlertMessage from "../Alert/AlertMessage";
import { getUserFromStorage } from "../../utils/getUserFromStorage";

const UpdateIncomeBudget = () => {
  const [data, setData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdownRow, setOpenDropdownRow] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isSuccess, setIsSuccess] = useState(false);
  const [columns] = useState([
    { Header: "Code", accessor: "code" },
    { Header: "Description", accessor: "description" },
    { Header: "Quantity", accessor: "quantity" },
    { Header: "Unit", accessor: "unit" },
    { Header: "Rate", accessor: "rate" },
    { Header: "Amount", accessor: "amount" },
    { Header: "Progress %", accessor: "progress" },
    { Header: "Amount Due to date", accessor: "currentAmount" },
    { Header: "Categories", accessor: "category" },
    { Header: "Action", accessor: "action" },

  ]);

  const headerColors = {
    code: "#ffcccc", // Soft Red
    description: "#ccffcc", // Soft Green
    quantity: "#ffebcc", // Soft Orange
    unit: "#e6e6fa", // Lavender
    rate: "#ffff99", // Light Yellow
    amount: "#ffb3e6", // Soft Pink
    progress: "#99ccff", // Light Blue
    category: "#ffcc99", // Light Peach
    currentAmount: "#c2f0c2", // Light Mint
  };

  const categoryRowColor = "#d3d3d3";
  const invalidCodeColor = "#003366";
  const token = getUserFromStorage();
  const selectedProjectName = localStorage.getItem("projectName") || null

  useEffect(() => {
    fetchProjects();
    fetchCategories();  
    displayRandomProject();
  }, []);

  useEffect(() => {
      if (selectedProject) {
        displayRandomProject();
      }
    }, [selectedProject]);

    const filteredCategories = categories.filter(category => 
      category.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/categories/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response?.data);

      console.log('jjhjjj', response?.data)
    } catch (err) {
      console.error("Error fetching Categories", err);
    }
  };

  const displayRandomProject = async () => {
    try {
      setIsLoading(true);
      setData([])

      const prjResponse = await axios.get(`${BASE_URL}/projects/lists`, {
        headers: { Authorization: `Bearer ${token}` }, });

        const projectsData = prjResponse?.data?.myProjects || [];
        const sortedProjects = projectsData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        let projectData = null

        if(selectedProjectName === null) { 
          setSelectedProject(sortedProjects[0]?.name);
           projectData = { projectName: sortedProjects[0]?.name }

        } else {
          setSelectedProject(selectedProjectName)
          projectData = { projectName: selectedProjectName };
        }

      const response = await axios.post(
        `${BASE_URL}/budget/listsByProject`,
        projectData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsLoading(false);
      setData(response?.data?.budgetDataByProj);
 
      if (response?.data?.budgetDataByProj.length > 0) {
        setIsSuccess(true);
        setSuccessMessage("Project Budget listed successfully");

        setTimeout(() => {
          setIsSuccess(false);
          setSuccessMessage(" ");
        }, 3000);
      } else {
        setErrorMessage("Selected Project Doesn't have Income Budget");
        setIsError(true);

        setTimeout(() => {
          setIsError(false);
        }, 3000);
      }

    } catch (err) {
      console.log("Error fetching Projects", err);
    }
  };

  
  const handleSave = async (rowIndex) => {
    const row = data[rowIndex];
    const updatedData = {
      id: row._id,
      progress: row.progress,
      category: row.category,
      currentAmount: row.currentAmount,
      amount: row.amount,
      description: row.description,
      projectName: row.projectName,
    };

    if(row.category === undefined) {
      setErrorMessage("Please, Select Category!");
      setIsError(true);
      
      setTimeout(() => {
        setErrorMessage("");
        setIsError(false);
        }, 3000);
      return;
    }

    setIsLoading(true);  
    try {
      const response = await axios.post(
        `${BASE_URL}/budget/updateIncomes`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsLoading(false);
      console.log("updatedDataupdatedData", response?.data)


      if (response?.status === 200) {
        setSuccessMessage("Progress Updated successfully.");
        setIsSuccess(true);
        displayRandomProject(row.projectName)
  
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }
    } catch (err) {
      setIsLoading(false);
      console.log("Error updating data", err);
      setErrorMessage(err.response.data.message);
      setIsError(true);
      setTimeout(() => {
        setIsError(false);
        setErrorMessage("");
      }, 5000);
    }
  };

  const handleCategoryChange = (e, rowIndex) => {
    console.log('rowIndexrowIndex', e.target.value, rowIndex)
    const updatedData = [...data];
    updatedData[rowIndex].category = e.target.value; // Update the category for the current row
    setData(updatedData); // Update the data state
  };

  const getRowStyle = (row) => {
    if (!row.code || row.code.length === undefined) {
      return {
        backgroundColor: invalidCodeColor,
        color: "#fff",
      };
    }

    if (row.code && !row.rate && row.code !== 'tt' && row.code !== 'st') {
      return {
        backgroundColor: categoryRowColor,
        fontSize: "12px",
        fontWeight: "bold",
      };
    }


    return {};
  };

  const isEmptyRow = (row) => {
    return Object.values(row).every((value) => value === null || value === "");
  };

  const formatWithCommas = (value) => {
    if (value === undefined || value === null || value === "") {
      return "";
    }
    const number = parseFloat(value);
    return isNaN(number) ? value : number.toLocaleString();
  };

  const handleProgressChange = (e, rowIndex) => {
    const updatedData = [...data];
    const updatedProgress = e.target.value === "" ? "" : e.target.value;
    updatedData[rowIndex].progress = updatedProgress;
  
    // Recalculate Amount Due to date after Progress change
    if (updatedData[rowIndex].amount && updatedProgress !== "") {
      updatedData[rowIndex].currentAmount = 
        parseFloat(updatedProgress) === 0 
          // ? (updatedData[rowIndex].amount * updatedProgress)
          ? 0
          : calculateAmountDue(updatedData[rowIndex].amount, updatedProgress);
    } else {
      updatedData[rowIndex].currentAmount = "";
    }
  
    setData(updatedData); // Update the data state
  };

  const handleAutoSave = async () => {
    const rowsToSave = data.map(row => ({
      id: row._id,
      progress: row.progress,
      category: row.category,
      currentAmount: row.currentAmount,
      amount: row.amount,
      description: row.description,
      projectName: row.projectName,
    }));
  
    try {
      setIsLoading(true);
  
      // Send the batch request to update all rows
      await Promise.all(
        rowsToSave.map(async (row) => {
          if (row.category === undefined) {
            setSuccessMessage("Skiping un selected catogories ... ...");
            setIsSuccess(true);

            setTimeout(() => {
              setIsSuccess(false);
              setSuccessMessage("");
      
            }, 3000);
            
            return;
          }
  
          await axios.post(
            `${BASE_URL}/budget/updateIncomes`,
            row,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        })
      );
  
      setIsLoading(false);
      setSuccessMessage("All rows updated successfully!");
      setIsSuccess(true);
  
      // Optional: you can refresh the data after saving all the rows
      displayRandomProject(selectedProject);
  
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (err) {
      setIsLoading(false);
      console.error("Error updating rows", err);
      setErrorMessage(err.response.data.message);
      setIsError(true);
      setTimeout(() => {
        setIsError(false);
        setErrorMessage("");

      }, 5000);
    }
  };

  const showHandleDelete = (id) => {
    setShowDeleteModal(true);
    setTransactionId(id);
  }

  const handleDeleteIncomeBudget = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`${BASE_URL}/budget/deleteIncomeBudgets/${selectedProject}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsLoading(false);
      setSuccessMessage("Icome budget table deleted successfully!");
      setIsSuccess(true);
      displayRandomProject(selectedProject);
    
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (err) {
      setIsLoading(false);
      console.error("Error updating rows", err);
      setErrorMessage(err.response.data.message);
      setIsError(true);
      setTimeout(() => {
        setIsError(false);
        setErrorMessage("");

      }, 5000);
    }
  };
  
  

  const calculateAmountDue = (amount, progress) => {
    if (!amount || !progress) return ""; // If amount or progress is missing, return empty
    return (amount * progress) / 100;
  };

  const getCellStyle = (row, columnKey) => {
    if (row.code === "st") {
      if (columnKey === "code" || columnKey === "description") {
        return {
          fontSize: "13px",
          fontWeight: "bold",
          fontStyle: "italic",
          textDecoration: "underline",
        };
      }
    }

    if (row.code === "tt") {
      if (columnKey === "code" || columnKey === "description" || columnKey === "amount") {
        return {
          fontWeight: "bold",
        };
      }
    }

    // For editable progress cells
    if (columnKey === "progress") {
      return {
        border: "1px solid #ccc", // Border inside the cell
        color: "black", // Text color
        padding: "4px",
        textAlign: "center",
        width: "100%",
      };
    }

    return {};
  };

  const getEditableCellStyle = (columnKey, row) => {
    if (columnKey === "progress") {
      if (row.amount) {
        return {
          border: "1px solid #ccc",
          color: "black",
          padding: "4px",
          textAlign: "center",
          backgroundColor: "white",
        };
      } 
    }

    return {};
  };

  return (
    <div className="table-container">
      <div className='alert-message-container'>
        {isError && (
            <AlertMessage
                type="error"
                message={errorMessage}
            />                                                                                       
        )}
        {isSuccess && (
            <AlertMessage
                type="success"
                message={successMessage}
            />
        )}
        {isLoading ? <AlertMessage type="loading" message="Loading" /> : null}
      </div>
      <div style={{width: '30%'}} >
        <ProjectSelection selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
      </div>

      <div className="auto-save-container" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0px', marginRight: "25px" }}>
      <button
          onClick={showHandleDelete}
          style={{
            padding: '8px 12px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            marginRight: '10px'
          }}
        >
          Delete Income budget
        </button>

        <button
          onClick={handleAutoSave}
          style={{
            padding: '8px 12px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'} 
          onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
        >
          Auto Save All
        </button>
      </div>
      <div className="table-scroll-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th colSpan={10} className="summary-row">
                <div className="row-title">
                  <strong>Activate Income Table</strong>
                </div>
              </th>
            </tr>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  style={{
                    backgroundColor: headerColors[column.accessor],
                    width:
                      column.accessor === "quantity" ? "70px" :
                      column.accessor === "category" ? "250px" :
                      column.accessor === "description" ? "300px" : 
                      column.accessor === "code" ? "60px" : 
                      column.accessor === "unit" ? "80px" : "150px",
                    zIndex:                      
                       column.accessor === "category" ? 2000 : 0,

                  }}
                >
                  {column.Header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.map((row, rowIndex) => (
              isEmptyRow(row) ? (
                <tr key={rowIndex}>
                  <td colSpan={6} style={{ textAlign: "center", backgroundColor: "#f9f9f9", height: "30px" }}>
                    No Data Available
                  </td>
                </tr>
              ) : (
                <tr key={rowIndex} style={getRowStyle(row)}>
                  {columns.map((column) => (
                    <td key={column.accessor}>
                      {column.accessor === "amount" ||
                      column.accessor === "rate" ||
                      column.accessor === "currentAmount" ? (
                        <span style={getCellStyle(row, column.accessor)}>
                          {formatWithCommas(row[column.accessor])}
                        </span>
                      ) : column.accessor === "progress" ? (
                        <input
                          type="number"
                          value={row[column.accessor] !== null && row[column.accessor] !== "" ? row[column.accessor] : ""}
                          onChange={(e) => handleProgressChange(e, rowIndex)}
                          style={getEditableCellStyle(column.accessor, row)}
                          disabled={!row.amount}
                        />
                      ) : column.accessor === "category" ? (
                        row.amount ? (
                          <div>
                            {/* Custom Dropdown */}
                          <div style={{ position: "relative", width: "100%" }}>
                            <div 
                              onClick={() => 
                                setOpenDropdownRow(openDropdownRow === rowIndex ? null : rowIndex)
                              } 
                              style={{
                                border: "1px solid #ccc",
                                padding: "6px",
                                cursor: "pointer",
                                backgroundColor: "#fff",
                              }}
                            >
                              {row[column.accessor] 
                                ? categories.find(cat => cat.Name === row[column.accessor])?.Name
                                : "-- Select Category --"
                              }
                            </div>

                            {/* Show dropdown only for the selected row */}
                            {openDropdownRow === rowIndex && (
                              <div 
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  left: 0,
                                  right: 0,
                                  maxHeight: "200px",
                                  overflowY: "auto",
                                  border: "1px solid #ccc",
                                  backgroundColor: "#fff",
                                  zIndex: 10,
                                }}
                              >
                                {/* Search Input */}
                                <input
                                  type="text"
                                  placeholder="Search Category..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  style={{
                                    width: "100%",
                                    padding: "4px",
                                    boxSizing: "border-box",
                                    border: "none",
                                    borderBottom: "1px solid #ddd",
                                  }}
                                />

                                {/* Category List */}
                                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                  {filteredCategories.length > 0 ? (
                                    filteredCategories.map((category) => (
                                      <li 
                                        key={category.id}
                                        onClick={(e) => {
                                          handleCategoryChange({ target: { value: category.Name } }, rowIndex);
                                          setOpenDropdownRow(null);
                                          setSearchTerm('')
                                        }}
                                        style={{
                                          padding: "6px",
                                          cursor: "pointer",
                                          backgroundColor: row[column.accessor] === category.id ? "#f0f0f0" : "#fff"
                                        }}
                                      >
                                        {category.Name}
                                      </li>
                                    ))
                                  ) : (
                                    <li style={{ padding: "6px", color: "#888" }}>No categories found</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                          </div>
                        ) : (
                          <span>--</span>
                        )
                      ) : column.accessor === "code" || column.accessor === "description" ? (
                        <span style={getCellStyle(row, column.accessor)}>
                          {row[column.accessor]}
                        </span>
                      ) : column.accessor === "action" ? (  // Action column with Save button
                        row.amount ? (  // Only show Save button if there is an amount
                          <button
                            onClick={() => handleSave(rowIndex)}
                            style={{
                              padding: "5px 10px",
                              fontSize: "12px",
                              backgroundColor: "#4CAF50",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Save
                          </button>
                        ) : null // No button if no amount
                      ) : (
                        <span style={{ width: "100%" }}>{row[column.accessor] || ""}</span>
                      )}
                    </td>
                  ))}
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>

      <style>
        {`
          .table-container {
            margin: 50px 80px;
          }

          .table-scroll-container {
            max-height: 800px;
            overflow-y: auto;
          }

          .styled-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-family: Arial, sans-serif;
            font-size: 12px;
          }

          .row-title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
          }

          .styled-table th, .styled-table td {
            border: 1px solid #ddd;
            padding: 6px 8px;
            text-align: left;
          }

          .styled-table th {
            font-weight: bold;
            color: #333;
            background-color: #f1f1f1;
            position: sticky;
            top: 0;
          }

          .styled-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }

          .styled-table tr:hover {
            background-color: #f1f1f1;
          }

          .styled-table .summary-row {
            background-color: #f8f8f8;
            font-size: 16px;
          }



        @media screen and (max-width: 768px) {
        .table-container {
            margin: 5px 20px;
          }
            .styled-table {
                font-size: 12px;
                width: 100%;
            }

            .styled-table th,
            .styled-table td {
                padding: 8px;
            }

            #project-select {
                width: 100%;
                margin-bottom: 10px;
            }

            .table-scroll-container {
                overflow-x: auto;
            }

            .styled-table th,
            .styled-table td {
                text-align: left;
                padding: 8px;
            }
            }

            @media screen and (max-width: 480px) {
            .styled-table {
                font-size: 10px;
            }

            .styled-table th,
            .styled-table td {
                padding: 5px;
            }

            .styled-table th {
                font-size: 12px;
            }

            #project-select {
                width: 100%;
            }

        `}
      </style>
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
          <h3>
            {`Are you sure you want to delete Income budget table for selected project (`}
            <span style={{ fontSize: "24px", fontWeight: "bold", color: "red" }}>
              {selectedProject}
            </span>
            {`)?`}
          </h3>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {/* Yes Button */}
              <button
                onClick={handleDeleteIncomeBudget}
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

export default UpdateIncomeBudget;
