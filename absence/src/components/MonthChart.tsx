import React from 'react';
import { useEffect, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { faker } from '@faker-js/faker'; 


const MonthChart = ({ data }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
          {
            label: "Fehlstunden pro Monat",
            data: [],
            backgroundColor: ["#a82036", "#57dfc9"],
            hoverOffset: 4,
          },
        ],
      });    

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Chart.js Bar Chart',
    },
  },
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'Oktober', 'November', 'December'];




useEffect(() => {
    setChartData({
      labels: labels,
      datasets: [
        {
          label: "Fehlstunden pro Monat",
          data: data,
          backgroundColor: ["#a82036", "#57dfc9"],
          hoverOffset: 4,
        },
      ],
    });
  }, [data]);

 return (
    <div className="w-full p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Fehlstunden pro Monat</h2>
      {data ? (
        <Bar options={options} data={chartData} />
      ) : (
        <p className="text-gray-500">Keine Daten verfügbar</p>
      )}
    </div>
  );


};
export default MonthChart