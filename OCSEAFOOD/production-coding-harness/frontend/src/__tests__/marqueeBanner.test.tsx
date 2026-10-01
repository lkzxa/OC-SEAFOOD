import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MarqueeBanner from '../components/MarqueeBanner';

let mockPathname = '/';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('MarqueeBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/';
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        MARQUEE_ENABLED: true,
        MARQUEE_CONTENT: 'ỐC SEAFOOD TƯƠI NGON ĐẲNG CẤP',
      }),
    });
  });

  it('renders the brand ticker on regular pages', async () => {
    render(<MarqueeBanner />);

    await waitFor(() => {
      expect(screen.getByRole('marquee', { name: 'Khẩu hiệu thương hiệu ỐC SEAFOOD' })).not.toBeNull();
      expect(screen.getAllByText(/ỐC SEAFOOD TƯƠI NGON ĐẲNG CẤP/).length).toBeGreaterThan(0);
    });
  });

  it('does not render the ticker on the cart checkout page', () => {
    mockPathname = '/cart';

    render(<MarqueeBanner />);

    expect(screen.queryByRole('marquee', { name: 'Khẩu hiệu thương hiệu ỐC SEAFOOD' })).toBeNull();
  });
});
