import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCartStore } from '../store/useCartStore';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Root Layout Elements', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    mockPush.mockClear();
  });

  describe('Header Component', () => {
    it('should render brand logo and main navigation links', () => {
      render(<Header />);
      
      // Brand Logo
      const logoElement = screen.getByText('OCSEAFOOD');
      expect(logoElement).not.toBeNull();
      const linkElement = logoElement.closest('a');
      expect(linkElement).not.toBeNull();
      expect(linkElement?.getAttribute('href')).toBe('/');

      // Desktop Nav Links
      const homeLinks = screen.getAllByText('TRANG CHỦ');
      expect(homeLinks.length).toBeGreaterThan(0);
      expect(screen.getAllByText('MENU').length).toBeGreaterThan(0);
      expect(screen.getAllByText('COMBO').length).toBeGreaterThan(0);
      expect(screen.getAllByText('CẨM NANG VÀO BẾP').length).toBeGreaterThan(0);
      expect(screen.getAllByText('GIỚI THIỆU').length).toBeGreaterThan(0);
    });

    it('should display cart badge starting at 0 count', () => {
      render(<Header />);
      const cartBadge = screen.getByText('0');
      expect(cartBadge).not.toBeNull();
    });

    it('should display the correct cart item count when products are added', () => {
      // Add items to Zustand store
      const store = useCartStore.getState();
      store.addItem({
        id: 1,
        name: 'Bào ngư',
        priceReference: 120000,
        image: '/abalone.jpg',
        unit: 'con',
      }, 3);

      render(<Header />);
      
      // Should display 3 in the cart badge
      const cartBadge = screen.getByText('3');
      expect(cartBadge).not.toBeNull();
    });

    it('should display desktop search bar', () => {
      render(<Header />);
      const searchInputs = screen.getAllByPlaceholderText('Tìm kiếm hải sản...');
      expect(searchInputs.length).toBeGreaterThan(0);
    });

    it('should toggle mobile menu when burger button is clicked', () => {
      render(<Header />);
      
      // Click burger menu toggle button
      const toggleButton = screen.getByRole('button', { name: /Toggle menu/i });
      expect(toggleButton).not.toBeNull();

      // Initially close icon is not present
      expect(screen.queryByText('close')).toBeNull();

      // Click to open
      fireEvent.click(toggleButton);
      const closeIcon = screen.getByText('close');
      expect(closeIcon).not.toBeNull();

      // Click to close
      fireEvent.click(toggleButton);
      expect(screen.queryByText('close')).toBeNull();
    });

    it('should submit search query on desktop', () => {
      render(<Header />);
      const searchInputs = screen.getAllByPlaceholderText('Tìm kiếm hải sản...');
      const desktopInput = searchInputs[0];
      
      fireEvent.change(desktopInput, { target: { value: 'Cá hồi' } });
      
      const desktopForm = desktopInput.closest('form');
      expect(desktopForm).not.toBeNull();
      fireEvent.submit(desktopForm!);
      
      expect(mockPush).toHaveBeenCalledWith('/menu?search=C%C3%A1%20h%E1%BB%93i');
    });

    it('should submit search query on mobile', () => {
      render(<Header />);
      
      // Open mobile menu
      const toggleButton = screen.getByRole('button', { name: /Toggle menu/i });
      fireEvent.click(toggleButton);
      
      const searchInputs = screen.getAllByPlaceholderText('Tìm kiếm hải sản...');
      // When mobile menu is open, there are two inputs: desktop (hidden) and mobile.
      const mobileInput = searchInputs[1];
      expect(mobileInput).not.toBeUndefined();
      
      fireEvent.change(mobileInput, { target: { value: 'Tôm' } });
      
      const mobileForm = mobileInput.closest('form');
      expect(mobileForm).not.toBeNull();
      fireEvent.submit(mobileForm!);
      
      expect(mockPush).toHaveBeenCalledWith('/menu?search=T%C3%B4m');
    });
  });

  describe('Footer Component', () => {
    it('should render branding and correct contact details', () => {
      render(<Footer />);
      
      // Contact Info
      expect(screen.getByText(/123 Đường Hải Sản, Quận 1, TP\. HCM/i)).not.toBeNull();
      expect(screen.getByText(/Hotline: 1900 1234/i)).not.toBeNull();
      expect(screen.getByText(/Email: contact@ocseafood\.vn/i)).not.toBeNull();
    });

    it('should render quick links and policies links', () => {
      render(<Footer />);
      
      expect(screen.getByText('Liên kết nhanh')).not.toBeNull();
      expect(screen.getByText('Chính sách')).not.toBeNull();
      expect(screen.getByText('Chính sách đổi trả')).not.toBeNull();
      expect(screen.getByText('Chính sách bảo mật')).not.toBeNull();
    });

    it('should render newsletter subscription form', () => {
      render(<Footer />);
      
      expect(screen.getByPlaceholderText('Email của bạn')).not.toBeNull();
      expect(screen.getByRole('button', { name: /Send/i })).not.toBeNull();
    });
  });
});
