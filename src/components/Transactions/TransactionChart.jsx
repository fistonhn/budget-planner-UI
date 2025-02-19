import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { BASE_URL } from "../../utils/url";
import { getUserFromStorage } from "../../utils/getUserFromStorage";

const token = getUserFromStorage();
ChartJS.register(ArcElement, Tooltip, Legend);

const TransactionChart = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedProject, setSelectedProject] = useState("");
  const [chartData, setChartData] = useState([]);


  // Fetch transactions data
  useEffect(() => { 
    fetchData();
  }, []); 

  const fetchData = async () => {
    try {
      const prjResponse = await axios.get(`${BASE_URL}/projects/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });  
      
      const projects = prjResponse?.data?.myProjects || [];
      const sortedProjects = projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

      console.log('sortedProjects', sortedProjects)

      setIsLoading(false)
      setSelectedProject(sortedProjects[0]?.name);


      const selectedprojectName = {
        projectName: sortedProjects[0]?.name
      }
      const datResponse = await axios.post(`${BASE_URL}/report/listsByProject`, selectedprojectName, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTransactions(datResponse.data.myReports)
      setChartData(datResponse.data.myReports);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  

  // Calculate totals for income and expense
  const totals = transactions?.length > 0 ? (transactions?.reduce(
    (acc, transaction) => {
      if (transaction?.incomeAmount) {
        acc.income += transaction?.incomeAmount;
      } else if(transaction?.expenseAmount){
        acc.expense += transaction?.expenseAmount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  )) : 0

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
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: "Income vs Expense",
        font: {
          size: 18,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
    },
    cutout: "70%",
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading transactions data</div>;
  }

  return (
    <div className="my-8 p-6 bg-white rounded-lg shadow-xl border border-gray-200">
      <h1 className="text-2xl font-bold text-center mb-6">Transaction Overview</h1>
      <div style={{ height: "350px" }}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default TransactionChart;
