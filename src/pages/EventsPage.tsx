import React, { useState, useMemo } from 'react';
import { EventItem } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Ticket, 
  Plus, 
  Edit3, 
  Trash2, 
  SlidersHorizontal, 
  RotateCcw, 
  Image as ImageIcon,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useEvents } from '../context/EventsContext';
import { useCMS } from '../context/CMSContext';
import { useTheme } from '../context/ThemeContext';
import { AnimatedImage } from '../components/AnimatedImage';

interface EventsPageProps {
  onOpenEvent: (event: EventItem) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({ onOpenEvent }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const { 
    events, 
    openCreateModal, 
    openEditModal, 
    deleteEvent, 
    resetEvents,
    manageMode,
    setManageMode 
  } = useEvents();
  const { isAuthenticated } = useCMS();
  const canManage = isAuthenticated && manageMode;

  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamically compute unique categories based on existing events
  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((evt) => {
      if (evt.category) set.add(evt.category);
    });
    return ['All', ...Array.from(set)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesCategory = filterCategory === 'All' || evt.category === filterCategory;
      const matchesSearch = 
        !searchQuery.trim() ||
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [events, filterCategory, searchQuery]);

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the event: "${title}"?`)) {
      deleteEvent(id);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset events to initial ministry itinerary schedule? Any custom events created will be replaced.')) {
      resetEvents();
    }
  };

  return (
    <div className={`pt-24 sm:pt-28 pb-16 sm:pb-20 transition-colors duration-400 ${
      isLight ? 'bg-[#F8FAF8] text-[#080D0A]' : 'bg-[#050505] text-[#F5F7F5]'
    }`}>
      {/* Header */}
      <section className="px-4 sm:px-6 md:px-12 py-10 sm:py-14 max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#168A45] dark:text-[#63D98A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#168A45]" />
              <span>MINISTERIAL ITINERARY & GATHERINGS</span>
            </div>
            <h1 className={`font-serif-luxury text-3xl sm:text-6xl md:text-7xl font-normal leading-tight ${
              isLight ? 'text-neutral-950' : 'text-white'
            }`}>
              UPCOMING <br />
              <span className="italic text-[#168A45] dark:text-[#63D98A]">EVENTS &amp; CONVOCATIONS</span>
            </h1>
            <p className={`text-sm md:text-base max-w-2xl font-light leading-relaxed ${
              isLight ? 'text-gray-600' : 'text-white/70'
            }`}>
              Apostolic gatherings, prophetic breakthrough vigils, and leadership intensives with Prophet John Lord.
            </p>
          </div>

          {/* Action Toolbar: Shown only when authenticated as Admin */}
          {isAuthenticated && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={openCreateModal}
                className="px-5 py-3 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(22,138,69,0.35)] cursor-pointer hover:scale-102 min-h-[44px]"
              >
                <Plus className="w-4 h-4 text-[#63D98A]" />
                <span>CREATE NEW EVENT</span>
              </button>

              <button
                onClick={() => setManageMode(!manageMode)}
                className={`px-4 py-3 text-xs font-semibold tracking-wider uppercase border transition-all flex items-center gap-2 min-h-[44px] cursor-pointer ${
                  manageMode
                    ? 'bg-amber-500 text-black border-amber-600 font-bold'
                    : isLight
                    ? 'bg-white text-neutral-800 border-gray-300 hover:border-[#168A45]'
                    : 'bg-white/5 text-white/80 border-white/15 hover:border-white/30'
                }`}
                title="Toggle Edit / Delete buttons on event cards"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{manageMode ? 'EXIT MANAGE' : 'MANAGE EVENTS'}</span>
              </button>

              {manageMode && (
                <button
                  onClick={handleReset}
                  className="px-3.5 py-3 text-xs font-semibold uppercase tracking-wider text-red-500 hover:bg-red-500/10 border border-red-500/30 flex items-center gap-1.5 min-h-[44px] cursor-pointer"
                  title="Reset to sample ministry events"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Filter Tabs & Search */}
      <section className={`px-4 sm:px-6 md:px-12 py-4 max-w-7xl mx-auto border-t space-y-3 ${
        isLight ? 'border-gray-200' : 'border-white/10'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3.5 py-2 text-xs font-medium tracking-wider whitespace-nowrap transition-all border min-h-[42px] sm:min-h-[38px] cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-[#168A45] text-white border-[#63D98A] shadow-sm'
                    : isLight
                      ? 'bg-white text-gray-700 border-gray-200 hover:border-[#168A45] hover:text-[#168A45]'
                      : 'bg-white/5 text-white/70 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search events by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-3.5 py-2.5 border text-base sm:text-xs outline-none focus:border-[#168A45] min-h-[44px] ${
                isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black/60 border-white/15 text-white'
              }`}
            />
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="px-4 sm:px-6 md:px-12 py-6 sm:py-8 max-w-7xl mx-auto space-y-6">
        {filteredEvents.length === 0 ? (
          <div className={`p-10 text-center border space-y-3 ${
            isLight ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'
          }`}>
            <p className="text-sm text-gray-500">No ministerial events found matching your filter.</p>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-[#168A45] text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Event Now</span>
            </button>
          </div>
        ) : (
          filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className={`border transition-all overflow-hidden group hover:-translate-y-0.5 ${
                isLight
                  ? 'bg-white border-gray-200 hover:border-[#168A45] shadow-xs hover:shadow-md'
                  : 'bg-[#0B2418]/15 border-white/10 hover:border-[#168A45]'
              }`}
            >
              {/* Optional Event Flyer Banner */}
              {evt.image && (
                <div className="relative aspect-[16/8] sm:aspect-[24/7] lg:aspect-[32/7] w-full overflow-hidden bg-neutral-900">
                  <AnimatedImage
                    src={evt.image}
                    alt={evt.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />
                  
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2">
                    <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-mono font-bold bg-[#168A45] text-white shadow-md">
                      {evt.category}
                    </span>
                    {evt.themeOrScripture && (
                      <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/30">
                        {evt.themeOrScripture}
                      </span>
                    )}
                  </div>

                  {canManage && (
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(evt)}
                        className="px-3 py-1.5 bg-black/80 hover:bg-[#168A45] text-white text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1 backdrop-blur-sm border border-white/20 cursor-pointer min-h-[36px]"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(evt.id, evt.title)}
                        className="p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-none cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Main Card Content Grid */}
              <div className="p-4 sm:p-7 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-center">
                {/* Date & Time Column */}
                <div className={`lg:col-span-3 flex flex-wrap lg:flex-col items-center lg:items-start justify-between gap-2 border-b lg:border-b-0 lg:border-r pb-4 lg:pb-0 lg:pr-6 ${
                  isLight ? 'border-gray-200' : 'border-white/10'
                }`}>
                  <div className="space-y-1">
                    {!evt.image && (
                      <span className="text-[11px] uppercase tracking-widest text-[#168A45] font-semibold font-mono block">
                        {evt.category}
                      </span>
                    )}
                    <div className={`font-serif-luxury text-xl sm:text-2xl md:text-3xl font-medium ${
                      isLight ? 'text-neutral-900' : 'text-white'
                    }`}>
                      {evt.date}
                    </div>
                  </div>

                  <div className={`text-xs flex items-center gap-1.5 mt-2 ${
                    isLight ? 'text-gray-500' : 'text-white/60'
                  }`}>
                    <Clock className="w-3.5 h-3.5 text-[#168A45] shrink-0" />
                    <span>{evt.time}</span>
                  </div>
                </div>

                {/* Event Details Column */}
                <div className="lg:col-span-6 space-y-2.5 sm:space-y-3">
                  <div className="space-y-1">
                    <h3 className={`font-serif-luxury text-xl sm:text-2xl font-medium transition-colors leading-snug ${
                      isLight ? 'text-neutral-900 group-hover:text-[#168A45]' : 'text-white group-hover:text-[#63D98A]'
                    }`}>
                      {evt.title}
                    </h3>
                    {evt.themeOrScripture && !evt.image && (
                      <span className="text-xs font-mono text-[#168A45] dark:text-[#63D98A] flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Theme: {evt.themeOrScripture}</span>
                      </span>
                    )}
                  </div>

                  <p className={`text-xs sm:text-sm font-light leading-relaxed line-clamp-3 ${
                    isLight ? 'text-gray-600' : 'text-white/70'
                  }`}>
                    {evt.description}
                  </p>

                  <div className={`flex flex-wrap items-center gap-2 text-xs pt-1 ${
                    isLight ? 'text-gray-600' : 'text-white/60'
                  }`}>
                    <MapPin className="w-4 h-4 text-[#168A45] shrink-0" />
                    <span className={`font-medium ${isLight ? 'text-neutral-900' : 'text-white/90'}`}>
                      {evt.location}
                    </span>
                    {evt.venueDetails && (
                      <span className={isLight ? 'text-gray-400' : 'text-white/40'}>
                        · {evt.venueDetails}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action & Manage Column */}
                <div className="lg:col-span-3 flex flex-col items-stretch lg:items-end justify-center gap-2 pt-2 lg:pt-0">
                  <button
                    onClick={() => onOpenEvent(evt)}
                    className="w-full lg:w-auto px-6 py-3.5 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(22,138,69,0.3)] min-h-[44px] cursor-pointer hover:scale-105"
                  >
                    <Ticket className="w-4 h-4 text-[#63D98A]" />
                    <span>RESERVE SEAT</span>
                  </button>

                  <span className={`text-[10px] text-center lg:text-right font-mono ${
                    isLight ? 'text-gray-400' : 'text-white/40'
                  }`}>
                    {evt.registrationOpen ? '* Free admission with pre-registration' : 'Walk-in admission'}
                  </span>

                  {canManage && !evt.image && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-white/10 w-full justify-end">
                      <button
                        onClick={() => openEditModal(evt)}
                        className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 border cursor-pointer ${
                          isLight ? 'border-gray-300 text-gray-700 hover:bg-gray-100' : 'border-white/20 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <Edit3 className="w-3 h-3 text-[#168A45]" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(evt.id, evt.title)}
                        className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-red-500 hover:bg-red-500/10 border border-red-500/30 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Security & Protocol Notice */}
        <div className={`p-6 border text-xs flex items-start gap-3 mt-8 ${
          isLight ? 'bg-white border-gray-200 text-gray-600 shadow-xs' : 'bg-white/5 border-white/10 text-white/60'
        }`}>
          <ShieldCheck className="w-4 h-4 text-[#168A45] shrink-0 mt-0.5" />
          <p>
            Convocation and service locations are subject to regional venue arrangements. Please register in advance to receive official event updates, prayer protocols, and seat confirmations.
          </p>
        </div>
      </section>
    </div>
  );
};
