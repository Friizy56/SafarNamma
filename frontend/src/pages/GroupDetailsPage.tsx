import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, Calendar, IndianRupee, Users, ShieldAlert, CheckCircle, 
  MessageCircle, ExternalLink, Clock, UserCheck, XCircle, Send, Trash2, AlertCircle
} from 'lucide-react';
import type { Group, GroupRequest, Place } from '../types';
import { groupsApi, placesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const GroupDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [requests, setRequests] = useState<GroupRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Requester status ('none' | 'pending' | 'approved' | 'rejected')
  const [myRequestStatus, setMyRequestStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchDetails = async () => {
    if (!id) return;
    try {
      // Pass logged-in user email so backend reveals chat_link ONLY if authorized
      const groupData = await groupsApi.getGroupById(id, user?.email);
      if (groupData) {
        setGroup(groupData);

        // Fetch corresponding place info
        const destId = groupData.destination_id || (groupData as any).place_id;
        if (destId) {
          const placeData = await placesApi.getPlaceById(destId.toString());
          if (placeData) setPlace(placeData);
        }

        // Check if current user is organizer
        const isOrganizer = user && user.email.toLowerCase() === groupData.organizer_email.toLowerCase();

        if (isOrganizer) {
          // Load requests for organizer to review
          const reqs = await groupsApi.getRequests(Number(id), user.email);
          setRequests(reqs);
        } else if (user) {
          if (groupData.user_request_status) {
            setMyRequestStatus(groupData.user_request_status as any);
          } else if (groupData.chat_link) {
            setMyRequestStatus('approved');
          } else {
            setMyRequestStatus('none');
          }
        }
      }
    } catch (error) {
      console.error("Error fetching group details", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, user]);

  // Handle Request to Join
  const handleRequestToJoin = async () => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    if (!group) return;

    setIsSubmittingRequest(true);
    setActionMessage('');
    try {
      await groupsApi.requestToJoin(Number(group.id), user.name, user.email);
      setMyRequestStatus('pending');
      setActionMessage('Your request has been sent! The organizer will review it.');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('rejected')) {
        setMyRequestStatus('rejected');
      } else if (msg.toLowerCase().includes('pending')) {
        setMyRequestStatus('pending');
      } else {
        alert(msg || 'Failed to send request.');
      }
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Organizer approves or rejects a request
  const handleUpdateRequestStatus = async (requestId: number, newStatus: 'approved' | 'rejected') => {
    if (!user || !group) return;
    try {
      const success = await groupsApi.updateRequestStatus(requestId, newStatus, user.email);
      if (success) {
        // Re-fetch requests and group to refresh member count and status
        await fetchDetails();
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Organizer cancels & deletes the travel group
  const handleDeleteGroup = async () => {
    if (!user || !group) return;
    setDeleteError('');

    const confirmed = window.confirm(
      'Are you sure you want to cancel and delete this group trip? This action cannot be undone.'
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await groupsApi.deleteGroup(Number(group.id), user.email);
      navigate('/groups');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete group.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-64 bg-gray-200 rounded-3xl mt-8"></div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Travel Plan Not Found</h1>
        <p className="text-gray-500 mb-8">This group plan may have been removed or does not exist.</p>
        <Link to="/groups" className="bg-[#1a4731] text-white px-6 py-3 rounded-full font-medium hover:bg-[#123523] transition-colors">
          ← Back to All Groups
        </Link>
      </div>
    );
  }

  const isOrganizer = user && user.email.toLowerCase() === group.organizer_email.toLowerCase();
  const isApprovedMember = Boolean(group.chat_link && !isOrganizer);
  const isWhatsApp = group.chat_link?.includes('whatsapp.com') || group.chat_link?.includes('wa.me');
  const isTelegram = group.chat_link?.includes('t.me') || group.chat_link?.includes('telegram.me');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Link to="/groups" className="text-sm font-medium text-gray-500 hover:text-[#f97316] inline-flex items-center gap-1">
          ← Back to all travel plans
        </Link>
      </div>

      {/* Header Info */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            group.status === 'open' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            {group.status === 'open' ? 'Recruiting Travelers' : 'Group Full'}
          </span>
          <span className="text-sm font-semibold text-gray-600">
            {group.max_members - group.current_members} spots remaining
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#1a4731] mb-2 leading-tight">
          {group.title}
        </h1>

        {group.custom_destination ? (
          <p className="text-lg text-[#f97316] font-medium flex items-center gap-2">
            Multi-Stop Route: <span className="font-bold text-gray-900">{group.custom_destination}</span>
          </p>
        ) : place ? (
          <p className="text-lg text-[#f97316] font-medium flex items-center gap-2">
            Destination: <Link to={`/places/${place.id}`} className="hover:underline font-semibold">{place.name}</Link>
          </p>
        ) : null}
      </div>

      {/* Two-Column Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Itinerary & Safety */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Main Description */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">The Plan & Itinerary</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
              {group.description}
            </p>
          </section>

          {/* Safety & Gear */}
          {group.safety_notes && (
            <section className="bg-amber-50/70 p-6 rounded-3xl border border-amber-200/60">
              <h2 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" /> Safety Notes & Gear Checklist
              </h2>
              <p className="text-amber-800 text-sm leading-relaxed">{group.safety_notes}</p>
            </section>
          )}

          {/* ============================================================ */}
          {/*          ORGANIZER DASHBOARD: PENDING JOIN REQUESTS          */}
          {/* ============================================================ */}
          {isOrganizer && (
            <section className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#1a4731]/15 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-[#1a4731]" />
                  <h2 className="text-xl font-bold text-gray-900">Manage Join Requests</h2>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-[#f5f0e6] text-[#1a4731] rounded-lg">
                  Organizer View
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-6">
                When you click <strong>Approve (✅)</strong>, that student will immediately get access to the group chat link.
              </p>

              {requests.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-2xl text-center text-sm text-gray-500 border border-gray-100">
                  No requests yet. When students ask to join, they will appear here!
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map(req => (
                    <div 
                      key={req.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#faf9f6] rounded-2xl border border-gray-150 gap-3"
                    >
                      <div>
                        <p className="font-bold text-gray-900">{req.user_name}</p>
                        <p className="text-xs text-gray-500">{req.user_email}</p>
                        <span className={`inline-block mt-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          req.status === 'approved' ? 'bg-green-100 text-green-700' :
                          req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      {req.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleUpdateRequestStatus(req.id, 'rejected')}
                            className="bg-gray-200 hover:bg-red-100 hover:text-red-700 text-gray-700 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Decline
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        </div>

        {/* Right Column: Logistics & Actions */}
        <div className="space-y-6">
          <div className="bg-[#faf9f6] p-6 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 text-lg">Trip Logistics</h3>
            
            <ul className="space-y-5">
              <li className="flex gap-3">
                <Calendar className="w-5 h-5 text-[#1a4731] shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Date & Time</p>
                  <p className="text-sm text-gray-900 font-semibold mt-0.5">
                    {new Date(group.trip_date).toLocaleString('en-IN', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric', 
                      hour: 'numeric', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-[#1a4731] shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Meeting Point</p>
                  <p className="text-sm text-gray-900 font-semibold mt-0.5">{group.meeting_area}</p>
                </div>
              </li>

              <li className="flex gap-3">
                <IndianRupee className="w-5 h-5 text-[#1a4731] shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Estimated Budget</p>
                  <p className="text-sm text-gray-900 font-semibold mt-0.5">₹{group.estimated_cost} per head</p>
                </div>
              </li>

              <li className="flex gap-3">
                <Users className="w-5 h-5 text-[#1a4731] shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Group Size</p>
                  <p className="text-sm text-gray-900 font-semibold mt-0.5">
                    {group.current_members} / {group.max_members} Joined
                  </p>
                </div>
              </li>
            </ul>

            {/* ACTION BUTTON AREA */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
              
              {actionMessage && (
                <div className="bg-green-50 text-green-800 p-3.5 rounded-xl text-xs font-medium border border-green-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-green-600" />
                  {actionMessage}
                </div>
              )}

              {/* Case 1: The user is the Organizer */}
              {isOrganizer ? (
                <div className="space-y-3">
                  <div className="bg-[#eaf4ee] text-[#1a4731] p-3 rounded-xl text-xs font-semibold text-center border border-[#d2e7d9]">
                    👑 You are the Organizer of this trip
                  </div>
                  {group.chat_link && (
                    <a
                      href={group.chat_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
                    >
                      <MessageCircle className="w-5 h-5" /> Open Group Chat <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {/* Organizer Delete Action with 2-hour cooldown notice */}
                  <div className="pt-3 border-t border-gray-200/80">
                    <button
                      onClick={handleDeleteGroup}
                      disabled={isDeleting}
                      className="w-full bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 border border-red-200 py-2.5 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting ? 'Deleting Trip...' : 'Delete Trip Plan'}
                    </button>

                    {deleteError && (
                      <div className="mt-2.5 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{deleteError}</span>
                      </div>
                    )}

                    <p className="text-[11px] text-gray-400 text-center mt-2 leading-relaxed">
                      ⏱️ Organizers can delete their group plan 2 hours after creation to ensure group stability.
                    </p>
                  </div>
                </div>
              ) : isApprovedMember && group.chat_link ? (
                /* Case 2: The user is APPROVED -> Reveal WhatsApp / Telegram Link! */
                <div className="space-y-3">
                  <div className="bg-green-100 text-green-800 p-3.5 rounded-xl text-xs font-bold text-center border border-green-200">
                    🎉 You have been approved by the organizer!
                  </div>
                  <a
                    href={group.chat_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3.5 rounded-xl font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                      isWhatsApp 
                        ? 'bg-[#25D366] hover:bg-[#1EBE5D]' 
                        : isTelegram 
                          ? 'bg-[#0088cc] hover:bg-[#0077b5]' 
                          : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    {isWhatsApp ? 'Join WhatsApp Group' : isTelegram ? 'Join Telegram Chat' : 'Open Group Chat'}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : myRequestStatus === 'pending' ? (
                /* Case 3: Request is Pending */
                <div className="w-full bg-amber-50 border border-amber-200 text-amber-800 py-3.5 rounded-xl font-bold text-center text-sm flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" /> Request Pending Approval
                </div>
              ) : myRequestStatus === 'rejected' ? (
                /* Case 4: Request was Rejected */
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-center space-y-1.5">
                    <div className="flex items-center justify-center gap-2 text-red-700 font-bold text-sm">
                      <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      Your request was declined
                    </div>
                    <p className="text-xs text-red-600 leading-relaxed">
                      The group organizer has declined your request to join this group trip.
                    </p>
                  </div>
                  <button
                    disabled={true}
                    className="w-full py-3.5 rounded-xl font-bold bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed flex items-center justify-center gap-2 select-none shadow-none"
                  >
                    <XCircle className="w-4 h-4" /> Request Declined
                  </button>
                </div>
              ) : (
                /* Case 5: Standard user viewing trip -> "Request to Join" */
                <button
                  onClick={handleRequestToJoin}
                  disabled={group.status !== 'open' || isSubmittingRequest}
                  className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                    group.status === 'open'
                      ? 'bg-[#f97316] text-white hover:bg-[#ea580c]'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  {isSubmittingRequest 
                    ? 'Sending Request...' 
                    : group.status === 'open' 
                      ? 'Request to Join Group' 
                      : 'Group is Full'}
                </button>
              )}

              {/* Privacy Notice on Link */}
              {!isOrganizer && !isApprovedMember && (
                <p className="text-[11px] text-gray-500 text-center leading-normal pt-1">
                  🔒 WhatsApp/Telegram chat link will automatically unlock once the organizer approves your request.
                </p>
              )}

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

