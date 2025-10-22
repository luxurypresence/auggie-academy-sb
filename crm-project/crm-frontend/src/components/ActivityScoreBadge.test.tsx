import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityScoreBadge } from './ActivityScoreBadge';

describe('ActivityScoreBadge', () => {
  it('should render gray badge for null score', () => {
    render(<ActivityScoreBadge score={null} />);
    expect(screen.getByText('Not Calculated')).toBeInTheDocument();
  });

  it('should render gray badge for undefined score', () => {
    render(<ActivityScoreBadge score={undefined} />);
    expect(screen.getByText('Not Calculated')).toBeInTheDocument();
  });

  it('should render red badge for score 0', () => {
    const { container } = render(<ActivityScoreBadge score={0} />);
    expect(container.querySelector('.bg-red-100')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render red badge for score 25', () => {
    const { container } = render(<ActivityScoreBadge score={25} />);
    expect(container.querySelector('.bg-red-100')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('should render red badge for score 30 (boundary)', () => {
    const { container } = render(<ActivityScoreBadge score={30} />);
    expect(container.querySelector('.bg-red-100')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('should render yellow badge for score 31', () => {
    const { container } = render(<ActivityScoreBadge score={31} />);
    expect(container.querySelector('.bg-yellow-100')).toBeInTheDocument();
    expect(screen.getByText('31')).toBeInTheDocument();
  });

  it('should render yellow badge for score 50', () => {
    const { container } = render(<ActivityScoreBadge score={50} />);
    expect(container.querySelector('.bg-yellow-100')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('should render yellow badge for score 70 (boundary)', () => {
    const { container } = render(<ActivityScoreBadge score={70} />);
    expect(container.querySelector('.bg-yellow-100')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
  });

  it('should render green badge for score 71', () => {
    const { container } = render(<ActivityScoreBadge score={71} />);
    expect(container.querySelector('.bg-green-100')).toBeInTheDocument();
    expect(screen.getByText('71')).toBeInTheDocument();
  });

  it('should render green badge for score 85', () => {
    const { container } = render(<ActivityScoreBadge score={85} />);
    expect(container.querySelector('.bg-green-100')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('should render green badge for score 100', () => {
    const { container } = render(<ActivityScoreBadge score={100} />);
    expect(container.querySelector('.bg-green-100')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should have correct text color classes for red badge', () => {
    const { container } = render(<ActivityScoreBadge score={20} />);
    expect(container.querySelector('.text-red-800')).toBeInTheDocument();
  });

  it('should have correct text color classes for yellow badge', () => {
    const { container } = render(<ActivityScoreBadge score={50} />);
    expect(container.querySelector('.text-yellow-800')).toBeInTheDocument();
  });

  it('should have correct text color classes for green badge', () => {
    const { container } = render(<ActivityScoreBadge score={90} />);
    expect(container.querySelector('.text-green-800')).toBeInTheDocument();
  });
});
