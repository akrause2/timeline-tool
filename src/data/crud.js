// CRUD operations for timeline data
import { validateTimelineEvent, validateTimelineTrack } from './schema.js';

export class DataManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
  }

  // Bulk operations
  bulkCreateEvents(events) {
    const results = { success: [], errors: [] };
    
    events.forEach((eventData, index) => {
      try {
        const validation = validateTimelineEvent(eventData);
        if (!validation.isValid) {
          results.errors.push({
            index,
            errors: validation.errors,
            data: eventData
          });
          return;
        }
        
        this.stateManager.addEvent(eventData);
        results.success.push(eventData);
      } catch (error) {
        results.errors.push({
          index,
          errors: [error.message],
          data: eventData
        });
      }
    });
    
    return results;
  }

  bulkCreateTracks(tracks) {
    const results = { success: [], errors: [] };
    
    tracks.forEach((trackData, index) => {
      try {
        const validation = validateTimelineTrack(trackData);
        if (!validation.isValid) {
          results.errors.push({
            index,
            errors: validation.errors,
            data: trackData
          });
          return;
        }
        
        this.stateManager.addTrack(trackData);
        results.success.push(trackData);
      } catch (error) {
        results.errors.push({
          index,
          errors: [error.message],
          data: trackData
        });
      }
    });
    
    return results;
  }

  // Search and filter operations
  searchEvents(query) {
    const events = this.stateManager.getEvents();
    const searchTerm = query.toLowerCase();
    
    return events.filter(event => 
      event.title.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm) ||
      event.category.toLowerCase().includes(searchTerm)
    );
  }

  getEventsByDateRange(startDate, endDate) {
    const events = this.stateManager.getEvents();
    
    return events.filter(event => {
      const eventStart = event.start_date;
      const eventEnd = event.end_date || event.start_date;
      
      return eventStart <= endDate && eventEnd >= startDate;
    });
  }

  getEventsByCategory(category) {
    return this.stateManager.getEvents().filter(event => event.category === category);
  }

  getEventsByTrack(trackId) {
    return this.stateManager.getEventsForTrack(trackId);
  }

  // Statistics
  getDataStats() {
    const events = this.stateManager.getEvents();
    const tracks = this.stateManager.getTracks();
    
    const categories = [...new Set(events.map(e => e.category))].filter(Boolean);
    const aiGenerated = events.filter(e => e.ai_generated).length;
    const dateRange = events.length > 0 ? {
      earliest: new Date(Math.min(...events.map(e => e.start_date))),
      latest: new Date(Math.max(...events.map(e => e.start_date)))
    } : null;
    
    return {
      totalEvents: events.length,
      totalTracks: tracks.length,
      categories: categories.length,
      aiGeneratedEvents: aiGenerated,
      manualEvents: events.length - aiGenerated,
      dateRange,
      eventsPerTrack: tracks.map(track => ({
        trackName: track.name,
        eventCount: this.getEventsByTrack(track.id).length
      }))
    };
  }
}