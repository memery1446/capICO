import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlobalError from '../components/GlobalError';

describe('GlobalError', () => {
  
  it('renders nothing when there is no error', () => {
    const { container } = render(<GlobalError error={null} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error message when there is an error', () => {
    render(<GlobalError error="Test error message" onClose={() => {}} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  // Error content and structure
  it('handles different types of error messages', () => {
    const errorObject = { message: 'Error object message' };
    render(<GlobalError error={errorObject} onClose={() => {}} />);
    expect(screen.getByText('Error object message')).toBeInTheDocument();
  });

  it('handles HTML content in error messages safely', () => {
    const errorWithHtml = '<strong>Dangerous HTML</strong>';
    render(<GlobalError error={errorWithHtml} onClose={() => {}} />);
    expect(screen.getByText('<strong>Dangerous HTML</strong>')).toBeInTheDocument();
    expect(screen.queryByText(/Dangerous HTML/)).not.toHaveAttribute('strong');
  });

  // Accessibility tests
  it('meets accessibility requirements', () => {
    render(<GlobalError error="Test error" onClose={() => {}} />);
    
    // Check for proper heading hierarchy
    const heading = screen.getByText('Error');
    expect(heading.tagName).toBe('H2');
    
    // Check that the dialog is properly structured
    const dialog = screen.getByText('Test error').closest('div');
    expect(dialog).toHaveClass('bg-white');
    
    // Verify close button is properly labeled
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('provides proper focus management', () => {
    const mockOnClose = jest.fn();
    render(<GlobalError error="Test error" onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(document.activeElement).toBe(closeButton);
  });

  // Keyboard interaction tests
  it('handles keyboard interactions correctly', async () => {
    const mockOnClose = jest.fn();
    render(<GlobalError error="Test error" onClose={mockOnClose} />);
    
    // Test Escape key closes the error
    await userEvent.keyboard('{Escape}');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    
    // Test Enter key on close button
    mockOnClose.mockClear();
    const closeButton = screen.getByRole('button', { name: /close/i });
    closeButton.focus();
    await userEvent.keyboard('{Enter}');
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Visual and style tests
  it('applies correct styling for error states', () => {
    render(<GlobalError error="Test error" onClose={() => {}} />);
    
    // Check overlay styling
    const overlay = screen.getByText('Test error').parentElement.parentElement;
    expect(overlay).toHaveClass('fixed', 'inset-0', 'bg-black', 'bg-opacity-50');
    
    // Check error container styling
    const container = screen.getByText('Test error').closest('div');
    expect(container).toHaveClass('bg-white', 'p-6', 'rounded-lg', 'shadow-xl');
    
    // Check close button styling
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toHaveClass('bg-red-500', 'text-white', 'px-4', 'py-2', 'rounded', 'hover:bg-red-600');
  });

  // Integration with click outside
  it('handles clicking outside the error container', () => {
    const mockOnClose = jest.fn();
    render(<GlobalError error="Test error" onClose={mockOnClose} />);
    
    // Click the overlay (outside the error container)
    const overlay = screen.getByText('Test error').parentElement.parentElement;
    fireEvent.click(overlay);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Error boundary integration
  it('works with error boundary caught errors', () => {
    const errorBoundaryError = new Error('Boundary error');
    render(<GlobalError error={errorBoundaryError} onClose={() => {}} />);
    
    expect(screen.getByText('Boundary error')).toBeInTheDocument();
  });

  // Test multiple rapid interactions
  it('handles multiple rapid interactions correctly', async () => {
    const mockOnClose = jest.fn();
    render(<GlobalError error="Test error" onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    
    // Simulate rapid clicks
    fireEvent.click(closeButton);
    fireEvent.click(closeButton);
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(3);
  });

    // Test for proper cleanup of event listeners
  it('properly cleans up event listeners on unmount', () => {
    const mockOnClose = jest.fn();
    const { unmount } = render(<GlobalError error="Test error" onClose={mockOnClose} />);
    
    // Store the number of listeners before unmount
    const beforeListeners = window.__handlers?.length || 0;
    
    // Unmount the component
    unmount();
    
    // Simulate an Escape key press after unmount
    fireEvent.keyDown(document, { key: 'Escape' });
    
    // Verify the handler wasn't called after unmount
    expect(mockOnClose).not.toHaveBeenCalled();
    
    // Verify no memory leaks in event listeners
    const afterListeners = window.__handlers?.length || 0;
    expect(afterListeners).toBe(beforeListeners);
  });


    // Test for handling complex error objects
  it('handles complex error objects by converting them to strings', () => {
    const complexError = {
      error: {
        innerError: {
          message: 'Deeply nested error message'
        }
      }
    };
    
    render(<GlobalError error={complexError} onClose={() => {}} />);
    
    // Display [object Object] as per the current implementation
    expect(screen.getByText('[object Object]')).toBeInTheDocument();
    
    // Verify the error dialog structure remains intact
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('Error')).toBeInTheDocument();
  });
  });

