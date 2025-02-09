import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaTrash, FaEdit } from "react-icons/fa";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { listTransactionsAPI } from "../../services/transactions/transactionService";
import { listCategoriesAPI } from "../../services/category/categoryService";

const TransactionList = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "",
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
    <div className="my-4 p-4 shadow-lg rounded-lg bg-white">
      {/* Filter Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4 max-w-xs mx-auto">
        {/* Start Date */}
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="p-1 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
        {/* End Date */}
        <input
          value={filters.endDate}
          onChange={handleFilterChange}
          type="date"
          name="endDate"
          className="p-1 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
        {/* Type */}
        <div className="relative">
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="w-full p-1 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 appearance-none"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <ChevronDownIcon className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
        {/* Category */}
        <div className="relative">
          <select
            value={filters.category}
            onChange={handleFilterChange}
            name="category"
            className="w-full p-1 text-sm rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 appearance-none"
          >
            <option value="All">All Categories</option>
            <option value="Uncategorized">Uncategorized</option>
            {categoriesData?.map((category) => (
              <option key={category?._id} value={category?.name}>
                {category?.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      {/* Displaying Filtered Transactions */}
      <div className="my-4 p-4 shadow-lg rounded-lg bg-white">
        <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-inner">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Filtered Transactions</h3>
          <table className="min-w-full bg-white table-auto border-collapse shadow-md text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2 bg-blue-100 text-gray-700">Project</th>
                <th className="p-2 bg-green-100 text-gray-700">Category</th>
                <th className="p-2 bg-yellow-100 text-gray-700">Type</th>
                <th className="p-2 bg-red-100 text-gray-700">Amount</th>
                <th className="p-2 bg-purple-100 text-gray-700">Description</th>
                <th className="p-2 bg-gray-100 text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.length > 0 ? (
                transactions
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  .map((transaction, index) => (
                    <tr
                      key={transaction._id}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="p-2">{transaction?.projectName}</td>
                      <td className="p-2">{transaction?.category || "Uncategorized"}</td>
                      <td
                        className={`p-2 ${
                          transaction.type === "income"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.type?.charAt(0).toUpperCase() +
                          transaction.type?.slice(1) ||
                          "Expense"}
                      </td>
                      <td className="p-2">${transaction.amount.toLocaleString()}</td>
                      <td className="p-2">{transaction.description || "No Description"}</td>
                      <td className="p-2">{formatDate(transaction.date)}</td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-2 text-center">
                    No transactions available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Example for updating and deleting transactions
const handleUpdateTransaction = (id) => {
  console.log("Updating transaction", id);
};

const handleDelete = (id) => {
  console.log("Deleting transaction", id);
};

export default TransactionList;
