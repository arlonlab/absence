import { MenuItems } from "@headlessui/react";
import ApexCharts from "apexcharts";
import { useState } from "react";

interface Props {
  items: number[];
}

function GraphTest({ items }: Props) {
  const getChartOptions = () => {
    return {
      series: items,
      colors: ["#808080", "#7aff6c", "#ff6c6c"],
      chart: {
        height: 420,
        width: "100%",
        type: "pie",
      },
      stroke: {
        colors: ["white"],
        lineCap: "",
      },
      plotOptions: {
        pie: {
          labels: {
            show: true,
          },
          size: "100%",
          dataLabels: {
            offset: -25
          }
        },
      },
      labels: ["Direct", "Organic search", "Referrals"],
      dataLabels: {
        enabled: true,
        style: {
          fontFamily: "Inter, sans-serif",
        },
      },
      legend: {
        position: "bottom",
        fontFamily: "Inter, sans-serif",
      },
      yaxis: {
        labels: {
          formatter: function (value : number) {
            return value + "%"
          },
        },
      },
      xaxis: {
        labels: {
          formatter: function (value : number) {
            return value  + "%"
          },
        },
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
      },
    }
  }
  
  if (document.getElementById("pie-chart") && typeof ApexCharts !== 'undefined') {
    const chart = new ApexCharts(document.getElementById("pie-chart"), getChartOptions());
    chart.render();
  }
    
    
    return (
<>

<div className="max-w-sm w-full bg-white rounded-lg shadow dark:bg-gray-800 p-4 md:p-6">




  <div className="py-6" id="pie-chart"></div>


</div>

</>
    );
  }
  
  export default GraphTest;
  