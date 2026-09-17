import React, { useEffect, useState } from 'react';
import { Search, MapPin, Compass, ArrowRight, ShieldCheck, Users, Star, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { placesApi } from '../api/client';
import type { Place } from '../types';

const quickFilters = [
  { label: 'Treks & Hiking', value: 'Treks', icon: '🥾' },
  { label: 'Waterfalls', value: 'Waterfalls', icon: '🌊' },
  { label: 'Lakes & Sunsets', value: 'Lakes', icon: '🌅' },
  { label: 'Heritage & History', value: 'Heritage', icon: '🏰' },
  { label: 'Scenic Escapes', value: 'Nature', icon: '🌲' },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredPlaces, setFeaturedPlaces] = useState<Place[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  useEffect(() => {
    const fetchWeekendPlaces = async () => {
      try {
        const data = await placesApi.getPopularWeekend();
        setFeaturedPlaces(data);
      } catch (error) {
        console.error("Failed to load weekend places:", error);
      } finally {
        setIsLoadingFeatured(false);
      }
    };
    fetchWeekendPlaces();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full py-20 lg:py-32 overflow-hidden flex flex-col items-center text-center px-4">
        <div className="absolute inset-0 bg-[#f5f0e6] -z-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f97316]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#1a4731]/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 -z-10" />
        
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-[#1a4731] leading-tight tracking-tight">
            Stop asking where to go. <br className="hidden md:block" />
            <span className="text-[#f97316]">Start discovering somewhere new.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover hidden gems, practical weekend escapes, and trustworthy places around Bangalore designed for students and young professionals.
          </p>

          {/* Search Box */}
          <div className="w-full max-w-2xl mx-auto mt-10">
            <form onSubmit={handleSearch} className="relative flex items-center shadow-lg rounded-full bg-white border border-gray-100 p-2">
              <MapPin className="absolute left-6 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Where to? Try 'Nandi Hills', 'Trek', or 'Waterfalls'..."
                className="w-full pl-16 pr-32 py-4 rounded-full focus:outline-none text-lg bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-3 bg-[#1a4731] text-white px-8 py-3 rounded-full font-medium hover:bg-[#123523] transition-colors flex items-center gap-2"
              >
                Search <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-3 mt-10 max-w-3xl mx-auto">
            {quickFilters.map((filter) => (
              <Link
                key={filter.label}
                to={`/explore?category=${encodeURIComponent(filter.value)}`}
                className="bg-white border border-gray-200 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:border-[#f97316] hover:text-[#f97316] hover:shadow-md transition-all flex items-center gap-2"
              >
                <span>{filter.icon}</span>
                {filter.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-serif font-bold text-[#1a4731] mb-4">Popular this weekend</h2>
            <p className="text-gray-600 max-w-xl">Curated spots perfect for your next quick getaway from the city hustle.</p>
          </div>
          <Link to="/explore" className="hidden sm:flex items-center gap-2 text-[#f97316] font-medium hover:gap-3 transition-all">
            See all places <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoadingFeatured ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl bg-gray-100 h-96 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPlaces.map(place => (
              <Link key={place.id} to={`/places/${place.id}`} className="group rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col h-full">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={place.image_url || 'https://images.unsplash.com/photo-1506461883276-594543d04e12'} 
                    alt={place.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506461883276-594543d04e12';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#1a4731] shadow-sm">
                    {place.category}
                  </div>
                  {place.is_hidden_gem && (
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-400" /> Hidden Gem
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#1a4731] transition-colors">{place.name}</h3>
                    <span className="text-sm font-medium text-[#f97316] bg-[#f97316]/10 px-2.5 py-1 rounded-md whitespace-nowrap">
                      {place.budget_tier ? `₹${place.budget_tier}` : 'Free'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> {place.state || 'Karnataka'}
                    {place.duration && ` • ${place.duration}`}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">{place.description}</p>
                  {place.rating > 0 && (
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md w-fit mt-auto">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{place.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center sm:hidden">
          <Link to="/explore" className="inline-flex items-center gap-2 text-[#f97316] font-medium border border-[#f97316] px-6 py-3 rounded-full hover:bg-[#f97316] hover:text-white transition-colors">
            See all places <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Community / Groups Section */}
      <section className="py-24 bg-[#1a4731] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2c6e4d] rounded-full blur-[100px] opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-serif font-bold text-[#f3eee8]">Find people who want to go too.</h2>
              <p className="text-[#8da3a6] text-lg leading-relaxed">
                Traveling is better together. Discover upcoming group trips organized by other students and young professionals, or create your own plan and invite others to join and split costs.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/groups" className="bg-[#f97316] text-white px-8 py-4 rounded-full font-medium hover:bg-[#ea580c] transition-colors shadow-lg flex items-center gap-2">
                  <Users className="w-5 h-5" /> Find a Group
                </Link>
                <Link to="/explore" className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-full font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
                  <Compass className="w-5 h-5" /> Explore Places
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a4731] to-transparent z-10 w-12 hidden lg:block"></div>
              {/* Dummy Group Cards for visual */}
              <div className="space-y-4 transform lg:rotate-3 lg:translate-x-12 opacity-90">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg mb-1">Skandagiri Night Trek</h4>
                      <p className="text-sm text-[#8da3a6] flex items-center gap-2">
                        <span>This Saturday</span> • <span>4 spots left</span>
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#f97316]/20 flex items-center justify-center border border-[#f97316]/50">
                      <ArrowRight className="w-5 h-5 text-[#f97316]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-[#f3eee8] rounded-2xl mb-8">
            <ShieldCheck className="w-12 h-12 text-[#1a4731]" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#1a4731] mb-6">Safety and Trust First</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed mb-12">
            Every place submitted to RoamLocal is reviewed for basic safety and accessibility. We look out for each other, providing realistic costs, local tips, and transport options so you know exactly what to expect.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl border border-gray-100 bg-[#faf9f6]">
              <h3 className="font-bold text-lg mb-2 text-gray-900">Verified Info</h3>
              <p className="text-gray-600 text-sm">We verify crucial details like entry times and current open status.</p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-100 bg-[#faf9f6]">
              <h3 className="font-bold text-lg mb-2 text-gray-900">Practical Costs</h3>
              <p className="text-gray-600 text-sm">Realistic student-friendly budgets for travel, food, and entry fees.</p>
            </div>
            <div className="p-6 rounded-2xl border border-gray-100 bg-[#faf9f6]">
              <h3 className="font-bold text-lg mb-2 text-gray-900">Clear Guidelines</h3>
              <p className="text-gray-600 text-sm">Honest recommendations and transport options so you can plan safely.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
