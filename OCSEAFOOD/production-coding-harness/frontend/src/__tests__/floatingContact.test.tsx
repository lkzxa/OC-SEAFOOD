import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

async function openContactOptions() {
  const toggle = await screen.findByRole('button', { name: 'Mở kênh liên hệ' });
  fireEvent.click(toggle);
}

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
    await openContactOptions();

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

  it('normalizes the formatted official Hotline for the telephone link', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        CONTACT_HOTLINE: '0908 464 818',
        CONTACT_ZALO: 'https://zalo.me/0908464818',
        CONTACT_FACEBOOK: '',
      }),
    });

    render(<FloatingContact />);
    await openContactOptions();

    const hotlineLink = await screen.findByTitle('Hotline: 0908 464 818');
    expect(hotlineLink.getAttribute('href')).toBe('tel:0908464818');
    expect(screen.getByTitle('Chat Zalo').getAttribute('href')).toBe('https://zalo.me/0908464818');
  });

  it('keeps mobile contacts collapsed until the user opens them', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        CONTACT_HOTLINE: '0908 464 818',
        CONTACT_ZALO: '0908464818',
        CONTACT_FACEBOOK: 'ocseafood',
      }),
    });

    render(<FloatingContact />);

    const toggle = await screen.findByRole('button', { name: 'Mở kênh liên hệ' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById('contact-options')).toBeNull();

    fireEvent.click(toggle);

    const options = document.getElementById('contact-options');
    expect(options).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Đóng kênh liên hệ' }).getAttribute('aria-expanded')).toBe('true');
    expect(within(options as HTMLElement).getByRole('link', { name: 'Gọi hotline 0908 464 818' }).getAttribute('href')).toBe('tel:0908464818');
  });

  it('uses the official contact defaults when the public settings request fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    render(<FloatingContact />);
    await openContactOptions();

    const hotlineLink = await screen.findByTitle('Hotline: 0908 464 818');
    expect(hotlineLink.getAttribute('href')).toBe('tel:0908464818');
    expect(screen.getByTitle('Chat Zalo').getAttribute('href')).toBe('https://zalo.me/0908464818');
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
