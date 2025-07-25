import { v4 as uuidv4 } from 'uuid';

// Core data schema for timeline events
export const TimelineEventSchema = {
  // Unique identifier for the event
  id: String,
  
  // Which timeline track this event belongs to
  timeline_id: String,
  
  // Temporal information
  start_date: Date,
  end_date: Date, // null for point events
  
  // Basic event information
  title: String,
  description: String,
  category: String,
  
  // Visual and interaction properties
  color: String,
  icon: String,
  
  // Chart data references
  chart_data: Object, // { type: 'line', data: [...], config: {...} }
  chart_position: Object, // { x: 0, y: 0, z: 0 } for 3D positioning
  
  // AI and data source tracking
  ai_generated: Boolean,
  confidence_score: Number, // 0-1
  source: String,
  
  // Additional metadata
  metadata: Object,
  tags: Array,
  
  // Timestamps for data management
  created_at: Date,
  updated_at: Date
};

// Timeline track schema
export const TimelineTrackSchema = {
  id: String,
  name: String,
  description: String,
  color: String,
  position: Object, // { x: 0, y: 0, z: 0 } for 3D positioning
  visible: Boolean,
  created_at: Date,
  updated_at: Date
};

// Factory functions for creating new entities
export const createTimelineEvent = (data = {}) => {
  const now = new Date();
  return {
    id: data.id || uuidv4(),
    timeline_id: data.timeline_id || 'default',
    start_date: data.start_date ? new Date(data.start_date) : now,
    end_date: data.end_date ? new Date(data.end_date) : null,
    title: data.title || 'Untitled Event',
    description: data.description || '',
    category: data.category || 'general',
    color: data.color || '#007acc',
    icon: data.icon || null,
    chart_data: data.chart_data || null,
    chart_position: data.chart_position || { x: 0, y: 0, z: 0 },
    ai_generated: data.ai_generated || false,
    confidence_score: data.confidence_score || 1.0,
    source: data.source || 'manual',
    metadata: data.metadata || {},
    tags: data.tags || [],
    created_at: data.created_at || now,
    updated_at: data.updated_at || now
  };
};

export const createTimelineTrack = (data = {}) => {
  const now = new Date();
  return {
    id: data.id || uuidv4(),
    name: data.name || 'New Timeline',
    description: data.description || '',
    color: data.color || '#666666',
    position: data.position || { x: 0, y: 0, z: 0 },
    visible: data.visible !== undefined ? data.visible : true,
    created_at: data.created_at || now,
    updated_at: data.updated_at || now
  };
};

// Data validation helpers
export const validateTimelineEvent = (event) => {
  const errors = [];
  
  if (!event.id) errors.push('Event ID is required');
  if (!event.timeline_id) errors.push('Timeline ID is required');
  if (!event.start_date || !(event.start_date instanceof Date)) {
    errors.push('Valid start date is required');
  }
  if (event.end_date && !(event.end_date instanceof Date)) {
    errors.push('End date must be a valid Date object');
  }
  if (!event.title || event.title.trim().length === 0) {
    errors.push('Event title is required');
  }
  if (event.confidence_score < 0 || event.confidence_score > 1) {
    errors.push('Confidence score must be between 0 and 1');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateTimelineTrack = (track) => {
  const errors = [];
  
  if (!track.id) errors.push('Track ID is required');
  if (!track.name || track.name.trim().length === 0) {
    errors.push('Track name is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};