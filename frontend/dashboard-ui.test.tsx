import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DashboardUI from './dashboard-ui'

const mockStats = {
  totalProcessed: 42,
  successRate: 95.2,
  averageConfidence: 0.82,
  classificationBreakdown: { billing: 20, support_ticket: 15, sales_lead: 7 },
  recentActivity: [
    {
      id: 'test-1',
      timestamp: '2026-03-15T12:00:00Z',
      text: 'I need a refund',
      source: 'email',
      classification: 'billing',
      confidence: 0.85,
      status: 'completed',
    },
  ],
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('DashboardUI', () => {
  test('shows loading state initially', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}))
    render(<DashboardUI />)
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
  })

  test('shows error state when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))
    render(<DashboardUI />)
    await waitFor(() => {
      expect(screen.getByText('Connection Error')).toBeInTheDocument()
    })
  })

  test('renders stat cards after successful fetch', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockStats,
    } as Response)

    render(<DashboardUI />)

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument()
    })
    expect(screen.getByText('Total Processed')).toBeInTheDocument()
    expect(screen.getByText('Success Rate')).toBeInTheDocument()
    expect(screen.getByText('Avg Confidence')).toBeInTheDocument()
    expect(screen.getByText('Classifications')).toBeInTheDocument()
  })

  test('renders activity table with data', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockStats,
    } as Response)

    render(<DashboardUI />)

    await waitFor(() => {
      expect(screen.getByText('I need a refund')).toBeInTheDocument()
    })
    expect(screen.getAllByText('billing').length).toBeGreaterThanOrEqual(1)
  })

  test('shows no activity message when empty', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ ...mockStats, recentActivity: [] }),
    } as Response)

    render(<DashboardUI />)

    await waitFor(() => {
      expect(screen.getByText(/No activity yet/)).toBeInTheDocument()
    })
  })

  test('manual test panel has input and button', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockStats,
    } as Response)

    render(<DashboardUI />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter text to classify...')).toBeInTheDocument()
    })
    expect(screen.getByText('Process Request')).toBeInTheDocument()
  })

  test('process button is disabled when input is empty', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockStats,
    } as Response)

    render(<DashboardUI />)

    await waitFor(() => {
      expect(screen.getByText('Process Request')).toBeInTheDocument()
    })

    const button = screen.getByText('Process Request')
    expect(button).toBeDisabled()
  })
})
