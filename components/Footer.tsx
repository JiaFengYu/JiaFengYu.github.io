import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-indigo-900 bg-opacity-50 py-6 mt-auto border-t border-indigo-600 relative z-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-white">
              © {new Date().getFullYear()} Jayden Yu. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="https://github.com/JiaFengYu" target="_blank" rel="noopener noreferrer" 
               className="text-white hover:text-indigo-200 transition-colors">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/jiafeng-yu/" target="_blank" rel="noopener noreferrer"
               className="text-white hover:text-indigo-200 transition-colors">
              LinkedIn
            </a>
            <a href="mailto:jaydenyu2001@gmail.com"
               className="text-white hover:text-indigo-200 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}; 
