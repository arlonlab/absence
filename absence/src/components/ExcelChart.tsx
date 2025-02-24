import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import "chart.js/auto"; // Required for Chart.js to work properly

const ExcelChart = ({ data }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (data.length > 0) {
      // Calculate counts for "Entschuldigt" and "Nicht entschuldigt"
      const statusCounts = data.reduce(
        (acc, row) => {
          if (row["Erledigt"]) {
            acc["Entschuldigt"] += 1;
          } else {
            acc["Nicht entschuldigt"] += 1;
          }
          return acc;
        },
        { Entschuldigt: 0, "Nicht entschuldigt": 0 }
      );

      // Set the chart data
      setChartData({
        labels: ["Entschuldigt", "Nicht entschuldigt"],
        datasets: [
          {
            label: "Abwesenheitsstatus",
            data: [statusCounts["Entschuldigt"], statusCounts["Nicht entschuldigt"]],
            backgroundColor: ["#a82036", "#57dfc9"], // Green and Red colors
            hoverOffset: 4,
          },
        ],
      });
    }
  }, [data]);

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Abwesenheitsstatus</h2>
      {chartData ? (
        <Pie data={chartData} />
      ) : (
        <p className="text-gray-500">Keine Daten verfügbar</p>
      )}
    </div>
  );
};

export default ExcelChart;