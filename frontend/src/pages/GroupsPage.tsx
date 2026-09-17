import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Calendar, MapPin, IndianRupee, ShieldCheck, ArrowRight, Plus, X, MessageCircle, Sparkles, Route } from 'lucide-react';
import type { Group, Place } from '../types';
import { groupsApi, placesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const GroupsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();//returns two things searchParams object to read data and setSearchParams function to update 

  const destinationIdParam = searchParams.get('destinationId')//searchParams is the object over here , also it's not javascript object its a API web interface 




  const [groups, setGroups] = useState<(Group & { place?: Place })[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form inputs
  const [formData, setFormData] = useState({
    destination_id: '',
    title: '',
    description: '',
    trip_date: '',
    meeting_area: '',
    estimated_cost: 500,
    max_members: 6,
    chat_link: '',
    safety_notes: 'Carry water, helmet, and ID card. Respect everyone in the group.'
  });

  // Multi-stop custom curation state
  const [customStopCount, setCustomStopCount] = useState<number>(2);
  const [customStops, setCustomStops] = useState<string[]>(['', '']);

  const handleStopCountChange = (count: number) => {
    const validCount = Math.max(2, Math.min(6, count));
    setCustomStopCount(validCount);
    setCustomStops(prev => {
      const next = [...prev];
      if (next.length < validCount) {
        while (next.length < validCount) next.push('');
      } else {
        return next.slice(0, validCount);
      }
      return next;
    });
  };

  const handleStopChange = (index: number, val: string) => {
    setCustomStops(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const fetchGroupsAndPlaces = async () => {
    setIsLoading(true);
    try {
      const [groupsData, allPlaces] = await Promise.all([
        groupsApi.getGroups(),
        placesApi.getPlaces()
      ]);
      setPlaces(allPlaces);

      // Map destinations to groups
      const placesMap = new Map(allPlaces.map(p => [p.id, p]));
      const groupsWithPlaces = groupsData.map(g => {
        const destId = g.destination_id || Number((g as any).place_id);
        return {
          ...g,
          place: placesMap.get(destId)
        };
      });

      setGroups(groupsWithPlaces);
    } catch (error) {
      console.error("Failed to fetch groups or places", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupsAndPlaces();
  }, []);

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Pre-select the destination if user was redirected with destinationIdParam
    const initialDest = destinationIdParam || (places.length > 0 ? places[0].id.toString() : '');
    setFormData(prev => ({ ...prev, destination_id: initialDest }));

    // Also pre-fill custom stops with the destination name
    if (targetPlace) {
      setCustomStops([targetPlace.name, '']);
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.destination_id) {
      setFormError('Please select a destination.');
      return;
    }
    if (!formData.trip_date) {
      setFormError('Please choose a date and time for the trip.');
      return;
    }

    // Strict WhatsApp & Telegram link verification
    if (formData.chat_link.trim()) {
      const validChatRegex = /^https?:\/\/(chat\.whatsapp\.com\/[A-Za-z0-9_-]+|wa\.me\/[0-9]+|t\.me\/[A-Za-z0-9_+-]+|telegram\.me\/[A-Za-z0-9_+-]+)/i;
      if (!validChatRegex.test(formData.chat_link.trim())) {
        setFormError('Security Check: Only authentic WhatsApp (chat.whatsapp.com/...) or Telegram (t.me/...) invite links are permitted.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let finalDestinationId: number | undefined = undefined;
      let finalCustomDestination: string | undefined = undefined;

      // Handle customized multi-stop curation
      if (formData.destination_id === 'custom') {
        const trimmedStops = customStops.map(s => s.trim()).filter(Boolean);
        if (trimmedStops.length < 2) {
          setFormError('Please enter at least 2 places for your customized multi-stop itinerary.');
          setIsSubmitting(false);
          return;
        }
        if (trimmedStops.length !== customStopCount) {
          setFormError(`Please fill in all ${customStopCount} place names or adjust the count.`);
          setIsSubmitting(false);
          return;
        }

        // Attached directly to group — Explore catalog remains 100% pristine & admin-curated!
        finalCustomDestination = trimmedStops.join(' ➔ ');
      } else {
        finalDestinationId = Number(formData.destination_id);
      }

      const created = await groupsApi.createGroup({
        destination_id: finalDestinationId,
        custom_destination: finalCustomDestination,
        organizer_name: user?.name || 'Anonymous Organizer',
        organizer_email: user?.email || '',
        title: formData.title,
        description: formData.description,
        trip_date: formData.trip_date,
        meeting_area: formData.meeting_area,
        estimated_cost: Number(formData.estimated_cost),
        max_members: Number(formData.max_members),
        chat_link: formData.chat_link.trim() || null,
        safety_notes: formData.safety_notes.trim() || null
      });

      if (created) {
        setIsModalOpen(false);
        // Reset form
        setFormData({
          destination_id: places[0]?.id.toString() || '',
          title: '',
          description: '',
          trip_date: '',
          meeting_area: '',
          estimated_cost: 500,
          max_members: 6,
          chat_link: '',
          safety_notes: 'Carry water, helmet, and ID card. Respect everyone in the group.'
        });
        setCustomStopCount(2);
        setCustomStops(['', '']);
        // Re-fetch groups to show the new one immediately
        await fetchGroupsAndPlaces();
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create group plan.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const targetPlace = destinationIdParam ? places.find(p => p.id === Number(destinationIdParam)) : null


  const filteredGroups = groups.filter(group => {

    if (!destinationIdParam) return true

    const matchesOfficial = group.destination_id === Number(destinationIdParam)

    const matchesCustom = targetPlace && group.custom_destination ? group.custom_destination.toLowerCase().includes(targetPlace.name.toLowerCase()) : false

    return matchesOfficial || matchesCustom

  })


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-serif font-bold text-[#1a4731] mb-4">Travel Together</h1>
          <p className="text-lg text-gray-600">
            Find people heading to the same destinations. Split costs, travel safer, and make new friends around Bangalore.
          </p>
          <div className="mt-4 bg-[#f5f0e6] p-4 rounded-xl border border-[#e8ded1] flex gap-3 text-sm text-[#1a4731]">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <p>RoamLocal helps coordinate interest safely. Group invite links are protected until the organizer approves your request.</p>
          </div>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-[#f97316] text-white px-6 py-3.5 rounded-full font-bold hover:bg-[#ea580c] transition-all flex items-center gap-2 shadow-lg hover:shadow-orange-200 shrink-0 transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" /> Create a Plan
        </button>
      </div>

      {/* Active Filter Banner */}
      {destinationIdParam && (
        <div className="mb-8 p-4 bg-orange-50 border border-orange-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] animate-pulse"></span>
            <p className="text-sm font-medium text-orange-950">
              Filtering trips visiting: <strong className="font-bold text-[#f97316]">{targetPlace?.name || 'Selected Destination'}</strong>
            </p>
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="text-xs font-bold text-orange-800 bg-white border border-orange-200 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <X className="w-3.5 h-3.5" /> Clear Filter
          </button>
        </div>
      )}

      {/* Groups Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-3xl h-80 shadow-sm"></div>
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{targetPlace ? `No travel groups for ${targetPlace.name}` : "No active groups yet"}
          </h2>
          <p className="text-gray-500 mb-6">{targetPlace
            ? `There are no official groups to ${targetPlace.name}, and no custom trips with ${targetPlace.name} included in their route yet.`
            : "Be the first to organize a trip and invite fellow travelers!"}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleOpenModal}
              className="bg-[#1a4731] text-white px-6 py-3 rounded-full font-bold hover:bg-[#123523] transition-colors shadow-md hover:shadow-lg"
            >
              Create a Trip to {targetPlace?.name || 'this spot'}
            </button>
            {destinationIdParam && (
              <button
                onClick={() => setSearchParams({})}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3 rounded-full font-medium transition-colors"
              >
                Clear filter and show all trips
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <div
              key={group.id}
              className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col h-full relative overflow-hidden group border border-gray-100"
            >
              {group.status === 'full' ? (
                <div className="absolute top-4 right-4 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Full
                </div>
              ) : (
                <div className="absolute top-4 right-4 bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {group.max_members - group.current_members} spots left
                </div>
              )}

              <div className="mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#f97316] bg-orange-50 px-2.5 py-1 rounded-lg">
                  {group.custom_destination || group.place?.name || 'Local Destination'}
                </span>
                <h3 className="text-xl font-bold text-gray-900 leading-tight mt-2.5 line-clamp-2">
                  {group.title}
                </h3>
              </div>

              <div className="space-y-3 mb-6 flex-grow text-sm text-gray-600">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#1a4731] shrink-0" />
                  <span>
                    {new Date(group.trip_date).toLocaleString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#1a4731] shrink-0" />
                  <span className="line-clamp-1">Meet: {group.meeting_area}</span>
                </div>
                <div className="flex items-center gap-3">
                  <IndianRupee className="w-4 h-4 text-[#1a4731] shrink-0" />
                  <span>₹{group.estimated_cost} per head</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#1a4731] shrink-0" />
                  <span>By {group.organizer_name} ({group.current_members}/{group.max_members} joined)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">
                  {group.chat_link ? '🔒 Chat Protected' : 'Community Trip'}
                </span>
                <Link
                  to={`/groups/${group.id}`}
                  className="bg-[#1a4731] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#123523] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  View Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/*              CREATE A PLAN MODAL POPUP                        */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-100 relative">

            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-serif font-bold text-[#1a4731]">Create a Travel Group Plan</h2>
              <p className="text-sm text-gray-600 mt-1">
                Organize a trip, set your team capacity, and approve who gets access to the group chat.
              </p>
            </div>

            {formError && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Destination Select */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5 flex items-center justify-between">
                  <span>Destination *</span>
                  <span className="text-xs text-[#f97316] font-medium">Select a single place or customize a multi-stop trip</span>
                </label>
                <select
                  required
                  value={formData.destination_id}
                  onChange={e => setFormData({ ...formData, destination_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] bg-white text-gray-800 font-medium"
                >
                  <option value="custom" className="font-bold text-[#f97316]">
                    ✨ Customize Multi-Stop Itinerary (Combine 2+ Places)
                  </option>
                  <optgroup label="── Or Choose An Existing Curated Place ──">
                    {places.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Customized Multi-Stop Route Builder Panel */}
              {formData.destination_id === 'custom' && (
                <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-emerald-50/30 border-2 border-[#f97316]/30 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-[#f97316]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Custom Multi-Stop Curation</h4>
                        <p className="text-xs text-gray-600">How many places in your customized curation?</p>
                      </div>
                    </div>

                    {/* Place count selector */}
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-orange-200 shadow-sm self-start sm:self-auto">
                      {[2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleStopCountChange(num)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${customStopCount === num
                              ? 'bg-[#f97316] text-white shadow-sm'
                              : 'text-gray-600 hover:bg-orange-50 hover:text-[#f97316]'
                            }`}
                        >
                          {num} Places
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Fields for Each Place */}
                  <div className="space-y-3 pt-1">
                    {customStops.map((stop, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#1a4731] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            required
                            placeholder={
                              idx === 0 ? "1st Place (e.g. Nandi Hills Sunrise Point)" :
                                idx === 1 ? "2nd Place (e.g. Indian Paratha Company for Breakfast)" :
                                  idx === 2 ? "3rd Place (e.g. Devanahalli Heritage Fort)" :
                                    `Place ${idx + 1} Name (e.g. Cafe, Viewpoint, Mall)`
                            }
                            value={stop}
                            onChange={(e) => handleStopChange(idx, e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-orange-200 bg-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] text-sm text-gray-800 placeholder-gray-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live Curation Route Preview */}
                  {customStops.some(s => s.trim()) && (
                    <div className="bg-white/90 border border-orange-200/80 rounded-xl p-3 flex items-center gap-2.5 text-xs text-gray-700 shadow-sm">
                      <Route className="w-4 h-4 text-[#f97316] shrink-0" />
                      <span className="font-bold text-[#1a4731]">Curation Route:</span>
                      <span className="truncate text-gray-700 font-medium">
                        {customStops.filter(s => s.trim()).join(' ➔ ') || 'Type place names above...'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Trip Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunrise Bike Ride & Chai at Nandi Hills"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Description & Itinerary *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="What is the plan? Timings, activities, who should join..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
                />
              </div>

              {/* Date & Meeting Area */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Trip Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.trip_date}
                    onChange={e => setFormData({ ...formData, trip_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Meeting Point *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Silk Board Metro Gate 2"
                    value={formData.meeting_area}
                    onChange={e => setFormData({ ...formData, meeting_area: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
                  />
                </div>
              </div>

              {/* Cost & Group Size */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Estimated Cost (₹ per person)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formData.estimated_cost}
                    onChange={e => setFormData({ ...formData, estimated_cost: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Max Group Size</label>
                  <input
                    type="number"
                    min="2"
                    max="30"
                    value={formData.max_members}
                    onChange={e => setFormData({ ...formData, max_members: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
                  />
                </div>
              </div>

              {/* WhatsApp or Telegram Link */}
              <div className="bg-[#f5f9f6] p-4 rounded-2xl border border-[#d6e7dc]">
                <label className="block text-sm font-bold text-[#1a4731] mb-1 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp or Telegram Group Invite Link
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  🔒 <strong>Privacy Protected:</strong> This link is kept secret and will only be shown to members you explicitly approve (✅).
                </p>
                <input
                  type="url"
                  placeholder="https://chat.whatsapp.com/... or https://t.me/..."
                  value={formData.chat_link}
                  onChange={e => setFormData({ ...formData, chat_link: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 bg-white text-sm"
                />
              </div>

              {/* Safety Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Safety & Gear Requirements</label>
                <input
                  type="text"
                  placeholder="e.g. Bring water bottles, trekking shoes, rain jacket"
                  value={formData.safety_notes}
                  onChange={e => setFormData({ ...formData, safety_notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-[#f97316] text-white font-bold hover:bg-[#ea580c] transition-all shadow-md disabled:opacity-70 flex items-center gap-2"
                >
                  {isSubmitting ? 'Publishing Plan...' : 'Publish Group Plan'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

