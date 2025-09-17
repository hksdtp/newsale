import { render, screen } from '@testing-library/react';
import RichTextDisplay from '../RichTextDisplay';

describe('RichTextDisplay', () => {
  it('renders plain text correctly', () => {
    render(<RichTextDisplay content="Hello World" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders with correct dark text color styling', () => {
    const { container } = render(<RichTextDisplay content="Test content" />);
    const displayElement = container.firstChild as HTMLElement;

    expect(displayElement).toHaveClass('text-gray-900');
    expect(displayElement).toHaveStyle('color: rgb(17, 24, 39)');
    expect(displayElement).toHaveStyle('background-color: rgb(255, 255, 255)');
    expect(displayElement).toHaveStyle('font-size: 16px');
  });

  it('renders formatted text correctly', () => {
    const content = '**Bold text** and *italic text*';
    const { container } = render(<RichTextDisplay content={content} />);

    expect(container.innerHTML).toContain('<strong>Bold text</strong>');
    expect(container.innerHTML).toContain('<em>italic text</em>');
  });

  it('renders quotes with proper dark color', () => {
    const content = '[quote]This is a quote[/quote]';
    const { container } = render(<RichTextDisplay content={content} />);

    expect(container.innerHTML).toContain('color: #374151');
    expect(container.innerHTML).toContain('This is a quote');
  });

  it('renders lists correctly', () => {
    const content = '- Item 1\n- Item 2\n- Item 3';
    const { container } = render(<RichTextDisplay content={content} />);

    expect(container.innerHTML).toContain('<ul');
    expect(container.innerHTML).toContain('<li');
    expect(container.innerHTML).toContain('Item 1');
    expect(container.innerHTML).toContain('Item 2');
    expect(container.innerHTML).toContain('Item 3');
  });

  it('handles empty content gracefully', () => {
    const { container } = render(<RichTextDisplay content="" />);
    const displayElement = container.firstChild as HTMLElement;
    expect(displayElement).toBeInTheDocument();
    expect(displayElement).toHaveClass('rich-text-display');
  });

  it('applies custom className', () => {
    const { container } = render(<RichTextDisplay content="Test" className="custom-class" />);
    const displayElement = container.firstChild as HTMLElement;

    expect(displayElement).toHaveClass('custom-class');
    expect(displayElement).toHaveClass('rich-text-display');
    expect(displayElement).toHaveClass('text-gray-900');
  });
});
