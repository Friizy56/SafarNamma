import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { 
  Mail, 
  Shield, 
  Calendar, 
  MapPin, 
  Heart, 
  Users, 
  Trash2, 
  X, 
  Compass, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { submissionsApi } from '../api/client';
import type { Place } from '../types';

export const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { favorites, removeFavorite } = useFavorites();

  const [userSubmissions, setUserSubmissions] = useState<Place[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState<boolean>(true);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || ''
  });

  // Fetch places submitted by this user
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user?.email) return;
      setIsLoadingSubmissions(true);
      try {
        const subs = await submissionsApi.getUserSubmissions(user.email);
        setUserSubmissions(subs);
      } catch (err) {
        console.error('Failed to load user submissions', err);
      } finally {
        setIsLoadingSubmissions(false);
      }
    };
    fetchSubmissions();
  }, [user?.email]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Safe join date formatting
  const joinDate = user.created_at
    ? (() => {
        try {
          const d = new Date(user.created_at);
          return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } catch {
          return 'Recently';
        }
      })()
    : 'Recently';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Call AuthContext action
    updateUser({
      name: formData.name.trim() || user.name,
      bio: formData.bio.trim(),
      avatar_url: formData.avatar_url.trim()
    });

    setIsEditing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header Profile Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f5f0e6] rounded-full blur-3xl -mr-32 -mt-32 opacity-60 pointer-events-none"></div>

          <div className="relative">
            <div className="h-32 w-32 bg-[#1a4731] rounded-full flex items-center justify-center text-[#f5f0e6] text-4xl font-bold shadow-sm border-4 border-white overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900">{user.name}</h1>
                {user.bio ? (
                  <p className="mt-2 text-gray-600 text-sm italic max-w-xl">
                    "{user.bio}"
                  </p>
                ) : (
                  <p className="mt-2 text-gray-400 text-sm italic">
                    No bio added yet. Tell fellow travelers about your travel style!
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setFormData({
                    name: user.name || '',
                    bio: user.bio || '',
                    avatar_url: user.avatar_url || ''
                  });
                  setIsEditing(true);
                }}
                className="px-5 py-2.5 bg-[#1a4731] text-white rounded-full font-medium hover:bg-[#133524] transition-colors shadow-sm self-center md:self-start text-sm"
              >
                Edit Profile
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-gray-600 justify-center md:justify-start text-sm">
              <div className="flex items-center gap-2 bg-[#faf9f6] px-3 py-1.5 rounded-full border border-gray-100">
                <Mail className="w-4 h-4 text-[#1a4731]" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#faf9f6] px-3 py-1.5 rounded-full border border-gray-100">
                <Shield className="w-4 h-4 text-[#1a4731]" />
                <span className="capitalize font-medium">{user.role}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#faf9f6] px-3 py-1.5 rounded-full border border-gray-100">
                <Calendar className="w-4 h-4 text-[#1a4731]" />
                <span>Joined {joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 1. Saved Places (Bucket List) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Saved Places</h3>
                  <p className="text-xs text-gray-500">{favorites.length} places saved</p>
                </div>
              </div>
              <Link to="/explore" className="text-xs text-[#1a4731] font-semibold hover:underline">
                Explore
              </Link>
            </div>

            {favorites.length === 0 ? (
              <div className="my-auto py-6 text-center">
                <p className="text-gray-400 text-sm mb-3">No saved places yet.</p>
                <Link to="/explore" className="text-xs font-semibold text-[#1a4731] bg-[#f5f0e6] px-4 py-2 rounded-full hover:bg-[#e8decb] transition-colors inline-block">
                  Browse destinations &rarr;
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-72">
                {favorites.map(place => {
                  const placeImg = place.image_url || (place as any).image_urls?.[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800';
                  return (
                    <div key={place.id} className="flex gap-3 items-center bg-[#faf9f6] p-2.5 rounded-2xl border border-gray-100 group">
                      <img 
                        src={placeImg} 
                        alt={place.name} 
                        className="w-12 h-12 rounded-xl object-cover shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <Link to={`/places/${place.id}`} className="font-semibold text-sm text-gray-900 hover:text-[#f97316] truncate block">
                          {place.name}
                        </Link>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {place.state || place.category || 'India'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFavorite(place.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Remove from favorites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. My Submissions (Community Contributions) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">My Submissions</h3>
                  <p className="text-xs text-gray-500">{userSubmissions.length} places contributed</p>
                </div>
              </div>
              <Link to="/submit" className="text-xs text-[#1a4731] font-semibold hover:underline flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" /> Submit
              </Link>
            </div>

            {isLoadingSubmissions ? (
              <p className="text-xs text-gray-400 text-center my-auto py-6">Loading submissions...</p>
            ) : userSubmissions.length === 0 ? (
              <div className="my-auto py-6 text-center">
                <p className="text-gray-400 text-sm mb-3">You haven't submitted any places yet.</p>
                <Link to="/submit" className="text-xs font-semibold text-[#1a4731] bg-[#f5f0e6] px-4 py-2 rounded-full hover:bg-[#e8decb] transition-colors inline-block">
                  Submit a hidden gem &rarr;
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-72">
                {userSubmissions.map(place => {
                  const placeImg = place.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800';
                  const isApproved = place.is_approved || (place as any).submission_status === 'approved';
                  return (
                    <div key={place.id} className="flex gap-3 items-center bg-[#faf9f6] p-2.5 rounded-2xl border border-gray-100">
                      <img 
                        src={placeImg} 
                        alt={place.name} 
                        className="w-12 h-12 rounded-xl object-cover shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        {isApproved ? (
                          <Link to={`/places/${place.id}`} className="font-semibold text-sm text-gray-900 hover:text-[#f97316] truncate block">
                            {place.name}
                          </Link>
                        ) : (
                          <p className="font-semibold text-sm text-gray-900 truncate">{place.name}</p>
                        )}
                        
                        {/* Status Chip */}
                        <div className="mt-1 flex items-center gap-1.5">
                          {isApproved ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Approved & Live
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Clock className="w-3 h-3" /> Under Review
                            </span>
                          )}
                        </div>
                      </div>

                      {isApproved && (
                        <Link 
                          to={`/places/${place.id}`} 
                          className="p-1.5 text-gray-400 hover:text-[#1a4731] hover:bg-gray-100 rounded-lg transition-colors"
                          title="View live page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. My Travel Groups */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">My Groups</h3>
                  <p className="text-xs text-gray-500">Travel plans & treks</p>
                </div>
              </div>
              <Link to="/groups" className="text-xs text-[#1a4731] font-semibold hover:underline">
                Find Groups
              </Link>
            </div>

            <div className="my-auto py-6 text-center">
              <p className="text-gray-400 text-sm mb-3">Connect and travel with fellow explorers.</p>
              <Link to="/groups" className="text-xs font-semibold text-[#1a4731] bg-[#f5f0e6] px-4 py-2 rounded-full hover:bg-[#e8decb] transition-colors inline-block">
                Browse active trips &rarr;
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/*                   EDIT PROFILE MODAL POPUP                   */}
      {/* ============================================================ */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#1a4731]">Edit Profile</h2>
                <p className="text-xs text-gray-500 mt-1">Update your public traveler details</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1a4731]/20 focus:border-[#1a4731] outline-none text-sm transition-all"
                  placeholder="Your Name"
                />
              </div>

              {/* Profile Picture URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Profile Picture URL
                </label>
                <input
                  type="url"
                  value={formData.avatar_url}
                  onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1a4731]/20 focus:border-[#1a4731] outline-none text-sm transition-all"
                  placeholder="https://images.unsplash.com/..."
                />
                <p className="text-[11px] text-gray-400 mt-1">Paste an image URL from Unsplash or anywhere on the web</p>
              </div>

              {/* Bio / Motto */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Travel Bio & Motto
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1a4731]/20 focus:border-[#1a4731] outline-none text-sm transition-all"
                  placeholder="Weekend trekker, photographer, exploring hidden water bodies around Bangalore..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[#1a4731] text-white rounded-xl font-semibold hover:bg-[#133524] transition-colors text-sm shadow-md"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
