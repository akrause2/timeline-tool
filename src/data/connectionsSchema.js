import { v4 as uuidv4 } from 'uuid';

// Schema for connections between timeline events
export const ConnectionSchema = {
  id: String,
  source_event_id: String,
  target_event_id: String,
  
  // Connection metadata
  relationship_type: String, // 'causes', 'influences', 'leads_to', 'related', 'conflicts_with'
  strength: Number, // 0.1 to 1.0 (affects line thickness/opacity)
  confidence: Number, // 0.1 to 1.0 (AI confidence in this connection)
  
  // Visual properties
  color: String,
  line_style: String, // 'solid', 'dashed', 'dotted'
  curve_height: Number, // How high the arc goes in 3D space
  
  // Content
  description: String,
  evidence: Array, // Supporting evidence/sources
  
  // 3D rendering properties
  geometry_cache: Object, // Cached Three.js curve geometry
  animation_duration: Number, // For animated connections
  
  // AI and source tracking
  ai_generated: Boolean,
  source: String,
  
  // Timestamps
  created_at: Date,
  updated_at: Date
};

// Factory function for creating connections
export const createConnection = (data = {}) => {
  const now = new Date();
  return {
    id: data.id || uuidv4(),
    source_event_id: data.source_event_id || '',
    target_event_id: data.target_event_id || '',
    
    relationship_type: data.relationship_type || 'related',
    strength: data.strength || 0.5,
    confidence: data.confidence || 1.0,
    
    color: data.color || '#6c757d',
    line_style: data.line_style || 'solid',
    curve_height: data.curve_height || 20,
    
    description: data.description || '',
    evidence: data.evidence || [],
    
    geometry_cache: null,
    animation_duration: data.animation_duration || 1000,
    
    ai_generated: data.ai_generated || false,
    source: data.source || 'manual',
    
    created_at: data.created_at || now,
    updated_at: data.updated_at || now
  };
};

// Validation
export const validateConnection = (connection) => {
  const errors = [];
  
  if (!connection.source_event_id) errors.push('Source event is required');
  if (!connection.target_event_id) errors.push('Target event is required');
  if (connection.source_event_id === connection.target_event_id) {
    errors.push('Source and target cannot be the same event');
  }
  if (connection.strength < 0.1 || connection.strength > 1.0) {
    errors.push('Strength must be between 0.1 and 1.0');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Connection types with visual properties
export const ConnectionTypes = {
  causes: {
    label: 'Causes',
    color: '#dc3545',
    icon: '→',
    description: 'One event directly causes another'
  },
  influences: {
    label: 'Influences',
    color: '#ffc107',
    icon: '⟿',
    description: 'One event influences or contributes to another'
  },
  leads_to: {
    label: 'Leads To',
    color: '#28a745',
    icon: '⇒',
    description: 'One event leads to or results in another'
  },
  related: {
    label: 'Related',
    color: '#6c757d',
    icon: '↔',
    description: 'Events are related but causality is unclear'
  },
  conflicts_with: {
    label: 'Conflicts With',
    color: '#e74c3c',
    icon: '⚔',
    description: 'Events are in opposition or conflict'
  },
  concurrent: {
    label: 'Concurrent',
    color: '#17a2b8',
    icon: '‖',
    description: 'Events happen at the same time'
  }
};