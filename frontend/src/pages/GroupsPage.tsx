import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import {
  Users,
  ShieldCheck,
  ArrowDown,
  ArrowUpRight,
  Plus,
  X,
  MessageCircle,
  Sparkles,
  Route,
  Search,
  UserPlus,
  Unlock,
  Lock,
} from 'lucide-react';
import type { Group, Place } from '../types';
import { groupsApi, placesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { GroupCard } from '../components/groups/GroupCard';
import { SplitHeading } from '../components/motion/SplitHeading';
import { Reveal } from '../components/motion/Reveal';
import { Counter } from '../components/motion/Counter';
import { Chip } from '../components/ui/Chip';
import { photoProps, type PhotoKey } from '../utils/images';
import { isPastTrip, seatsLeft } from '../utils/groups';
import { setScrollLocked } from '../hooks/useLenis';
import { cn } from '../utils/cn';

const EASE = [0.22, 1, 0.36, 1] as const;

type QuickFilter = 'all' | 'weekend' | 'budget' | 'seats';

const QUICK_FILTERS: { key: QuickFilter; label: string }[] = [
  { key: 'all', label: 'All trips' },
  { key: 'weekend', label: 'This weekend' },
  { key: 'budget', label: 'Under ₹1,000' },
  { key: 'seats', label: 'Seats open' },
];

/** Saturday 00:00 → Sunday 23:59 of the coming weekend (or the current one, if it's already the weekend). */
const thisWeekend = () => {
  const now = new Date();
  const day = now.getDay(); // 0 Sun … 6 Sat
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (day !== 0 && day !== 6) start.setDate(start.getDate() + (6 - day));
  if (day === 0) start.setDate(start.getDate() - 1);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  return [start.getTime(), end.getTime()] as const;
};

/* ── The three steps, told while the section is pinned ── */
const STEPS: { icon: typeof Search; title: string; body: string; photo: PhotoKey }[] = [
  { icon: Search, title: 'Pick a trip', body: 'Browse trips by date, budget and seats left. Every trip shows where you meet and what it costs.', photo: 'skandagiri' },
  { icon: UserPlus, title: 'Ask to join', body: 'Send a request with one tap. The host sees who you are before saying yes, so every group stays safe.', photo: 'chikmagalurHills' },
  { icon: Unlock, title: 'Chat unlocks', body: "Once you're approved, the WhatsApp or Telegram link appears. Plan the ride, split fuel, and go.", photo: 'friends' },
];

const HowItWorks = () => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => setStep(Math.min(STEPS.length - 1, Math.floor(v * STEPS.length * 0.999))));
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <>
      {/* Desktop: pinned story */}
      <section ref={ref} className="relative hidden lg:block bg-night grain" style={{ height: reduced ? 'auto' : `${STEPS.length * 90 + 10}vh` }}>
        <div className={cn('top-0 h-screen overflow-hidden', !reduced && 'sticky')}>
          <div className="max-w-7xl mx-auto h-full px-10 grid grid-cols-12 gap-10 items-center">
            <div className="col-span-5 on-photo">
              <p className="section-label mb-5">How travel groups work</p>
              <h2 className="text-display text-sand mb-12" style={{ fontSize: 'clamp(2.5rem, 4.4vw, 4rem)' }}>
                Three steps to <span className="italic font-medium text-[#F4B08A]">your crew.</span>
              </h2>
              <ol className="space-y-2">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const active = i === step;
                  return (
                    <li key={s.title} className={cn('rounded-3xl p-5 transition-all duration-500', active ? 'bg-white/[0.07]' : 'opacity-45')}>
                      <div className="flex items-center gap-4">
                        <span className={cn('w-11 h-11 rounded-2xl flex items-center justify-center transition-colors duration-500', active ? 'bg-accent text-white' : 'bg-white/10 text-sand')}>
                          <Icon className="w-5 h-5" />
                        </span>
                        <span className="font-mono text-xs text-sand/50">0{i + 1}</span>
                        <h3 className="font-display text-2xl text-sand">{s.title}</h3>
                      </div>
                      <motion.p
                        initial={false}
                        animate={{ height: active ? 'auto' : 0, opacity: active ? 1 : 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="overflow-hidden text-[#C8D0CC] leading-relaxed pl-[4.75rem] pr-4"
                      >
                        <span className="block pt-3">{s.body}</span>
                      </motion.p>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-10 h-px bg-white/10 relative overflow-hidden max-w-sm">
                <motion.div className="absolute inset-y-0 left-0 bg-accent" style={{ width: bar }} />
              </div>
            </div>

            <div className="col-span-7 relative h-[72vh]">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.photo}
                  initial={false}
                  animate={{ opacity: i === step ? 1 : 0, scale: i === step ? 1 : 1.06 }}
                  transition={{ duration: 0.9, ease: EASE }}
                  className="absolute inset-0 rounded-[36px] overflow-hidden"
                >
                  <img {...photoProps(s.photo, '55vw')} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/60 to-transparent" />
                </motion.div>
              ))}
              <div className="absolute left-6 bottom-6 badge glass-dark !py-2 !px-3.5">
                Step {step + 1} of {STEPS.length}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile & tablet: stacked */}
      <section className="lg:hidden bg-night grain px-6 py-20">
        <div className="on-photo mb-10">
          <p className="section-label mb-4">How travel groups work</p>
          <h2 className="text-display text-sand" style={{ fontSize: 'clamp(2.25rem, 8vw, 3rem)' }}>
            Three steps to <span className="italic font-medium text-[#F4B08A]">your crew.</span>
          </h2>
        </div>
        <div className="space-y-5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} className="rounded-[26px] overflow-hidden bg-white/[0.06]">
                <img {...photoProps(s.photo, '100vw')} loading="lazy" className="w-full aspect-[16/10] object-cover" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="font-mono text-xs text-sand/50">0{i + 1}</span>
                    <h3 className="font-display text-xl text-sand">{s.title}</h3>
                  </div>
                  <p className="text-[#C8D0CC] text-sm leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </>
  );
};

