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

  const [projects, setProjects] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [switchToEditMode, setSwitchToEditMode] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectableCategories, setSelectableCategories] = useState([])
  const [incomeReport, setIncomeReport] = useState([])
  const [openDropdownRow, setOpenDropdownRow] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState("");
  const [fullSelectedReport, setFullSelectedReport] = useState(null)
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
    fetchProjectData();
    }, []);

  const fetchTransactionData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/transactions/lists`, 
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTransactionData(response.data);
      setSelectableCategories(response.data)

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

      setProjects(sortedProjects);
      
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

    console.log('fffffffffffffffffffff', response.data.myReports)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!amount || !category || !date || !selectedProject || !quantity || !unit || !paymentMethod || !price || !fullSelectedReport
    ) {
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
      await axios.post(`${BASE_URL}/transactions/create`, transactionData,
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      setIsSuccess(true);
      setSuccessMessage("Transaction recorded successfully");

      setTimeout(() => {
        setIsSuccess(false); 
        // resetForm();
     }, 3000);

      // setShowModal(false);
      
    } catch (error) {
      setIsLoading(false);
      setErrorMessage("Something went wrong. Please try again!");
      setIsError(true);

      setTimeout(() => {
        setIsError(false);

      }, 3000);
      console.error("There was an error creating the transaction:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);

        await axios.delete(`${BASE_URL}/transactions/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsLoading(false);
      setIsSuccess(true);
      setSuccessMessage("Transaction deleted successfully");


      setTimeout(() => {
        setIsSuccess(false); 
     }, 3000);


      fetchTransactionData();
    } catch (error) {
      setIsLoading(false);

      console.error("Error deleting transaction:", error);
    }
  }; 
  
  const handleUpdateTransaction = async (id) => {
    setShowModal(true)
    setSwitchToEditMode(true);
    setTransactionId(id)
    fetchReportData()

    const dataToEdit = transactionData.find((transaction) => transaction._id === id);

    console.log("dataToEditdataToEditdataToEdit", fullSelectedReport)

    setAmount(dataToEdit.amount);
    setCategory(dataToEdit.category);
    setDate(dataToEdit.date);
    setDescription(dataToEdit.description);
    setSelectedProject(dataToEdit.projectName);
    setQuantity(dataToEdit.quantity);
    setUnit(dataToEdit.unit);
    setPaymentMethod(dataToEdit.paymentMethod);
    setPrice(dataToEdit.price);
    setSelectedReport(fullSelectedReport.description || "")

  };

  const handleSaveUpdatedTransaction = async () => {
    // Validate all fields
    if (!amount || !category || !date || !selectedProject || !quantity || !unit || !paymentMethod || !price || !fullSelectedReport
    ) {
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
      fullSelectedReport

    };

    try {
      setIsLoading(true);
      await axios.put(`${BASE_URL}/transactions/update/${transactionId}`, transactionData,
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLoading(false);
      setIsSuccess(true);
      setSuccessMessage("Transaction updated successfully");

      setTimeout(() => {
        setIsSuccess(false); 
        resetForm();
        setShowModal(false);
        setSwitchToEditMode(false);
        fetchTransactionData();
     }, 3000);

    } catch (error) {
      setIsLoading(false);
      setErrorMessage("something went wrong. Please try again!");
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
        }).filter(item => item !== null); // Filter out the null (header row)

        try {
          setIsLoading(true);
          await axios.post(
            `${BASE_URL}/transactions/importTransactions`,
            jsonFormattedData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setIsLoading(false);
    
          setFileName("");
          setIsSuccess(true);
          setSuccessMessage("Transactions imported successfully");
    
          fetchTransactionData();
    
          // Fetch updated categories
          setTimeout(() => {
            setIsSuccess(false);
          }, 3000);
        } catch (err) {
          console.log('err', err)
          setIsLoading(false);
          setErrorMessage("Invalid file format! Please check file columns.");
          setIsError(true);

          setTimeout(() => {
            setIsError(false);

          }, 3000);
          console.error("There was an error creating the transaction:", error);
        }
  
      };
  
      // Read the file as an array buffer
      reader.readAsArrayBuffer(file);
    }
  };

  // Reset form fields after submission
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

  // Handle input blur
  const handleBlur = () => {
    // Add a slight delay before closing the dropdown to allow clicking on list items
    setTimeout(() => setOpenDropdownRow(false), 200);
  };
  const handleItemClick = (e, report) => {
    setOpenDropdownRow(false)
    setSearchTerm('');
    console.log("descriptiondescriptiondescription", report)
    setSelectedReport(e.target.value)
    setFullSelectedReport(report)
  };

   // Filter the incomeReport based on the search term
   const filteredReports = incomeReport.filter((report) =>
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openIncomeDropdown = () => {
    openDropdownRow === true ? setOpenDropdownRow(false) : setOpenDropdownRow(true)
    fetchReportData()

  }
  

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
        <div style={{ maxWidth: '30%', float: 'right', marginRight: '50px', fontSize: '12px' }}>
          <select
            value={filters.category?.Name}
            onChange={handleFilterChange}
            name="category"
            style={{ width: '300px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="All" >Sort Categories</option>
            <option value="All" style={{ color: 'black', fontSize: '16px', fontFamily: 'Arial', backgroundColor: '#f0f0f0' }}>All Categories</option>

            {
            // Remove duplicates by creating a Set from the categories and mapping them
            [...new Set(selectableCategories?.map((category) => category?.category))].map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))
            }

          </select>
        </div>

     </div>


    <div className="transaction-table">
      <h3 className="table-title">Transaction Overview</h3>
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
          <th style={{ backgroundColor: "#f2d1b9" }}>Action</th>
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
                          onClick={() => handleDelete(transaction._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
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
                        <span>{report.description}</span>
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
                value={date}
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

