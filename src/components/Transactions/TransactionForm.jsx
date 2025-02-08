import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaEdit } from "react-icons/fa";
import { BASE_URL } from "../../utils/url";
import { getUserFromStorage } from "../../utils/getUserFromStorage";
import AlertMessage from "../Alert/AlertMessage";

const token = getUserFromStorage();

const CreateTransaction = () => {

  const [type, setType] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [projectName, setProjectName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [vendor, setVendor] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [categories, setCategories] = useState([]);

  const [projects, setProjects] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjectData();
    fetchTransactionData();
    fetchCategories();
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
    if (!type || !amount || !category || !date || !projectName || !quantity || !unit || !paymentMethod || !vendor
    ) {
      setError("All fields are required!");
      return;
    }

    // Prepare data for submission
    const transactionData = {
      type,
      amount,
      currency,
      category,
      date,
      description,
      projectName,
      quantity,
      unit,
      paymentMethod,
      vendor,
    };

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
      setErrorMessage("Category name already exists");
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

  // Reset form fields after submission
  const resetForm = () => {
    setType("");
    setAmount("");
    setCurrency("");
    setCategory("");
    setDate("");
    setDescription("");
    setProjectName("");
    setQuantity("");
    setUnit("");
    setPaymentMethod("");
    setVendor("");
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
      <button
        onClick={() => setShowModal(true)}
        className="create-transaction-btn"
      >
        Create new Transaction
      </button>
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
            <th style={{ backgroundColor: "#f2b9b9" }}>Date</th>
            <th style={{ backgroundColor: "#d1f2b9" }}>Category</th>
            <th style={{ backgroundColor: "#b9e0f2" }}>Project Name</th>
            <th style={{ backgroundColor: "#f2e3b9" }}>Quantity</th>
            <th style={{ backgroundColor: "#d9b9f2" }}>Unit</th>
            <th style={{ backgroundColor: "#f2d9b9" }}>Amount</th>
            <th style={{ backgroundColor: "#b9f2b9" }}>Currency</th>
            <th style={{ backgroundColor: "#f2b9d9" }}>Type</th>
            <th style={{ backgroundColor: "#b9f2d9" }}>Payment Method</th>
            <th style={{ backgroundColor: "#f2f0b9" }}>Vendor</th>
            <th style={{ backgroundColor: "#d1b9f2" }}>Description</th>
            <th style={{ backgroundColor: "#b9d1f2" }}>Recorded By</th>
            <th style={{ backgroundColor: "#f2d1b9" }}>Action</th>
            </tr>
          </thead>
          <tbody>
             {/* Loop through the transactionData array and render each transaction */}
             {transactionData.length > 0 ? (
                transactionData
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // Sort in descending order
                  .map((transaction, index) => (
                    <tr key={index}>
                      <td>{formatDate(transaction.date)}</td>
                      <td>{transaction.category}</td>
                      <td>{transaction.projectName}</td>
                      <td>{transaction.quantity}</td>
                      <td>{transaction.unit}</td>
                      <td>{transaction.amount}</td>
                      <td>{transaction.currency.toUpperCase()}</td>
                      <td>{transaction.type}</td>
                      <td>{transaction.paymentMethod}</td>
                      <td>{transaction.vendor}</td>
                      <td>{transaction.description}</td>
                      <td>{transaction.recordedBy}</td>
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
              {/* First Row (Type and Amount) */}
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
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
                <label className="form-label">Currency</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              {/* Second Row (Category and Date) */}
              {/* <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input"
                  required
                />
              </div> */}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Select a Category</option>
                  {/* Display categories dynamically */}
                  {categories.map((categoryItem) => (
                    <option key={categoryItem.id} value={categoryItem.Name}>
                      {categoryItem.Name}
                    </option>
                  ))}
                </select>
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

              {/* Third Row (Description and Project Name) */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Project Name</label>
                <select
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project, index) => (
                    <option key={index} value={project?.projectName}>{project?.projectName}</option>
                  ))}
                </select>
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

              {/* Fifth Row (Payment Method and Vendor) */}
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
                <label className="form-label">Vendor</label>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-btn"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    fetchTransactionData();
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
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin: 50px;
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
    position: fixed; /* Keep it fixed at the top */
    top: 20%; /* Adjust position from top */
    left: 50%;
    transform: translateX(-50%); /* Center it horizontally */
    padding: 15px 30px;
    max-width: 40%; 
    width: 100%;
    z-index: 1000;

  }
`;
document.head.appendChild(style);
