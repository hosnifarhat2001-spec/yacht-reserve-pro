import { Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import asfarLogo from '@/assets/logo1.png';

export const Footer = () => {
  return (
    <footer className="bg-[#121416] text-gray-300 border-t border-white/10">
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2">
            <img src={asfarLogo} alt="Asfar" className="h-50 lg:h-48 w-auto" />
            <span className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white">asfaryacht<span className="text-orange-500">.com</span></span>
          </div>
          <p className="text-xs leading-5">
            It's Time For Luxury Yachts Charter. Asfar Yachts is the luxury yacht charter specialist in the Middle East. We have been helping to create unforgettable yacht charters.
          </p>
          <div className="flex items-center gap-2 text-white/90">
            <a href="#" aria-label="Instagram" className="hover:text-white/70"><Instagram size={16} /></a>
            <a href="#" aria-label="Facebook" className="hover:text-white/70"><Facebook size={16} /></a>
            <a href="#" aria-label="Twitter" className="hover:text-white/70"><Twitter size={16} /></a>
            <a href="#" aria-label="YouTube" className="hover:text-white/70"><Youtube size={16} /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-white/70"><Linkedin size={16} /></a>
          </div>
          <div className="pt-2 text-[10px] text-white/60">
            100% SECURED BY <span className="font-semibold text-white">GlobalSign</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 md:col-span-1 lg:col-span-2">
          <div>
            <h3 className="text-white font-semibold mb-2 text-sm">Asfar Yachts</h3>
            <ul className="space-y-1.5 text-xs">
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Sitemap</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Gift Card</a></li>
              <li><a href="#" className="hover:text-white">About us</a></li>
              <li><a href="#" className="hover:text-white">Contact us</a></li>
              <li><a href="#" className="hover:text-white">Why book with us?</a></li>
              <li><a href="#" className="hover:text-white">Yacht Management</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2 text-sm">Support & Policies</h3>
            <ul className="space-y-1.5 text-xs">
              <li><a href="#" className="hover:text-white">FAQ</a></li>
              <li><a href="#" className="hover:text-white">User Guide</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2 text-sm">Partners</h3>
            <ul className="space-y-1.5 text-xs">
              <li><a href="#" className="hover:text-white">Corporate Login</a></li>
              <li><a href="#" className="hover:text-white">B2B Login</a></li>
              <li><a href="#" className="hover:text-white">Become Affiliate</a></li>
            </ul>
          </div>
          <div className="flex flex-col items-start gap-3">
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-emerald-400 font-semibold text-sm">Trustpilot</div>
            </div>
            <div className="bg-white p-2 rounded-md">
              <div className="text-black text-[10px] font-semibold">Travellers' Choice</div>
              <div className="text-black text-[9px]">Tripadvisor</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-right text-[10px] text-white/70">WE ACCEPT</div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* VISA */}
            <div className="bg-white rounded-md px-2 py-1 flex items-center shadow-sm">
              <svg width="36" height="14" viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg" aria-label="VISA logo" role="img">
                <rect width="64" height="24" rx="3" fill="#1A1F71"/>
                <text x="8" y="16" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fontWeight="700" fill="#FFFFFF">VISA</text>
              </svg>
            </div>
            {/* MasterCard */}
            <div className="bg-white rounded-md px-2 py-1 flex items-center shadow-sm">
              <svg width="36" height="14" viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard logo" role="img">
                <rect width="64" height="24" rx="3" fill="#FFFFFF"/>
                <circle cx="26" cy="12" r="7" fill="#EB001B"/>
                <circle cx="38" cy="12" r="7" fill="#F79E1B"/>
              </svg>
            </div>
            {/* Bank Transfer */}
            <div className="bg-white rounded-md px-2 py-1 flex items-center shadow-sm">
              <svg width="36" height="14" viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg" aria-label="Bank Transfer" role="img">
                <rect width="64" height="24" rx="3" fill="#FFFFFF"/>
                <g transform="translate(8,4)" fill="#0F172A">
                  <polygon points="24,0 48,8 0,8" fill="#0F172A"/>
                  <rect x="4" y="8" width="40" height="2"/>
                  <rect x="8" y="11" width="6" height="6"/>
                  <rect x="20" y="11" width="6" height="6"/>
                  <rect x="32" y="11" width="6" height="6"/>
                </g>
              </svg>
            </div>
            {/* Cash Payment */}
            <div className="bg-white rounded-md px-2 py-1 flex items-center shadow-sm">
              <svg width="36" height="14" viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg" aria-label="Cash Payment" role="img">
                <rect width="64" height="24" rx="3" fill="#FFFFFF"/>
                <rect x="10" y="6" width="44" height="12" rx="2" fill="#16A34A"/>
                <circle cx="32" cy="12" r="3" fill="#BBF7D0"/>
                <rect x="12" y="8" width="8" height="2" fill="#BBF7D0"/>
                <rect x="44" y="14" width="8" height="2" fill="#BBF7D0"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-3 text-center text-[10px] text-white/60">
          © {new Date().getFullYear()} Asfar Yacht. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
