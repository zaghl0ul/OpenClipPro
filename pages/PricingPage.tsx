import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

interface PricingTier {
    name: string;
    credits: number;
    price: number;
    description: string;
    popular?: boolean;
}

const pricingTiers: PricingTier[] = [
    { name: 'Basic', credits: 20, price: 5, description: 'Perfect for getting started and occasional use.' },
    { name: 'Creator', credits: 100, price: 20, description: 'Ideal for regular content creators.', popular: true },
    { name: 'Pro', credits: 500, price: 75, description: 'For power users and agencies.' },
];

const PricingPage: React.FC = () => {
    const { user, addCredits } = useAuth();
    const [loading, setLoading] = useState<string | null>(null);
    
    const handlePurchase = async (tier: PricingTier) => {
        if (!user) {
            toast.error("Please sign in to purchase credits");
            return;
        }

        setLoading(tier.name);
        try {
            await addCredits(tier.credits);
            toast.success(`${tier.credits} credits added successfully!`);
        } catch (error) {
            toast.error("Failed to add credits. Please try again.");
            console.error(error);
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="min-h-screen py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="holographic">Choose Your Plan</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        {user 
                            ? "Select a package that fits your content creation needs. One credit equals one comprehensive video analysis." 
                            : "Transparent pricing for world-class AI video analysis. Start creating viral content today."
                        }
                    </p>
                    {user && (
                        <div className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600/20 border border-primary-400/30 rounded-lg">
                            <span className="text-primary-400 font-semibold">Current Balance:</span>
                            <span className="text-white ml-2 font-bold">{user.credits} credits</span>
                        </div>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {pricingTiers.map(tier => (
                        <div key={tier.name} className={`relative glass gradient-border rounded-xl p-8 flex flex-col transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-purple-500 ${tier.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}>
                           {tier.popular && (
                               <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                   <div className="px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg rounded-full">
                                       Most Popular
                                   </div>
                               </div>
                           )}
                            <h2 className="text-2xl font-bold text-white mb-4">{tier.name}</h2>
                            <p className="text-gray-400 mb-6 flex-grow">{tier.description}</p>
                            <div className="text-center mb-8">
                                <p className="text-5xl font-extrabold text-white mb-2">
                                    {tier.credits} <span className="text-2xl font-semibold text-gray-300">Credits</span>
                                </p>
                                <p className="text-2xl font-bold text-primary-400">${tier.price}</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    ${(tier.price / tier.credits).toFixed(2)} per analysis
                                </p>
                            </div>

                            {/* Features included */}
                            <div className="mb-6 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                    <span>AI Viral Scoring (0-100)</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                    <span>Audio + Visual Analysis</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                    <span>Multi-Format Auto-Cropping</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                    <span>4 AI Models Available</span>
                                </div>
                                {tier.name === 'Pro' && (
                                    <div className="flex items-center gap-2 text-sm text-primary-400">
                                        <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                                        <span>Priority Support</span>
                                    </div>
                                )}
                            </div>

                            {user ? (
                                <button
                                  onClick={() => handlePurchase(tier)}
                                  disabled={loading === tier.name}
                                  className="w-full mt-auto py-4 px-6 font-bold text-white rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-wait bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:scale-105"
                                >
                                    {loading === tier.name ? 'Processing...' : 'Purchase Credits'}
                                </button>
                            ) : (
                                <Link
                                    to="/"
                                    className="w-full mt-auto py-4 px-6 font-bold text-white rounded-lg transition-all duration-300 ease-in-out bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:scale-105 text-center"
                                >
                                    Sign Up to Purchase
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-20 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">
                        <span className="holographic">Frequently Asked Questions</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-white mb-3">How do credits work?</h3>
                            <p className="text-gray-300">Each video analysis consumes 1 credit. You get comprehensive AI analysis including viral scoring, audio analysis, and auto-cropping coordinates.</p>
                        </div>
                        <div className="glass p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-white mb-3">Can I use multiple AI models?</h3>
                            <p className="text-gray-300">Yes! You can use our "Board of Advisors" mode to get consensus from multiple AI models. This uses additional credits but provides higher confidence results.</p>
                        </div>
                        <div className="glass p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-white mb-3">Do credits expire?</h3>
                            <p className="text-gray-300">No, your credits never expire. Purchase once and use them whenever you need to analyze videos.</p>
                        </div>
                        <div className="glass p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-white mb-3">What formats are supported?</h3>
                            <p className="text-gray-300">We support all common video formats (MP4, MOV, AVI, etc.) and automatically generate cropping coordinates for 16:9, 9:16, and 1:1 aspect ratios.</p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                {!user && (
                    <div className="mt-20 text-center">
                        <div className="glass gradient-border p-8 rounded-xl max-w-2xl mx-auto">
                            <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
                            <p className="text-gray-300 mb-6">
                                Join thousands of content creators who are already using AI to identify their most viral moments.
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 text-white text-lg font-bold rounded-xl hover:from-primary-700 hover:to-blue-700 transition-all hover-lift magnetic-btn shadow-2xl"
                            >
                                🚀 Create Free Account
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PricingPage;