export const GroupsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const reduced = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  const destinationIdParam = searchParams.get('destinationId');

  const [groups, setGroups] = useState<(Group & { place?: Place })[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quick, setQuick] = useState<QuickFilter>('all');
  const gridRef = useRef<HTMLElement>(null);

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
    safety_notes: 'Carry water, helmet, and ID card. Respect everyone in the group.',
  });

  // Multi-stop custom curation state
  const [customStopCount, setCustomStopCount] = useState<number>(2);
  const [customStops, setCustomStops] = useState<string[]>(['', '']);

  const handleStopCountChange = (count: number) => {
    const validCount = Math.max(2, Math.min(6, count));
    setCustomStopCount(validCount);
    setCustomStops((prev) => {
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
    setCustomStops((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const fetchGroupsAndPlaces = async () => {
    setIsLoading(true);
    try {
      const [groupsData, allPlaces] = await Promise.all([groupsApi.getGroups(), placesApi.getPlaces()]);
      setPlaces(allPlaces);

      const placesMap = new Map(allPlaces.map((p) => [p.id, p]));
      const groupsWithPlaces = groupsData.map((g) => {
        const destId = g.destination_id || Number((g as any).place_id);
        return {
          ...g,
          place: placesMap.get(destId),
        };
      });

      setGroups(groupsWithPlaces);
    } catch (error) {
      console.error('Failed to fetch groups or places', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupsAndPlaces();
  }, []);

  useEffect(() => {
    setScrollLocked(isModalOpen);
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsModalOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      setScrollLocked(false);
    };
  }, [isModalOpen]);

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const initialDest = destinationIdParam || (places[0]?.id ? places[0].id.toString() : '');
    setFormData((prev) => ({
      ...prev,
      destination_id: initialDest,
    }));
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      let finalDestId: number | null = null;
      let finalCustomDest: string | null = null;

      if (formData.destination_id === 'custom') {
        const validStops = customStops.map((s) => s.trim()).filter(Boolean);
        if (validStops.length < 2) {
          throw new Error('Please enter at least 2 destinations for your custom curation route.');
        }
        finalCustomDest = validStops.join(' ➔ ');
      } else {
        finalDestId = Number(formData.destination_id);
      }

      const created = await groupsApi.createGroup({
        destination_id: finalDestId,
        custom_destination: finalCustomDest,
        title: formData.title,
        description: formData.description,
        trip_date: new Date(formData.trip_date).toISOString(),
        meeting_area: formData.meeting_area,
        estimated_cost: Number(formData.estimated_cost),
        max_members: Number(formData.max_members),
        chat_link: formData.chat_link.trim() || null,
        safety_notes: formData.safety_notes.trim() || null,
      } as Parameters<typeof groupsApi.createGroup>[0]);

      if (created) {
        setIsModalOpen(false);
        setFormData({
          destination_id: places[0]?.id.toString() || '',
          title: '',
          description: '',
          trip_date: '',
          meeting_area: '',
          estimated_cost: 500,
          max_members: 6,
          chat_link: '',
          safety_notes: 'Carry water, helmet, and ID card. Respect everyone in the group.',
        });
        setCustomStopCount(2);
        setCustomStops(['', '']);
        await fetchGroupsAndPlaces();
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create group plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetPlace = destinationIdParam ? places.find((p) => p.id === Number(destinationIdParam)) : null;

  const filteredGroups = useMemo(() => {
    const [wkStart, wkEnd] = thisWeekend();
    return groups
      .filter((group) => {
        if (!destinationIdParam) return true;
        const matchesOfficial = group.destination_id === Number(destinationIdParam);
        const matchesCustom = targetPlace && group.custom_destination ? group.custom_destination.toLowerCase().includes(targetPlace.name.toLowerCase()) : false;
        return matchesOfficial || matchesCustom;
      })
      .filter((g) => {
        const t = new Date(g.trip_date).getTime();
        if (quick === 'weekend') return t >= wkStart && t < wkEnd;
        if (quick === 'budget') return g.estimated_cost <= 1000;
        if (quick === 'seats') return g.status !== 'full' && seatsLeft(g) > 0 && !isPastTrip(g);
        return true;
      })
      // Upcoming trips first (soonest at the top), past trips last
      .sort((a, b) => {
        const pa = isPastTrip(a);
        const pb = isPastTrip(b);
        if (pa !== pb) return pa ? 1 : -1;
        const ta = new Date(a.trip_date).getTime();
        const tb = new Date(b.trip_date).getTime();
        return pa ? tb - ta : ta - tb;
      });
  }, [groups, destinationIdParam, targetPlace, quick]);

  const upcoming = groups.filter((g) => !isPastTrip(g));
  const openSeats = upcoming.filter((g) => g.status !== 'full').reduce((sum, g) => sum + seatsLeft(g), 0);
  const destinations = new Set(upcoming.map((g) => g.custom_destination || g.place?.name).filter(Boolean)).size;

  /* ── Hero: photo shrinks into a frame as you scroll (same motion language as Explore) ── */
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const inset = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const clipPath = useMotionTemplate`inset(calc(${inset} * 6%) calc(${inset} * 4%) calc(${inset} * 6%) calc(${inset} * 4%) round calc(${inset} * 40px))`;
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const scrollToGrid = () => gridRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });

  return (
    <div className="flex flex-col w-full bg-sand min-h-screen">
      {/* ── Hero ── */}
      <section ref={heroRef} className="relative h-[92svh] min-h-[620px] max-h-[920px] bg-sand">
        <motion.div className="absolute inset-0 overflow-hidden bg-night grain" style={reduced ? undefined : { clipPath }}>
          <motion.img
            {...photoProps('ghatsSummit')}
            fetchPriority="high"
            style={reduced ? { scale: 1.05 } : { y: imageY, scale: 1.12 }}
            className="absolute inset-0 w-full h-full object-cover object-[center_40%]"
          />
          <div className="absolute inset-0 hero-scrim" />
        </motion.div>

        <motion.div
          style={reduced ? undefined : { y: textY, opacity: textOpacity }}
          className="on-photo relative z-10 h-full max-w-7xl mx-auto px-6 sm:px-10 flex flex-col justify-end pb-16 sm:pb-20"
        >
          <p className="section-label mb-6 animate-fade-up">Travel groups · Bengaluru</p>
          <SplitHeading
            as="h1"
            onMount
            delay={0.1}
            className="text-display text-sand max-w-4xl"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)' }}
            accentClassName="italic font-medium text-[#F4B08A]"
            parts={[{ text: 'Travel' }, { text: 'together.', accent: true }]}
          />
          <p className="text-[#E4E8E5] text-lg sm:text-xl max-w-xl mt-6 leading-relaxed animate-fade-up delay-400">
            Pool rides, split fuel, and find people who want to see the same sunrise. Hosts approve every member.
          </p>

          <div className="flex flex-wrap gap-3 mt-9 animate-fade-up delay-500">
            <button onClick={handleOpenModal} className="btn-primary">
              <Plus className="w-4 h-4" /> Start a trip
            </button>
            <button onClick={scrollToGrid} className="btn-ghost">
              Browse trips <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          <dl className="flex gap-8 sm:gap-12 text-sand mt-12 animate-fade-up delay-600">
            {[
              { n: upcoming.length, l: 'Upcoming trips' },
              { n: openSeats, l: 'Seats open' },
              { n: destinations, l: 'Destinations' },
            ].map((s) => (
              <div key={s.l}>
                <dd className="font-display text-3xl sm:text-4xl leading-none">{isLoading ? '—' : <Counter value={s.n} />}</dd>
                <dt className="text-label text-sand/65 mt-2">{s.l}</dt>
              </div>
            ))}
          </dl>
        </motion.div>
      </section>

      {/* ── Trust strip ── */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-10 -mt-2 relative z-10">
        <Reveal className="card card-shadow flex items-start sm:items-center gap-4 p-5 sm:px-7">
          <span className="w-11 h-11 rounded-2xl bg-sage-soft text-sage-text flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <p className="text-sm text-body leading-relaxed">
            <strong className="text-ink">Private by default.</strong> A trip's WhatsApp or Telegram link stays hidden until the host reviews and approves your request.
          </p>
        </Reveal>
      </div>

      {/* ── Filters (sticky only while the trips are on screen) + trips ── */}
      <div>
      <div className="sticky z-30 top-[5.6rem] mt-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-10">
          <div className="glass rounded-full card-shadow flex items-center gap-2 p-2">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-1 min-w-0" data-lenis-prevent>
              {QUICK_FILTERS.map((f) => (
                <Chip key={f.key} group="groups" active={quick === f.key} onClick={() => setQuick(f.key)}>
                  {f.label}
                </Chip>
              ))}
            </div>
            <button onClick={handleOpenModal} className="btn-primary !py-2.5 !px-4 !text-[13px] shrink-0 max-sm:!hidden">
              <Plus className="w-4 h-4" /> Start a trip
            </button>
          </div>
        </div>
      </div>

      {/* ── Trips ── */}
      <section ref={gridRef} className="max-w-7xl mx-auto w-full px-6 sm:px-10 pt-16 pb-28 scroll-mt-40">
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="section-label mb-4">{targetPlace ? 'Trips to' : 'Coming up'}</p>
            <h2 className="text-display text-ink" style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}>
              {targetPlace ? (
                <>
                  <span className="accent-word">{targetPlace.name}</span>
                </>
              ) : isLoading ? (
                'Loading trips…'
              ) : (
                <>
                  {filteredGroups.length} {filteredGroups.length === 1 ? 'trip' : 'trips'} <span className="accent-word">to join.</span>
                </>
              )}
            </h2>
          </div>
          {destinationIdParam && (
            <button onClick={() => setSearchParams({})} className="btn-ghost self-start md:self-auto">
              <X className="w-4 h-4" /> Show all destinations
            </button>
          )}
        </Reveal>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-[26px] overflow-hidden bg-paper border border-line">
                <div className="skeleton aspect-[16/10]" style={{ borderRadius: 0 }} />
                <div className="p-5 flex gap-4">
                  <div className="skeleton w-16 h-20 rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-2 w-full mt-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <Reveal className="card grid md:grid-cols-2 overflow-hidden">
            <div className="relative min-h-[260px] md:min-h-[400px]">
              <img {...photoProps('friends', '(min-width: 768px) 50vw, 100vw')} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-12">
              <p className="section-label mb-4">Nothing yet</p>
              <h3 className="font-display text-3xl text-ink mb-3">
                {targetPlace ? `No trips to ${targetPlace.name} yet` : quick !== 'all' ? 'No trips match this filter' : 'No trips planned yet'}
              </h3>
              <p className="text-muted mb-8 max-w-sm">
                {targetPlace ? 'Be the one who gets the group together. It takes two minutes.' : 'Pick a place, set a date and gather your crew. It takes two minutes.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={handleOpenModal} className="btn-primary">
                  <Plus className="w-4 h-4" /> {targetPlace ? `Plan a trip to ${targetPlace.name}` : 'Start a trip'}
                </button>
                {(destinationIdParam || quick !== 'all') && (
                  <button
                    onClick={() => {
                      setQuick('all');
                      setSearchParams({});
                    }}
                    className="btn-ghost"
                  >
                    Show all trips
                  </button>
                )}
              </div>
            </div>
          </Reveal>
        ) : (
          <motion.div layout={!reduced} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {filteredGroups.map((group, i) => (
                <motion.div
                  key={group.id}
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.8, ease: EASE, delay: (i % 3) * 0.08 }}
                  className="h-full"
                >
                  <GroupCard group={group} place={group.place} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
      </div>

      {/* ── How it works (pinned story) ── */}
      <HowItWorks />

      {/* ── Closing call ── */}
      <section className="max-w-7xl mx-auto w-full px-6 sm:px-10 py-28">
        <Reveal className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="section-label mb-5">Can't find your trip?</p>
            <SplitHeading className="text-display text-ink mb-6" style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)' }} parts={[{ text: 'Start one.' }, { text: 'People will come.', accent: true }]} />
            <p className="text-body text-lg leading-relaxed max-w-md mb-9">
              Pick a place from Explore or build your own multi-stop route. You choose the date, the budget and who joins.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleOpenModal} className="btn-primary">
                <Plus className="w-4 h-4" /> Start a trip
              </button>
              <Link to="/explore" className="btn-ghost">
                Find a place first <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="relative h-[380px] sm:h-[460px]">
            <div className="absolute right-0 top-0 w-[78%] h-[82%] rounded-[32px] overflow-hidden card-shadow-hover">
              <img {...photoProps('hampi', '40vw')} loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="absolute left-0 bottom-0 w-[46%] h-[52%] rounded-[26px] overflow-hidden ring-[10px] ring-sand card-shadow-hover">
              <img {...photoProps('coorgFalls', '22vw')} loading="lazy" className="w-full h-full object-cover" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ Start-a-trip side sheet ═══ */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div className="fixed inset-0 z-[60] flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-night/55 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} aria-label="Close" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="new-trip-title"
              initial={reduced ? false : { x: '100%' }}
              animate={{ x: 0 }}
              exit={reduced ? undefined : { x: '100%' }}
              transition={{ duration: 0.55, ease: EASE }}
              className="relative w-full max-w-xl h-full bg-sand overflow-y-auto shadow-2xl"
              data-lenis-prevent
            >
              <div className="sticky top-0 z-10 bg-sand/90 backdrop-blur border-b border-line px-6 sm:px-8 py-5 flex items-center justify-between">
                <div>
                  <p className="section-label">New trip</p>
                  <h2 id="new-trip-title" className="font-display text-2xl text-ink mt-1">
                    Start a travel group
                  </h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-stone text-ink flex items-center justify-center transition-colors" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 sm:px-8 py-7">
                <p className="text-sm text-muted mb-7">Set the plan and the size of your group. You approve who gets the chat link.</p>

                {formError && (
                  <div className="mb-6 bg-[#FDF3F1] border border-[#F2C9C2] text-[#8A1C12] p-4 rounded-2xl text-sm" role="alert">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Destination Select */}
                  <div>
                    <label htmlFor="trip-destination" className="field-label !flex items-center justify-between">
                      <span>Destination *</span>
                      <span className="font-medium text-muted">One place or a custom route</span>
                    </label>
                    <select
                      id="trip-destination"
                      required
                      value={formData.destination_id}
                      onChange={(e) => setFormData({ ...formData, destination_id: e.target.value })}
                      className="field"
                    >
                      <option value="custom">✨ Custom multi-stop route (2+ places)</option>
                      <optgroup label="Or choose a place from SafarNamma">
                        {places.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.category})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Customized Multi-Stop Route Builder Panel */}
                  <AnimatePresence initial={false}>
                    {formData.destination_id === 'custom' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-3xl border border-line bg-paper p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="w-9 h-9 rounded-xl bg-accent-soft text-accent-text flex items-center justify-center">
                                <Sparkles className="w-4 h-4" />
                              </span>
                              <div>
                                <p className="text-sm font-bold text-ink">Your route</p>
                                <p className="text-xs text-muted">How many stops?</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 bg-sand p-1 rounded-full border border-line self-start sm:self-auto">
                              {[2, 3, 4, 5].map((num) => (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => handleStopCountChange(num)}
                                  className={cn('px-3 py-1.5 rounded-full text-xs font-bold transition-colors', customStopCount === num ? 'bg-ink text-sand' : 'text-body hover:text-ink')}
                                >
                                  {num} stops
                                </button>
                              ))}
                            </div>
                          </div>

                          <ol className="relative space-y-3 pl-1">
                            <span className="absolute left-[15px] top-4 bottom-4 border-l-2 border-dashed border-line-strong" aria-hidden />
                            {customStops.map((stop, idx) => (
                              <li key={idx} className="relative flex items-center gap-3">
                                <span className="relative z-10 w-7 h-7 rounded-full bg-ink text-sand text-xs font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                                <input
                                  type="text"
                                  required
                                  placeholder={
                                    idx === 0
                                      ? 'e.g. Nandi Hills sunrise point'
                                      : idx === 1
                                        ? 'e.g. Indian Paratha Company for chai'
                                        : idx === 2
                                          ? 'e.g. Devanahalli Fort'
                                          : `Stop ${idx + 1}`
                                  }
                                  value={stop}
                                  onChange={(e) => handleStopChange(idx, e.target.value)}
                                  className="field !py-2.5"
                                  aria-label={`Stop ${idx + 1}`}
                                />
                              </li>
                            ))}
                          </ol>

                          {customStops.some((s) => s.trim()) && (
                            <div className="rounded-2xl bg-sand border border-line p-3 flex items-center gap-2.5 text-xs text-body">
                              <Route className="w-4 h-4 text-accent-text shrink-0" />
                              <span className="font-bold text-ink shrink-0">Route:</span>
                              <span className="truncate">{customStops.filter((s) => s.trim()).join(' ➔ ')}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label htmlFor="trip-title" className="field-label">
                      Trip title *
                    </label>
                    <input
                      id="trip-title"
                      type="text"
                      required
                      placeholder="e.g. Sunrise jeep ride & chai at Nandi Hills"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="field"
                    />
                  </div>

                  <div>
                    <label htmlFor="trip-description" className="field-label">
                      The plan *
                    </label>
                    <textarea
                      id="trip-description"
                      required
                      rows={4}
                      placeholder="Timings, vehicles, who should join…"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="field resize-none"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="trip-date" className="field-label">
                        Date & time *
                      </label>
                      <input
                        id="trip-date"
                        type="datetime-local"
                        required
                        value={formData.trip_date}
                        onChange={(e) => setFormData({ ...formData, trip_date: e.target.value })}
                        className="field"
                      />
                    </div>
                    <div>
                      <label htmlFor="trip-meeting" className="field-label">
                        Meeting point *
                      </label>
                      <input
                        id="trip-meeting"
                        type="text"
                        required
                        placeholder="e.g. Silk Board Metro, Gate 2"
                        value={formData.meeting_area}
                        onChange={(e) => setFormData({ ...formData, meeting_area: e.target.value })}
                        className="field"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="trip-cost" className="field-label">
                        Cost per person (₹)
                      </label>
                      <input
                        id="trip-cost"
                        type="number"
                        min="0"
                        step="50"
                        value={formData.estimated_cost}
                        onChange={(e) => setFormData({ ...formData, estimated_cost: Number(e.target.value) })}
                        className="field"
                      />
                    </div>
                    <div>
                      <label htmlFor="trip-size" className="field-label">
                        Group size
                      </label>
                      <input
                        id="trip-size"
                        type="number"
                        min="2"
                        max="30"
                        value={formData.max_members}
                        onChange={(e) => setFormData({ ...formData, max_members: Number(e.target.value) })}
                        className="field"
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl bg-paper border border-line p-5">
                    <label htmlFor="trip-chat" className="field-label !flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-sage-text" /> WhatsApp or Telegram invite link
                    </label>
                    <p className="text-xs text-muted mb-3 flex items-center gap-1.5">
                      <Lock className="w-3 h-3" /> Only people you approve will see it.
                    </p>
                    <input
                      id="trip-chat"
                      type="url"
                      placeholder="https://chat.whatsapp.com/… or https://t.me/…"
                      value={formData.chat_link}
                      onChange={(e) => setFormData({ ...formData, chat_link: e.target.value })}
                      className="field"
                    />
                  </div>

                  <div>
                    <label htmlFor="trip-safety" className="field-label">
                      Safety & gear notes
                    </label>
                    <input
                      id="trip-safety"
                      type="text"
                      placeholder="e.g. Water bottles, trekking shoes, rain jacket"
                      value={formData.safety_notes}
                      onChange={(e) => setFormData({ ...formData, safety_notes: e.target.value })}
                      className="field"
                    />
                  </div>

                  <div className="sticky bottom-0 -mx-6 sm:-mx-8 px-6 sm:px-8 py-4 bg-sand/95 backdrop-blur border-t border-line flex gap-3 justify-end">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="btn-accent">
                      <Users className="w-4 h-4" /> {isSubmitting ? 'Publishing…' : 'Publish trip'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
