import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatabaseForm } from '../components/DatabaseForm/DatabaseForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('DatabaseForm', () => {
  it('renders all form inputs', () => {
    render(<DatabaseForm />, { wrapper });
    
    expect(screen.getByLabelText(/host/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/port/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/database name/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<DatabaseForm />, { wrapper });
    
    const submitButton = screen.getByRole('button', { name: /start transformation/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/host is required/i)).toBeInTheDocument();
      expect(screen.getByText(/port must be a number/i)).toBeInTheDocument();
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/database name is required/i)).toBeInTheDocument();
    });
  });

  it('validates port number format', async () => {
    render(<DatabaseForm />, { wrapper });
    
    const portInput = screen.getByLabelText(/port/i);
    await userEvent.type(portInput, 'abc');
    
    const submitButton = screen.getByRole('button', { name: /start transformation/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/port must be a number/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockAxios = vi.spyOn(axios, 'post').mockResolvedValueOnce({ data: { success: true } });
    
    render(<DatabaseForm />, { wrapper });
    
    await userEvent.type(screen.getByLabelText(/host/i), 'localhost');
    await userEvent.type(screen.getByLabelText(/port/i), '3306');
    await userEvent.type(screen.getByLabelText(/username/i), 'root');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.type(screen.getByLabelText(/database name/i), 'testdb');
    
    const submitButton = screen.getByRole('button', { name: /start transformation/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAxios).toHaveBeenCalledWith('/api/transform', {
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'password123',
        database: 'testdb',
      });
    });
  });
});