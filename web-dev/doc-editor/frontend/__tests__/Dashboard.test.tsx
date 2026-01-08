import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../app/page';
import { useRouter } from 'next/navigation';

// 1. Mock useRouter locally
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Dashboard', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Reset the mock return value before each test
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  it('redirects to login if no user is found in localStorage', () => {
    render(<Dashboard />);
    expect(pushMock).toHaveBeenCalledWith('/login');
  });

  it('fetches and displays documents for logged-in users', async () => {
    localStorage.setItem('username', 'ValidUser');
    
    // Mock Backend Response
    // We use a clean mock here to return specific data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(['doc-1', 'doc-2']),
      })
    ) as jest.Mock;

    render(<Dashboard />);

    // Check welcome message
    expect(screen.getByText('ValidUser')).toBeInTheDocument();

    // Wait for documents
    // Note: The document ID processing in page.tsx replaces '-' with ' '
    await waitFor(() => {
      expect(screen.getByText('doc 1')).toBeInTheDocument();
      expect(screen.getByText('doc 2')).toBeInTheDocument();
    });
  });
});