import React, { createContext, useContext, useState } from 'react';
import type { EventItem } from '../types/index.ts';
import { useCMS } from './CMSContext.tsx';
import { createDefaultCMSContent } from '../data/cmsDefaults.ts';

interface EventsContextType {
  events: EventItem[];
  addEvent: (eventData: Omit<EventItem, 'id'>) => EventItem;
  updateEvent: (id: string, updatedData: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
  resetEvents: () => void;
  manageMode: boolean;
  setManageMode: React.Dispatch<React.SetStateAction<boolean>>;
  editingEvent: EventItem | null;
  isFormModalOpen: boolean;
  openCreateModal: () => void;
  openEditModal: (event: EventItem) => void;
  closeFormModal: () => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { content, updateSection, isAuthenticated } = useCMS();
  const events = content.events;

  const [manageMode, setManageMode] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);

  const addEvent = (eventData: Omit<EventItem, 'id'>): EventItem => {
    const newId = `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newEvent: EventItem = {
      ...eventData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    const nextEvents = [newEvent, ...events];
    if (isAuthenticated) {
      void updateSection('events', nextEvents);
    }
    return newEvent;
  };

  const updateEvent = (id: string, updatedData: Partial<EventItem>) => {
    const nextEvents = events.map((evt) => (evt.id === id ? { ...evt, ...updatedData } : evt));
    if (isAuthenticated) {
      void updateSection('events', nextEvents);
    }
  };

  const deleteEvent = (id: string) => {
    const nextEvents = events.filter((evt) => evt.id !== id);
    if (isAuthenticated) {
      void updateSection('events', nextEvents);
    }
  };

  const resetEvents = () => {
    const defaults = createDefaultCMSContent().events;
    if (isAuthenticated) {
      void updateSection('events', defaults);
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (event: EventItem) => {
    setEditingEvent(event);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setEditingEvent(null);
    setIsFormModalOpen(false);
  };

  return (
    <EventsContext.Provider
      value={{
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        resetEvents,
        manageMode,
        setManageMode,
        editingEvent,
        isFormModalOpen,
        openCreateModal,
        openEditModal,
        closeFormModal,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = (): EventsContextType => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};
