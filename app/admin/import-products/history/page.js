'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authStorage } from '../../../../lib/localStorage-utils';
import { apiClient } from '../../../../lib/api';
import { PageHeader, AdminButton } from '../../../../components/admin/ui';

export default function ImportHistoryPage() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    if (!authStorage.isAuthenticatedAdmin()) {
      router.replace('/admin/login');
      return;
    }
    fetchLogs(1);
  }, [router]);

  const fetchLogs = async (page) => {
    setLoading(true);
    setError('');
    try {
      const result = await apiClient.get(`/import/logs?page=${page}&limit=10`);
      if (result.success) {
        setLogs(result.data || []);
        setPagination(result.pagination || { page: 1, pages: 1, total: 0 });
      } else {
        throw new Error(result.message || 'Failed to load logs');
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err.message || 'Failed to load import history');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogDetails = async (logId) => {
    if (selectedLog?.id === logId) {
      setSelectedLog(null);
      return;
    }

    setDetailsLoading(true);
    try {
      const result = await apiClient.get(`/import/logs/${logId}`);
      if (result.success) {
        setSelectedLog(result.data);
      }
    } catch (err) {
      console.error('Error fetching log details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    const labels = {
      completed: 'Completed',
      processing: 'Processing',
      failed: 'Failed',
      pending: 'Pending',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="admin-legacy space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Import History"
          description="View past bulk import operations and their results."
          breadcrumbs={[{ label: 'Imports', href: '/admin/import-products' }, { label: 'History' }]}
          actions={
            <Link
              href="/admin/import-products"
              className="inline-flex items-center gap-2 h-12 px-5 rounded-xl bg-on-surface text-surface font-bold text-[14px] hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              New Import
            </Link>
          }
        />

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 flex items-center">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-blue-500 text-3xl mb-4"></i>
              <p className="text-gray-600">Loading import history...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && logs.length === 0 && !error && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-history text-gray-400 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Import History</h3>
            <p className="text-gray-600 mb-6">You haven&apos;t performed any bulk imports yet.</p>
            <Link
              href="/admin/import-products"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <i className="fas fa-cloud-upload-alt mr-2"></i>
              Start Your First Import
            </Link>
          </div>
        )}

        {/* Logs Table */}
        {!loading && logs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Files</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Success</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Failed</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{log.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(log.created_at)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <i className="fas fa-file-excel text-green-500 mr-1.5 text-xs"></i>
                          <span className="truncate max-w-[150px]" title={log.excel_file_name}>{log.excel_file_name}</span>
                        </div>
                        {log.zip_file_name && (
                          <div className="flex items-center">
                            <i className="fas fa-file-archive text-yellow-500 mr-1.5 text-xs"></i>
                            <span className="truncate max-w-[150px]" title={log.zip_file_name}>{log.zip_file_name}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(log.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{log.total_rows || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{log.successful_imports || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{log.failed_imports || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDuration(log.processing_time_seconds)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => fetchLogDetails(log.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                      >
                        {selectedLog?.id === log.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => fetchLogs(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchLogs(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Log Details Panel */}
        {selectedLog && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">
                  Import #{selectedLog.id} Details
                </h3>
                <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="text-xl font-bold text-blue-600">{selectedLog.total_rows || 0}</div>
                  <div className="text-xs text-blue-800">Total</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <div className="text-xl font-bold text-green-600">{selectedLog.successful_imports || 0}</div>
                  <div className="text-xs text-green-800">Success</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-xl">
                  <div className="text-xl font-bold text-red-600">{selectedLog.failed_imports || 0}</div>
                  <div className="text-xs text-red-800">Failed</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-xl">
                  <div className="text-xl font-bold text-yellow-600">{selectedLog.skipped_imports || 0}</div>
                  <div className="text-xs text-yellow-800">Skipped</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <div className="text-xl font-bold text-purple-600">{formatDuration(selectedLog.processing_time_seconds)}</div>
                  <div className="text-xs text-purple-800">Duration</div>
                </div>
              </div>

              {selectedLog.error_message && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm"><strong>Error:</strong> {selectedLog.error_message}</p>
                </div>
              )}
            </div>

            {selectedLog.details && selectedLog.details.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Row</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Images</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedLog.details.map((detail, idx) => (
                      <tr key={idx} className={
                        detail.status === 'success' ? 'bg-green-50/50' :
                        detail.status === 'failed' ? 'bg-red-50/50' :
                        'bg-yellow-50/50'
                      }>
                        <td className="px-6 py-3 text-sm text-gray-900">{detail.row_number}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">
                          {detail.product_id ? (
                            <Link href={`/admin/products?id=${detail.product_id}`} className="text-blue-600 hover:text-blue-800">
                              {detail.product_name}
                            </Link>
                          ) : detail.product_name}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-600">{detail.sku || '-'}</td>
                        <td className="px-6 py-3">{getStatusBadge(detail.status)}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{detail.images_uploaded || 0}</td>
                        <td className="px-6 py-3 text-sm text-red-600">{detail.error_message || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {detailsLoading && (
              <div className="p-8 text-center">
                <i className="fas fa-spinner fa-spin text-blue-500 text-xl"></i>
                <p className="text-gray-600 mt-2">Loading details...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
