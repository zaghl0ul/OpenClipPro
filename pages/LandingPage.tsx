import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import LogoIcon from '../components/icons/LogoIcon';
import toast from 'react-hot-toast';

const LandingPage: React.FC = () => {
  const { signUp, login } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLoginView) {
        await login(email, password);
        toast.success('Welcome back!');
      } else {
        await signUp(email, password);
        toast.success('Account created! Welcome.');
      }
      setShowAuthModal(false);
    } catch (error) {
      const code = (error as any)?.code;
      const errorMessage = code ? code.replace('auth/', '').replace(/-/g, ' ') : 'An unknown error occurred.';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: '🎵',
      title: 'Advanced Audio Analysis',
      description: 'Analyzes music, speech, emotional peaks, and volume dynamics to identify the most engaging moments.',
      highlight: 'Industry First'
    },
    {
      icon: '🏆',
      title: 'AI Viral Scoring',
      description: 'Get detailed viral potential scores (0-100) with AI explanations for engagement, shareability, retention, and trends.',
      highlight: 'Unique Algorithm'
    },
    {
      icon: '📐',
      title: 'Smart Auto-Cropping',
      description: 'Automatically generates optimal crops for TikTok (9:16), YouTube (16:9), and Instagram (1:1) - saving hours of work.',
      highlight: 'Multi-Platform'
    },
    {
      icon: '🤖',
      title: 'Multi-AI Board of Advisors',
      description: 'Combine insights from Gemini, OpenAI, Claude, and local models for maximum confidence in your clips.',
      highlight: 'AI Consensus'
    },
    {
      icon: '⚡',
      title: 'Real-Time Analysis',
      description: 'Get comprehensive results in 30-90 seconds with detailed progress tracking and audio-visual insights.',
      highlight: 'Lightning Fast'
    },
    {
      icon: '🎯',
      title: 'Platform Optimization',
      description: 'Tailored analysis for TikTok, YouTube Shorts, Instagram Reels, and traditional platforms.',
      highlight: 'Purpose Built'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="animate-float mb-8">
              <LogoIcon className="w-20 h-20 mx-auto text-primary-400 animate-pulse-glow" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="holographic block">Find Viral Moments</span>
              <span className="neon-text">with AI Precision</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              The world's most advanced AI-powered video analysis tool. Get viral clips with 
              <span className="text-primary-400 font-semibold"> audio analysis</span>, 
              <span className="text-blue-400 font-semibold"> viral scoring</span>, and 
              <span className="text-purple-400 font-semibold"> auto-cropping</span> for every platform.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:from-primary-700 hover:to-blue-700 transition-all hover-lift magnetic-btn shadow-2xl"
              >
                🚀 Start Analyzing Videos
              </button>
              <Link
                to="/about"
                className="px-8 py-4 glass border border-primary-400/30 text-primary-400 text-lg font-semibold rounded-xl hover:bg-primary-400/10 transition-all hover-lift"
              >
                Learn More
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="glass p-6 rounded-xl">
                <div className="text-3xl font-bold text-emerald-400 mb-2">30-90s</div>
                <div className="text-gray-300">Analysis Time</div>
              </div>
              <div className="glass p-6 rounded-xl">
                <div className="text-3xl font-bold text-blue-400 mb-2">4 AIs</div>
                <div className="text-gray-300">Working Together</div>
              </div>
              <div className="glass p-6 rounded-xl">
                <div className="text-3xl font-bold text-purple-400 mb-2">3 Formats</div>
                <div className="text-gray-300">Auto-Cropped</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="holographic">Revolutionary Features</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Cutting-edge technology that gives you an unfair advantage in the content creation game
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass gradient-border p-8 rounded-xl hover-lift group">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                    {feature.highlight}
                  </span>
                </div>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="holographic">How It Works</span>
            </h2>
            <p className="text-xl text-gray-400">
              From upload to viral clips in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Upload Video</h3>
              <p className="text-gray-300">
                Upload your video file. We support all common formats and analyze both visual and audio content.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-4">AI Analysis</h3>
              <p className="text-gray-300">
                Our AI analyzes audio patterns, visual content, and viral potential with detailed scoring and explanations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Get Viral Clips</h3>
              <p className="text-gray-300">
                Download optimized clips with viral scores, auto-cropping coordinates, and detailed insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="holographic">Ready to Go Viral?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join content creators who are already using AI to identify their most viral moments
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white text-xl font-bold rounded-xl hover:from-primary-700 hover:to-blue-700 transition-all hover-lift magnetic-btn shadow-2xl"
          >
            🎬 Start Your First Analysis
          </button>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md glass gradient-border animate-fade-in">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {isLoginView ? 'Welcome Back' : 'Create Account'}
                </h2>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 glass-dark rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={isLoginView ? 'current-password' : 'new-password'}
                    className="w-full px-4 py-3 glass-dark rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    placeholder="Enter your password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 font-bold text-white rounded-lg transition-all duration-300 disabled:opacity-50 bg-gradient-to-r from-primary-700 to-blue-600 hover:from-primary-600 hover:to-blue-500 hover-lift"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    isLoginView ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <button
                  type="button"
                  className="text-primary-400 hover:text-primary-300 font-semibold text-sm transition-colors hover:underline"
                  onClick={() => setIsLoginView(!isLoginView)}
                >
                  {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;