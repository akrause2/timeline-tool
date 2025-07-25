// Centralized state management for the timeline tool
class StateManager {
    constructor() {
      this.state = {
        // Data state
        events: new Map(), // id -> event object
        tracks: new Map(), // id -> track object
        
        // UI state
        activeTab: 'table',
        timelineMode: '2d', // '2d' or '3d'
        selectedEvents: new Set(),
        selectedTracks: new Set(),
        
        // Timeline view state
        timelineView: {
          zoom: 1,
          centerTime: new Date(),
          visibleTimeRange: {
            start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
            end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)    // 1 year from now
          }
        },
        
        // Table state
        tableState: {
          sortColumn: 'start_date',
          sortDirection: 'asc',
          filterText: '',
          selectedRows: new Set()
        }
      };
      
      this.listeners = new Map(); // event -> Set of callback functions
      this.history = []; // for undo/redo
      this.historyIndex = -1;
    }
    
    // Event system for state changes
    on(event, callback) {
      if (!this.listeners.has(event)) {
        this.listeners.set(event, new Set());
      }
      this.listeners.get(event).add(callback);
      
      // Return unsubscribe function
      return () => {
        this.listeners.get(event)?.delete(callback);
      };
    }
    
    emit(event, data) {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.forEach(callback => callback(data));
      }
    }
    
    // State getters
    getState() {
      return { ...this.state };
    }
    
    getEvents() {
      return Array.from(this.state.events.values());
    }
    
    getTracks() {
      return Array.from(this.state.tracks.values());
    }
    
    getEvent(id) {
      return this.state.events.get(id);
    }
    
    getTrack(id) {
      return this.state.tracks.get(id);
    }
    
    getEventsForTrack(trackId) {
      return this.getEvents().filter(event => event.timeline_id === trackId);
    }
    
    // State mutations with history tracking
    setState(newState, skipHistory = false) {
      if (!skipHistory) {
        this.saveToHistory();
      }
      
      const oldState = { ...this.state };
      this.state = { ...this.state, ...newState };
      
      this.emit('stateChanged', {
        oldState,
        newState: this.state,
        changes: newState
      });
    }
    
    // Event operations
    addEvent(event) {
      this.saveToHistory();
      event.updated_at = new Date();
      this.state.events.set(event.id, event);
      this.emit('eventAdded', event);
      this.emit('dataChanged', { type: 'event', action: 'add', data: event });
    }
    
    updateEvent(id, updates) {
      const event = this.state.events.get(id);
      if (event) {
        this.saveToHistory();
        const updatedEvent = { ...event, ...updates, updated_at: new Date() };
        this.state.events.set(id, updatedEvent);
        this.emit('eventUpdated', { id, event: updatedEvent, updates });
        this.emit('dataChanged', { type: 'event', action: 'update', data: updatedEvent });
      }
    }
    
    deleteEvent(id) {
      const event = this.state.events.get(id);
      if (event) {
        this.saveToHistory();
        this.state.events.delete(id);
        this.state.selectedEvents.delete(id);
        this.emit('eventDeleted', { id, event });
        this.emit('dataChanged', { type: 'event', action: 'delete', data: event });
      }
    }
    
    // Track operations
    addTrack(track) {
      this.saveToHistory();
      track.updated_at = new Date();
      this.state.tracks.set(track.id, track);
      this.emit('trackAdded', track);
      this.emit('dataChanged', { type: 'track', action: 'add', data: track });
    }
    
    updateTrack(id, updates) {
      const track = this.state.tracks.get(id);
      if (track) {
        this.saveToHistory();
        const updatedTrack = { ...track, ...updates, updated_at: new Date() };
        this.state.tracks.set(id, updatedTrack);
        this.emit('trackUpdated', { id, track: updatedTrack, updates });
        this.emit('dataChanged', { type: 'track', action: 'update', data: updatedTrack });
      }
    }
    
    deleteTrack(id) {
      const track = this.state.tracks.get(id);
      if (track) {
        this.saveToHistory();
        
        // Delete all events in this track
        const eventsToDelete = this.getEventsForTrack(id);
        eventsToDelete.forEach(event => {
          this.state.events.delete(event.id);
          this.state.selectedEvents.delete(event.id);
        });
        
        this.state.tracks.delete(id);
        this.state.selectedTracks.delete(id);
        
        this.emit('trackDeleted', { id, track, deletedEvents: eventsToDelete });
        this.emit('dataChanged', { type: 'track', action: 'delete', data: track });
      }
    }
    
    // Selection operations
    selectEvent(id) {
      this.state.selectedEvents.add(id);
      this.emit('selectionChanged', {
        selectedEvents: Array.from(this.state.selectedEvents),
        selectedTracks: Array.from(this.state.selectedTracks)
      });
    }
    
    deselectEvent(id) {
      this.state.selectedEvents.delete(id);
      this.emit('selectionChanged', {
        selectedEvents: Array.from(this.state.selectedEvents),
        selectedTracks: Array.from(this.state.selectedTracks)
      });
    }
    
    clearSelection() {
      this.state.selectedEvents.clear();
      this.state.selectedTracks.clear();
      this.emit('selectionChanged', {
        selectedEvents: [],
        selectedTracks: []
      });
    }
    
    // Tab switching with state preservation
    switchTab(tabName) {
      const oldTab = this.state.activeTab;
      this.state.activeTab = tabName;
      this.emit('tabChanged', { from: oldTab, to: tabName });
    }
    
    // Timeline view operations
    setTimelineView(updates) {
      this.state.timelineView = { ...this.state.timelineView, ...updates };
      this.emit('timelineViewChanged', this.state.timelineView);
    }
    
    // History operations for undo/redo
    saveToHistory() {
      // Remove any future history if we're not at the end
      this.history = this.history.slice(0, this.historyIndex + 1);
      
      // Add current state to history
      this.history.push(JSON.parse(JSON.stringify({
        events: Array.from(this.state.events.entries()),
        tracks: Array.from(this.state.tracks.entries())
      })));
      
      this.historyIndex = this.history.length - 1;
      
      // Limit history size
      if (this.history.length > 50) {
        this.history.shift();
        this.historyIndex--;
      }
    }
    
    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.restoreFromHistory();
      }
    }
    
    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.restoreFromHistory();
      }
    }
    
    restoreFromHistory() {
      const historyState = this.history[this.historyIndex];
      this.state.events = new Map(historyState.events);
      this.state.tracks = new Map(historyState.tracks);
      this.emit('historyRestored', { events: this.getEvents(), tracks: this.getTracks() });
      this.emit('dataChanged', { type: 'history', action: 'restore' });
    }
    
    canUndo() {
      return this.historyIndex > 0;
    }
    
    canRedo() {
      return this.historyIndex < this.history.length - 1;
    }
  }
  
  // Create and export singleton instance
  export const stateManager = new StateManager();