import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { BASE_URL } from "../../utils/url";
import AlertMessage from "../Alert/AlertMessage";
import { getUserFromStorage } from "../../utils/getUserFromStorage";
import ProjectSelection from "../Category/AddProject";

const token = getUserFromStorage();
ChartJS.register(ArcElement, Tooltip, Legend);

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

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchTransactionsData();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      const prjResponse = await axios.get(`${BASE_URL}/projects/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const projectsData = prjResponse?.data?.myProjects || [];
      const sortedProjects = projectsData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      setProjects(sortedProjects);
      setSelectedProject(sortedProjects[0]?.name);

      setIsLoading(false)
      setIsSuccess(true);
      setSuccessMessage("Project Report Displayed successfully.");

      setTimeout(() => {
        setIsSuccess(false);
        setSuccessMessage("")
      }, 3000);

    } catch (err) {
      console.error("Error fetching Projects", err);
    }
  };

  const fetchTransactionsData = async () => {
    try {
      const selectedProjectName = { projectName: selectedProject };
      const response = await axios.post(`${BASE_URL}/report/listsByProject`, selectedProjectName, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTransactions(response.data.myReports);
      setIsLoading(false);
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

  // Data structure for the chart
  const data = {
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

  const options = {
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

  // Process data to remove duplicated categories and sum both incomeAmount and expenseAmount
  const processData = (data) => {
    const aggregatedData = data.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          category: item.category,
          incomeAmount: 0,
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

  // Format number
  const formatNumber = (number) => new Intl.NumberFormat().format(isNaN(number) ? 0 : number);

  // Table row click for expanding details
  const handleRowClick = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  // Handle Project Change from Select Dropdown
  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
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
      {/* Chart */}
      <div className="my-8 p-6 bg-white rounded-lg shadow-xl border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-6">Transaction Overview</h1>
        <div style={{ height: "350px" }}>
          <Doughnut data={data} options={options} />
        </div>
        <div className="responsive-container">
          <ProjectSelection selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
        </div>

      </div>

      {/* Table */}
      <div style={{ marginTop: "20px", maxWidth: "1200px", marginLeft: "auto", marginRight: 'auto', marginBottom: '50px' }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "8px", backgroundColor: "#d1e7e0" }}>Categories</th>
              <th style={{ padding: "8px", backgroundColor: "#cce0ff" }}>Income</th>
              <th style={{ padding: "8px", backgroundColor: "#a8c6e8" }}>Expense</th>
              <th style={{ padding: "8px", backgroundColor: "#ffcccc" }}>Profit</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map((item, index) => (
              <React.Fragment key={index}>
                <tr key={index} onClick={() => handleRowClick(item.category)} style={{ cursor: "pointer" }}>
                  <td style={cellStyle}>{item.category}</td>
                  <td style={incomeHeaderStyle}>{formatNumber(item.incomeAmount)}</td>
                  <td style={expenseHeaderStyle}>{formatNumber(item.expenseAmount)}</td>
                  <td style={{ ...profitHeaderStyle, ...(item.profit < 0 ? negativeStyle : {}) }}>
                      {formatNumber(item.profit)}
                  </td>
                </tr>

                {/* Render expanded descriptions */}
                {expandedCategory === item.category && (
                  item.descriptions
                  ?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  ?.map((descItem, descIndex) => (
                      <tr key={`${index}-desc-${descIndex}`}>
                          <td style={{border: "1px solid gray", paddingLeft: "30px", fontSize: "12px", fontStyle: "italic", color: "gray"}}>{descItem.description}</td> {/* Description under Category */}
                          <td style={{ border: "1px solid gray", backgroundColor: "#cce0ff", paddingLeft: "30px", fontSize: "12px", fontStyle: "italic", color: "gray" }}>
                              {formatNumber(descItem.incomeAmount)}
                          </td>
                          <td style={{ border: "1px solid gray", backgroundColor: "#a8c6e8", paddingLeft: "30px", fontSize: "12px", fontStyle: "italic", color: "gray" }}>
                              {formatNumber(descItem.expenseAmount)}
                          </td>
                          <td style={{ border: "1px solid gray", backgroundColor: "#ffcccc", paddingLeft: "30px", fontSize: "12px", fontStyle: "italic", color: "gray",
                            ...(((descItem.incomeAmount ? descItem.incomeAmount : 0) - (descItem.expenseAmount ? descItem.expenseAmount : 0)) < 0 ? negativeStyle : {}) }}>
                              {formatNumber((descItem.incomeAmount ? descItem.incomeAmount : 0) - (descItem.expenseAmount ? descItem.expenseAmount : 0))}
                          </td>
                      </tr>
                  ))
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .responsive-container {
          width: 30%;
          margin-bottom: -40px;
          margin-top: -85px;
          margin-left: 9%;
          margin-right: auto;
          max-width: 1200px;
          display: flex;
          justify-content: center;
          padding: 0 10px;
        }

        @media (max-width: 1024px) {
          .responsive-container {
            width: 50%;
            margin-left: 25%;
            margin-bottom: 5px;
            margin-top: 5px;
          }
        }

        @media (max-width: 768px) {
          .responsive-container {
            width: 80%;
            margin-left: 10%;
            margin-bottom: 5px;
            margin-top: 5px;
          }
        }

        @media (max-width: 480px) {
          .responsive-container {
            width: 90%;
            margin-left: 5%;
            margin-bottom: 5px;
            margin-top: 5px;
          }
        }
      `}</style>
    </div>
    
  );
};



export default TransactionOverview;
