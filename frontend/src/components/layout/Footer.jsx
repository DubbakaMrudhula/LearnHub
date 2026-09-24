import React from 'react';
import { GraduationCap, Github, Twitter, Linkedin, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-purple-100 bg-purple-50/30 py-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center shadow-sm">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">LearnHub</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Skill learning, concept-level assessment, AI-driven adaptive recommendations, and verified certifications.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-950 mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li><a href="#features" className="hover:text-purple-700 transition-colors">Adaptive Assessment</a></li>
              <li><a href="#courses" className="hover:text-purple-700 transition-colors">Course Catalog</a></li>
              <li><a href="#ai" className="hover:text-purple-700 transition-colors">AI Learning Path</a></li>
              <li><a href="#certifications" className="hover:text-purple-700 transition-colors">Verification Portal</a></li>
            </ul>
          </div>

          {/* User Roles */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-950 mb-4">Roles Supported</h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li><span className="hover:text-purple-700 transition-colors cursor-pointer">Students & Learners</span></li>
              <li><span className="hover:text-purple-700 transition-colors cursor-pointer">Course Instructors</span></li>
              <li><span className="hover:text-purple-700 transition-colors cursor-pointer">Content Reviewers</span></li>
              <li><span className="hover:text-purple-700 transition-colors cursor-pointer">Industry Mentors</span></li>
              <li><span className="hover:text-purple-700 transition-colors cursor-pointer">Platform Admins</span></li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-950 mb-4">Stack & AI</h4>
            <p className="text-sm text-slate-500 mb-3">
              Built on React 18, Node.js, Express, MongoDB, Tailwind CSS, and Google Gemini API.
            </p>
            <div className="flex items-center gap-2 text-xs text-purple-600 font-medium">
              <span>Capstone Project 2026</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-purple-100/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LearnHub Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-purple-700 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-purple-700 cursor-pointer">Terms of Service</span>
            <span className="hover:text-purple-700 cursor-pointer">API Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
