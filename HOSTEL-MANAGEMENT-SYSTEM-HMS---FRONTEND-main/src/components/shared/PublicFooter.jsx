import { Link } from 'react-router-dom';
import { Building2, ShieldCheck } from 'lucide-react';

const footerLinks = [
  {
    title: 'Explore',
    links: [
      { label: 'Hostels', to: '/branches' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Actions',
    links: [
      { label: 'Browse Hostels', to: '/branches' },
      { label: 'Register', to: '/register' },
      { label: 'Login', to: '/login' },
      { label: 'Pay Booking', to: '/payments' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Forgot Password', to: '/forgot-password' },
      { label: 'Verify OTP', to: '/verify-otp' },
      { label: 'Reset Password', to: '/reset-password' },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer id="contact-footer" className="bg-[#122049] text-[#FCFBFB]">
      <div className="hbms-container grid gap-10 py-12 md:grid-cols-[1.35fr_1fr_1fr_1fr] lg:py-14">
        <div className="max-w-sm">
          <Link to="/" className="inline-flex items-center gap-3" aria-label="Home">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EF5B12] text-white">
              <Building2 className="h-5 w-5" />
            </span>

            <span className="font-display text-[25px] font-bold text-white">
              Hostel<span className="text-[#EF5B12]">Stay</span>
            </span>
          </Link>

          <p className="mt-6 text-[15px] leading-8 text-[#CBD5E1]">
            Discover hostels, compare rooms and beds, request bookings, and manage your stay after login.
          </p>
        </div>

        {footerLinks.map((column) => (
          <nav key={column.title} className="space-y-5" aria-label={`${column.title} footer links`}>
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-white">
              {column.title}
            </h2>

            <div className="flex flex-col gap-3">
              {column.links.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-[15px] font-medium text-[#CBD5E1] transition hover:text-[#EF5B12]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        ))}
      </div>

      <div className="hbms-container border-t border-white/10 py-5">
        <div className="flex flex-col gap-3 text-xs text-[#CBD5E1] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 HostelStay. All rights reserved.</p>

          <p className="inline-flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[#EF5B12]" />
            Secure account access
          </p>
        </div>
      </div>
    </footer>
  );
}