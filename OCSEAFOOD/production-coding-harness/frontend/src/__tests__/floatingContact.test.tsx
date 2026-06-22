import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import FloatingContact from '../components/FloatingContact';

// Mock path and router
let mockPathname = '/';
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('FloatingContact Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/';
  });

  it('should not render anything when on admin page', async () => {
    mockPathname = '/admin/settings';
    render(<FloatingContact />);
    expect(screen.queryByTitle('Facebook Fanpage')).toBeNull();
    expect(screen.queryByTitle('Chat Zalo')).toBeNull();
    expect(screen.queryByTitle('Hotline')).toBeNull();
  });

  it('should fetch public settings and render configured contact icons', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        CONTACT_HOTLINE: '0909999999',
        CONTACT_ZALO: '0909999999',
        CONTACT_FACEBOOK: 'https://facebook.com/myfanpage',
      }),
    });

    render(<FloatingContact />);

    await waitFor(() => {
      expect(screen.getByTitle('Facebook Fanpage')).not.toBeNull();
      expect(screen.getByTitle('Chat Zalo')).not.toBeNull();
      expect(screen.getByTitle('Hotline: 0909999999')).not.toBeNull();
    });

    // Check Zalo normalization
    const zaloLink = screen.getByTitle('Chat Zalo');
    expect(zaloLink.getAttribute('href')).toBe('https://zalo.me/0909999999');

    // Check Facebook normalization
    const fbLink = screen.getByTitle('Facebook Fanpage');
    expect(fbLink.getAttribute('href')).toBe('https://facebook.com/myfanpage');

    // Check Hotline link
    const hotlineLink = screen.getByTitle('Hotline: 0909999999');
    expect(hotlineLink.getAttribute('href')).toBe('tel:0909999999');
  });

  it('should not render anything if settings are empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        CONTACT_HOTLINE: '',
        CONTACT_ZALO: '',
        CONTACT_FACEBOOK: '',
      }),
    });

    render(<FloatingContact />);

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.queryByTitle('Facebook Fanpage')).toBeNull();
    expect(screen.queryByTitle('Chat Zalo')).toBeNull();
    expect(screen.queryByTitle('Hotline')).toBeNull();
  });
});
