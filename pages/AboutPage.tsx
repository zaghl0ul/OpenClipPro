import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">
              About OpenClip Pro
            </h1>
            <p className="text-xl text-secondary">
              AI-powered video analysis and viral clip generation
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="card p-6">
              <div className="text-3xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Smart Clip Detection
              </h3>
              <p className="text-secondary">
                Our AI analyzes your videos to find the most engaging moments that have viral potential.
              </p>
            </div>

            <div className="card p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Viral Score Analysis
              </h3>
              <p className="text-secondary">
                Get detailed breakdowns of engagement, shareability, and retention potential for each clip.
              </p>
            </div>

            <div className="card p-6">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Multi-Platform Export
              </h3>
              <p className="text-secondary">
                Generate clips optimized for TikTok, YouTube Shorts, Instagram Reels, and more.
              </p>
            </div>
          </div>

          {/* Theme Demo Section */}
          <div className="card p-8 mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">
              Theme System Demo
            </h2>
            <p className="text-secondary mb-6">
              This section demonstrates the theme system with different components:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Buttons Demo */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Buttons</h3>
                <div className="space-y-3">
                  <button className="btn btn-primary">Primary Button</button>
                  <button className="btn btn-secondary">Secondary Button</button>
                  <button className="btn btn-ghost">Ghost Button</button>
                </div>
              </div>

              {/* Badges Demo */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Badges</h3>
                <div className="space-y-3">
                  <span className="badge badge-primary">Primary</span>
                  <span className="badge badge-secondary">Secondary</span>
                  <span className="badge badge-success">Success</span>
                  <span className="badge badge-warning">Warning</span>
                  <span className="badge badge-error">Error</span>
                </div>
              </div>

              {/* Progress Demo */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Progress</h3>
                <div className="space-y-3">
                  <div className="progress">
                    <div className="progress-bar" style={{ width: '75%' }}></div>
                  </div>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>

              {/* Loading Demo */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-4">Loading</h3>
                <div className="space-y-3">
                  <div className="loading-spinner"></div>
                  <div className="loading-pulse p-4 bg-secondary rounded-lg">
                    Loading content...
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Link 
              to="/app/dashboard" 
              className="btn btn-primary text-lg px-8 py-3"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 