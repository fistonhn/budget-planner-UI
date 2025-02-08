import React, { useState, useEffect } from "react";
import { SiDatabricks } from "react-icons/si";
import axios from "axios";
import { FaTrash, FaEdit } from "react-icons/fa";
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

  const handleDelete = async (id) => {
    try {
        await axios.delete(`${BASE_URL}/categories/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsSuccess(true);
      setSuccessMessage("Category deleted successfully");


      setTimeout(() => {
        setIsSuccess(false); 
     }, 3000);


     fetchCategories();
    } catch (error) {
      setIsLoading(false);

      console.error("Error deleting Category:", error);
    }
  };

  return (
    <div>
      {/* Form */}
      <form onSubmit={handleSubmit} className="form-container">
        <div>
          <h2 className="form-title">Add New Category</h2>
        </div>

        {/* Display alert message */}
        {error && <AlertMessage type="error" message={error} />}
        {isSuccess && (
          <AlertMessage type="success" message={ successMessage } />
        )}

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
        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding Category..." : "Add Category"}
        </button>
      </form>

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
                  <td>{category.Name}</td>
                  <td className="action-buttons">
                    <button
                      onClick={() => handleUpdateCategory(category._id)}
                      className="edit-button"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="delete-button"
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
  .form-container {
    max-width: 60%;
    margin: 10px 50px;
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-title {
    text-align: left;
    font-size: 1.5rem;
    font-weight: 600;
    color: #4a4a4a;
  }

  .input-label {
    font-size: 1rem;
    color: #4a4a4a;
    margin-bottom: 0.5rem;
  }

  .input-field {
    padding: 0.75rem;
    border: 1px solid #dcdcdc;
    border-radius: 0.375rem;
    width: 100%;
    font-size: 1rem;
    outline-color: #3b82f6;
  }

  .submit-button {
    background-color: #003366;
    color: white;
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
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
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    text-align: left;
    font-size: 1rem;
  }

  .table th {
    background-color: #f3f4f6;
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
  }

  .edit-button, .delete-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
  }

  .edit-button:hover {
    color: #3b82f6;
  }

  .delete-button:hover {
    color: #ef4444;
  }
`;
document.head.appendChild(style);
