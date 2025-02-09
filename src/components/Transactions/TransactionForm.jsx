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

  console.log("categorycategorycategorycategory", selectedProject)
  

  useEffect(() => {
    fetchProjectData();
    fetchTransactionData();
    fetchCategories();

    if (quantity && price) {
      setAmount(quantity * price); // Update amount whenever quantity or price changes
    } else {
      setAmount(0); // Reset amount if quantity or price is not provided
    }

  }, [quantity, price]);

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
      console.log('Transactions:', response.data);
    } catch (err) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
    }
  };

  const fetchProjectData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/budget/lists`, 
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response.data", response.data)
      setProjects(response.data);
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!amount || !category || !date || !selectedProject || !quantity || !unit || !paymentMethod || !price
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
    };

    // projectName

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
        resetForm();
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

    const dataToEdit = transactionData.find((transaction) => transaction._id === id);

    setAmount(dataToEdit.amount);
    setCategory(dataToEdit.category);
    setDate(dataToEdit.date);
    setDescription(dataToEdit.description);
    setSelectedProject(dataToEdit.selectedProject);
    setQuantity(dataToEdit.quantity);
    setUnit(dataToEdit.unit);
    setPaymentMethod(dataToEdit.paymentMethod);
    setPrice(dataToEdit.price);

  };

  const handleSaveUpdatedTransaction = async () => {
    // Validate all fields
    if (!amount || !category || !date || !selectedProject || !quantity || !unit || !paymentMethod || !price
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

  return (
    <div>
      {/* Button to open the modal */}
      <div className='create-transaction-btn-container'>
        
        {/* <div className="import-button-container"> */}
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
            <div className="filename-display">
              {fileName ? `Selected file: ${fileName}` : "No file selected"}
            </div>
          </div>
        {/* </div>  */}
        {/* <button
          onClick={() => setShowModal(true)}
          className="create-transaction-btn"
        >
          Import Transactions (Excel)
        </button> */}
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

      {/* Add the table below the Create Transaction button */}
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
             {/* Loop through the transactionData array and render each transaction */}
             {transactionData.length > 0 ? (
                transactionData
                  ?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  ?.map((transaction, index) => (
                    // <tr key={index}>
                    <tr
                      key={transaction._id}
                      className={index % 2 === 0 ? 'odd-row' : 'even-row'}
                    >
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
            
            {/* Error message if fields are empty */}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="transaction-form">
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

              {/* Fourth Row (Quantity and Unit) */}
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

export default CreateTransaction;

// Styles for the component (inside the same file)
const style = document.createElement('style');
style.innerHTML = `
/* Styling for the Create Transaction form */
.create-transaction-btn {
  background-color: #003366;
  color: white;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  max-width: 60%
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
.form-group-categories{
  margin-top: -24px;
  margin-left: -20px;
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
  position: fixed; /* Keep it fixed at the top */
  top: 20%; /* Adjust position from top */
  left: 50%;
  transform: translateX(-50%); /* Center it horizontally */
  padding: 15px 30px;
  max-width: 40%; 
  width: 100%;
  z-index: 1000;
}

  /* Container for the import button */ 
.import-button-label {
  background-color: #003366; /* Dark blue */
  color: white;
  padding: 10px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  display: inline-block;
  text-align: center;
  margin-left: -150px; /* space between button and filename display */
}

/* Hover effect for the label */
.import-button-label:hover {
  background-color: #002244; /* Slightly darker blue */
  transform: translateY(-2px); /* Elevate button effect */
}

/* Input file styling: Hide the default file input */
.import-file-input {
  display: none; /* Hide the default file input */
}

/* Style the filename display */
.filename-display {
  font-size: 0.9rem;
  color: #4a4a4a;
  padding-top: 8px;
  font-weight: 400;
}

/* Optional: add focus effect on label when input is focused */
.import-file-input:focus + .import-button-label {
  border: 2px solid #3b82f6; /* Blue border on focus */
  box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); /* Blue glow */
}
  /* styles.css */
.odd-row {
  background-color: #ffffff; /* White */
}

.even-row {
  background-color: #f0f0f0; /* Light Gray */
}

`;
document.head.appendChild(style);
