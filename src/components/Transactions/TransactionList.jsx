import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../utils/url";
import { getUserFromStorage } from "../../utils/getUserFromStorage";
import ProjectSelection from "../Category/AddProject";

const token = getUserFromStorage();

const Table = () => {
    const [data, setData] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [expandedCategory, setExpandedCategory] = useState(null); // Track the expanded row

    useEffect(() => {
      fetchProjects();
    }, []);
  
    useEffect(() => {
      if (selectedProject) {
        fetchData();
      }
    }, [selectedProject]);

    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/projects/lists`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        const projects = response?.data?.myProjects || [];
    
        // Sort projects by updatedAt in descending order (latest updated first)
        const sortedProjects = projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
        // Set the latest updated project as selected by default
        if (sortedProjects.length > 0) {
          setSelectedProject(sortedProjects[0]?.name); // Set default project
        }
    
        setProjects(sortedProjects); // Save all projects in state
      } catch (err) {
        console.error("Error fetching Projects", err);
      }
    };
    

    const fetchData = async () => {
      try {
        const selectedprojectName = {
          projectName: selectedProject
        }
        const datResponse = await axios.post(`${BASE_URL}/report/listsByProject`, selectedprojectName, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // console.log("datResponse", datResponse);

        // Process data to remove duplicated categories and sum both incomeAmount and expenseAmount
        const processedData = processData(datResponse.data.myReports);
        setData(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

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
        acc[item.category].descriptions.push(item);  // Keep the full item with its income/expense

        if (new Date(item.updatedAt) > new Date(acc[item.category].updatedAt)) {
          acc[item.category].updatedAt = item.updatedAt;
        }

        return acc;
      }, {});

      const aggregatedArray = Object.values(aggregatedData).map((item) => ({
        ...item,
        profit: item.incomeAmount - item.expenseAmount,
      }));

      return aggregatedArray.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    };

    const handleProjectChange = (event) => {
      setSelectedProject(event.target.value);
      // console.log("selectedProject", selectedProject)
    };

    const formatNumber = (number) => {
      // Replace NaN with 0 and format the number
      return new Intl.NumberFormat().format(isNaN(number) ? 0 : number);
    };

    const handleRowClick = (category) => {
      setExpandedCategory(expandedCategory === category ? null : category); // Toggle expanded row
    };

    // Styles
    const containerStyle = {
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "column",
        padding: "20px",
    };

    const sectionStyle = {
        width: "100%",
        marginTop: "20px", 
        marginLeft: "auto", 
        marginRight: "auto", 
        maxWidth: "1200px", 
    };

    const tableContainerStyle = {
        ...sectionStyle, // Same as sectionStyle for margin
        border: "2px solid black",
        borderCollapse: "collapse",
    };

    const tableStyle = {
        width: "100%",
        borderCollapse: "collapse",
        fontFamily: "Arial, sans-serif",
    };
    
    const cellStyle = {
        border: "1px solid black",
        padding: "8px",
        textAlign: "left",
    };

    const categoriesHeaderStyle = {
        ...cellStyle,
        backgroundColor: "#d1e7e0", // Light green (for categories)
    };

    const incomeHeaderStyle = {
        ...cellStyle,
        backgroundColor: "#cce0ff", // Light blue (for income)
    };

    const expenseHeaderStyle = {
        ...cellStyle,
        backgroundColor: "#a8c6e8", // Lighter blue (for expense)
    };

    const profitHeaderStyle = {
        ...cellStyle,
        backgroundColor: "#ffcccc", // Light red (for profit)
    };

    const negativeStyle = {
        color: "red",
    };

    return (
        <div style={containerStyle}>
            {/* Project Selection */}
            <div style={sectionStyle}>
                <div 
                  style={{
                    width: '30%', 
                    marginBottom: '-20px',
                    '@media (max-width: 768px)': {
                      width: '100%',
                    }
                  }}
                >
                  <ProjectSelection selectedProject={selectedProject} setSelectedProject={setSelectedProject} />       
                </div>
            </div>

            {/* Table Container */}
            <div style={tableContainerStyle}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={categoriesHeaderStyle}>Categories</th>
                            <th style={incomeHeaderStyle}>Income</th>
                            <th style={expenseHeaderStyle}>Expense</th>
                            <th style={profitHeaderStyle}>Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((item, index) => (
                            <>
                                <tr
                                    key={index}
                                    onClick={() => handleRowClick(item.category)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <td style={cellStyle}>{item.category}</td>
                                    <td style={incomeHeaderStyle}>{formatNumber(item.incomeAmount)}</td>
                                    <td style={expenseHeaderStyle}>{formatNumber(item.expenseAmount)}</td>
                                    <td style={{ ...profitHeaderStyle, ...(item.profit < 0 ? negativeStyle : {}) }}>
                                        {formatNumber(item.profit)}
                                    </td>
                                </tr>

                                {/* Render expanded descriptions below the category row if it's expanded */}
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
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Table;
