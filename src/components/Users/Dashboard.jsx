import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { BASE_URL } from "../../utils/url";
import AlertMessage from "../Alert/AlertMessage";
import { getUserFromStorage } from "../../utils/getUserFromStorage";
import ProjectSelection from "../Category/AddProject";
import Chart from 'chart.js/auto'; // Ensure Chart.js is imported
import ChartDataLabels from 'chartjs-plugin-datalabels'; 

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
      // setTransactions(response.data.myReports);
      setTransactions(response.data.myReports.filter(report => report.incomeAmount !== 0));
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

      datalabels: {
        display: true,
        anchor: 'center', 
        align: 'center',
        font: {
          // weight: 'bold',
          fontStyle: 'italic',
          size: 14,
        },
        rotation: -10,
        color: 'black',
        formatter: (value) => {
          return value.toLocaleString();
        },
    },
    },
    cutout: "70%",
  };

  // Aggregate data to avoid duplicate category names
  const aggregateCategoryData = (transactions) => {
    return transactions?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))?.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { category: item.category, incomeAmount: 0, expenseAmount: 0 };
      }
      acc[item.category].incomeAmount += item.incomeAmount || 0;
      acc[item.category].expenseAmount += item.expenseAmount || 0;
      return acc;
    }, {});
  };

  const aggregatedData = Object.values(aggregateCategoryData(transactions));

  
Chart.register(ChartDataLabels); // Register the plugin

const barData = {
  labels: aggregatedData.map(item => item.category),
  datasets: [
    {
      label: "Income",
      data: aggregatedData.map(item => item.incomeAmount),
      backgroundColor: "#36A2EB",
    },
    {
      label: "Expense",
      data: aggregatedData.map(item => item.expenseAmount),
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
      // display: false,

    },
    title: {
      display: true,
      text: "Income vs Expense per Category",
      font: { size: 18, weight: "bold" },
    },
    datalabels: {
      display: true,
      anchor: 'start', 
      align: 'end',
      font: {
        // weight: 'bold',
        fontStyle: 'italic',
        size: 11,
      },
      rotation: -85,
      color: 'black',
      formatter: (value) => {
        return value.toLocaleString();
      },
  },
  },
  scales: {
    x: {
      type: "category",
    },
    y: {
      type: "linear",
      beginAtZero: true,
    },
  },
};

  
  const formatNumber = (number) => new Intl.NumberFormat().format(isNaN(number) ? 0 : number);

  // Styles restored
  const cellStyle = {
    padding: "8px",
    border: "1px solid black",
    textAlign: "center",
  };
  const negativeStyle = {
    color: "red",
  };

  const incomeHeaderStyle = {
    ...cellStyle,
    backgroundColor: "#cce0ff",
  };

  const expenseHeaderStyle = {
    ...cellStyle,
    backgroundColor: "#a8c6e8",
  };

  const profitHeaderStyle = {
    ...cellStyle,
    backgroundColor: "#ffcccc",
  };

  // Function to handle row expansion (toggle)
  const handleRowClick = (category) => {
    // Toggle expanded category
    // setExpandedCategory(prevCategory => (prevCategory === category ? null : category));
    console.log('expandedCategory', expandedCategory);
        setExpandedCategory(expandedCategory === category ? null : category);

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

  const processedData = processData(transactions);

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
      {/* <div >
        <h1 className="text-2xl font-bold text-center mb-6">Transaction Overview</h1>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", height: "350px", marginRight: "130px" }}>
          <div style={{ width: "100%", marginTop: "20px", flexBasis: "48%" }}>
            <Doughnut ref={doughnutChartRef} data={doughnutData} options={doughnutOptions} />
          </div>

          <div style={{ width: "100%", marginLeft: "20px", marginTop: "20px", flexBasis: "48%" }}>
            <Bar ref={barChartRef} data={barData} options={barOptions} />
          </div>
        </div>


        
        <div style={{width: '30%', display: 'flex', justifyContent: 'center', marginTop: '20px', marginLeft: '9%'}}>
          <ProjectSelection selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
        </div>
      </div> */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", height: "350px", marginRight: "130px" }}>
        <div className="Doughnut-chart-container" style={{marginLeft: '30px', width: "100%", marginTop: "20px", flexBasis: "48%", minWidth: "300px", height: "400px", justifyContent: "center" }}>
          <Doughnut ref={doughnutChartRef} data={doughnutData} options={doughnutOptions} />
        </div>

        <div className="bar-chart-container" style={{ width: "100%", marginLeft: "20px", marginTop: "20px", flexBasis: "48%", minWidth: "300px", height: "400px", justifyContent: "center" }}>  
          <Bar ref={barChartRef} data={barData} options={barOptions} />
        </div>
      </div>


      <div className="projectName">
        <ProjectSelection selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
      </div>

      {/* Table */}
      <div style={{ marginTop: "20px", maxWidth: "1200px", marginLeft: "auto", marginRight: 'auto', marginBottom: '50px' }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "8px", backgroundColor: "#d1e7e0", border: "1px solid black" }}>ID</th>
              <th style={{ padding: "8px", backgroundColor: "#d1e7e0", border: "1px solid black" }}>Categories</th>
              <th style={incomeHeaderStyle}>Income</th>
              <th style={incomeHeaderStyle}>Contract</th>
              <th style={expenseHeaderStyle}>Expense</th>
              <th style={profitHeaderStyle}>Profit</th>
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
                    <td style={profitHeaderStyle}>
                      {item?.incomeAmount - item?.expenseAmount > 0
                        ? "+" + formatNumber(item?.incomeAmount - item?.expenseAmount)
                        : formatNumber(item?.incomeAmount - item?.expenseAmount)}
                    </td>
                  </tr>
                  


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
        </table>
      </div>
      <style jsx>{`
        .projectName {
          width: 30%;
          margin-top: 20px;
          display: flex;
          justify-content: center;
          margin-left: 9%;
          margin-top: 200px;
        }
        @media (max-width: 768px) {
          .projectName {
            margin-top: 500px;
          }
          .doughnut-chart-container {
            display: none;
          },
          .bar-chart-container {
            width: 100%;
            height: 400px; /* Increased height for charts */
            margin-top: 20px;
            margin-bottom: 500px;
            display: none
          }
        }
      `}</style>
    </div>
   
  );
};

export default TransactionOverview;
