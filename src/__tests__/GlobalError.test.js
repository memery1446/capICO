import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    render(<GlobalError error="Test error message" onClose={mockOnClose} />);

    fireEvent.click(screen.getByText('Close'));
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});

