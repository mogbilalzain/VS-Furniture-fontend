'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authStorage } from '../../../lib/localStorage-utils';
import { apiClient } from '../../../lib/api';
import { ENV_CONFIG } from '../../../environment/index.js';

const STEPS = ['Upload', 'Preview', 'Results'];

export default function ImportProductsPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1 state
  const [excelFile, setExcelFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [dragOver, setDragOver] = useState({ excel: false, zip: false });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const excelRef = useRef(null);
  const zipRef = useRef(null);

  // Step 2 state
  const [sessionId, setSessionId] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [isImporting, setIsImporting] = useState(false);

  // Step 3 state
  const [importResult, setImportResult] = useState(null);

  // Shared state
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    if (!authStorage.isAuthenticatedAdmin()) {
      router.replace('/admin/login');
    }
  }, [router]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  }, []);

  // ── Step 1: Upload & Validate ──────────────────────────────────────

  const handleFileSelect = (file, type) => {
    if (type === 'excel') {
      const allowed = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ];
      if (!allowed.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
        showToast('Please select a valid Excel file (.xlsx, .xls, .csv)', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('Excel file must be less than 10MB', 'error');
        return;
      }
      setExcelFile(file);
    } else {
      if (!file.type.includes('zip') && !file.name.endsWith('.zip')) {
        showToast('Please select a valid ZIP file', 'error');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        showToast('ZIP file must be less than 100MB', 'error');
        return;
      }
      setZipFile(file);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [type]: false }));
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0], type);
    }
  };

  const handleValidateAndPreview = () => {
    if (!excelFile) {
      setError('Please select an Excel file');
      return;
    }

    setError('');
    setIsValidating(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('excel_file', excelFile);
    if (zipFile) {
      formData.append('zip_file', zipFile);
    }

    const token = apiClient.getToken();
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      setIsValidating(false);
      return;
    }

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      setIsValidating(false);
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status === 200 && response.success) {
          const data = response.data;
          setSessionId(data.session_id);
          setPreviewData(data);
          const validRows = data.preview
            .filter(r => r.status === 'valid' && r.selected)
            .map(r => r.row);
          setSelectedRows(new Set(validRows));
          setCurrentStep(1);
          showToast('Files validated successfully', 'success');
        } else {
          setError(response.error || response.message || 'Validation failed');
        }
      } catch {
        setError('Failed to parse server response');
      }
    });

    xhr.addEventListener('error', () => {
      setIsValidating(false);
      setError('Network error occurred while uploading');
    });

    xhr.open('POST', ENV_CONFIG.buildApiUrl('/import/validate'));
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send(formData);
  };

  // ── Step 2: Preview & Select ───────────────────────────────────────

  const toggleRow = (row) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(row)) next.delete(row);
      else next.add(row);
      return next;
    });
  };

  const toggleAll = () => {
    if (!previewData) return;
    const validRows = previewData.preview.filter(r => r.status === 'valid').map(r => r.row);
    if (selectedRows.size === validRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(validRows));
    }
  };

  const handleStartImport = async () => {
    if (selectedRows.size === 0) {
      setError('Please select at least one product to import');
      return;
    }

    setError('');
    setIsImporting(true);

    try {
      const response = await apiClient.post('/import/products', {
        session_id: sessionId,
        selected_rows: Array.from(selectedRows),
      });

      if (response.success) {
        setImportResult(response.data);
        setCurrentStep(2);
        showToast('Import completed!', 'success');
      } else {
        setError(response.error || response.message || 'Import failed');
      }
    } catch (err) {
      setError(err.message || 'Import request failed');
    } finally {
      setIsImporting(false);
    }
  };

  // ── Step 3: Results ────────────────────────────────────────────────

  const handleExportResults = () => {
    if (!importResult?.details) return;
    const rows = ['Row,Product Name,Status,Images,Materials,Certifications,Properties,Files,Error'];
    for (const d of importResult.details) {
      rows.push([d.row, `"${d.product_name || ''}"`, d.status, d.images_count || 0, d.materials_count || 0, d.certifications_count || 0, d.properties_count || 0, d.files_count || 0, d.error ? `"${d.error}"` : ''].join(','));
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `import_results_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleReset = () => {
    setCurrentStep(0);
    setExcelFile(null);
    setZipFile(null);
    setUploadProgress(0);
    setSessionId(null);
    setPreviewData(null);
    setSelectedRows(new Set());
    setImportResult(null);
    setError('');
    if (excelRef.current) excelRef.current.value = '';
    if (zipRef.current) zipRef.current.value = '';
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = apiClient.getToken();
      const response = await fetch(ENV_CONFIG.buildApiUrl('/import/template'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'product_import_template.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('Template downloaded', 'success');
      }
    } catch {
      showToast('Failed to download template', 'error');
    }
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen p-6">
      {/* Toast */}
      {toast.message && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Product Import</h1>
          <p className="text-gray-600 mt-1">Import products from Excel with optional image ZIP</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0 ${
                i < currentStep ? 'bg-green-500 text-white' :
                i === currentStep ? 'bg-blue-600 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {i < currentStep ? <i className="fas fa-check text-xs"></i> : i + 1}
              </div>
              <span className={`ml-2 text-sm font-medium whitespace-nowrap ${
                i === currentStep ? 'text-blue-600' : 'text-gray-500'
              }`}>{label}</span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${i < currentStep ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
            <i className="fas fa-exclamation-triangle text-red-500 mt-0.5 mr-3"></i>
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* ── STEP 1: Upload ── */}
        {currentStep === 0 && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Excel */}
              <DropZone
                label="Excel Data"
                sublabel="Product information (required)"
                icon="fa-file-excel"
                iconColor="from-green-400 to-green-500"
                accept=".xlsx,.xls,.csv"
                file={excelFile}
                dragOver={dragOver.excel}
                inputRef={excelRef}
                disabled={isValidating}
                onFile={(f) => handleFileSelect(f, 'excel')}
                onClear={() => { setExcelFile(null); if (excelRef.current) excelRef.current.value = ''; }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(p => ({ ...p, excel: true })); }}
                onDragLeave={(e) => { e.preventDefault(); setDragOver(p => ({ ...p, excel: false })); }}
                onDrop={(e) => handleDrop(e, 'excel')}
                formats=".xlsx, .xls, .csv (Max 10MB)"
              />
              {/* ZIP */}
              <DropZone
                label="ZIP Images"
                sublabel="Product images (optional)"
                icon="fa-file-archive"
                iconColor="from-yellow-400 to-yellow-500"
                accept=".zip"
                file={zipFile}
                dragOver={dragOver.zip}
                inputRef={zipRef}
                disabled={isValidating}
                onFile={(f) => handleFileSelect(f, 'zip')}
                onClear={() => { setZipFile(null); if (zipRef.current) zipRef.current.value = ''; }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(p => ({ ...p, zip: true })); }}
                onDragLeave={(e) => { e.preventDefault(); setDragOver(p => ({ ...p, zip: false })); }}
                onDrop={(e) => handleDrop(e, 'zip')}
                formats=".zip (Max 100MB)"
              />
            </div>

            {/* Upload progress */}
            {isValidating && (
              <div className="mb-8 p-6 bg-white rounded-xl border border-gray-200">
                <div className="flex items-center mb-3">
                  <i className="fas fa-spinner fa-spin text-blue-500 mr-3"></i>
                  <span className="text-gray-700 font-medium">Uploading & validating...</span>
                  <span className="ml-auto text-sm text-gray-500">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleValidateAndPreview}
                disabled={!excelFile || isValidating}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  excelFile && !isValidating
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <i className="fas fa-search mr-2"></i>
                Validate & Preview
              </button>
              <button onClick={handleDownloadTemplate}
                className="px-5 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                <i className="fas fa-download mr-2"></i>Template
              </button>
              <Link href="/admin/import-products/history"
                className="px-5 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:border-purple-400 hover:text-purple-600 transition-colors inline-flex items-center"
              >
                <i className="fas fa-history mr-2"></i>History
              </Link>
            </div>
          </div>
        )}

        {/* ── STEP 2: Preview ── */}
        {currentStep === 1 && previewData && (
          <div>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total Rows" value={previewData.total_rows} color="blue" />
              <StatCard label="Valid" value={previewData.valid_rows} color="green" />
              <StatCard label="Errors" value={previewData.error_rows} color="red" />
              <StatCard label="Images Found" value={previewData.total_images} color="purple" />
            </div>

            {/* Selection info */}
            <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-sm text-blue-800">
                <strong>{selectedRows.size}</strong> of {previewData.valid_rows} products selected for import
              </span>
              <button onClick={toggleAll} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                {selectedRows.size === previewData.valid_rows ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Preview table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left w-10"></th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Row</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Images</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Materials</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Certs</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Props</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Files</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewData.preview.map((row, i) => (
                      <tr key={i} className={row.status === 'error' ? 'bg-red-50/50' : selectedRows.has(row.row) ? 'bg-blue-50/30' : ''}>
                        <td className="px-4 py-3">
                          {row.status === 'valid' && (
                            <input
                              type="checkbox"
                              checked={selectedRows.has(row.row)}
                              onChange={() => toggleRow(row.row)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{row.row}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                        <td className="px-4 py-3 text-gray-600">{row.sku || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{row.category || '-'}</td>
                        <td className="px-4 py-3">
                          {row.images_count > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {row.images_count} image{row.images_count > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {row.materials_count > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700" title={row.materials?.map(m => `${m.code} (${m.name})`).join(', ')}>
                              {row.materials_count} material{row.materials_count > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">None</span>
                          )}
                          {row.materials_warnings?.length > 0 && (
                            <span className="block text-xs text-orange-500 mt-0.5" title={row.materials_warnings.join(', ')}>
                              <i className="fas fa-exclamation-triangle mr-1"></i>{row.materials_warnings.length} warning{row.materials_warnings.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {row.certifications_count > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700" title={row.certifications?.map(c => c.title).join(', ')}>
                              {row.certifications_count} cert{row.certifications_count > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">None</span>
                          )}
                          {row.certifications_warnings?.length > 0 && (
                            <span className="block text-xs text-orange-500 mt-0.5" title={row.certifications_warnings.join(', ')}>
                              <i className="fas fa-exclamation-triangle mr-1"></i>{row.certifications_warnings.length} warning{row.certifications_warnings.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {row.properties_count > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700" title={row.properties?.map(p => `${p.property}: ${p.display_name}`).join(', ')}>
                              {row.properties_count} prop{row.properties_count > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">None</span>
                          )}
                          {row.properties_warnings?.length > 0 && (
                            <span className="block text-xs text-orange-500 mt-0.5" title={row.properties_warnings.join(', ')}>
                              <i className="fas fa-exclamation-triangle mr-1"></i>{row.properties_warnings.length} warning{row.properties_warnings.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {row.files_count > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700" title={row.files?.map(f => `${f.name} (${f.category})`).join(', ')}>
                              {row.files_count} file{row.files_count > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {row.status === 'valid' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <i className="fas fa-check mr-1"></i>Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700" title={row.error}>
                              <i className="fas fa-times mr-1"></i>Error
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => setCurrentStep(0)}
                className="px-5 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>Back
              </button>
              <button
                onClick={handleStartImport}
                disabled={selectedRows.size === 0 || isImporting}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  selectedRows.size > 0 && !isImporting
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isImporting ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Importing...</>
                ) : (
                  <><i className="fas fa-rocket mr-2"></i>Import {selectedRows.size} Product{selectedRows.size !== 1 ? 's' : ''}</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Results ── */}
        {currentStep === 2 && importResult && (
          <div>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Total" value={importResult.total_rows} color="blue" />
              <StatCard label="Successful" value={importResult.successful} color="green" />
              <StatCard label="Failed" value={importResult.failed} color="red" />
              <StatCard label="Skipped" value={importResult.skipped} color="yellow" />
            </div>

            {importResult.successful > 0 && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4 shrink-0">
                  <i className="fas fa-check text-white"></i>
                </div>
                <div>
                  <p className="font-semibold text-green-800">Import Completed</p>
                  <p className="text-green-600 text-sm">Successfully imported {importResult.successful} product{importResult.successful !== 1 ? 's' : ''}.</p>
                </div>
              </div>
            )}

            {/* Results table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Row</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Images</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Materials</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Certs</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Props</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Files</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {importResult.details.map((d, i) => (
                      <tr key={i} className={
                        d.status === 'success' ? 'bg-green-50/30' :
                        d.status === 'failed' ? 'bg-red-50/30' : ''
                      }>
                        <td className="px-4 py-3 text-gray-500">{d.row}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {d.product_id ? (
                            <Link href={`/admin/products?id=${d.product_id}`} className="text-blue-600 hover:text-blue-800">
                              {d.product_name}
                            </Link>
                          ) : d.product_name}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-600">{d.images_count ?? '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{d.materials_count ?? '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{d.certifications_count ?? '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{d.properties_count ?? '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{d.files_count ?? '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{d.error || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={handleReset}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>New Import
              </button>
              <button onClick={handleExportResults}
                className="px-5 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:border-green-400 hover:text-green-600 transition-colors"
              >
                <i className="fas fa-download mr-2"></i>Export CSV
              </button>
              <Link href="/admin/products"
                className="px-5 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:border-blue-400 hover:text-blue-600 transition-colors inline-flex items-center"
              >
                <i className="fas fa-list mr-2"></i>All Products
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────

function DropZone({ label, sublabel, icon, iconColor, accept, file, dragOver, inputRef, disabled, onFile, onClear, onDragOver, onDragLeave, onDrop, formats }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${iconColor} rounded-lg flex items-center justify-center mr-3`}>
          <i className={`fas ${icon} text-white text-lg`}></i>
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{label}</h3>
          <p className="text-xs text-gray-500">{sublabel}</p>
        </div>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver ? 'border-blue-400 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept={accept} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} disabled={disabled} className="hidden" />

        {file ? (
          <div className="space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <i className="fas fa-check text-green-600 text-lg"></i>
            </div>
            <p className="font-medium text-gray-800 text-sm">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="text-red-500 hover:text-red-700 text-xs font-medium"
            >
              <i className="fas fa-times mr-1"></i>Remove
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <i className={`fas ${icon} text-gray-400 text-lg`}></i>
            </div>
            <p className="font-medium text-gray-700 text-sm">Drop file here or click to browse</p>
            <p className="text-xs text-gray-400">{formats}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'from-blue-50 to-blue-100 text-blue-600',
    green: 'from-green-50 to-green-100 text-green-600',
    red: 'from-red-50 to-red-100 text-red-600',
    yellow: 'from-yellow-50 to-yellow-100 text-yellow-600',
    purple: 'from-purple-50 to-purple-100 text-purple-600',
  };

  return (
    <div className={`text-center p-4 bg-gradient-to-br ${colors[color]} rounded-xl`}>
      <div className="text-2xl font-bold">{value ?? 0}</div>
      <div className="text-xs font-semibold opacity-80">{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    success: { bg: 'bg-green-100 text-green-700', icon: 'fa-check-circle', text: 'Success' },
    failed: { bg: 'bg-red-100 text-red-700', icon: 'fa-times-circle', text: 'Failed' },
    skipped: { bg: 'bg-yellow-100 text-yellow-700', icon: 'fa-forward', text: 'Skipped' },
  };
  const c = config[status] || config.skipped;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.bg}`}>
      <i className={`fas ${c.icon} mr-1`}></i>{c.text}
    </span>
  );
}
