import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Filter } from 'lucide-react';
import type { Place } from '../types';
import { placesApi } from '../api/client';
import { cn } from '../utils/cn';

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Read filters from URL
  const query = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('category') || '';
  const budgetFilter = searchParams.get('budget') || '';
  
  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoading(true);
      try {
        const filters: Record<string, string | number> = {};
        if (categoryFilter) filters.category = categoryFilter;
        if (budgetFilter) filters.maxPrice = parseInt(budgetFilter);
        
        let results = await placesApi.getPlaces(filters);
        
        if (query) {
          const q = query.toLowerCase();
          results = results.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)

          );
        }
        
        setPlaces(results);
      } catch (error) {
        console.error("Failed to fetch places", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, [query, categoryFilter, budgetFilter]);

  const updateSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (newQuery) params.set('q', newQuery);
    else params.delete('q');
    setSearchParams(params);
  };

  const updateCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat) params.set('category', cat);
    else params.delete('category');
    setSearchParams(params);
  };

  const categories = [
    'Viewpoints', 
    'Waterfalls', 
    'Treks', 
    'Lakes', 
    'Nature', 
    'Heritage & Temples', 
    'Cafes', 
    'Food & Street Food', 
    'Shopping', 
    'Malls & Entertainment', 
    'Parks & Gardens'
  ];

  return (
    <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
      
      {/* Mobile Filter Toggle */}
      <div className="md:hidden flex justify-between items-center w-full">
        <h1 className="text-2xl font-serif font-bold text-[#1a4731]">Explore</h1>
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg bg-white shadow-sm"
        >
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Filter Sidebar */}
      <aside className={cn(
        "w-full md:w-64 flex-shrink-0 flex flex-col gap-6",
        isFilterOpen ? "block" : "hidden md:flex"
      )}>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-900">Filters</h2>
            <button 
              onClick={() => setSearchParams(new URLSearchParams())}
              className="text-sm text-[#f97316] hover:underline"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-6">
            {/* Search Input for Sidebar (Optional, but good UX) */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Keywords..."
                  value={query}
                  onChange={(e) => updateSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]/20 focus:border-[#1a4731] transition-all"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Category</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    checked={categoryFilter === ''}
                    onChange={() => updateCategory('')}
                    className="w-4 h-4 text-[#1a4731] focus:ring-[#1a4731] border-gray-300"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-[#1a4731] transition-colors">All Categories</span>
                </label>
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={categoryFilter === cat}
                      onChange={() => updateCategory(cat)}
                      className="w-4 h-4 text-[#1a4731] focus:ring-[#1a4731] border-gray-300"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-[#1a4731] transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* You would add more filters here (Budget, Distance, etc.) based on requirements */}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0">
        
        {/* Top Bar */}
        <div className="hidden md:flex justify-between items-center mb-6">
          <h1 className="text-3xl font-serif font-bold text-[#1a4731]">Discover Places</h1>
          <div className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900">{places.length}</span> results
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-2xl overflow-hidden h-96">
                <div className="bg-gray-200 h-56 w-full"></div>
                <div className="p-5 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && places.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-2xl shadow-sm text-center px-4">
            <div className="w-16 h-16 bg-[#f5f0e6] rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-[#1a4731]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No places found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              We couldn't find any places matching your current filters. Try adjusting your search criteria or clearing filters.
            </p>
            <button 
              onClick={() => setSearchParams(new URLSearchParams())}
              className="bg-[#1a4731] text-white px-6 py-2 rounded-full font-medium hover:bg-[#123523] transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && places.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {places.map((place, index) => (
              <Link 
                key={place.id} 
                to={`/places/${place.id}`} 
                className="group rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col h-full animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300 z-10"></div>
                  <img 
                    src={place.image_url || 'https://images.unsplash.com/photo-1506461883276-594543d04e12'} 
                    alt={place.name} 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506461883276-594543d04e12';
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#1a4731] shadow-sm z-20">
                    {place.category}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1a4731] transition-colors line-clamp-1">{place.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {place.distance_km} km • {place.duration}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">{place.description}</p>
                  
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#f97316]">
                      ~₹{place.budget_tier}
                    </span>
                    {place.best_season && (
                      <span className="text-xs text-gray-500 bg-[#f5f0e6] px-2 py-1 rounded-md">
                        {place.best_season}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
