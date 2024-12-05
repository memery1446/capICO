import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const ICOChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { totalRaised, hardCap, softCap } = useSelector(state => state.ico);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Raised', 'Remaining to Soft Cap', 'Remaining to Hard Cap'],
        datasets: [{
          data: [
            parseFloat(totalRaised),
            Math.max(0, parseFloat(softCap) - parseFloat(totalRaised)),
            Math.max(0, parseFloat(hardCap) - Math.max(parseFloat(totalRaised), parseFloat(softCap)))
          ],
          backgroundColor: ['#4CAF50', '#FFC107', '#2196F3'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'ICO Progress'
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [totalRaised, hardCap, softCap]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default ICOChart;

