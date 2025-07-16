import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import LogoIcon from '../components/icons/LogoIcon';
import toast from 'react-hot-toast';

const LandingPage: React.FC = () => {
  const { signUp, login } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [viralScore, setViralScore] = useState(0);
  const [currentDemo, setCurrentDemo] = useState(0);


  // Check URL parameters for auth modal
  useEffect(() => {
    const authParam = searchParams.get('auth');
    if (authParam === 'login') {
      setIsLoginView(true);
      setShowAuthModal(true);
      // Clear the URL parameter
      searchParams.delete('auth');
      setSearchParams(searchParams, { replace: true });
    } else if (authParam === 'signup') {
      setIsLoginView(false);
      setShowAuthModal(true);
      // Clear the URL parameter
      searchParams.delete('auth');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Animated viral score counter
  useEffect(() => {
    const interval = setInterval(() => {
      setViralScore(prev => (prev + 1) % 101);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Demo content rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo(prev => (prev + 1) % demoContent.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
      closeModal();
    } catch (error) {
      const code = (error as any)?.code;
      const errorMessage = code ? code.replace('auth/', '').replace(/-/g, ' ') : 'An unknown error occurred.';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowAuthModal(false);
    setEmail('');
    setPassword('');
    setLoading(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop, not the modal content
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAuthModal) {
        closeModal();
      }
    };

    if (showAuthModal) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showAuthModal]);

  const demoContent = [
    {
      type: "TikTok",
      moment: "Dance Break @ 1:23",
      score: 94,
      reason: "Perfect music synchronization + trending move",
      color: "from-pink-500 to-red-500"
    },
    {
      type: "YouTube",
      moment: "Plot Twist @ 3:45",
      score: 89,
      reason: "High emotional intensity + shock value",
      color: "from-red-500 to-orange-500"
    },
    {
      type: "Instagram",
      moment: "Before/After @ 0:15",
      score: 92,
      reason: "Visual transformation + quick payoff",
      color: "from-purple-500 to-pink-500"
    }
  ];

  const ViralDNA = () => (
    <div className="relative w-32 h-32 mx-auto">
      <div className="absolute inset-0 animate-spin-slow">
        <div className="w-full h-full border-4 border-primary-400 rounded-full border-dashed opacity-30"></div>
      </div>
      <div className="absolute inset-2 animate-pulse">
        <div className="w-full h-full bg-gradient-to-br from-primary-400 to-blue-500 rounded-full opacity-20"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-2xl font-bold text-primary-400">{viralScore}%</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] overflow-hidden">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary-400 rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      {/* Hero: Viral Discovery Simulator */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/20 via-[var(--color-bg-secondary)]/20 to-[var(--color-accent-hover)]/20"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Animated Logo */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 animate-ping">
              <LogoIcon className="w-20 h-20 mx-auto text-primary-400 opacity-30" />
            </div>
            <LogoIcon className="w-20 h-20 mx-auto text-primary-400 animate-pulse-glow relative z-10" />
          </div>

          {/* Dynamic Headline */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
            <span className="block bg-gradient-to-r from-white via-primary-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              VIRAL
            </span>
            <span className="block text-white">
              MOMENTS
            </span>
            <span className="block text-2xl md:text-3xl font-normal text-gray-400 mt-4">
              AI discovers them. You create them.
            </span>
          </h1>

          {/* Interactive Demo Window */}
          <div className="glass gradient-border p-8 max-w-md mx-auto mb-12 transform hover:scale-105 transition-all duration-500">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Analyzing...</span>
                <span className={`px-2 py-1 rounded text-xs font-bold bg-gradient-to-r ${demoContent[currentDemo].color} text-white`}>
                  {demoContent[currentDemo].type}
                </span>
              </div>
              <div className="bg-gray-800 rounded p-3 mb-4">
                <div className="text-white font-bold">{demoContent[currentDemo].moment}</div>
                <div className="text-sm text-gray-400 mt-1">{demoContent[currentDemo].reason}</div>
              </div>
            </div>
            <ViralDNA />
            <div className="mt-4">
              <div className="text-primary-400 font-bold text-lg">Viral Score: {demoContent[currentDemo].score}%</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${demoContent[currentDemo].color} transition-all duration-1000`}
                  style={{ width: `${demoContent[currentDemo].score}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-12 py-6 bg-gradient-to-r from-primary-600 to-blue-600 text-white text-xl font-bold rounded-2xl hover:from-primary-700 hover:to-blue-700 transition-all hover-lift magnetic-btn shadow-2xl transform hover:scale-110"
          >
            🔥 Start Finding Viral Moments
          </button>

          <div className="mt-6 text-gray-400">
            <span className="animate-pulse">⚡ 30-90 second analysis</span>
            <span className="mx-4">•</span>
            <span className="animate-pulse">🎯 4 AI models</span>
            <span className="mx-4">•</span>
            <span className="animate-pulse">📐 Auto-cropping</span>
          </div>
        </div>
      </section>

      {/* Viral Moments Showcase */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
              The Science of Going Viral
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Audio DNA */}
            <div className="glass gradient-border rounded-2xl p-8 transform hover:rotate-1 transition-all duration-500 hover-lift">
              <div className="text-6xl mb-4 text-center">🎵</div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Audio DNA</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-300">Music sync detection</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <span className="text-gray-300">Emotional peak analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  <span className="text-gray-300">Speech pattern mapping</span>
                </div>
              </div>
            </div>

            {/* AI Brain */}
            <div className="glass gradient-border rounded-2xl p-8 transform hover:-rotate-1 transition-all duration-500 hover-lift">
              <div className="text-6xl mb-4 text-center">🧠</div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">AI Consensus</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Gemini</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: `${i * 0.2}s`}}></div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">OpenAI</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: `${i * 0.2}s`}}></div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Claude</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: `${i * 0.2}s`}}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Optimizer */}
            <div className="glass gradient-border rounded-2xl p-8 transform hover:rotate-1 transition-all duration-500 hover-lift">
              <div className="text-6xl mb-4 text-center">📱</div>
              <h3 className="text-2xl font-bold text-white mb-4 text-center">Smart Cropping</h3>
              <div className="space-y-4">
                <div className="bg-gray-800 rounded p-3 transform hover:scale-105 transition-all">
                  <div className="text-pink-400 font-bold">TikTok 9:16</div>
                  <div className="text-xs text-gray-400">Portrait viral moments</div>
                </div>
                <div className="bg-gray-800 rounded p-3 transform hover:scale-105 transition-all">
                  <div className="text-red-400 font-bold">YouTube 16:9</div>
                  <div className="text-xs text-gray-400">Landscape storytelling</div>
                </div>
                <div className="bg-gray-800 rounded p-3 transform hover:scale-105 transition-all">
                  <div className="text-purple-400 font-bold">Instagram 1:1</div>
                  <div className="text-xs text-gray-400">Square perfection</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creators Stats Section */}
      <section className="py-20 bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-[var(--color-text-primary)]">
            Creators Are Already Going Viral
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { creator: "@viral_sarah", growth: "+2.3M views", platform: "TikTok", score: 94 },
              { creator: "@gaming_alex", growth: "+890K subs", platform: "YouTube", score: 87 },
              { creator: "@food_emma", growth: "+1.2M likes", platform: "Instagram", score: 91 }
            ].map((stat, index) => (
              <div key={index} className="glass rounded-xl p-6 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-[var(--color-text-primary)]">{stat.creator}</span>
                  <span className="text-xs px-2 py-1 bg-primary-600 rounded-full text-white">{stat.platform}</span>
                </div>
                <div className="text-2xl font-bold text-primary-400 mb-2">{stat.growth}</div>
                <div className="text-sm text-[var(--color-text-secondary)] mb-3">Viral Score: {stat.score}%</div>
                <div className="w-full bg-[var(--color-bg-tertiary)] rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-blue-500"
                    style={{ width: `${stat.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent)]/30 to-[var(--color-accent-hover)]/30"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <div className="mb-8">
            <ViralDNA />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-[var(--color-text-primary)]">
            Your Next Viral Moment
            <br />
            <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
              Is Waiting
            </span>
          </h2>
          <p className="text-xl text-[var(--color-text-secondary)] mb-12 max-w-2xl mx-auto">
            Stop guessing. Start knowing. Let AI find the moments that will make your content explode.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-16 py-8 bg-gradient-to-r from-primary-600 to-blue-600 text-white text-2xl font-bold rounded-3xl hover:from-primary-700 hover:to-blue-700 transition-all hover-lift magnetic-btn shadow-2xl transform hover:scale-110"
          >
            🚀 Discover My Viral Moments
          </button>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleBackdropClick}
        >
          <div className="w-full max-w-md glass gradient-border animate-fade-in transform scale-100 hover:scale-105 transition-all duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {isLoginView ? 'Welcome Back' : 'Join the Revolution'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors text-2xl hover:scale-110 transform"
                  type="button"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full px-6 py-4 glass-dark rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-lg"
                    placeholder="Your email"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={isLoginView ? 'current-password' : 'new-password'}
                    className="w-full px-6 py-4 glass-dark rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-lg"
                    placeholder="Password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 font-bold text-white rounded-xl transition-all duration-300 disabled:opacity-50 bg-gradient-to-r from-primary-700 to-blue-600 hover:from-primary-600 hover:to-blue-500 hover-lift text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Processing...
                    </div>
                  ) : (
                    isLoginView ? '🚀 Launch Dashboard' : '🎬 Start Creating'
                  )}
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <button
                  type="button"
                  className="text-primary-400 hover:text-primary-300 font-semibold transition-colors hover:underline"
                  onClick={() => setIsLoginView(!isLoginView)}
                >
                  {isLoginView ? "New creator? Join now" : "Already have an account? Sign in"}
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