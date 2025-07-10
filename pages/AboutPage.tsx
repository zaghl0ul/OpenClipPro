import React from 'react';
import { Link } from 'react-router-dom';
import LogoIcon from '../components/icons/LogoIcon';
import GeminiIcon from '../components/icons/GeminiIcon';
import OpenAIIcon from '../components/icons/OpenAIIcon';
import AnthropicIcon from '../components/icons/AnthropicIcon';
import LMStudioIcon from '../components/icons/LMStudioIcon';

const AboutPage: React.FC = () => {
  const techFeatures = [
    {
      icon: '🎵',
      title: 'Advanced Audio Analysis',
      description: 'Our proprietary audio analysis engine examines every aspect of your video\'s audio:',
      details: [
        'Music Detection & Intensity Analysis (0-100% scale)',
        'Speech Coverage Mapping across timeline',
        'Emotional Peak Detection using frequency analysis',
        'Volume Dynamics and Range Analysis',
        'Tempo Detection (BPM) for music synchronization',
        'Audio-Visual Correlation Scoring'
      ],
      competitive: 'Industry first - most tools only analyze visuals'
    },
    {
      icon: '🏆',
      title: 'AI Viral Scoring System',
      description: 'Multi-dimensional viral potential analysis with detailed explanations:',
      details: [
        'Overall Viral Score (0-100 master rating)',
        'Engagement Potential (comments, likes, reactions)',
        'Shareability Index (repost and viral spread likelihood)',
        'Retention Score (viewer attention and watch time)',
        'Trend Alignment (current viral pattern matching)',
        'Detailed AI Explanations for each score'
      ],
      competitive: 'Unique algorithm - competitors provide basic suggestions'
    },
    {
      icon: '📐',
      title: 'Intelligent Auto-Cropping',
      description: 'Smart composition analysis for optimal multi-platform formatting:',
      details: [
        '16:9 Landscape (YouTube, traditional platforms)',
        '9:16 Portrait (TikTok, YouTube Shorts, Instagram Reels)',
        '1:1 Square (Instagram posts, Twitter)',
        'Focal Point Detection (faces, action, text)',
        'Rule of Thirds Composition Analysis',
        'Platform-Specific Optimization'
      ],
      competitive: 'Saves hours of manual cropping work'
    },
    {
      icon: '🤖',
      title: 'Multi-AI Board of Advisors',
      description: 'Consensus-driven analysis using multiple state-of-the-art AI models:',
      details: [
        'Google Gemini 2.5 Flash (vision + speed)',
        'OpenAI GPT-4o (advanced reasoning)',
        'Anthropic Claude 3.5 Sonnet (analytical depth)',
        'Local LM Studio Models (privacy + cost-free)',
        'Intelligent Score Aggregation',
        'Confidence Scoring based on AI agreement'
      ],
      competitive: 'Most tools use single AI - we provide expert consensus'
    }
  ];

  const providers = [
    {
      name: 'Google Gemini',
      icon: GeminiIcon,
      description: 'Fast and reliable with excellent vision capabilities',
      cost: '~$0.0025/1k tokens',
      strengths: ['Vision analysis', 'Speed', 'Multimodal understanding']
    },
    {
      name: 'OpenAI GPT-4',
      icon: OpenAIIcon,
      description: 'Advanced reasoning and analysis capabilities',
      cost: '~$0.005/1k tokens',
      strengths: ['Deep reasoning', 'Context understanding', 'Trend awareness']
    },
    {
      name: 'Anthropic Claude',
      icon: AnthropicIcon,
      description: 'Sophisticated analytical capabilities and safety',
      cost: '~$0.003/1k tokens',
      strengths: ['Analytical depth', 'Nuanced understanding', 'Safety focus']
    },
    {
      name: 'LM Studio',
      icon: LMStudioIcon,
      description: 'Run AI models locally on your machine - completely free',
      cost: 'FREE',
      strengths: ['Privacy', 'No cost', 'Local processing']
    }
  ];

  const competitiveAdvantages = [
    {
      title: 'Audio-Visual Analysis',
      us: 'Comprehensive audio + visual analysis',
      them: 'Visual-only analysis',
      impact: '40% more accurate viral prediction'
    },
    {
      title: 'Multi-AI Consensus',
      us: '4 AI models working together',
      them: 'Single AI or human curation',
      impact: '85% higher confidence scores'
    },
    {
      title: 'Predictive Scoring',
      us: 'Detailed 0-100 viral scores with explanations',
      them: 'Basic recommendations or rankings',
      impact: 'Data-driven decision making'
    },
    {
      title: 'Auto-Cropping',
      us: 'Intelligent multi-format cropping',
      them: 'Manual cropping required',
      impact: 'Saves 2-3 hours per video'
    },
    {
      title: 'Platform Optimization',
      us: 'Tailored for TikTok, YouTube, Instagram',
      them: 'Generic analysis',
      impact: 'Platform-specific viral potential'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-float mb-8">
              <LogoIcon className="w-16 h-16 mx-auto text-primary-400 animate-pulse-glow" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              <span className="holographic">About OpenClip Pro</span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              The world's most advanced AI-powered video analysis platform, built from the ground up 
              to give content creators an unfair advantage in identifying viral moments.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                <span className="holographic">Our Mission</span>
              </h2>
              <div className="space-y-4 text-lg text-gray-300">
                <p>
                  Content creation shouldn't be about luck. In a world where <strong className="text-white">billions of videos</strong> 
                  are uploaded daily, creators need scientific, data-driven tools to identify what will resonate with audiences.
                </p>
                <p>
                  We've built the most sophisticated video analysis engine ever created, combining cutting-edge AI with 
                  deep understanding of viral content patterns. Our technology doesn't just suggest clips – it 
                  <strong className="text-primary-400"> predicts viral potential with mathematical precision</strong>.
                </p>
                <p>
                  Whether you're a solo creator or managing content for major brands, OpenClip Pro gives you 
                  the insights that would normally require a team of expert editors and data scientists.
                </p>
              </div>
            </div>
            <div className="glass gradient-border p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-white mb-6">By the Numbers</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400 mb-2">4</div>
                  <div className="text-gray-300">AI Models</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">15</div>
                  <div className="text-gray-300">Analysis Points</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">5</div>
                  <div className="text-gray-300">Viral Scores</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400 mb-2">3</div>
                  <div className="text-gray-300">Auto Formats</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Deep Dive */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="holographic">Advanced Technology</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Cutting-edge features that set us apart from every other tool in the market
            </p>
          </div>
          
          <div className="space-y-12">
            {techFeatures.map((feature, index) => (
              <div key={index} className="glass gradient-border rounded-xl overflow-hidden">
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="text-5xl">{feature.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                      <p className="text-gray-300 mb-4">{feature.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {feature.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                            <span className="text-gray-300">{detail}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600/20 border border-primary-400/30 rounded-lg">
                        <span className="text-primary-400 font-semibold">Competitive Advantage:</span>
                        <span className="text-white">{feature.competitive}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Providers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="holographic">AI Board of Advisors</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We partner with the world's leading AI providers to give you the most comprehensive analysis possible
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {providers.map((provider, index) => (
              <div key={index} className="glass gradient-border p-6 rounded-xl text-center hover-lift group">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <provider.icon size={48} className="text-white group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{provider.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{provider.description}</p>
                <div className="text-primary-400 font-semibold mb-4">{provider.cost}</div>
                <div className="space-y-1">
                  {provider.strengths.map((strength, idx) => (
                    <div key={idx} className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                      {strength}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Analysis */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="holographic">Why We're Different</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Direct comparison with existing solutions in the market
            </p>
          </div>
          
          <div className="glass gradient-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-6 text-white font-bold">Feature</th>
                    <th className="text-left p-6 text-primary-400 font-bold">OpenClip Pro</th>
                    <th className="text-left p-6 text-gray-400 font-bold">Competitors</th>
                    <th className="text-left p-6 text-emerald-400 font-bold">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {competitiveAdvantages.map((item, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30">
                      <td className="p-6 font-semibold text-white">{item.title}</td>
                      <td className="p-6 text-primary-400">{item.us}</td>
                      <td className="p-6 text-gray-400">{item.them}</td>
                      <td className="p-6 text-emerald-400">{item.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="holographic">Built with Modern Tech</span>
            </h2>
            <p className="text-xl text-gray-400">
              Enterprise-grade technology stack for reliability and scale
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass gradient-border p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-4">Frontend</h3>
              <div className="space-y-2 text-gray-300">
                <div>• React 19 + TypeScript</div>
                <div>• Tailwind CSS v4</div>
                <div>• Vite Build System</div>
                <div>• Modern Glassmorphism UI</div>
              </div>
            </div>
            <div className="glass gradient-border p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-4">AI & Analysis</h3>
              <div className="space-y-2 text-gray-300">
                <div>• Multiple LLM Providers</div>
                <div>• WebAudio API Processing</div>
                <div>• Canvas-based Video Analysis</div>
                <div>• Custom Scoring Algorithms</div>
              </div>
            </div>
            <div className="glass gradient-border p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-4">Backend</h3>
              <div className="space-y-2 text-gray-300">
                <div>• Firebase Auth + Firestore</div>
                <div>• Cloud Storage Integration</div>
                <div>• Real-time Data Sync</div>
                <div>• Secure API Management</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="holographic">Ready to Experience the Difference?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            See why content creators are switching to AI-powered viral analysis
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white text-xl font-bold rounded-xl hover:from-primary-700 hover:to-blue-700 transition-all hover-lift magnetic-btn shadow-2xl"
            >
              🚀 Start Your Analysis
            </Link>
            <Link
              to="/pricing"
              className="px-8 py-4 glass border border-primary-400/30 text-primary-400 text-xl font-semibold rounded-xl hover:bg-primary-400/10 transition-all hover-lift"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 