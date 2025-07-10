import React, { useState } from 'react';
import { useAnalyses } from '../hooks/useAnalyses';
import Loader from '../components/Loader';
import { AnalysisJob } from '../types';
import ClipCard from '../components/ClipCard';

const HistoryItem: React.FC<{ job: AnalysisJob }> = ({ job }) => {
    const [isOpen, setIsOpen] = useState(false);
    const date = job.createdAt ? job.createdAt.toDate().toLocaleString() : 'Date not available';

    return (
        <div className="bg-gray-800/70 rounded-xl border border-gray-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-purple-500 animate-fade-in">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 flex justify-between items-center text-left hover:bg-gray-700/50 transition-colors rounded-xl"
            >
                <div className="flex-1">
                    <p className="font-semibold text-white text-lg">{job.videoFileName}</p>
                    <p className="text-sm text-gray-400 mt-1">{date}</p>
                    {job.llmProvider && (
                        <p className="text-xs text-purple-400 mt-1">Analyzed with {job.llmProvider.toUpperCase()}</p>
                    )}
                </div>
                <div className="flex items-center gap-4">
                   <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                       job.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                       job.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                       'bg-red-500/20 text-red-400 border border-red-500/30'
                   }`}>
                       {job.status}
                   </span>
                   <svg className={`w-6 h-6 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            {isOpen && (
                <div className="p-6 border-t border-gray-700">
                    {job.clips.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {job.clips.map((clip) => (
                                <ClipCard key={clip.id} clip={clip} sourceVideoUrl={job.videoUrl} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 py-8">
                            <p>No clips found in this analysis.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const HistoryPage: React.FC = () => {
    const { analyses, loading } = useAnalyses();

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Analysis History</h1>
                <p className="text-lg text-gray-400">Review your past video analyses and clips</p>
            </div>
            
            {loading && <Loader message="Loading your analysis history..." />}
            
            {!loading && analyses.length === 0 && (
                <div className="text-center text-gray-400 bg-gray-800/50 p-12 rounded-xl max-w-2xl mx-auto animate-fade-in">
                    <div className="w-20 h-20 border-2 border-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-2xl mb-4">No analysis history yet.</h3>
                    <p className="text-lg">Upload a video to get started!</p>
                </div>
            )}
            
            {!loading && analyses.length > 0 && (
                <div className="space-y-6">
                    {analyses.map(job => (
                        <HistoryItem key={job.id} job={job} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryPage;