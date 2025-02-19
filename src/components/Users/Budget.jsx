import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { BASE_URL } from "../../utils/url";
import AlertMessage from "../Alert/AlertMessage";
import { getUserFromStorage } from "../../utils/getUserFromStorage";

const ExcelTableImporter = () => {
  const [data, setData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  // const [projectName, setProjectName] = useState('');
  const [selectedProject, setSelectedProject] = useState("");
  const [progress, setProgress] = useState(1);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isSuccess, setIsSuccess] = useState(false);
  const [columns] = useState([
    { Header: "Code", accessor: "Code" },
    { Header: "Description", accessor: "Description" },
    { Header: "Quantity", accessor: "Quantity" },
    { Header: "UOM", accessor: "UOM" },
    { Header: "Rate", accessor: "Rate" },
    { Header: "Amount", accessor: "Amount" }
  ]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/projects/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProjects(response?.data?.myProjects);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      console.error("Error fetching projects", err);
    }
  };

  // Handle changes in the team mates progress input field
  const handleProgressChange = (e) => {
    setProgress(e.target.value);
  };

  const togglePopup = () => {
    setIsOpen(!isOpen);
    // setData([]);
  }

  const headerColors = {
    Code: "#d0e0f0",       // Light Blue
    Description: "#d9f8d9", // Light Green
    Quantity: "#f4e1d2",    // Light Coral
    UOM: "#f9f9f9",         // Light Gray
    Rate: "#fdf1b3",         // Light Yellow
    Amount: "#f2d0a1"       // Light Orange
  };

  const categoryRowColor = "#d3d3d3";
  const invalidCodeColor = "#003366";
  const token = getUserFromStorage();

  const sendDataToDatabase = async () => {

    if(data.length === 0) {
        setErrorMessage("Please import a valid BOQ file before sending to database!");
        setIsError(true);

        setTimeout(() => {
          setIsError(false); 
       }, 4000);
    } else {
        console.log("Data to send to database:", data);
        setIsOpen(!isOpen); 
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the data to send
    const budgetData = {
      projectName: selectedProject,
      progress,
      budgetData: data,
    };

    try {
      setIsLoading(true);
      await axios.post(`${BASE_URL}/budget/importIncomes`, budgetData, { headers: { Authorization: `Bearer ${token}` } });
      setIsLoading(false);
      setSuccessMessage("Project Budget saved successfully");
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false); 
        setIsOpen(!isOpen);
        setData([]);
        setProgress('');

     }, 4000);
     
    } catch (error) {
        setErrorMessage("Please Import valid BOQ file and try again!");
        setIsError(true);

        setTimeout(() => {
          setIsError(false); 
          setIsLoading(false);
       }, 4000);

    }
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/BudgetData.xlsx';
    link.download = 'BudgetData.xlsx';
    link.click();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const abuf = e.target.result;
        const wb = XLSX.read(abuf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]]; 
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const processedData = jsonData.slice(1).map((row) => {
          return {
            Code: row[0],
            Description: row[1],
            Quantity: row[2],
            UOM: row[3],
            Rate: row[4],
            Amount: row[5]
          };
        });

        const filteredData = processedData.filter((row) => {
          return row.Code || row.Description || row.Quantity || row.UOM || row.Rate || row.Amount;
        });

        setData(filteredData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const getRowStyle = (row) => {
    if (!row.Code || row.Code.length === undefined) {
      return {
        backgroundColor: invalidCodeColor,
        color: "#fff" // White text color for better contrast
      };
    }

    if (row.Code && row.Code.length === 1) {
      return {
        backgroundColor: categoryRowColor, 
        fontSize: "12px",
        fontWeight: "bold",
      };
    }

    return {};
  };

  const isCategoryRow = (row) => {
    return row.Code && row.Code.length === 1;
  };

  const isEmptyRow = (row) => {
    return Object.values(row).every(value => value === null || value === "");
  };

  const isInvalidCodeRow = (row) => {
    return !row.Code || row.Code ==="tt" || row.Code === "st" || row.Code.length === undefined;
  };

  const formatWithCommas = (value) => {
    if (value === undefined || value === null || value === "") {
      return "";
    }
    const number = parseFloat(value);
    return isNaN(number) ? value : number.toLocaleString();
  };

  const getCellStyle = (row, columnKey) => {
    if (row.Code === "st") {
      if (columnKey === "Code" || columnKey === "Description") {
        return {
          fontSize: "13px",
          fontWeight: "bold",
          fontStyle: "italic",
          textDecoration: "underline",
        };
      }
    }

    if (row.Code === "tt") {
      if (columnKey === "Code" || columnKey === "Description" || columnKey === "Amount") {
        return {
          fontWeight: "bold",
        };
      }
    }

    return {};
  };

  const handleSelectProject = (e) => {
    setSelectedProject(e.target.value);
  };

  return (
    <div className="table-container">
      {/* Popup Form */}
      {isOpen && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupContainer}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000000', textAlign: 'center', marginBottom: '20px' }}>
              Adjust project progress
            </h2> 
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
            <form onSubmit={handleSubmit}>

              <div>
                <label style={{ fontStyle: 'italic', fontSize: '14px', marginRight: '10px' }}>
                  Select Project:
                </label>
                  <select
                    id="project-select"
                    value={selectedProject}
                    onChange={handleSelectProject}
                    style={{
                      marginBottom: '10px',
                      marginTop: '5px',
                      padding: '10px',
                      fontSize: '14px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    <option value="">-- Select a project --</option>
                    {projects?.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>           
              </div>
              
              <div style={styles.formField}>
              <label style={{ fontStyle: 'italic', fontSize: '14px' }}>
                Enter Project Progress % (Optional)
              </label>
                <input
                  type="number"
                  placeholder="%"
                  value={progress}
                  onChange={handleProgressChange}
                  style={styles.input}
                />
              </div>

              {error && <div style={styles.error}>{error}</div>}
              <div style={styles.formActions}>
                <button type="button" onClick={togglePopup} style={styles.cancelButton}>
                  Cancel
                </button>
                {isLoading ? <AlertMessage type="loading" message="Loading" /> : <button type="submit" style={styles.submitButton}>
                  Submit
                </button>}

                
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Display alert message */}
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
      <label htmlFor="file-upload" className="import-budget-button">
        Import contract BOQ
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        style={{ display: 'none' }} 
      />
      <div>
        <button className="example-format-btn" onClick={handleDownload}>Click here to Download Example File Format</button>
      </div>
      <div className="send-data-button-container">
        <button onClick={sendDataToDatabase} className="send-data-button">
            Activate Income Table
        </button>
      </div>

      <div className="table-scroll-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th colSpan={6} className="summary-row">
                <div className="row-title">
                  <strong>REVIEW CONTRACT BOQ</strong>
                </div>
              </th>
            </tr>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  style={{
                    backgroundColor: headerColors[column.accessor],
                    width: column.accessor === "Description" ? "300px" : 
                           column.accessor === "Code" ? "60px" : 
                           column.accessor === "UOM" ? "80px" : "150px",
                  }}
                >
                  {column.Header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              isEmptyRow(row) ? (
                <tr key={rowIndex}>
                  <td colSpan={6} style={{ textAlign: 'center', backgroundColor: '#f9f9f9', height: '30px' }} >
                    No Data Available
                  </td>
                </tr>
              ) : (
                <tr key={rowIndex} style={getRowStyle(row)}>
                  {columns.map((column) => (
                    <td key={column.accessor}>
                      {column.accessor === "Amount" || column.accessor === "Rate" ? (
                        <span style={getCellStyle(row, column.accessor)}>
                          {formatWithCommas(row[column.accessor])}
                        </span>
                      ) : column.accessor === "Code" || column.accessor === "Description" ? (
                        <span style={getCellStyle(row, column.accessor)}>
                          {row[column.accessor]}
                        </span>
                      ) : isInvalidCodeRow(row) ? (
                        <span style={{
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          fontStyle: 'italic'
                        }}>
                          {row[column.accessor]}
                        </span>
                      ) : column.accessor === "Code" && isCategoryRow(row) ? (
                        row[column.accessor]
                      ) : (
                        <span style={{ width: "100%" }}>
                          {row[column.accessor] || ""}
                        </span>
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
            margin: 10px;
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
            z-index: 10;
          }

          .styled-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }

          .styled-table tr:hover {
            background-color: #f1f1f1;
          }

          .styled-table td, .styled-table th {
            border: 1px solid #ccc;
          }

          .styled-table th {
            background-color: #f1f1f1;
          }

          .styled-table td:hover, .styled-table th:hover {
            background-color: #e6f7ff;
          }

          .summary-row {
            background-color: #f1f1f1;
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            padding: 10px 0;
          }

          .import-budget-button {
            display: inline-block;
            padding: 8px 10px;
            background-color: #003366;
            color: white;
            font-size: 12px;
            font-style: italic;
            border: none;
            cursor: pointer;
            text-align: center;
            border-radius: 5px;
            margin-top: 20px;
          }

          .import-budget-button:hover {
            background-color: #002244;
          }

          .import-budget-button:active {
            background-color: #001933;
          }

          .send-data-button-container {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
          }

          .send-data-button {
            padding: 6px 10px;
            background-color: #003366;
            color: white;
            font-size: 12px;
            font-style: italic;
            border: none;
            cursor: pointer;
            border-radius: 5px;
          }

          .send-data-button:hover {
            background-color: #002244;
          }

          .send-data-button:active {
            background-color: #001933;
          }
          
          .example-format-btn {
            font-size: 12px;
            font-style: italic;
          }
          .example-format-btn:hover {
            background-color: #002244;
            color: white;
            font-size: 16px;
            padding: 5px;
            transform: translateY(-2px);
          }

          /* Mobile responsiveness */
          @media (max-width: 768px) {
            .example-format-btn {
              font-size: 10px;
              margin-bottom: 20px;
              white-space: nowrap;
            }
            
        `}
      </style>
    </div>
  );
};
const styles = {
      popupOverlay: {
      zIndex: 1000,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    popupContainer: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      width: '400px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
    formField: {
      marginBottom: '15px',
    },
    input: {
      width: '100%',
      padding: '8px',
      fontSize: '16px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      marginTop: '5px'
    },
    formActions: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    cancelButton: {
      padding: '10px 20px',
      backgroundColor: 'gray',
      color: '#000',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    submitButton: {
      padding: '10px 20px',
      backgroundColor: '#002244',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    error: {
      color: 'red',
      fontSize: '14px',
      marginBottom: '10px',
    },
  };  

export default ExcelTableImporter;
