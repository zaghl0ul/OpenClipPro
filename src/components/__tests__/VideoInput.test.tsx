import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VideoInput from '../VideoInput';

// Mock the hooks
const mockUseAuth = {
  user: { email: 'test@example.com', credits: 10 },
  signUp: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
};

const mockUseAnalyses = {
  analyses: [],
  loading: false,
  isProcessing: false,
  createAnalysisJob: jest.fn(),
  deleteAnalysis: jest.fn(),
  clearCache: jest.fn(),
};

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth,
}));

jest.mock('../../hooks/useAnalyses', () => ({
  useAnalyses: () => mockUseAnalyses,
}));

describe('VideoInput Component', () => {
  const mockOnAnalyze = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders upload area correctly', () => {
    render(<VideoInput onAnalyze={mockOnAnalyze} isProcessing={false} credits={10} />);
    
    expect(screen.getByText(/Upload a Video/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop your video here/i)).toBeInTheDocument();
    expect(screen.getByText(/or click to browse/i)).toBeInTheDocument();
  });

  test('shows processing state correctly', () => {
    render(<VideoInput onAnalyze={mockOnAnalyze} isProcessing={true} credits={10} />);
    
    expect(screen.getByText(/Processing video/i)).toBeInTheDocument();
    expect(screen.getByText(/Please wait while we analyze your video/i)).toBeInTheDocument();
  });

  test('displays credit information', () => {
    render(<VideoInput onAnalyze={mockOnAnalyze} isProcessing={false} credits={5} />);
    
    expect(screen.getByText(/5 credits remaining/i)).toBeInTheDocument();
  });

  test('handles file selection via click', async () => {
    const user = userEvent.setup();
    render(<VideoInput onAnalyze={mockOnAnalyze} isProcessing={false} credits={10} />);
    
    const fileInput = screen.getByLabelText(/file input/i);
    const file = new File(['test video content'], 'test-video.mp4', { type: 'video/mp4' });
    
    await user.upload(fileInput, file);
    
    expect(fileInput.files?.[0]).toBe(file);
  });

  test('handles drag and drop', async () => {
    render(<VideoInput onAnalyze={mockOnAnalyze} isProcessing={false} credits={10} />);
    
    const dropZone = screen.getByTestId('drop-zone');
    const file = new File(['test video content'], 'test-video.mp4', { type: 'video/mp4' });
    
    fireEvent.dragEnter(dropZone);
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });
    
    await waitFor(() => {
      expect(screen.getByText(/test-video.mp4/i)).toBeInTheDocument();
    });
  });

  test('validates file type', async () => {
    const user = userEvent.setup();
    render(<VideoInput onAnalyze={mockOnAnalyze} isProcessing={false} credits={10} />);
    
    const fileInput = screen.getByLabelText(/file input/i);
    const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    await user.upload(fileInput, invalidFile);
    
    expect(screen.getByText(/Please select a valid video file/i)).toBeInTheDocument();
  });

  test('validates file size', async () => {
    const user = userEvent.setup();
    render(<VideoInput onAnalyze={mockOnAnalyze} isProcessing={false} credits={10} />);
    
    const fileInput = screen.getByLabelText(/file input/i);
    // Create a large file (over 100MB)
    const largeFile = new File(['x'.repeat(100 * 1024 * 1024)], 'large-video.mp4', { type: 'video/mp4' });
    
    await user.upload(fileInput, largeFile);
    
    expect(screen.getByText(/File size must be less than 100MB/i)).toBeInTheDocument();
  });

  test('shows analysis settings when file is selected', async () => {
    const user = userEvent.setup();
    render(<VideoInput onAnalyze={mockOnAnalyze} isProcessing={false} credits={10} />);
    
    const fileInput = screen.getByLabelText(/file input/i);
    const file = new File(['test video content'], 'test-video.mp4', { type: 'video/mp4' });
    
    await user.upload(fileInput, file);
    
    await waitFor(() => {
      expect(screen.getByText(/Analysis Settings/i)).toBeInTheDocument();
      expect(screen.getByText(/AI Providers/i)).toBeInTheDocument();
    });
  });

  test('starts analysis when analyze button is clicked', async () => {
    const user = userEvent.setup();
    render(<VideoInput onAnalyze={mockOnAnalyze} isProcessing={false} credits={10} />);
    
    const fileInput = screen.getByLabelText(/file input/i);
    const file = new File(['test video content'], 'test-video.mp4', { type: 'video/mp4' });
    
    await user.upload(fileInput, file);
    
    await waitFor(() => {
      const analyzeButton = screen.getByText(/Start Analysis/i);
      expect(analyzeButton).toBeInTheDocument();
    });
    
    const analyzeButton = screen.getByText(/Start Analysis/i);
    await user.click(analyzeButton);
    
    expect(mockOnAnalyze).toHaveBeenCalled();
  });

  test('displays file information correctly', async () => {
    const user = userEvent.setup();
    render(<VideoInput onAnalyze={mockOnAnalyze} isProcessing={false} credits={10} />);
    
    const fileInput = screen.getByLabelText(/file input/i);
    const file = new File(['test video content'], 'test-video.mp4', { type: 'video/mp4' });
    
    await user.upload(fileInput, file);
    
    await waitFor(() => {
      expect(screen.getByText(/test-video.mp4/i)).toBeInTheDocument();
      expect(screen.getByText(/video\/mp4/i)).toBeInTheDocument();
    });
  });

  test('handles file removal', async () => {
    const user = userEvent.setup();
    render(<VideoInput onAnalyze={mockOnAnalyze} isProcessing={false} credits={10} />);
    
    const fileInput = screen.getByLabelText(/file input/i);
    const file = new File(['test video content'], 'test-video.mp4', { type: 'video/mp4' });
    
    await user.upload(fileInput, file);
    
    await waitFor(() => {
      const removeButton = screen.getByText(/Remove/i);
      expect(removeButton).toBeInTheDocument();
    });
    
    const removeButton = screen.getByText(/Remove/i);
    await user.click(removeButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Drag and drop your video here/i)).toBeInTheDocument();
    });
  });

  test('shows insufficient credits warning', async () => {
    const user = userEvent.setup();
    render(<VideoInput onAnalyze={mockOnAnalyze} isProcessing={false} credits={0} />);
    
    const fileInput = screen.getByLabelText(/file input/i);
    const file = new File(['test video content'], 'test-video.mp4', { type: 'video/mp4' });
    
    await user.upload(fileInput, file);
    
    await waitFor(() => {
      expect(screen.getByText(/Insufficient credits/i)).toBeInTheDocument();
      expect(screen.getByText(/You need at least 1 credit to start an analysis/i)).toBeInTheDocument();
    });
  });
});