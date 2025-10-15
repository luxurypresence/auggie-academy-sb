import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch to avoid actual API calls in tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
) as jest.Mock;

test('renders todo app and loads', async () => {
  render(<App />);

  // Wait for loading to complete and app to render
  await waitFor(() => {
    const titleElement = screen.getByText(/Todo App/i);
    expect(titleElement).toBeInTheDocument();
  });

  // Check for the input placeholder
  const inputElement = screen.getByPlaceholderText(/What needs to be done?/i);
  expect(inputElement).toBeInTheDocument();
});
