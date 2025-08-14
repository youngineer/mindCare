
import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';
import type { ChartConfiguration } from 'chart.js/auto';

const xValues = [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150];
const yValues = [7, 8, 8, 9, 9, 9, 10, 11, 14, 14, 15];

const Chart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const config: ChartConfiguration = {
        type: 'line',
        data: {
          labels: xValues,
          datasets: [
            {
              label: 'Sample Data',
              backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-primary') || '#570df8',
              borderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-primary') || '#570df8',
              pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-accent') || '#fbbf24',
              pointBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--color-accent') || '#fbbf24',
              data: yValues,
              fill: false,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content') || '#333',
                font: {
                  size: 16,
                  weight: 'bold',
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content') || '#333',
              },
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-200') || '#eee',
              },
            },
            y: {
              ticks: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-content') || '#333',
              },
              grid: {
                color: getComputedStyle(document.documentElement).getPropertyValue('--color-base-200') || '#eee',
              },
            },
          },
        },
      };
      const chartInstance = new ChartJS(chartRef.current, config);
      return () => {
        chartInstance.destroy();
      };
    }
  }, []);

  return (
    <div className="card bg-base-100 shadow-xl p-10 w-full max-w-5xl mx-auto">
      <div className="card-body">
        <h2 className="card-title text-primary mb-6 text-3xl">Mood Overview</h2>
        <div className="w-full flex justify-center">
          <canvas ref={chartRef} id="myChart" style={{ maxHeight: 520, minHeight: 420, width: '100%', minWidth: 600 }} />
        </div>
      </div>
    </div>
  );
};

export default Chart;