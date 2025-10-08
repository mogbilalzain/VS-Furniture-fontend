'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Image from 'next/image';

export default function Career() {
  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="hero-section bg-gradient-to-br from-gray-100 to-slate-200 py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-800 mb-6 leading-tight">
            Join Our Team
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Shape the future of furniture design with V/S. We're looking for passionate individuals who want to create innovative solutions for modern learning environments.
          </p>
          <a href="#jobs" className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3 transition-all duration-300 hover:-translate-y-1">
            View Open Positions
          </a>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-normal text-gray-800 mb-4">Why Work With V/S?</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl">
                At V/S, we believe that great design comes from great people. Join our team of innovators, designers, and craftspeople who are passionate about creating furniture that transforms learning environments.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <p className="text-gray-700">Innovative design projects that make a real impact</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <p className="text-gray-700">Collaborative environment with talented professionals</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <p className="text-gray-700">Opportunities for professional growth and development</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <p className="text-gray-700">Work on sustainable and environmentally conscious projects</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Image 
                src="/FlipTable_global-hero_3_2.webp" 
                alt="V/S Office Environment" 
                width={500}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-normal text-gray-800 mb-4">Employee Benefits</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We offer comprehensive benefits to support your professional and personal growth.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-lg text-center hover:-translate-y-1 transition-all duration-300">
              <div className="text-5xl text-yellow-400 mb-4">
                <i className="fas fa-heartbeat"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Health & Wellness</h3>
              <p className="text-gray-600">
                Comprehensive health insurance, dental coverage, and wellness programs to keep you healthy.
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-lg text-center hover:-translate-y-1 transition-all duration-300">
              <div className="text-5xl text-yellow-400 mb-4">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Learning & Development</h3>
              <p className="text-gray-600">
                Professional development opportunities, training programs, and conference attendance.
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-lg text-center hover:-translate-y-1 transition-all duration-300">
              <div className="text-5xl text-yellow-400 mb-4">
                <i className="fas fa-clock"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Work-Life Balance</h3>
              <p className="text-gray-600">
                Flexible working hours, remote work options, and generous paid time off policies.
              </p>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-lg text-center hover:-translate-y-1 transition-all duration-300">
              <div className="text-5xl text-yellow-400 mb-4">
                <i className="fas fa-piggy-bank"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Financial Security</h3>
              <p className="text-gray-600">
                Competitive salary, performance bonuses, and retirement savings plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Values Section */}
      <section className="py-24 bg-[--color-vs-darker-gray] text-white" style={{'backgroundColor': '#2c2c2c'}}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-normal text-white mb-4">Our Values</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              These core values guide everything we do at V/S and shape our company culture.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="mb-8">
              <div className="text-5xl font-light text-yellow-400 mb-2">01</div>
              <h3 className="text-2xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-300 leading-relaxed">
                We constantly push boundaries to create furniture solutions that transform how people learn and work.
              </p>
            </div>
            <div className="mb-8">
              <div className="text-5xl font-light text-yellow-400 mb-2">02</div>
              <h3 className="text-2xl font-semibold mb-2">Quality</h3>
              <p className="text-gray-300 leading-relaxed">
                Excellence in craftsmanship and attention to detail are at the heart of everything we create.
              </p>
            </div>
            <div className="mb-8">
              <div className="text-5xl font-light text-yellow-400 mb-2">03</div>
              <h3 className="text-2xl font-semibold mb-2">Sustainability</h3>
              <p className="text-gray-300 leading-relaxed">
                We're committed to environmentally responsible practices and sustainable design solutions.
              </p>
            </div>
            <div className="mb-8">
              <div className="text-5xl font-light text-yellow-400 mb-2">04</div>
              <h3 className="text-2xl font-semibold mb-2">Collaboration</h3>
              <p className="text-gray-300 leading-relaxed">
                We believe the best ideas come from working together and valuing diverse perspectives.
              </p>
            </div>
            <div className="mb-8">
              <div className="text-5xl font-light text-yellow-400 mb-2">05</div>
              <h3 className="text-2xl font-semibold mb-2">Customer Focus</h3>
              <p className="text-gray-300 leading-relaxed">
                Understanding and exceeding our customers' needs drives every decision we make.
              </p>
            </div>
            <div className="mb-8">
              <div className="text-5xl font-light text-yellow-400 mb-2">06</div>
              <h3 className="text-2xl font-semibold mb-2">Integrity</h3>
              <p className="text-gray-300 leading-relaxed">
                We operate with honesty, transparency, and ethical business practices in all our relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
    

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-light text-gray-800 mb-6">
            Don't see the right position?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals to join our team. Send us your resume and let us know how you'd like to contribute to V/S.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-transparent border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-gray-800 font-semibold px-8 py-3 transition-all duration-300"
          >
            Contact Us
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
} 