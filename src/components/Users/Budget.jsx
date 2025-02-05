import React, { useState, useEffect } from "react"; 
import * as XLSX from "xlsx";
import axios from "axios";
import { BASE_URL } from "../../utils/url";
import AlertMessage from "../Alert/AlertMessage";
import { getUserFromStorage } from "../../utils/getUserFromStorage";

const ExcelTableImporter = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [columns] = useState([
    { Header: "Code", accessor: "Code" },
    { Header: "Description", accessor: "Description" },
    { Header: "Quantity", accessor: "Quantity" },
    { Header: "UOM", accessor: "UOM" },
    { Header: "Rate", accessor: "Rate" },
    { Header: "Amount", accessor: "Amount" }
  ]);
  const [error, setError] = useState(null);

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

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/budget/lists`, 
        
        { 
          headers: {
          Authorization: `Bearer ${token}`,
         },
        }
    ); // Replace with your actual API endpoint
      console.log("Data fetched successfully:", response.data);
 
      setData(response.data);      // Store the fetched data in the state
    } catch (err) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", err);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const sendDataToDatabase = async () => {
    await axios.post(
        `${BASE_URL}/budget/create`,
        {
          data,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(response => {
        console.log("Data successfully sent to the database:", response.data);
        alert("Data successfully sent to the database!");
      })
      .catch(error => {
        console.log("token:", token);
        console.error("Error sending data to the database:", error);
        alert("Error sending data to the database.");
      });
  };

  const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const abuf = e.target.result;
          const wb = XLSX.read(abuf, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]]; // Assume first sheet
          const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
  
          // Log the raw data to the console for inspection
          console.log("Raw Data from Excel:", jsonData); // This will show the entire data
  
          // Skip the first row and process remaining data
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
  
          // Remove rows where all main columns are undefined or empty
          const filteredData = processedData.filter((row) => {
            return row.Code || row.Description || row.Quantity || row.UOM || row.Rate || row.Amount;
          });
  
          console.log("Filtered Data:", filteredData); // Log the filtered data to check its format
  
          setData(filteredData);
        };
        reader.readAsArrayBuffer(file);
      }
    };

  const handleCellChange = (e, rowIndex, columnKey) => {
    const newData = [...data];
    newData[rowIndex][columnKey] = e.target.value;
    setData(newData);
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

  return (
    <div className="table-container">
      <label htmlFor="file-upload" className="import-budget-button">
        Import Budget from Excel
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        style={{ display: 'none' }} // Hide the default file input
      />
      <div className="send-data-button-container">
        <button onClick={sendDataToDatabase} className="send-data-button">
            Send Data to Database
        </button>
      </div>

      <div className="table-scroll-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th colSpan={6} className="summary-row">
                <div className="row-title">
                  <strong>Update Quantity, UOM, Rate and Amount</strong>
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
                      {column.accessor === "Amount" && (isInvalidCodeRow(row) || row.Code === "") ? (
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
                        <input
                          type="text"
                          value={column.accessor === "Rate" || column.accessor === "Amount"
                            ? formatWithCommas(row[column.accessor])
                            : row[column.accessor] || ""}
                          onChange={(e) => handleCellChange(e, rowIndex, column.accessor)}
                          disabled={isCategoryRow(row)} 
                          style={{ width: "100%" }}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>

      {isLoading && <AlertMessage type="loading" message="Loading" />}
      {isError && (
        <AlertMessage type="error" message={error.response.data.message} />
      )}


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
            z-index: 10;
          }

          .styled-table td input {
            width: 100%;
            padding: 4px;
            border: 1px solid #ddd;
            box-sizing: border-box;
            background-color: #fff;
            font-size: 12px;
            text-align: center;
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

          .styled-table td input:disabled {
            background-color: #d3d3d3;
            cursor: not-allowed;
            font-size: 12px;
            font-weight: bold;
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
            padding: 10px 20px;
            background-color: #003366; /* Dark blue background */
            color: white;
            font-size: 14px;
            font-weight: bold;  /* Bold text */
            font-style: italic; /* Italic text */
            border: none;
            cursor: pointer;
            text-align: center;
            border-radius: 5px;
            margin-bottom: 20px;
          }

          .import-budget-button:hover {
            background-color: #002244; /* Slightly darker blue when hovered */
          }

          .import-budget-button:active {
            background-color: #001933; /* Even darker blue when clicked */
          }

          .send-data-button-container {
            display: flex;
            justify-content: center;  /* Centers content horizontally */
            align-items: center;  /* Centers content vertically */
            width: 100%;
          }

          .send-data-button-container {
         }

         .send-data-button {
            padding: 10px 20px;
            background-color: #003366;
            color: white;
            font-size: 14px;
            font-weight: bold;
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



        `}
      </style>
    </div>
  );
};

export default ExcelTableImporter;
