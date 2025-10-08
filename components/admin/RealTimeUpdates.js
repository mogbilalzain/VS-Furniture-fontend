'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { dashboardAPI } from '../../lib/api';

/**
 * Real-time Updates Component for Dashboard
 */
const RealTimeUpdates = ({ onStatsUpdate, onNewActivity }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [updateInterval, setUpdateInterval] = useState(30000); // 30 seconds default
  const [notifications, setNotifications] = useState([]);

  // Auto-refresh stats
  const refreshStats = useCallback(async () => {
    try {
      const response = await dashboardAPI.getStats();
      if (response.success) {
        onStatsUpdate?.(response.data);
        setLastUpdate(new Date());
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to refresh stats:', error);
      setIsConnected(false);
    }
  }, [onStatsUpdate]);

  // Check for new activity
  const checkNewActivity = useCallback(async () => {
    try {
      const response = await dashboardAPI.getStats();
      if (response.success && response.data.recentActivity) {
        const newActivities = response.data.recentActivity.slice(0, 3);
        onNewActivity?.(newActivities);
        
        // Create notifications for very recent activities (last 5 minutes)
        const recentActivities = newActivities.filter(activity => {
          const activityTime = new Date(activity.date);
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          return activityTime > fiveMinutesAgo;
        });

        if (recentActivities.length > 0) {
          setNotifications(prev => [
            ...recentActivities.map(activity => ({
              id: Date.now() + Math.random(),
              message: activity.description,
              type: activity.type,
              timestamp: new Date(activity.date),
            })),
            ...prev.slice(0, 4) // Keep only last 5 notifications
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to check new activity:', error);
    }
  }, [onNewActivity]);

  // Setup intervals
  useEffect(() => {
    // Initial load
    refreshStats();
    checkNewActivity();

    // Set up intervals
    const statsInterval = setInterval(refreshStats, updateInterval);
    const activityInterval = setInterval(checkNewActivity, 15000); // Check activity every 15 seconds

    return () => {
      clearInterval(statsInterval);
      clearInterval(activityInterval);
    };
  }, [refreshStats, checkNewActivity, updateInterval]);

  // Auto-remove old notifications
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setNotifications(prev => 
        prev.filter(notification => {
          const age = Date.now() - notification.timestamp.getTime();
          return age < 5 * 60 * 1000; // Remove notifications older than 5 minutes
        })
      );
    }, 60000); // Check every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'product': return '📦';
      case 'message': return '📧';
      case 'category': return '📂';
      case 'solution': return '💡';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'product': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'message': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'category': return 'bg-green-50 border-green-200 text-green-800';
      case 'solution': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Connection Status */}
      <div className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-2 ${
        isConnected 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>{isConnected ? 'Live Updates Active' : 'Connection Lost'}</span>
        {lastUpdate && (
          <span className="text-xs opacity-75">
            • {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Real-time Notifications */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-3 rounded-lg border shadow-sm animate-slide-in ${getNotificationColor(notification.type)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-2 flex-1">
              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{notification.message}</p>
                <p className="text-xs opacity-75 mt-1">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}

      {/* Update Interval Control */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">Update Interval</span>
          <span className="text-xs text-gray-500">{updateInterval / 1000}s</span>
        </div>
        <div className="flex space-x-1">
          {[15000, 30000, 60000].map((interval) => (
            <button
              key={interval}
              onClick={() => setUpdateInterval(interval)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                updateInterval === interval
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {interval / 1000}s
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealTimeUpdates;
