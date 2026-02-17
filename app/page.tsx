'use client';

import { ArrowRight, Zap, Lock, Layers, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-violet-950">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-600 rounded flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">Linq</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/sign-in"
                className="text-gray-300 hover:text-white transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Build AI Workflows
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400">
              Without Code
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Create powerful AI-powered workflows with our visual no-code builder. 
            Process images, generate content, and automate tasks in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all text-lg shadow-lg shadow-violet-500/50 hover:shadow-violet-500/70"
            >
              Start Building Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/sign-in"
              className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors text-lg border border-gray-700"
            >
              Sign In
            </Link>
          </div>

          <p className="text-gray-500 text-sm mt-4">
            No credit card required • Free forever
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-violet-500/50 transition-all group">
            <div className="w-14 h-14 bg-violet-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-violet-600/30 transition-all">
              <Zap className="w-7 h-7 text-violet-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              Lightning Fast
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Build and deploy workflows in minutes. No coding required, just drag, drop, and connect nodes.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-violet-500/50 transition-all group">
            <div className="w-14 h-14 bg-violet-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-violet-600/30 transition-all">
              <Sparkles className="w-7 h-7 text-violet-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              AI-Powered
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Integrate powerful AI models for image processing, text generation, and intelligent automation.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-violet-500/50 transition-all group">
            <div className="w-14 h-14 bg-violet-600/20 rounded-xl flex items-center justify-center mb-6 group-hover:bg-violet-600/30 transition-all">
              <Lock className="w-7 h-7 text-violet-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              Secure & Private
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Your workflows and data are encrypted and secure with enterprise-grade protection.
            </p>
          </div>
        </div>

        {/* Workflow History Feature Showcase */}
        <div className="mt-32 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-10 hover:border-violet-500/30 transition-all">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-violet-600/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-3xl font-bold text-white">
                  Track Everything
                </h3>
              </div>
              <p className="text-lg text-gray-400 mb-6 leading-relaxed">
                Complete execution history with node-level tracking. 
                See exactly what happened, when it happened, and how long it took.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-violet-400 rounded-full" />
                  <span className="text-lg">Real-time execution tracking</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-violet-400 rounded-full" />
                  <span className="text-lg">Node-level performance metrics</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <div className="w-2 h-2 bg-violet-400 rounded-full" />
                  <span className="text-lg">Expandable execution details</span>
                </li>
              </ul>
            </div>
            
            <div className="w-full lg:w-80">
              <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-6 shadow-2xl">
                <div className="text-xs text-gray-400 mb-4 font-semibold uppercase tracking-wider">Workflow History</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0 animate-pulse" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-300 font-medium">Run #1</span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">3.2s</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-300 font-medium">Run #2</span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">2.8s</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 animate-pulse" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-300 font-medium">Run #3</span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">Running...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="mt-32 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join thousands of users building amazing AI workflows today
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-10 py-4 rounded-lg font-semibold transition-all text-lg shadow-lg shadow-violet-500/50 hover:shadow-violet-500/70"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-gray-500 text-sm mt-4">
            Start building in 2 minutes • No credit card required
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-32 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-violet-600 rounded flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-sm text-gray-400">© 2024 Weavy. All rights reserved.</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}