import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from "xlsx";
import { FaTrash, FaEdit } from "react-icons/fa";
import { BASE_URL } from "../../utils/url";
import { getUserFromStorage } from "../../utils/getUserFromStorage";
import AlertMessage from "../Alert/AlertMessage";
import CategorySelection from "../Category/AddCategory";
import ProjectSelection from "../Category/AddProject";

const token = getUserFromStorage();

const CreateTransaction = () => {
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [amount, setAmount] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

  const [selectedTransctionData, setSelectedTransctionData] = useState();
  const [transactionData, setTransactionData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [switchToEditMode, setSwitchToEditMode] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectableCategories, setSelectableCategories] = useState([])
  const [incomeReport, setIncomeReport] = useState([])
  const [openDropdownRow, setOpenDropdownRow] = useState(false);
  const [openDropdownRowFile, setOpenDropdownRowFile] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState("");
  const [selectedReportFile, setSelectedReportFile] = useState("");

  const [fullSelectedReport, setFullSelectedReport] = useState(null)
  const [fullSelectedReportFile, setFullSelectedReportFile] = useState(null)

  const [excelFileData, setExcelFileData] = useState([])
  const [showProjectNameForm, setShowProjectNameForm] = useState(false)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
  }); 
   

  useEffect(() => {
    fetchTransactionData();
    fetchCategories();

    if (quantity && price) {
      setAmount(quantity * price);
    } else {
      setAmount(0);
    }

  }, [quantity, price]);
   useEffect(() => {
      if (selectedProject) {
        fetchTransactionData();
      }
    }, [selectedProject]);

   useEffect(() => {
    fetchProjectData();
    }, []);

  const fetchTransactionData = async () => {
    try {
      const getSelectedName = localStorage.getItem("projectName")
      const projectName = { projectName: getSelectedName };
      const response = await axios.post(`${BASE_URL}/transactions/lists`, projectName,
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTransactionData(response.data.myTransactions);
      setSelectableCategories(response.data.myTransactions)

      console.log('Transactions:', response.data);
    } catch (err) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
    }
  };

  const fetchProjectData = async () => {
    try {
      const prjResponse = await axios.get(`${BASE_URL}/projects/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const projectsData = prjResponse?.data?.myProjects || [];
      const sortedProjects = projectsData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      
      const selectedProjectName = localStorage.getItem("projectName") || null

      if(selectedProjectName === null) { 
        setSelectedProject(sortedProjects[0]?.name);

      } else {
        setSelectedProject(selectedProjectName)
      }

      setIsLoading(false)
      setIsSuccess(true);
      setSuccessMessage("Projects Displayed successfully.");

      setTimeout(() => {
        setIsSuccess(false);
        setSuccessMessage("")
      }, 3000);
    } catch (err) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/categories/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  const fetchReportData = async() => {
    setIsLoading(true)
    // check if selected category has a report
    const getSelectedName = localStorage.getItem("projectName")
    const selectedProjectName = { projectName: getSelectedName };
    const response = await axios.post(`${BASE_URL}/report/listsByProject`, selectedProjectName, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setIncomeReport(response.data.myReports)
    setIsLoading(false)

  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!amount || !category || !date || !selectedProject || !quantity || !unit || !paymentMethod || !price || !fullSelectedReport) {
      setError("Please fill all required fields! Including select income field.");
      setTimeout(() => {
        setError('')
      }, 3000);
      return;
    }
    // Prepare data for submission
    const transactionData = {
      amount,
      category,
      date,
      description,
      projectName: selectedProject,
      quantity,
      unit,
      paymentMethod,
      price,
      fullSelectedReport,
    };
    console.log('transactionDatatransactionData', transactionData)
    try {
      setIsLoading(true);
      const res = await axios.post(`${BASE_URL}/transactions/create`, transactionData,
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      setIsSuccess(true);
      // setSuccessMessage("Transaction recorded successfully");
      setSuccessMessage(res.data.message);

      setTimeout(() => {
        setIsSuccess(false); 
        // resetForm();
     }, 3000);

      // setShowModal(false);
      
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.response.data.message);
      setIsError(true);

      setTimeout(() => {
        setIsError(false);

      }, 5000);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);

        await axios.delete(`${BASE_URL}/transactions/delete/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowDeleteModal(false);
      setIsLoading(false);
      setIsSuccess(true);
      setSuccessMessage("Transaction deleted successfully");


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
  
  const handleUpdateTransaction = async (id) => {
    setShowModal(true)
    setSwitchToEditMode(true);
    setTransactionId(id)
    fetchReportData()

    const dataToEdit = transactionData.find((transaction) => transaction._id === id);
    setSelectedTransctionData(dataToEdit)
    setAmount(dataToEdit.amount);
    setCategory((dataToEdit?.incomeReportData?.incomeCategory) ? dataToEdit?.incomeReportData?.incomeCategory : dataToEdit.category);
    setDate(dataToEdit.date);
    setDescription(dataToEdit.description);
    setSelectedProject(dataToEdit.projectName);
    setQuantity(dataToEdit.quantity);
    setUnit(dataToEdit.unit);
    setPaymentMethod(dataToEdit.paymentMethod);
    setPrice(dataToEdit.price);
    setSelectedReport(dataToEdit?.incomeReportData?.incomeDescription ? dataToEdit?.incomeReportData?.incomeDescription : "")

  };

  const handleSaveUpdatedTransaction = async () => {
    let recordReport 

    const thisReport = incomeReport.find((rep) => rep._id === selectedTransctionData?.incomeReportData?.reportId)
    recordReport = thisReport ? thisReport : fullSelectedReport

    console.log('selectedProjectselectedProjectselectedProject', recordReport)


    if ( !recordReport) {
      setError("Please ReSelect income from income field!");
      return;
    }

    if (!amount || !category || !date || !selectedProject || !quantity || !unit || !paymentMethod || !price) {
      setError("Please fill in all required fields!");
      return;
    }

    // Prepare data for submission
    const transactionData = {
      amount,
      category,
      date,
      description,
      projectName: selectedProject,
      quantity,
      unit,
      paymentMethod,
      price,
      fullSelectedReport: recordReport

    };

    try {
      setIsLoading(true);
      const res = await axios.put(`${BASE_URL}/transactions/update/${transactionId}`, transactionData,
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('ressss', res)

      setIsLoading(false);
      setIsSuccess(true);
      setSuccessMessage(res.data.message);

      setTimeout(() => {
        setIsSuccess(false); 
        resetForm();
        setShowModal(false);
        fetchTransactionData();
     }, 3000);

    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.response.data.message);
      setIsError(true);

      setTimeout(() => {
        setIsError(false);

      }, 3000);
      console.error("There was an error updating the transaction:", error);
    }
  }

  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    setFileName(file.name);

    if (file) {
      const reader = new FileReader();
      
      // When the file is read, convert it to JSON format
      reader.onload = async (e) => {
        const abuf = e.target.result;
        const wb = XLSX.read(abuf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const jsonFormattedData = jsonData.map((row, index) => {
          // Skip the header row and generate JSON with header as keys
          if (index === 0) return null; // Skip the header row
          return jsonData[0].reduce((acc, columnName, colIndex) => {
            acc[columnName] = row[colIndex];
            return acc;
          }, {});
        }).filter(item => item !== null);

        setExcelFileData(jsonFormattedData)
        setShowProjectNameForm(true);
        console.log('excelFileData', jsonFormattedData)

  
      };
  
      // Read the file as an array buffer
      reader.readAsArrayBuffer(file);

    }
  };
  const closeShowProjectNameForm = () => {
    setShowProjectNameForm(false);
    setFullSelectedReportFile(null);
    setFileName("");
    setSelectedReportFile('')
    setCategory('')
  };

  const saveImportedFileData = async(e) => {
    e.preventDefault();

    try {
      const selectedProjectName = localStorage.getItem("projectName") || null
      if(!excelFileData || !category) {

        setIsError(true);
        setErrorMessage("Error! Please fill in all fields!");

        setTimeout(() => {
          setIsError(false);
          setErrorMessage('')
        }, 3000);
        return
      }
      const saveFileData = {
        projectName: selectedProjectName,
        fileExcelData: excelFileData,
        category: category
      }

      // console.log('saveFileDatakcnsociio', saveFileData)

      setIsLoading(true);
      await axios.post(
        `${BASE_URL}/transactions/importTransactions`,
        saveFileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowProjectNameForm(false)
      setFullSelectedReportFile(null)
      setIsLoading(false);

      setFileName("");
      setIsSuccess(true);
      setSuccessMessage("Transactions imported successfully");
      setCategory('')

      fetchTransactionData();

      // Fetch updated categories
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (err) {
      console.log('err', err)
      setIsLoading(false);
      setErrorMessage(error.response.data.message);
      setIsError(true);

      setTimeout(() => {
        setIsError(false);

      }, 3000);
    }
  }

  const resetForm = () => {
    setAmount("");
    setCategory("");
    setDate("");
    setDescription("");
    setSelectedProject("");
    setQuantity("");
    setUnit("");
    setPaymentMethod("");
    setPrice("");
    setError("");
    setSelectedProject("")
  };
  function formatDate(dateString) {
    const date = new Date(dateString);
  
    // Format the date to a readable format
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  
    return formattedDate;
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    console.log(value)

    if(value==='All'){
      setTransactionData(selectableCategories)
    } else {
    const filteredCategories = selectableCategories?.filter(category => category.category.includes(value));

    console.log('value', filteredCategories)
    setFilters((prev) => ({ ...prev, [name]: value }));

    setTransactionData(filteredCategories)
    }
  };

  const handleDownload = () => {
    // Trigger the file download
    const link = document.createElement('a');
    link.href = '/transactionData.xlsx'; // Path to the Excel file in the public folder
    link.download = 'transactionData.xlsx'; // The name of the downloaded file
    link.click(); // Simulate the click to trigger the download
  };
  const formatWithCommas = (value) => {
    if (value === undefined || value === null || value === "") {
      return "";
    }
    const number = parseFloat(value);
    return isNaN(number) ? value : number.toLocaleString();
  };

  const handleFocus = () => {
    setOpenDropdownRow(true);
  };

  const handleBlur = () => {
    // Add a slight delay before closing the dropdown to allow clicking on list items
    setTimeout(() => setOpenDropdownRow(false), 200);
  };
  const handleItemClick = (e, report) => {
    setOpenDropdownRow(false)
    setSearchTerm('');
    setSelectedReport(e.target.value)
    setFullSelectedReport(report)
    setCategory((report?.incomeReportData?.incomeCategory) ? report?.incomeReportData?.incomeCategory : report.category);
  };
  const handleItemClickFile = (e, report) => {
    setSelectedReportFile(e.target.value)
    setSearchTerm('');
    setFullSelectedReportFile(report)
    setCategory((report?.incomeReportData?.incomeCategory) ? report?.incomeReportData?.incomeCategory : report.category);
    setOpenDropdownRowFile(false)

  };

   const filteredReports = incomeReport.filter((report) =>
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openIncomeDropdown = () => {
    openDropdownRow === true ? setOpenDropdownRow(false) : setOpenDropdownRow(true)
    fetchReportData()

  }
  const totalAmount = (transactionData.reduce((sum, transaction) => sum + transaction.amount, 0));

  const openIncomeDropdownFile = (e) => {
    fetchReportData()
    // console.log('incomeReport', incomeReport)
    openDropdownRowFile === true ? setOpenDropdownRowFile(false) : setOpenDropdownRowFile(true)

  }

  const handleSelectAllChange = () => {
    if (selectedTransactions.length === transactionData.length) {
      setSelectedTransactions([]); // Deselect all if already all are selected
    } else {
      setSelectedTransactions(transactionData.map(transaction => transaction._id)); // Select all
    }
  };

  const showHandleDelete = (id) => {
    setShowDeleteModal(true);
    setTransactionId(id);
  }

  const handleCheckboxChange = (transactionId) => {
    if (selectedTransactions.includes(transactionId)) {
      setSelectedTransactions(selectedTransactions.filter(id => id !== transactionId));
    } else {
      setSelectedTransactions([...selectedTransactions, transactionId]);
    }
  };

  const handleDeleteAll = async () => {
    if (selectedTransactions.length === 0) {
      // Handle the case where no transactions are selected
      setErrorMessage("No transactions selected for deletion.");
      setIsError(true);
  
      setTimeout(() => {
        setIsError(false);
      }, 3000);
      return;
    }

    console.log("Deleting transactions with IDs:", selectedTransactions);
  
    try {
      setIsLoading(true);
      for (let transactionId of selectedTransactions) {
        await axios.delete(`${BASE_URL}/transactions/delete/${transactionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
  
      setSelectedTransactions([])
      setIsLoading(false);
      setIsSuccess(true);
      setSuccessMessage("Transactions deleted successfully");
  
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
  
      fetchTransactionData();
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.response?.data?.message || "An error occurred");
      setIsError(true);
      setSelectedTransactions([])
  
      setTimeout(() => {
        setIsError(false);
      }, 5000);
    }
  };
  


return (
  <div>
    {/* Button to open the modal */}
    <div className='create-transaction-btn-container'>
      <button
        onClick={() => setShowModal(true)}
        className="create-transaction-btn"
      >
        Create new Transaction
      </button>

      <div>
        <label htmlFor="excel-upload" className="import-button-label">
          Import Transactions (Excel)
        </label>
        <input
          type="file"
          id="excel-upload"
          className="import-file-input"
          accept=".xlsx, .xls"
          onChange={handleExcelUpload}
        />
        <div>
          <button className="example-btn" onClick={handleDownload}>Click here to Download Example File Format</button>
        </div>
        <div className="filename-display">
          {fileName ? `Selected file: ${fileName}` : "No file selected"}
        </div>
      </div>
      
    </div>

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

     {/* Filter Section */}
     <div className="filter-section-nnnnn">
        <div 
          style={{
            float: 'right', 
            marginRight: '50px', 
            fontSize: '12px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
          }}
        >
          
          <div className="responsive-container" style={{ marginRight: '10px', display: 'flex', width: '300px', alignItems: 'center' }}>
            <ProjectSelection selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
          </div>
          <select
            value={filters.category?.Name}
            onChange={handleFilterChange}
            name="category"
            style={{
              width: '300px',
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              backgroundColor: '#fafafa',
              fontFamily: 'Arial, sans-serif',
              fontSize: '16px',
              color: '#333',
              appearance: 'none',
              outline: 'none',
              transition: 'border-color 0.3s ease, background-color 0.3s ease',
            }}
          >
            <option
              value="All"
              style={{
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                color: '#555',
                backgroundColor: '#fafafa',
                padding: '10px',
              }}
            >
              Sort Categories
            </option>

            <option
              value="All"
              style={{
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                color: '#333',
                backgroundColor: '#f7f7f7',
                padding: '10px',
              }}
            >
              All Categories
            </option>

            {
              [...new Set(selectableCategories?.map((category) => category?.category))].map((category) => (
                <option
                  key={category}
                  value={category}
                  style={{
                    fontSize: '16px',
                    fontFamily: 'Arial, sans-serif',
                    color: '#333',
                    backgroundColor: '#fafafa',
                    padding: '10px',
                    transition: 'background-color 0.3s ease, color 0.3s ease',
                  }}
                >
                  {category}
                </option>
              ))
            }
          </select>
        </div>


     </div>


    <div className="transaction-table">
      <h3 className="table-title">Transaction Overview</h3>
      <div style={{ width: '100%',marginBottom: '5px', backgroundColor: '#ccc', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Total Amount on the left */}
        <div style={{marginLeft: '20px'}}>
          Total Amount: {totalAmount.toLocaleString()}
        </div>
        
        {/* Delete All Selected button on the right */}
        <button
          onClick={handleDeleteAll}
          className="text-red-500 hover:text-red-700"
          style={{
            padding: '8px 15px',
            backgroundColor: '#f2b9b9',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Delete All Selected
        </button>
      </div>

      

      <table className="table">
        <thead>
          <tr>
          <th style={{ backgroundColor: "#b9e0f2" }}>Project Name</th>
          <th style={{ backgroundColor: "#d1f2b9" }}>Category</th>
          <th style={{ backgroundColor: "#d1b9f2" }}>Description</th>
          <th style={{ backgroundColor: "#f2e3b9" }}>Quantity</th>
          <th style={{ backgroundColor: "#d9b9f2" }}>Unit</th>
          <th style={{ backgroundColor: "#d9b9f2" }}>Price</th>
          <th style={{ backgroundColor: "#f2d9b9" }}>Amount</th>
          <th style={{ backgroundColor: "#b9f2d9" }}>Payment Method</th>
          <th style={{ backgroundColor: "#b9d1f2" }}>Recorded By</th>
          <th style={{ backgroundColor: "#f2b9b9" }}>Date</th>
          <th style={{ backgroundColor: "#f2d1b9" }}>
            Action
            <input
              type="checkbox"
              checked={selectedTransactions.length === transactionData.length}
              onChange={handleSelectAllChange}
              style={{marginLeft: '10px'}}
            />
          </th>
          </tr>
        </thead>
        <tbody>
           {transactionData.length > 0 ? (
              transactionData
                ?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                ?.map((transaction, index) => (
                  <tr key={transaction._id} className={index % 2 === 0 ? 'odd-row' : 'even-row'}>
                    <td>{transaction.projectName}</td>
                    <td>{transaction.category}</td>
                    <td>{transaction.description}</td>
                    <td>{transaction.quantity}</td>
                    <td>{transaction.unit}</td>
                    <td>{transaction.price}</td>
                    <td>{transaction.amount}</td>
                    <td>{transaction.paymentMethod}</td>
                    <td>{transaction.recordedBy}</td>
                    <td>{formatDate(transaction.date)}</td>
                    <td> 
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleUpdateTransaction(transaction._id)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => showHandleDelete(transaction._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(transaction._id)}
                          onChange={() => handleCheckboxChange(transaction._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="12">No transactions available</td>
              </tr>
            )}
        </tbody>
      </table>
    </div>

    {/* Modal to display the form */}
    {showModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="modal-title">Create Transaction</h2>
          
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="transaction-form">
             <div className="form-group">
              <label style={{ fontSize: '18px', marginLeft: '20px' }}>Select Income for this Transaction: </label>
              <div style={{ fontStyle: 'italic', fontSize: '12px', marginLeft: '20px' }}>If no income, create one from the income tab</div>
             </div>
             
                        

            <div>
            <div 
              onClick={() => openIncomeDropdown() } 
              style={{
                border: "1px solid #ccc",
                padding: "6px",
                cursor: "pointer",
                backgroundColor: "#fff",
              }}
            >
              {selectedReport
                ?   selectedReport  
                : "-- Select Income --"
              }
            </div>
              {/* Dropdown */}
              {openDropdownRow && (
                <div>
                  <input
                    type="text"
                    placeholder="Search Incomes..."
                    value={searchTerm}
                    onChange={(e) => {setSearchTerm(e.target.value), setSelectedReport('')}}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={{
                      width: '100%',
                      padding: '4px',
                      boxSizing: 'border-box',
                      border: 'none',
                      borderBottom: '1px solid #000',
                    }}
                  />
                <div
                  key='{report.idjjjjjjj}'
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    maxHeight: '500px',
                    overflowY: 'auto',
                    border: '1px solid #ccc',
                    backgroundColor: '#fff',
                    position: 'absolute',
                    zIndex: 9999,
                  }}
                >
                  <div style={{marginLeft: '10px', fontStyle: 'italic'}}> All Incomes</div>
                  {filteredReports.length > 0 ? (
                    filteredReports
                    ?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                    ?.map((report) => (
                      <div
                        key={report.id}
                        style={{
                          padding: '10px 15px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          backgroundColor: '#f9f9f9',
                          transition: 'background-color 0.3s, transform 0.2s',
                          marginBottom: '5px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          fontSize: '14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          color: '#333',
                        }}
                        onClick={() => handleItemClick({ target: { value: report.description } }, report)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#e0e0e0'; // Highlight on hover
                          e.target.style.transform = 'scale(1.02)'; // Slightly enlarge on hover
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#f9f9f9'; // Reset background color
                          e.target.style.transform = 'scale(1)'; // Reset size
                        }}
                      >
                        <span>{`${report.description}:   `}</span>
                        <span>{formatWithCommas(report.amount)}</span>
                      </div>

                    ))
                  ) : (
                    <li style={{ padding: '6px', color: '#888' }}>No categories found</li>
                  )}
                </div>
                </div>
              )}
            </div>

            <div className="form-group-categories">
              <ProjectSelection selectedProject={selectedProject} setSelectedProject={setSelectedProject} />       
            </div>
            <div className="form-group-categories">
              <CategorySelection category={category} setCategory={setCategory} />
            </div>
            

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                value={date ? (new Date(date)?.toISOString().split('T')[0]) : ''}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-actions">
              {switchToEditMode ? 
                <button
                  type="button"
                  className="submit-btn"
                  onClick={() => handleSaveUpdatedTransaction()}
                >
                  Update
                </button> :
                <button
                  type="submit"
                  className="submit-btn"
                >
                  Submit
                </button>
              }
              
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  fetchTransactionData();
                  resetForm();
                  setSwitchToEditMode(false);
                  setSelectedReport('')
                  setFullSelectedReport(null)
                }}
                className="close-btn"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
     {showProjectNameForm && (
        <div  style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          // zIndex: 1000,
          animation: 'fadeIn 0.3s ease-in-out', // Fade-in effect
        }}
      >
        <div 
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            animation: 'slideIn 0.3s ease-in-out', // Slide-in effect
          }}
        >
          <h2 style={{paddingBottom: '10px', textAlign: 'center', fontSize: '18px'}}>Select Project name & Report income</h2>
          <div className="form-group-categories">
            <ProjectSelection selectedProject={selectedProject} setSelectedProject={setSelectedProject} />       
          </div>
          <div style={{margin: '0px 21px'}}>
            <label style={{ fontSize: '18px' }}>Select Income for this Transaction: </label>
            <div style={{ fontStyle: 'italic', fontSize: '12px' }}>If no income, create one from the income tab</div>
          </div>
          <div 
              onClick={() => openIncomeDropdownFile() } 
              style={{ border: "1px solid #ccc", padding: "6px", cursor: "pointer", backgroundColor: "#fff",margin: '0px 21px' }} >
                {selectedReportFile
                ?   selectedReportFile  
                : "-- Select Income --"
            }</div>
            {openDropdownRowFile && (
                <div style={{ marginLeft: '21px'}}>
                  <input
                    type="text"
                    placeholder="Search Incomes..."
                    value={searchTerm}
                    onChange={(e) => {setSearchTerm(e.target.value), setSelectedReport('')}}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    style={{ width: '100%', padding: '4px', boxSizing: 'border-box', border: 'none', borderBottom: '1px solid #000', }}
                  />
                <div
                  key='{report.idjjjjjjjmm}'
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    maxHeight: '500px',
                    overflowY: 'auto',
                    border: '1px solid #ccc',
                    backgroundColor: '#fff',
                    position: 'absolute',
                    zIndex: 9999,
                  }}
                >
                  <div style={{marginLeft: '10px', fontStyle: 'italic'}}> All Incomes</div>
                  {filteredReports.length > 0 ? (
                    filteredReports
                    ?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                    ?.map((report) => (
                      <div
                        key={report.id}
                        style={{
                          padding: '10px 15px',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          backgroundColor: '#f9f9f9',
                          transition: 'background-color 0.3s, transform 0.2s',
                          marginBottom: '5px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          fontSize: '14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          color: '#333',
                        }}
                        onClick={() => handleItemClickFile({ target: { value: report.description } }, report)}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#e0e0e0'; // Highlight on hover
                          e.target.style.transform = 'scale(1.02)'; // Slightly enlarge on hover
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#f9f9f9'; // Reset background color
                          e.target.style.transform = 'scale(1)'; // Reset size
                        }}
                      >
                        <span>{`${report.description}:   `}</span>
                        <span>{formatWithCommas(report.amount)}</span>
                      </div>

                    ))
                  ) : (
                    <li style={{ padding: '6px', color: '#888' }}>No categories found</li>
                  )}
                </div>
                </div>
            )}


          <div className="form-group-categories" >
            <CategorySelection category={category} setCategory={setCategory} />
            <div style={{ fontStyle: 'italic', fontSize: '12px', marginTop: '-40px', marginLeft: '21px', marginBottom: '50px' }}>Select Income above, Category generated Automatical</div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <button
              onClick={saveImportedFileData}
              style={{
                padding: '8px 16px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                backgroundColor: '#4CAF50',
                color: 'white',
              }}
            >
              Save
            </button>
            <button
              onClick={closeShowProjectNameForm}
              style={{
                padding: '8px 16px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                backgroundColor: '#f44336',
                color: 'white',
              }}
            >
              Close
            </button>
          </div>
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
            <h3>Are you sure you want to delete this transaction?</h3>
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

const style = document.createElement('style');
style.innerHTML = `

.filter-section-contain {
  margin: 50px 20px;
  display: block;
  float: right;
  max-width: 50%;
  display: block;
}
.select-cat {
  max-width: 20%
}

.filter-section-nnnnn {
/* Media query for small screens (max-width 768px) */
  @media (max-width: 768px) {
    .filter-section-nnnnn {
      display: block !important; /* Stack elements vertically */
    }

    .responsive-container, select {
      width: 100% !important;
      margin-left: 20px !important;
      margin-bottom: 10px;
    }
  }
}




/* Styling for the Create Transaction form */
.create-transaction-btn {
  background-color: #003366;
  color: white;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  max-width: 60%;
}
.create-transaction-btn-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  max-width: 50%;
  padding: 10px;
  margin-left: 40px;
  margin-top: 80px;
  margin-bottom: -40px;
}

.create-transaction-btn:hover {
  background-color: #002244;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 900px;
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.error-message {
  color: red;
  margin-bottom: 10px;
}

.transaction-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 14px;
  margin-bottom: 8px;
}

.form-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.submit-btn {
  background-color: #003366;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #002244;
}

.close-btn {
  background-color: #f44336;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.close-btn:hover {
  background-color: #e53935;
}

.transaction-table {
  margin: 50px;
}

.table-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  border: 1px solid #ddd;
  padding: 5px;
  text-align: left;
  font-size: 13px;
}

.alert-message-container {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  padding: 15px 30px;
  max-width: 40%;
  width: 100%;
  z-index: 1000;
}

/* Container for the import button */ 
.import-button-label {
  background-color: #003366;
  color: white;
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  display: inline-block;
  text-align: center;
  margin-left: -150px;
}

.import-button-label:hover {
  background-color: #002244;
  transform: translateY(-2px);
}

.import-file-input {
  display: none;
}
.example-btn {
  margin-left: -148px;
  font-size: 12px;
  font-style: italic;
}
.example-btn:hover {
  background-color: #002244;
  color: white;
  font-size: 16px;
  padding: 5px;
  transform: translateY(-2px);
}

.filename-display {
  font-size: 0.9rem;
  color: #4a4a4a;
  padding-top: 8px;
  font-weight: 400;
}

.import-file-input:focus + .import-button-label {
  border: 2px solid #3b82f6;
  box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .example-btn {
    margin-left: -10px;
    white-space: nowrap;
  }
  .create-transaction-btn-container {
    grid-template-columns: 1fr;
    margin-left: 20px;
    margin-top: 50px;
    margin-bottom: 20px;
    padding: 10px;
  }

  .create-transaction-btn {
    max-width: 100%;
    font-size: 14px;
  }

  .modal-content {
    width: 90%;
    padding: 15px;
  }

  .modal-title {
    font-size: 20px;
  }

  .transaction-form {
    grid-template-columns: 1fr;
  }

  .form-group {
    margin-bottom: 10px;
  }

  .form-input {
    font-size: 14px;
    padding: 10px;
  }

  .transaction-table {
    margin: 20px;
  }

  .table {
    font-size: 12px;
  }

  .table th {
    font-size: 12px;
  }

  .table td {
    font-size: 12px;
    padding: 8px;
  }

  .import-button-label {
    font-size: 14px;
    padding: 8px 16px;
    margin-left: 0;
  }

  .filename-display {
    font-size: 0.8rem;
    padding-top: 6px;
  }

  .close-btn {
    width: 100%;
    text-align: center;
  }

  .alert-message-container {
    max-width: 90%;
}
/* Filter section */

`;
document.head.appendChild(style);

export default CreateTransaction;

