import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { listTransactionsAPI } from "../../services/transactions/transactionService";
import { listCategoriesAPI } from "../../services/category/categoryService";

const TransactionList = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Fetching categories
  const { data: categoriesData } = useQuery({
    queryFn: listCategoriesAPI,
    queryKey: ["list-categories"],
  });

  // Fetching transactions
  const { data: transactions } = useQuery({
    queryFn: () => listTransactionsAPI(filters),
    queryKey: ["list-transactions", filters],
  });

  // Format the date for the table
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="transaction-list-container">
      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-inputs">
          {/* Start Date */}
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="filter-input"
          />
          {/* End Date */}
          <input
            value={filters.endDate}
            onChange={handleFilterChange}
            type="date"
            name="endDate"
            className="filter-input"
          />
          {/* Category */}
          <div className="select-wrapper">
            <select
              value={filters.category}
              onChange={handleFilterChange}
              name="category"
              className="filter-select"
            >
              <option value="All">All Categories</option>
              <option value="Uncategorized">Uncategorized</option>
              {categoriesData?.map((category) => (
                <option key={category?._id} value={category?.Name}>
                  {category?.Name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="chevron-icon" />
          </div>
        </div>
      </div>

      {/* Displaying Filtered Transactions */}
      <div className="transaction-table-container">
        <div className="table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th className="project-column">Project</th>
                <th className="category-column">Category</th>
                <th className="type-column">Type</th>
                <th className="amount-column">Amount</th>
                <th className="description-column">Description</th>
                <th className="date-column">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.length > 0 ? (
                transactions
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  .map((transaction, index) => (
                    <tr
                      key={transaction._id}
                      className={index % 2 === 0 ? "even-row" : "odd-row"}
                    >
                      <td>{transaction?.projectName}</td>
                      <td>{transaction?.category || "Uncategorized"}</td>
                      <td
                        className={`${
                          transaction.type === "income"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.type?.charAt(0).toUpperCase() +
                          transaction.type?.slice(1) ||
                          "Expense"}
                      </td>
                      <td>${transaction.amount.toLocaleString()}</td>
                      <td>{transaction.description || "No Description"}</td>
                      <td>{formatDate(transaction.date)}</td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-transactions">
                    No transactions available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        /* Container for the whole list */
        .transaction-list-container {
          margin: 1rem;
          padding: 1rem;
          background-color: #ffffff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }

        /* Filter section */
        .filter-section {
          display: flex;
          justify-content: flex-end; /* Align to the right side */
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .filter-inputs {
          display: grid;
          grid-template-columns: repeat(3, 1fr); /* Equal width for all inputs */
          gap: 0.75rem;
          width: 100%;
          max-width: 600px; /* Limit max width of filters */
        }

        .filter-input,
        .filter-select {
          padding: 0.25rem;
          font-size: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          transition: all 0.3s ease;
          width: 100%; /* Ensure inputs take full available width */
        }

        .filter-input:focus,
        .filter-select:focus {
          border-color: #3b82f6;
          outline: none;
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.5);
        }

        /* Select wrapper */
        .select-wrapper {
          position: relative;
          margin-right: 80px;
        }

        .chevron-icon {
          position: absolute;
          right: 0.25rem;
          top: 50%;
          transform: translateY(-50%);
          width: 12px;
          height: 12px;
          color: #6b7280;
        }

        /* Table wrapper with margin */
        .table-wrapper {
          margin: 0 1rem; /* Add margin on left and right side */
        }

        /* Table styles */
        .transaction-table {
          width: 92%;
          border-collapse: collapse;
          text-align: left;
          margin-top: 1rem;
          font-size: 0.75rem; /* Even smaller table font size */
        }

        .transaction-table th,
        .transaction-table td {
          padding: 0.25rem; /* Smaller padding */
          border: 1px solid #e5e7eb;
        }

        /* Individual column colors */
        .project-column {
          background-color: #bfdbfe;
          color: #374151;
        }

        .category-column {
          background-color: #d1fae5;
          color: #374151;
        }

        .type-column {
          background-color: #fef08a;
          color: #374151;
        }

        .amount-column {
          background-color: #f4aab6;
          color: #374151;
        }

        .description-column {
          background-color: #e9d5ff;
          color: #374151;
        }

        .date-column {
          background-color: #d1d5db;
          color: #374151;
        }

        .even-row {
          background-color: #f9fafb;
        }

        .odd-row {
          background-color: #ffffff;
        }

        .no-transactions {
          text-align: center;
          padding: 0.75rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default TransactionList;
