'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Monthly Activity Chart Component
 */
export const MonthlyActivityChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Activity Trend',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  );
};

/**
 * Category Distribution Chart Component
 */
export const CategoryDistributionChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.data,
        backgroundColor: data.backgroundColor,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 15,
        }
      },
      title: {
        display: true,
        text: 'Products by Category',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
  };

  return (
    <div className="h-64">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

/**
 * Content Growth Chart Component
 */
export const ContentGrowthChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Content Growth Over Time',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  );
};

/**
 * Messages Trend Chart Component
 */
export const MessagesTrendChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Messages per Day',
        data: data.data,
        borderColor: data.borderColor,
        backgroundColor: data.backgroundColor,
        fill: data.fill,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Messages Trend (Last 30 Days)',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};

/**
 * System Health Chart Component
 */
export const SystemHealthChart = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">System Health</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Database Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon(data.database === 'healthy' ? 'healthy' : 'error')}</span>
            <span className="font-medium">Database</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(data.database === 'healthy' ? 'healthy' : 'error')}`}>
            {data.database}
          </span>
        </div>

        {/* Disk Space */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon(data.disk_space > 20 ? 'healthy' : data.disk_space > 10 ? 'warning' : 'error')}</span>
            <span className="font-medium">Disk Space</span>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {data.disk_space}% free
          </span>
        </div>

        {/* Overall Status */}
        <div className="md:col-span-2 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon(data.status)}</span>
            <span className="font-medium">Overall Status</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.status)}`}>
            {data.status}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Last checked: {new Date(data.last_check).toLocaleString()}
      </p>
    </div>
  );
};

export default {
  MonthlyActivityChart,
  CategoryDistributionChart,
  ContentGrowthChart,
  MessagesTrendChart,
  SystemHealthChart,
};
