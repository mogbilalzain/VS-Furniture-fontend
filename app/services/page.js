'use client';

import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Image from 'next/image';
import Link from 'next/link';

const ServicesPage = () => {
  const services = [
    {
      id: 1,
      title: "Educational Space Planning & Design",
      description: "We collaborate with architects, school leaders, and designers to create ergonomic, flexible, and future-ready learning spaces. Our team supports space planning tailored to modern pedagogies and regional needs.",
      includes: [
        "Classroom and campus layout planning",
        "Furniture selection based on usage zones (learning, collaboration, focus)",
        "2D/3D visualizations (if applicable)"
      ],
      icon: "fas fa-drafting-compass",
      image: "/images/services/space-planning.jpg"
    },
    {
      id: 2,
      title: "Consultation & Product Customization",
      description: "Every learning environment is different. We offer personalized consultations to recommend the right furniture solutions based on your school's curriculum, teaching style, and student age group.",
      includes: [
        "On-site or remote consultations",
        "Custom sizing, finishes, and configurations (within VS global options)",
        "Recommendations based on age-appropriate ergonomics"
      ],
      icon: "fas fa-user-tie",
      image: "/images/services/consultation.jpg"
    },
    {
      id: 3,
      title: "Project Management & Delivery",
      description: "From order to installation, we manage logistics to ensure timely and accurate delivery — across the UAE and wider GCC.",
      includes: [
        "Project coordination and scheduling",
        "Import, delivery, and customs handling",
        "Coordination with site teams or contractors"
      ],
      icon: "fas fa-tasks",
      image: "/images/services/delivery.jpg"
    },
    {
      id: 4,
      title: "Professional Installation",
      description: "Our trained teams ensure that every piece of furniture is assembled, positioned, and installed to VS standards and client requirements.",
      includes: [
        "On-site installation services",
        "Classroom/staffroom/lab setups",
        "Quality assurance and finishing checks"
      ],
      icon: "fas fa-tools",
      image: "/images/services/installation.jpg"
    },
    {
      id: 5,
      title: "After-Sales Support & Maintenance",
      description: "We stand by the quality of VS furniture. Our team is available for any post-installation support, warranty queries, or maintenance needs.",
      includes: [
        "Warranty guidance and claims assistance",
        "Replacement parts and accessories",
        "Maintenance tips and support"
      ],
      icon: "fas fa-headset",
      image: "/images/services/support.jpg"
    },
    {
      id: 6,
      title: "Showroom Visits & Product Demonstrations",
      description: "Visit our regional display space to experience the quality, functionality, and flexibility of VS furniture in person.",
      includes: [
        "Product testing and demonstrations",
        "Material samples and finish options",
        "Consultant-led tours (by appointment)"
      ],
      icon: "fas fa-store",
      image: "/images/services/showroom.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section - Similar to the image */}
      <section className="relative bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-6 leading-tight">
                  Educational Services
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  We collaborate with architects, school leaders, and designers to create ergonomic, flexible, and future-ready learning spaces. Available in various sizes and configurations, they ensure ergonomic comfort while fostering collaboration. Built to last, our services provide the foundation for flexible learning spaces.
                </p>
                <Link href="/contact" className="bg-yellow-400 text-black px-8 py-3 font-medium hover:bg-yellow-500 transition-colors duration-300">
                  Contact Us
                </Link>
              </div>
              
              {/* Right Image */}
              <div className="relative">
                <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <img 
                    src="/images/services/hero-services.jpg" 
                    alt="Educational Services"
                    className="w-full h-96 object-cover transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTIwSDIyNVYxODBIMTc1VjEyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB4PSIxODAiIHk9IjEzMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IiM2QjczODAiPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNy41OS03LjU5TDE5IDhsLTkgOXoiLz4KPHN2Zz4KPHN2Zz4=';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Service 1 - Left Image, Right Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              <div className="relative">
                <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <img 
                    src="/images/services/space-planning.jpg" 
                    alt="Educational Space Planning"
                    className="w-full h-80 object-cover transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRUZGNkZGIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiM4QjVDRjYiLz4KPHN2ZyB4PSIxODAiIHk9IjEzMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IndoaXRlIj4KPHN2Zz4=';
                    }}
                  />
                </div>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6">
                  Educational Space Planning & Design
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  We collaborate with architects, school leaders, and designers to create ergonomic, flexible, and future-ready learning spaces. Our team supports space planning tailored to modern pedagogies and regional needs.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Classroom and campus layout planning</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Furniture selection based on usage zones (learning, collaboration, focus)</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">2D/3D visualizations (if applicable)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Service 2 - Right Image, Left Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              <div className="order-2 lg:order-1">
                <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6">
                  Consultation & Product Customization
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Every learning environment is different. We offer personalized consultations to recommend the right furniture solutions based on your school's curriculum, teaching style, and student age group.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">On-site or remote consultations</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Custom sizing, finishes, and configurations (within VS global options)</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Recommendations based on age-appropriate ergonomics</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 relative">
                <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <img 
                    src="/images/services/consultation.jpg" 
                    alt="Consultation Services"
                    className="w-full h-80 object-cover transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjBGREY0Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiMxMEI5ODEiLz4KPHN2ZyB4PSIxODAiIHk9IjEzMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IndoaXRlIj4KPHN2Zz4=';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Service 3 - Left Image, Right Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              <div className="relative">
                <div className="bg-gray-100 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <img 
                    src="/images/services/delivery.jpg" 
                    alt="Project Management"
                    className="w-full h-80 object-cover transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRkFGNUZGIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNDAiIGZpbGw9IiM4QjVDRjYiLz4KPHN2ZyB4PSIxODAiIHk9IjEzMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IndoaXRlIj4KPHN2Zz4=';
                    }}
                  />
                </div>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6">
                  Project Management & Delivery
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  From order to installation, we manage logistics to ensure timely and accurate delivery — across the UAE and wider GCC.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Project coordination and scheduling</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Import, delivery, and customs handling</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">Coordination with site teams or contractors</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom Section with Dark Background - Similar to image */}
      <section className="py-16 md:py-24 bg-gray-50 text-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-light mb-6">
              Each VS Service Is <span className="italic">Thoughtfully Crafted</span>
            </h2>
            <h3 className="text-2xl md:text-3xl font-light mb-8">
              Creating <span className="italic">Engaging</span> & <span className="italic">Adaptable</span> Learning Spaces
            </h3>
            
            {/* Additional Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="rounded-lg p-6 mb-4 hover:bg-gray-100 transition-colors duration-300">
                  <img 
                    src="/images/services/installation-thumb.jpg" 
                    alt="Professional Installation"
                    className="w-full h-40 object-cover rounded shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iMzAiIGZpbGw9IiNGNTk3MzEiLz4KPHN2ZyB4PSIxMzAiIHk9IjgwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMjIuNyA5bC0xLjItMS4yTDEzIDEwLjNWMmgtMnY4LjNMNi41IDcuOCA1LjMgOWw2LjcgNi43IDYuNy02Ljd6Ii8+Cjwvc3ZnPgo8L3N2Zz4=';
                    }}
                  />
                </div>
                <h4 className="text-xl font-medium mb-2">Professional Installation</h4>
                <p className="text-gray-900 text-sm">
                  Our trained teams ensure every piece is installed to VS standards and client requirements.
                </p>
              </div>

              <div className="text-center">
                <div className="rounded-lg p-6 mb-4 hover:bg-gray-100 transition-colors duration-300">
                  <img 
                    src="/images/services/support-thumb.jpg" 
                    alt="After-Sales Support"
                    className="w-full h-40 object-cover rounded shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iMzAiIGZpbGw9IiNFRjQ0NDQiLz4KPHN2ZyB4PSIxMzAiIHk9IjgwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMSAxNWgtMnYtNmgydjZ6bTAtOGgtMlY3aDJ2MnoiLz4KPC9zdmc+Cjwvc3ZnPg==';
                    }}
                  />
                </div>
                <h4 className="text-xl font-medium mb-2">After-Sales Support</h4>
                <p className="text-gray-900 text-sm">
                  We stand by our quality with comprehensive post-installation support and maintenance.
                </p>
              </div>

              <div className="text-center">
                <div className="rounded-lg p-6 mb-4 hover:bg-gray-100 transition-colors duration-300">
                  <img 
                    src="/images/services/showroom-thumb.jpg" 
                    alt="Showroom Visits"
                    className="w-full h-40 object-cover rounded shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iMzAiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSIxMzAiIHk9IjgwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMkwxMyA5TDIwIDlMMTUgMTRMMTcgMjFMMTIgMThMNyAyMUw5IDE0TDQgOUwxMSA5TDEyIDJaIi8+Cjwvc3ZnPgo8L3N2Zz4=';
                    }}
                  />
                </div>
                <h4 className="text-xl font-medium mb-2">Showroom Visits</h4>
                <p className="text-gray-900 text-sm">
                  Experience our furniture quality and functionality in person at our regional display space.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;