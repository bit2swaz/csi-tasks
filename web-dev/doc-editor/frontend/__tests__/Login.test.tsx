import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../app/login/page';
import { useRouter } from 'next/navigation';

// 1. Mock useRouter at the top level
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LoginPage', () => {
  it('renders the login form', () => {
    // Setup default return value
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    
    render(<LoginPage />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('redirects and saves user to localStorage on submit', () => {
    // 2. Setup the specific spy for this test
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    render(<LoginPage />);

    const input = screen.getByPlaceholderText('Enter your name');
    const button = screen.getByRole('button', { name: /continue/i });

    // Simulate typing and submit
    fireEvent.change(input, { target: { value: 'TestUser' } });
    fireEvent.click(button);

    // Verify localStorage
    expect(localStorage.getItem('username')).toBe('TestUser');
    
    // Verify redirection
    expect(pushMock).toHaveBeenCalledWith('/');
  });
});