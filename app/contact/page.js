'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { ENV_CONFIG } from '../../environment';

export default function Contact() {
  const [showForm, setShowForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    subject: '',
    questions: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [validationErrors, setValidationErrors] = useState({});

  const handleOpenForm = () => {
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setFormData({
      fullName: '',
      email: '',
      contactNumber: '',
      subject: '',
      questions: '',
      message: ''
    });
    setSelectedFiles([]);
    setValidationErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple form validation - check required fields that match backend validation
    if (!formData.fullName || !formData.email || !formData.subject || !formData.message) {
      alert('Please fill in all required fields (marked with *).');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setValidationErrors({});

    try {
      // Prepare FormData for file upload
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('name', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('contact_number', formData.contactNumber || '');
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('questions', formData.questions || '');
      
      // Add files if any
      selectedFiles.forEach((file, index) => {
        formDataToSend.append('files[]', file);
      });

      const response = await fetch(`${ENV_CONFIG.API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus('success');
        // Reset form after 3 seconds
        setTimeout(() => {
          handleCancelForm();
          setSubmitStatus(null);
        }, 3000);
      } else {
        // Handle validation errors from backend
        if (result.errors) {
          setValidationErrors(result.errors);
        }
        throw new Error(result.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        {!showForm && (
          <section className="py-24 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-light text-gray-800 mb-6">
                <b>General Inquiry</b> <span className="italic">Contact Form</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                For all general inquiries and questions for VS middle east, submit a form by clicking the button below
              </p>
              <button 
                onClick={handleOpenForm}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3 transition-all duration-300 hover:-translate-y-1"
              >
                Open form
              </button>
            </div>
          </section>
        )}

        {/* Contact Form Section */}
        {showForm && (
          <section className="py-16 px-4 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-medium text-gray-800 mb-4">General Inquiry Contact Form</h2>
              <p className="text-gray-600 mb-8">
                Fields marked with <span className="text-red-500">*</span> are required.
              </p>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="form-field">
                    <label className="block mb-2 font-medium text-gray-600" htmlFor="fullName">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 border-2 ${validationErrors.name ? 'border-red-500' : 'border-gray-300'} focus:border-yellow-400 focus:outline-none transition-colors duration-300`}
                      required
                    />
                    {validationErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.name[0]}</p>
                    )}
                  </div>
                  
                  <div className="form-field">
                    <label className="block mb-2 font-medium text-gray-600" htmlFor="email">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 border-2 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} focus:border-yellow-400 focus:outline-none transition-colors duration-300`}
                      required
                    />
                    {validationErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.email[0]}</p>
                    )}
                  </div>
                  
                  <div className="form-field">
                    <label className="block mb-2 font-medium text-gray-600" htmlFor="contactNumber">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 border-2 border-gray-300 focus:border-yellow-400 focus:outline-none transition-colors duration-300"
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="block mb-2 font-medium text-gray-600" htmlFor="subject">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-3 border-2 ${validationErrors.subject ? 'border-red-500' : 'border-gray-300'} focus:border-yellow-400 focus:outline-none transition-colors duration-300`}
                      required
                    />
                    {validationErrors.subject && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.subject[0]}</p>
                    )}
                  </div>
                  
                  <div className="form-field">
                    <label className="block mb-2 font-medium text-gray-600" htmlFor="questions">
                      Questions to Spark Your Thinking
                    </label>
                    <input
                      type="text"
                      id="questions"
                      name="questions"
                      value={formData.questions}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 border-2 border-gray-300 focus:border-yellow-400 focus:outline-none transition-colors duration-300"
                    />
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  <div className="form-field">
                    <label className="block mb-2 font-medium text-gray-600" htmlFor="message">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="5"
                      className={`w-full px-3 py-3 border-2 ${validationErrors.message ? 'border-red-500' : 'border-gray-300'} focus:border-yellow-400 focus:outline-none transition-colors duration-300 min-h-32 resize-vertical`}
                      required
                    />
                    {validationErrors.message && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.message[0]}</p>
                    )}
                  </div>
                  
                  <div className="form-field">
                    <label className="block mb-2 font-medium text-gray-600">
                      Uploads
                    </label>
                    <div className="border-2 border-dashed border-gray-300 hover:border-yellow-400 p-4 text-center cursor-pointer transition-colors duration-300">
                      <input
                        type="file"
                        id="fileUpload"
                        name="fileUpload"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="fileUpload" className="cursor-pointer">
                        {selectedFiles.length > 0 ? (
                          <div className="text-gray-700">
                            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span className="text-sm">{selectedFiles.length} file(s) selected</span>
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            <span className="text-sm">Choose files</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Status Messages */}
                {submitStatus && (
                  <div className="md:col-span-2">
                    {submitStatus === 'success' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <p className="text-green-700 font-medium">
                            Thank you for your inquiry! We will get back to you soon.
                          </p>
                        </div>
                      </div>
                    )}
                    {submitStatus === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <p className="text-red-700 font-medium">
                            Sorry, there was an error sending your message. Please try again.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Form Actions */}
                <div className="md:col-span-2 flex justify-between items-center pt-6">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    disabled={isSubmitting}
                    className="bg-transparent border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-black font-semibold px-8 py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting && (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isSubmitting ? 'Sending...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
} 