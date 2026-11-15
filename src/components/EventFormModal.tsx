import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  FileText, 
  Sparkles, 
  Check, 
  Trash2, 
  Link as LinkIcon 
} from 'lucide-react';
import { EventItem } from '../types';
import { useEvents } from '../context/EventsContext';
import { useCMS } from '../context/CMSContext';
import { useTheme } from '../context/ThemeContext';
import { AnimatedImage } from './AnimatedImage';

const DEFAULT_CATEGORIES = [
  'Conference',
  'Leadership',
  'Revival Night',
  'Training',
  'Prophetic Service',
  'Healing & Deliverance',
  'Apostolic Gathering',
  'All-Night Vigil',
];

export const EventFormModal: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { isFormModalOpen, editingEvent, closeFormModal, addEvent, updateEvent } = useEvents();
  const { uploadImage } = useCMS();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [venueDetails, setVenueDetails] = useState('');
  const [themeOrScripture, setThemeOrScripture] = useState('Jeremiah 1:10');
  const [speaker, setSpeaker] = useState('Prophet John Lord');
  const [description, setDescription] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(true);
  
  // Image handling
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Populate form if editing
  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title || '');
      if (DEFAULT_CATEGORIES.includes(editingEvent.category)) {
        setCategory(editingEvent.category);
        setCustomCategory('');
      } else {
        setCategory('Custom');
        setCustomCategory(editingEvent.category);
      }
      setDate(editingEvent.date || '');
      setTime(editingEvent.time || '');
      setLocation(editingEvent.location || '');
      setVenueDetails(editingEvent.venueDetails || '');
      setThemeOrScripture(editingEvent.themeOrScripture || 'Jeremiah 1:10');
      setSpeaker(editingEvent.speaker || 'Prophet John Lord');
      setDescription(editingEvent.description || '');
      setRegistrationOpen(editingEvent.registrationOpen !== false);
      setImagePreview(editingEvent.image || '');
      setImageUrlInput(editingEvent.image && !editingEvent.image.startsWith('data:') ? editingEvent.image : '');
    } else {
      // Reset defaults
      setTitle('');
      setCategory(DEFAULT_CATEGORIES[0]);
      setCustomCategory('');
      setDate('');
      setTime('6:00 PM (GMT)');
      setLocation('United Conquers Church / Ministry Auditorium');
      setVenueDetails('Main Sanctuary & Worldwide Online Broadcast');
      setThemeOrScripture('Jeremiah 1:10');
      setSpeaker('Prophet John Lord');
      setDescription('');
      setRegistrationOpen(true);
      setImagePreview('');
      setImageUrlInput('');
    }
    setErrorMsg('');
  }, [editingEvent, isFormModalOpen]);

  if (!isFormModalOpen) return null;

  const handleFileUpload = async (file: File) => {
    const res = await uploadImage(file);
    if (!res.ok || !res.url) {
      setErrorMsg(res.error || 'Failed to upload flyer image.');
      return;
    }
    setImagePreview(res.url);
    setImageUrlInput('');
    setErrorMsg('');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (imageUrlInput.trim()) {
      setImagePreview(imageUrlInput.trim());
      setErrorMsg('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter an event title.');
      return;
    }
    if (!date.trim()) {
      setErrorMsg('Please specify the event date.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Please specify the location or online venue.');
      return;
    }

    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'General Gathering') : category;

    const eventPayload = {
      title: title.trim(),
      category: finalCategory,
      date: date.trim(),
      time: time.trim() || 'TBA',
      location: location.trim(),
      venueDetails: venueDetails.trim(),
      themeOrScripture: themeOrScripture.trim(),
      speaker: speaker.trim() || 'Prophet John Lord',
      description: description.trim(),
      registrationOpen,
      image: imagePreview.trim() || undefined,
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, eventPayload);
    } else {
      addEvent(eventPayload);
    }

    closeFormModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className={`relative w-full max-w-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92svh] sm:max-h-[92vh] transition-colors ${
        isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#050505] border-white/10 text-[#F5F7F5]'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-4 sm:px-7 py-3.5 sm:py-4 border-b shrink-0 ${
          isLight ? 'bg-[#0B2418] text-white border-emerald-900' : 'bg-[#0B2418]/90 text-white border-white/10'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#168A45]/30 flex items-center justify-center border border-[#63D98A]/30 shrink-0">
              <Sparkles className="w-4 h-4 text-[#63D98A]" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold tracking-wider uppercase text-white block truncate">
                {editingEvent ? 'Edit Ministerial Event' : 'Create & Publish Ministerial Event'}
              </span>
              <p className="text-[10px] text-white/70 font-light truncate">
                Add dates, locations, description, and upload official event flyer banner
              </p>
            </div>
          </div>
          
          <button
            onClick={closeFormModal}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-7 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs rounded">
              {errorMsg}
            </div>
          )}

          {/* SECTION 1: Event Flyer / Banner Upload */}
          <div className="space-y-2">
            <label className={`block text-xs uppercase tracking-wider font-semibold ${
              isLight ? 'text-neutral-900' : 'text-white'
            }`}>
              Event Flyer / Poster Image
            </label>

            {imagePreview ? (
              <div className="relative border rounded overflow-hidden group">
                <div className="relative aspect-[21/9] sm:aspect-[16/7] w-full bg-black/60 overflow-hidden flex items-center justify-center">
                  <AnimatedImage
                    src={imagePreview}
                    alt="Event flyer preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                  
                  <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between text-white pointer-events-none">
                    <span className="text-xs font-mono font-medium drop-shadow bg-black/60 px-2 py-0.5 rounded">
                      Flyer Attached
                    </span>
                  </div>
                </div>

                <div className="p-2.5 flex items-center justify-between bg-black/80 text-white text-xs border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Change Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setImageUrlInput('');
                    }}
                    className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Flyer</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`p-6 sm:p-8 border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragOver
                    ? 'border-[#168A45] bg-[#168A45]/10'
                    : isLight
                    ? 'border-gray-300 bg-gray-50/60 hover:border-[#168A45] hover:bg-gray-50'
                    : 'border-white/15 bg-white/5 hover:border-[#63D98A]/50 hover:bg-white/10'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 rounded-full bg-[#168A45]/20 flex items-center justify-center text-[#168A45] dark:text-[#63D98A]">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-semibold">
                    Click to upload event flyer or drag & drop image here
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Supports PNG, JPG, JPEG, WEBP (Max 5MB)
                  </div>
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            {/* URL Fallback toggle */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] text-[#168A45] dark:text-[#63D98A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LinkIcon className="w-3 h-3" />
                <span>{showUrlInput ? 'Hide image URL input' : 'Or paste flyer image URL from web'}</span>
              </button>
            </div>

            {showUrlInput && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <input
                  type="url"
                  placeholder="https://example.com/event-flyer.jpg"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className={`flex-1 px-3 py-2.5 border text-base sm:text-xs outline-none focus:border-[#168A45] font-mono min-h-[44px] ${
                    isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black/60 border-white/20 text-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2.5 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase tracking-wider min-h-[44px] cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: Event Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-white/10">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">
                Event Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 3 Days of Supernatural Encounter & Prophetic Impartation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-3.5 py-2.5 border text-base sm:text-sm outline-none focus:border-[#168A45] font-serif-luxury min-h-[44px] ${
                  isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black/60 border-white/20 text-white'
                }`}
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">
                Event Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-3 py-2.5 border text-base sm:text-xs outline-none focus:border-[#168A45] min-h-[44px] ${
                  isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0B2418]/40 border-white/20 text-white'
                }`}
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className={isLight ? 'bg-white text-gray-900' : 'bg-neutral-900 text-white'}>
                    {cat}
                  </option>
                ))}
                <option value="Custom" className={isLight ? 'bg-white text-gray-900' : 'bg-neutral-900 text-white'}>
                  + Custom Category...
                </option>
              </select>

              {category === 'Custom' && (
                <input
                  type="text"
                  placeholder="Enter custom category name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className={`w-full mt-1.5 px-3 py-2.5 border text-base sm:text-xs outline-none focus:border-[#168A45] min-h-[44px] ${
                    isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black/60 border-white/20 text-white'
                  }`}
                />
              )}
            </div>

            {/* Scripture or Theme */}
            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">
                Biblical Theme or Scripture
              </label>
              <input
                type="text"
                placeholder="e.g. Jeremiah 1:10 or Divine Restoration"
                value={themeOrScripture}
                onChange={(e) => setThemeOrScripture(e.target.value)}
                className={`w-full px-3 py-2.5 border text-base sm:text-xs outline-none focus:border-[#168A45] min-h-[44px] ${
                  isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black/60 border-white/20 text-white'
                }`}
              />
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">
                Date *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. November 28 - 30, 2026"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 border text-base sm:text-xs outline-none focus:border-[#168A45] min-h-[44px] ${
                    isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black/60 border-white/20 text-white'
                  }`}
                />
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Time */}
            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">
                Time *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. 6:00 PM Daily (GMT)"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 border text-base sm:text-xs outline-none focus:border-[#168A45] min-h-[44px] ${
                    isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black/60 border-white/20 text-white'
                  }`}
                />
                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">
                Primary Location *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. United Conquers Church Auditorium"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 border text-base sm:text-xs outline-none focus:border-[#168A45] min-h-[44px] ${
                    isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black/60 border-white/20 text-white'
                  }`}
                />
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Venue Specifics / Webcast */}
            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">
                Venue Details / Access
              </label>
              <input
                type="text"
                placeholder="e.g. Main Hall & Worldwide YouTube Live"
                value={venueDetails}
                onChange={(e) => setVenueDetails(e.target.value)}
                className={`w-full px-3 py-2.5 border text-base sm:text-xs outline-none focus:border-[#168A45] min-h-[44px] ${
                  isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black/60 border-white/20 text-white'
                }`}
              />
            </div>

            {/* Minister */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">
                Minister / Host
              </label>
              <input
                type="text"
                placeholder="Prophet John Lord"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                className={`w-full px-3 py-2.5 border text-base sm:text-xs outline-none focus:border-[#168A45] min-h-[44px] ${
                  isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black/60 border-white/20 text-white'
                }`}
              />
            </div>

            {/* Description */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-gray-700 dark:text-gray-300">
                Event Description & Ministry Focus
              </label>
              <textarea
                rows={4}
                placeholder="Write the full event details, spiritual focus, what attendees should prepare for, and prophetic expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-3.5 py-2.5 border text-base sm:text-xs leading-relaxed outline-none focus:border-[#168A45] ${
                  isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black/60 border-white/20 text-white'
                }`}
              />
            </div>

            {/* Registration status */}
            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                <input
                  type="checkbox"
                  checked={registrationOpen}
                  onChange={(e) => setRegistrationOpen(e.target.checked)}
                  className="w-4 h-4 text-[#168A45] rounded border-gray-300 focus:ring-[#168A45]"
                />
                <span className={isLight ? 'text-gray-700' : 'text-gray-300'}>
                  Keep seat reservations & attendee registration open
                </span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
            <button
              type="button"
              onClick={closeFormModal}
              className={`w-full sm:w-auto px-5 py-2.5 text-xs font-semibold uppercase tracking-wider min-h-[44px] transition-colors cursor-pointer ${
                isLight ? 'text-gray-600 hover:text-gray-900' : 'text-white/60 hover:text-white'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg min-h-[44px] transition-transform active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#63D98A]" />
              <span>{editingEvent ? 'Save Changes' : 'Publish Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
