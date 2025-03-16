import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { BASE_URL } from "../../utils/url";
import AlertMessage from "../Alert/AlertMessage";
import { getUserFromStorage } from "../../utils/getUserFromStorage";
import ProjectSelection from "../Category/AddProject";

const token = getUserFromStorage();
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale); // Register CategoryScale here

const TransactionOverview = () => {
  const [transactions, setTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null); 
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Refs to store chart instances
  const doughnutChartRef = useRef(null);
  const barChartRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchReportData();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const prjResponse = await axios.get(`${BASE_URL}/projects/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const projectsData = prjResponse?.data?.myProjects || [];
      const sortedProjects = projectsData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setProjects(sortedProjects);
      const selectedProjectName = localStorage.getItem("projectName") || null;
      if (selectedProjectName === null) { 
        setSelectedProject(sortedProjects[0]?.name);
      } else {
        setSelectedProject(selectedProjectName);
      }
      setIsLoading(false);
      setIsSuccess(true);
      setSuccessMessage("Project Report Displayed successfully.");
      setTimeout(() => {
        setIsSuccess(false);
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      console.error("Error fetching Projects", err);
    }
  };

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const selectedProjectName = { projectName: selectedProject };
      const response = await axios.post(`${BASE_URL}/report/listsByProject`, selectedProjectName, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(response.data.myReports);
      setIsLoading(false);
      setIsSuccess(true);
      setSuccessMessage("Project Report Displayed successfully.");
      setTimeout(() => {
        setIsSuccess(false);
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error fetching transactions data:", error);
      setIsError(true);
      setIsLoading(false);
    }
  };

  // Calculate totals for income and expense
  const totals = transactions?.length
    ? transactions?.reduce(
        (acc, transaction) => {
          if (transaction?.incomeAmount) acc.income += transaction?.incomeAmount;
          else if (transaction?.expenseAmount) acc.expense += transaction?.expenseAmount;
          return acc;
        },
        { income: 0, expense: 0 }
      )
    : { income: 0, expense: 0 };

  // Data structure for the Doughnut chart
  const doughnutData = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        label: "Transactions",
        data: [totals?.income, totals?.expense],
        backgroundColor: ["#36A2EB", "#FF6384"],
        borderColor: ["#36A2EB", "#FF6384"],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 25,
          boxWidth: 12,
          font: { size: 14 },
        },
      },
      title: {
        display: true,
        text: "Income vs Expense",
        font: { size: 18, weight: "bold" },
        padding: { top: 10, bottom: 30 },
      },
    },
    cutout: "70%",
  };

  // Data structure for the Bar chart
  const barData = {
    labels: transactions?.map(transaction => transaction.category),
    datasets: [
      {
        label: "Income",
        data: transactions?.map(transaction => transaction.incomeAmount || 0),
        backgroundColor: "#36A2EB",
      },
      {
        label: "Expense",
        data: transactions?.map(transaction => transaction.expenseAmount || 0),
        backgroundColor: "#FF6384",
      },
    ],
  };

  const barOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Income vs Expense per Category",
        font: { size: 18, weight: "bold" },
      },
    },
    scales: {
      x: {
        type: "category",  // Ensure 'category' scale is used
      },
      y: {
        type: "linear",  // Ensure 'linear' scale is used for y-axis
        beginAtZero: true,
      },
    },
  };

  const processData = (data) => {
    const aggregatedData = data.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          category: item.category,
          incomeAmount: 0,
          amount: item.amount,
          expenseAmount: 0,
          updatedAt: item.updatedAt,
          descriptions: [],
        };
      }
      acc[item.category].incomeAmount += item.incomeAmount || 0;
      acc[item.category].expenseAmount += item.expenseAmount || 0;
      acc[item.category].descriptions.push(item);

      if (new Date(item.updatedAt) > new Date(acc[item.category].updatedAt)) {
        acc[item.category].updatedAt = item.updatedAt;
      }
      return acc;
    }, {});

    return Object.values(aggregatedData).map((item) => ({
      ...item,
      profit: item.incomeAmount - item.expenseAmount,
    })).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  };

  const formatNumber = (number) => new Intl.NumberFormat().format(isNaN(number) ? 0 : number);

  const handleRowClick = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const processedData = processData(transactions);

  const cellStyle = {
    border: "1px solid black",
    padding: "8px",
    textAlign: "left",
  };

  const profitHeaderStyle = {
    ...cellStyle,
    backgroundColor: "#ffcccc", // Light red (for profit)
  };

  const negativeStyle = {
    color: "red",
  };

  const incomeHeaderStyle = {
    ...cellStyle,
    backgroundColor: "#cce0ff", // Light blue (for income)
  };

  const expenseHeaderStyle = {
    ...cellStyle,
    backgroundColor: "#a8c6e8", // Lighter blue (for expense)
  };

  return (
    <div>
      <div className="alert-message-container">
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
      {/* Chart Block */}
      <div className="my-8 p-6 bg-white rounded-lg shadow-xl border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-6">Transaction Overview</h1>
        <div className="flex justify-between" style={{ height: "350px", marginRight: '130px' }}>
          {/* Doughnut Chart */}
          <div className="w-[48%]">
            <Doughnut ref={doughnutChartRef} data={doughnutData} options={doughnutOptions} />
          </div>
          {/* Bar Chart */}
          <div className="w-[48%]">
            <Bar ref={barChartRef} data={barData} options={barOptions} />
          </div>
        </div>
        <div style={{width: '30%', display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '9%'}}>
          <ProjectSelection selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
        </div>
      </div>

      {/* Table */}
      <div style={{ marginTop: "20px", maxWidth: "1200px", marginLeft: "auto", marginRight: 'auto', marginBottom: '50px' }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "8px", backgroundColor: "#d1e7e0", border: "1px solid black" }}>ID</th>
              <th style={{ padding: "8px", backgroundColor: "#d1e7e0", border: "1px solid black" }}>Categories</th>
              <th style={{ padding: "8px", backgroundColor: "#cce0ff", border: "1px solid black" }}>Income</th>
              <th style={{ padding: "8px", backgroundColor: "#cce0ff", border: "1px solid black" }}>Contract</th>
              <th style={{ padding: "8px", backgroundColor: "#a8c6e8", border: "1px solid black" }}>Expense</th>
              <th style={{ padding: "8px", backgroundColor: "#ffcccc", border: "1px solid black" }}>Profit</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map((item, index) => {
              const letter = String.fromCharCode(65 + (index % 26));

              return (
                <React.Fragment key={index}>
                  <tr onClick={() => handleRowClick(item.category)} style={{ cursor: "pointer" }}>
                    <td style={cellStyle}>{letter}</td>
                    <td style={cellStyle}>  {item.category.charAt(0).toUpperCase() + item.category.slice(1)}</td>
                    <td style={incomeHeaderStyle}>{formatNumber(item.incomeAmount)}</td>
                    <td style={incomeHeaderStyle}>{formatNumber(item.amount)}</td>
                    <td style={expenseHeaderStyle}>{formatNumber(item.expenseAmount)}</td>
                    <td style={{ ...profitHeaderStyle, ...(item.profit < 0 ? negativeStyle : {}) }}>
                      {formatNumber(item.profit)}
                    </td>
                  </tr>

                  {/* Render expanded descriptions */}
                  {expandedCategory === item.category &&
                    item.descriptions
                      ?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                      ?.map((descItem, descIndex) => {
                        const descriptionLabel = `${letter}${descIndex + 1}`;

                        return (
                          <tr key={`${index}-desc-${descIndex}`}>
                            <td
                              style={{
                                border: "1px solid gray",
                                paddingLeft: "30px",
                                fontSize: "12px",
                                fontStyle: "italic",
                                color: "gray",
                              }}
                            >
                              {descriptionLabel}
                            </td>
                            <td
                              style={{
                                border: "1px solid gray",
                                paddingLeft: "30px",
                                fontSize: "12px",
                                fontStyle: "italic",
                                color: "gray",
                              }}
                            >
                              {descItem.description.charAt(0).toUpperCase() + descItem.description.slice(1)}
                            </td>
                            <td
                              style={{
                                border: "1px solid gray",
                                backgroundColor: "#cce0ff",
                                paddingLeft: "30px",
                                fontSize: "12px",
                                fontStyle: "italic",
                                color: "gray",
                              }}
                            >
                              {formatNumber(descItem.incomeAmount)}
                            </td>
                            <td
                              style={{
                                border: "1px solid gray",
                                backgroundColor: "#cce0ff",
                                paddingLeft: "30px",
                                fontSize: "12px",
                                fontStyle: "italic",
                                color: "gray",
                              }}
                            >
                              {formatNumber(descItem.amount)}
                            </td>
                            <td
                              style={{
                                border: "1px solid gray",
                                backgroundColor: "#a8c6e8",
                                paddingLeft: "30px",
                                fontSize: "12px",
                                fontStyle: "italic",
                                color: "gray",
                              }}
                            >
                              {formatNumber(descItem.expenseAmount)}
                            </td>
                            <td
                              style={{
                                border: "1px solid gray",
                                backgroundColor: "#ffcccc",
                                paddingLeft: "30px",
                                fontSize: "12px",
                                fontStyle: "italic",
                                color: "gray",
                                ...(((descItem.incomeAmount ? descItem.incomeAmount : 0) - (descItem.expenseAmount ? descItem.expenseAmount : 0)) < 0
                                  ? negativeStyle
                                  : {}),
                              }}
                            >
                              {formatNumber(
                                (descItem.incomeAmount ? descItem.incomeAmount : 0) - (descItem.expenseAmount ? descItem.expenseAmount : 0)
                              )}
                            </td>
                          </tr>
                        );
                      })}
                </React.Fragment>
              );
            })}
          </tbody>

          {/* Totals Row */}
          <tfoot>
            <tr style={{ backgroundColor: "#f0f0f0", fontWeight: "bold" }}>
              <td style={{ padding: "8px", border: "1px solid black", textAlign: 'center' }} colSpan="2">Total</td>
              <td style={{ padding: "8px", border: "1px solid black", backgroundColor: "#cce0ff" }}>
                {formatNumber(processedData.reduce((acc, item) => acc + item.incomeAmount, 0))}
              </td>
              <td style={{ padding: "8px", border: "1px solid black", backgroundColor: "#cce0ff" }}>
                {formatNumber(processedData.reduce((acc, item) => acc + item.amount, 0))}
              </td>
              <td style={{ padding: "8px", border: "1px solid black", backgroundColor: "#a8c6e8" }}>
                {formatNumber(processedData.reduce((acc, item) => acc + item.expenseAmount, 0))}
              </td>
              <td style={{ padding: "8px", border: "1px solid black", ...profitHeaderStyle, ...((processedData.reduce((acc, item) => acc + item.profit, 0)) < 0 ? negativeStyle : {}) }}>
                {formatNumber(processedData.reduce((acc, item) => acc + item.profit, 0))}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TransactionOverview;
