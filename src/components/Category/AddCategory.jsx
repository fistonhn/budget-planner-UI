import React, { useState, useEffect } from "react";
import { SiDatabricks } from "react-icons/si";
import axios from "axios";
import { FaTrash, FaEdit } from "react-icons/fa";
import * as XLSX from "xlsx";

import AlertMessage from "../Alert/AlertMessage";
import { getUserFromStorage } from "../../utils/getUserFromStorage";
import { BASE_URL } from "../../utils/url";

const token = getUserFromStorage();

const AddCategory = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [switchToEditMode, setSwitchToEditMode] = useState(false);
  const [ctgId, setCtgId] = useState("")
  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []); 

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/categories/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
      console.log('response.data', response.data)
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    const formData = { name };

    try {
      // Send POST request to API using axios
      await axios.post(
        `${BASE_URL}/categories/create`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setName("");
      setIsSuccess(true);
      setSuccessMessage("Category added successfully");
      setIsSubmitting(false);

      fetchCategories();

      // Fetch updated categories
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (err) {
      setError("Category already exists or is Invalid!");
      setIsSubmitting(false);

      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleUpdateCategory = async (id) => {
    setSwitchToEditMode(true);
    console.log(id)
    setCtgId(id)
    const dataToEdit = categories.find((category) => category._id === id);
    setName(dataToEdit.Name)
  };

  const handleSaveUpdatedCategory = async() => {
    try {
      const formData = { name };
      await axios.post(
        `${BASE_URL}/categories/update/${ctgId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }   
      );

      setName("");
      setIsSuccess(true);
      setSuccessMessage("Category updated successfully");
      setIsSubmitting(false);
      setSwitchToEditMode(false);

      fetchCategories();

      // Fetch updated categories
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (err) {
      setSwitchToEditMode(false);
      setError("Category already exists or is Invalid!");
      setIsSubmitting(false);

      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  }

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
        await axios.delete(`${BASE_URL}/categories/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsLoading(false);
      setIsSuccess(true);
      setSuccessMessage("Category deleted successfully");

      setTimeout(() => {
        setIsSuccess(false); 
     }, 3000);


     fetchCategories();
    } catch (error) {
      setIsLoading(false);
      setError("Not Authorized! Please delete only category created or imported by you!");
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    setFileName(file.name);

    if (file) {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const abuf = e.target.result;
        const wb = XLSX.read(abuf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const jsonFormattedData = jsonData.map((row, index) => {
          if (index === 0) return null; // Skip the header row
          return jsonData[0].reduce((acc, columnName, colIndex) => {
            acc[columnName] = row[colIndex];
            return acc;
          }, {});
        }).filter(item => item !== null); // Filter out the null (header row)

        try {
          setIsLoading(true);
          await axios.post(
            `${BASE_URL}/categories/create`,
            jsonFormattedData,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setIsLoading(false);
    
          setName("");
          setIsSuccess(true);
          setSuccessMessage("Categories imported successfully");
          setIsSubmitting(false);
    
          fetchCategories();
    
          // Fetch updated categories
          setTimeout(() => {
            setIsSuccess(false);
          }, 3000);
        } catch (err) {
          setIsLoading(false);
          setError("One or many Categories already exists or file is in Invalid format!");
          setIsSubmitting(false);
    
          setTimeout(() => {
            setError(null);
          }, 3000);
        }
  
        console.log("Formatted JSON Data from Excel:", jsonFormattedData);
      };
  
      // Read the file as an array buffer
      reader.readAsArrayBuffer(file);
    }
  };
  
  return (
    <div>
      {/* Form */}
      <div className="form-categories-container">
        <form onSubmit={handleSubmit} className="form-container">
          <div>
            <h2 className="form-title">Add New Category</h2>
          </div>

          {/* Display alert message */}
          <div className='alert-message-container'>
            {error && <AlertMessage type="error" message={error} />}
            {isSuccess && (
              <AlertMessage type="success" message={ successMessage } />
            )}
            {isLoading ? <AlertMessage type="loading" message="Loading" /> : null}
          </div>

          {/* Category Name */}
          <div className="form-group">
            <label htmlFor="name" className="input-label">
              <SiDatabricks className="inline mr-2 text-blue-500" />
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              id="name"
              className="input-field"
            />
          </div>

          {/* Submit Button */}
          {switchToEditMode ? 
            <button
              type="button"
              className="submit-button"
              disabled={isSubmitting}
              onClick={() => handleSaveUpdatedCategory()}
            >
              {isSubmitting ? "Updating Category..." : "Update Category"}
            </button> : 

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
              >
              {isSubmitting ? "Adding Category..." : "Add Category"}
            </button>
          }
        </form>

        <div className="import-button-container">
          <div className="filename-display">
            {fileName ? `Selected file: ${fileName}` : "No file selected"}
          </div>

          <div className="import-button-label">
            <label htmlFor="excel-upload" >
              Import Categories (Excel)
            </label>
            <input
              type="file"
              id="excel-upload"
              accept=".xlsx, .xls"
              onChange={handleExcelUpload}
              className="import-file-input"
            />
          </div>
        </div>          
      </div>

      {/* Categories Table */}
      <div className="categories-table-container">
        <h2 className="table-title">Categories</h2>
        {categories.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
              .map((category) => (
                <tr key={category.id}>
                  <td>{ category.Name?.charAt(0)?.toUpperCase() + category?.Name?.slice(1) }</td>
                  <td className="action-buttons">
                    <button
                      onClick={() => handleUpdateCategory(category._id)}
                      className="text-blue-500 hover:text-blue-700"
                      >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                      >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No categories available.</p>
        )}
      </div>
    </div>
  );
};

export default AddCategory;

// Adding styles dynamically
const style = document.createElement('style');
style.innerHTML = `
  .form-categories-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 50px;
    max-width: 80%;
    padding: 10px;
  }
  .form-container {
    margin-left: 50px;
    max-width: 100%;
    background-color: white;
    padding: 10px;
    border-radius: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-title {
    text-align: left;
    font-size: 16px;
    font-weight: 600;
    color: #4a4a4a;
  }

  .input-label {
    font-size: 14px;
    color: #4a4a4a;
    margin-bottom: 5px;
  }

  .input-field {
    padding: 5px;
    border: 1px solid #dcdcdc;
    border-radius: 0.375rem;
    width: 100%;
    font-size: 14px;
    outline-color: #3b82f6;
  }

  .submit-button {
    background-color: #003366;
    color: white;
    padding: 5px 5px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .submit-button:hover {
    background-color: #002244;
  }

  .categories-table-container {
    max-width: 60%;
    margin-left: 50px;
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .table-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #4a4a4a;
    margin-bottom: 1rem;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .table th, .table td {
    padding: 12px;
    border: 1px solid #dcdcdc;
    text-align: left;
  }

  .table th {
    background-color: #f9f9f9;
  }

  .action-buttons {
    margin: 2px;
  }
  
  /* Styles for the import categories button */
  .import-button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 70px;
    margin-left: 0; /* Remove unnecessary margin-left */
  }

  .import-button-label {
    background-color: #1d4ed8;
    color: white;
    padding: 12px 28px;
    font-size: 1.1rem;
    font-weight: 700;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    display: inline-block;
    text-align: left;
    margin-top: 10px;
  }

  .import-button-label:hover {
    background-color: #1e40af;
    transform: translateY(-4px);
  }

  .import-file-input {
    display: none;
  }

  .filename-display {
    font-size: 1rem;
    color: #374151;
    padding-top: 10px;
    font-weight: 500;
  }

  .import-file-input:focus + .import-button-label {
    border: 2px solid #3b82f6;
    box-shadow: 0 0 6px rgba(59, 130, 246, 0.6);
  }
`;

document.head.appendChild(style);
