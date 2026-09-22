import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App Component', () => {
  it('renders without crashing and displays the header', () => {
    render(<App />)
    const headerElements = screen.getAllByText(/FraudLens/i)
    expect(headerElements.length).toBeGreaterThan(0)
  })
})
