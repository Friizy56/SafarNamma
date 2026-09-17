import React from 'react';
import { Map, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#1a4731] text-white pt-16 pb-8 border-t border-[#123523]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 group mb-4">
              <div className="bg-white p-1.5 rounded-lg group-hover:bg-[#f97316] transition-colors">
                <Map className="w-5 h-5 text-[#1a4731] group-hover:text-white" />
              </div>
              <span className="font-serif font-bold text-xl">
                RoamLocal
              </span>
            </Link>
            <p className="text-[#8da3a6] text-sm leading-relaxed max-w-sm">
              Your next escape is closer than you think. Discover hidden gems, practical weekend destinations, and like-minded travelers around Bangalore.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4 text-[#f3eee8]">Discover</h3>
            <ul className="space-y-3">
              <li><Link to="/explore?category=waterfalls" className="text-[#8da3a6] hover:text-[#f97316] text-sm transition-colors">Waterfalls</Link></li>
              <li><Link to="/explore?category=treks" className="text-[#8da3a6] hover:text-[#f97316] text-sm transition-colors">Treks</Link></li>
              <li><Link to="/explore?category=lakes" className="text-[#8da3a6] hover:text-[#f97316] text-sm transition-colors">Lakes & Peaceful</Link></li>
              <li><Link to="/explore?category=cafes" className="text-[#8da3a6] hover:text-[#f97316] text-sm transition-colors">Cafes</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-[#f3eee8]">Community</h3>
            <ul className="space-y-3">
              <li><Link to="/groups" className="text-[#8da3a6] hover:text-[#f97316] text-sm transition-colors">Join a Group</Link></li>
              <li><Link to="/submit" className="text-[#8da3a6] hover:text-[#f97316] text-sm transition-colors">Submit a Place</Link></li>
              <li><Link to="/guidelines" className="text-[#8da3a6] hover:text-[#f97316] text-sm transition-colors">Safety Guidelines</Link></li>
              <li><Link to="/admin/login" className="text-[#8da3a6] hover:text-[#f97316] text-sm transition-colors">Admin Area</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[#2c6e4d] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#8da3a6] text-sm">
            © {new Date().getFullYear()} RoamLocal Bangalore. All rights reserved.
          </p>
          <p className="text-[#8da3a6] text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-[#f97316]" fill="currentColor" /> for travelers
          </p>
        </div>
      </div>
    </footer>
  );
};
