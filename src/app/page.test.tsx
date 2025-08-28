import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import HomePage from './page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('HomePage', () => {
  const mockPush = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should_render_hero_section_and_input_form', () => {
    // Arrange & Act
    render(<HomePage />);
    
    // Assert - Hero section exists
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    
    // Assert - Input form elements exist
    expect(screen.getByTestId('home-input')).toBeInTheDocument();
    expect(screen.getByTestId('home-submit')).toBeInTheDocument();
  });

  it('should_render_example_chips', () => {
    // Arrange & Act
    render(<HomePage />);
    
    // Assert - Example chips exist
    expect(screen.getByText('3-day Tokyo food tour')).toBeInTheDocument();
    expect(screen.getByText('Week-long European adventure')).toBeInTheDocument();
    expect(screen.getByText('Beach vacation in Southeast Asia')).toBeInTheDocument();
  });

  it('should_populate_input_when_chip_clicked', () => {
    // Arrange
    render(<HomePage />);
    const input = screen.getByTestId('home-input');
    const chip = screen.getByText('3-day Tokyo food tour');
    
    // Act
    fireEvent.click(chip);
    
    // Assert - Input value replaced (not appended)
    expect((input as HTMLTextAreaElement).value).toBe('3-day Tokyo food tour');
  });

  it('should_show_loading_state_during_submission', async () => {
    // Arrange
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'itinerary_123' }),
      }), 100))
    );
    
    render(<HomePage />);
    const input = screen.getByTestId('home-input');
    const submitButton = screen.getByTestId('home-submit');
    
    // Act
    fireEvent.change(input, { target: { value: 'Test query' } });
    fireEvent.click(submitButton);
    
    // Assert - Loading state active
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('aria-busy', 'true');
    
    // Assert - Loading state cleared after response
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveAttribute('aria-busy', 'false');
    });
  });

  it('should_redirect_to_plan_on_successful_submission', async () => {
    // Arrange
    const mockId = 'itinerary_456';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: mockId }),
    });
    
    render(<HomePage />);
    const input = screen.getByTestId('home-input');
    const submitButton = screen.getByTestId('home-submit');
    
    // Act
    fireEvent.change(input, { target: { value: 'Paris weekend trip' } });
    fireEvent.click(submitButton);
    
    // Assert - API called with correct payload
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Paris weekend trip' }),
      });
    });
    
    // Assert - Redirected to plan page
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(`/plan/${mockId}`);
    });
  });

  it('should_display_error_message_on_api_failure', async () => {
    // Arrange
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(<HomePage />);
    const input = screen.getByTestId('home-input');
    const submitButton = screen.getByTestId('home-submit');
    
    // Act
    fireEvent.change(input, { target: { value: 'Test query' } });
    fireEvent.click(submitButton);
    
    // Assert - Error message displayed in aria-live region
    await waitFor(() => {
      const errorRegion = screen.getByRole('status');
      expect(errorRegion).toHaveAttribute('aria-live', 'polite');
      expect(errorRegion).toHaveTextContent(/error|failed|try again/i);
    });
    
    // Assert - Controls re-enabled
    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveAttribute('aria-busy', 'false');
  });

  it('should_handle_500_error_with_mock_param', async () => {
    // Arrange
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Internal server error' }),
    });
    
    render(<HomePage />);
    const input = screen.getByTestId('home-input');
    const submitButton = screen.getByTestId('home-submit');
    
    // Act - Simulate form submission that triggers 500
    fireEvent.change(input, { target: { value: 'Test query' } });
    
    // Override fetch for this test to add mock param
    const originalFetch = mockFetch;
    mockFetch.mockImplementationOnce((url, options) => {
      return originalFetch(`${url}?__mock=500`, options);
    });
    
    fireEvent.click(submitButton);
    
    // Assert - Error displayed
    await waitFor(() => {
      const errorRegion = screen.getByRole('status');
      expect(errorRegion).toHaveTextContent(/error|failed|try again/i);
    });
    
    // Assert - Form re-enabled
    expect(submitButton).not.toBeDisabled();
  });

  it('should_prevent_empty_query_submission', () => {
    // Arrange
    render(<HomePage />);
    const submitButton = screen.getByTestId('home-submit');
    
    // Act
    fireEvent.click(submitButton);
    
    // Assert - No API call made
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should_clear_error_on_new_submission', async () => {
    // Arrange - First submission fails
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(<HomePage />);
    const input = screen.getByTestId('home-input');
    const submitButton = screen.getByTestId('home-submit');
    
    // Act - First submission (failure)
    fireEvent.change(input, { target: { value: 'Test query' } });
    fireEvent.click(submitButton);
    
    // Assert - Error displayed
    await waitFor(() => {
      const errorRegion = screen.getByRole('status');
      expect(errorRegion).toHaveTextContent('Something went wrong. Please try again.');
    });
    
    // Arrange - Second submission succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'itinerary_789' }),
    });
    
    // Act - Second submission
    fireEvent.change(input, { target: { value: 'Another query' } });
    fireEvent.click(submitButton);
    
    // Assert - Error cleared (contains non-breaking space when empty)
    await waitFor(() => {
      const errorRegion = screen.getByRole('status');
      expect(errorRegion.textContent?.trim()).toBe('');
    });
  });
});