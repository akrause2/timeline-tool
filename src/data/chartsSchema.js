import { v4 as uuidv4 } from 'uuid';

// Schema for independent D3 charts that float above timelines
export const ChartSchema = {
  id: String,
  
  // Basic properties
  title: String,
  description: String,
  chart_type: String, // 'line', 'bar', 'scatter', 'heatmap', 'area', 'pie'
  
  // 3D Spatial positioning (above timeline on XY plane)
  position: {
    x: Number, // X position in 3D world space
    y: Number, // Y position (height above timeline)  
    z: Number  // Z position in 3D world space
  },
  
  // Chart dimensions
  dimensions: {
    width: Number,  // Chart width in 3D units
    height: Number, // Chart height in 3D units
    depth: Number   // For 3D chart effects (optional)
  },
  
  // Temporal scope (what time range this chart covers)
  time_range: {
    start_date: Date,
    end_date: Date,
    auto_adjust: Boolean // Whether to auto-adjust to visible timeline range
  },
  
  // D3 chart configuration
  d3_config: {
    data_source: String, // 'events', 'external_api', 'manual', 'computed'
    data_query: Object,  // How to extract data (e.g., count events by category)
    visual_config: {
      colors: Array,
      scales: Object,
      axes: Object,
      animations: Object
    },
    interactivity: {
      hover_enabled: Boolean,
      click_enabled: Boolean,
      zoom_enabled: Boolean,
      pan_enabled: Boolean
    }
  },
  
  // Data (can be static or dynamically generated)
  data_points: Array, // [{x: date, y: value, category: 'war', ...}, ...]
  data_last_updated: Date,
  
  // 3D rendering properties
  render_config: {
    texture_resolution: { width: Number, height: Number },
    cached_texture: null, // Canvas texture for Three.js plane
    needs_refresh: Boolean,
    transparency: Number, // 0.0 to 1.0
    always_face_camera: Boolean // Billboard effect
  },
  
  // Visibility and interaction
  visible: Boolean,
  interactive_in_3d: Boolean,
  track_association: String, // Optional: 'all', 'track_id', null
  
  // AI and automation
  ai_generated: Boolean,
  auto_update: Boolean, // Whether to refresh data automatically
  update_frequency: String, // 'real_time', 'hourly', 'daily', 'manual'
  
  // Metadata
  tags: Array,
  source: String,
  created_at: Date,
  updated_at: Date
};

// Factory function for creating charts
export const createChart = (data = {}) => {
  const now = new Date();
  return {
    id: data.id || uuidv4(),
    
    title: data.title || 'Untitled Chart',
    description: data.description || '',
    chart_type: data.chart_type || 'line',
    
    position: {
      x: data.position?.x || 0,
      y: data.position?.y || 30, // Default height above timeline
      z: data.position?.z || 0
    },
    
    dimensions: {
      width: data.dimensions?.width || 200,
      height: data.dimensions?.height || 150,
      depth: data.dimensions?.depth || 5
    },
    
    time_range: {
      start_date: data.time_range?.start_date || new Date(Date.now() - 365*24*60*60*1000),
      end_date: data.time_range?.end_date || new Date(),
      auto_adjust: data.time_range?.auto_adjust !== undefined ? data.time_range.auto_adjust : true
    },
    
    d3_config: {
      data_source: data.d3_config?.data_source || 'events',
      data_query: data.d3_config?.data_query || {},
      visual_config: {
        colors: data.d3_config?.visual_config?.colors || ['#007bff', '#28a745', '#ffc107'],
        scales: data.d3_config?.visual_config?.scales || {},
        axes: data.d3_config?.visual_config?.axes || {},
        animations: data.d3_config?.visual_config?.animations || { duration: 1000 }
      },
      interactivity: {
        hover_enabled: data.d3_config?.interactivity?.hover_enabled !== undefined ? data.d3_config.interactivity.hover_enabled : true,
        click_enabled: data.d3_config?.interactivity?.click_enabled !== undefined ? data.d3_config.interactivity.click_enabled : true,
        zoom_enabled: data.d3_config?.interactivity?.zoom_enabled !== undefined ? data.d3_config.interactivity.zoom_enabled : false,
        pan_enabled: data.d3_config?.interactivity?.pan_enabled !== undefined ? data.d3_config.interactivity.pan_enabled : false
      }
    },
    
    data_points: data.data_points || [],
    data_last_updated: data.data_last_updated || now,
    
    render_config: {
      texture_resolution: {
        width: data.render_config?.texture_resolution?.width || 512,
        height: data.render_config?.texture_resolution?.height || 384
      },
      cached_texture: null,
      needs_refresh: true,
      transparency: data.render_config?.transparency || 0.9,
      always_face_camera: data.render_config?.always_face_camera !== undefined ? data.render_config.always_face_camera : true
    },
    
    visible: data.visible !== undefined ? data.visible : true,
    interactive_in_3d: data.interactive_in_3d !== undefined ? data.interactive_in_3d : true,
    track_association: data.track_association || null,
    
    ai_generated: data.ai_generated || false,
    auto_update: data.auto_update || false,
    update_frequency: data.update_frequency || 'manual',
    
    tags: data.tags || [],
    source: data.source || 'manual',
    created_at: data.created_at || now,
    updated_at: data.updated_at || now
  };
};

// Chart type definitions with default configurations
export const ChartTypes = {
  line: {
    label: 'Line Chart',
    description: 'Show trends over time',
    icon: '📈',
    default_query: { type: 'events_over_time', aggregation: 'count' }
  },
  bar: {
    label: 'Bar Chart', 
    description: 'Compare categories or values',
    icon: '📊',
    default_query: { type: 'events_by_category', aggregation: 'count' }
  },
  scatter: {
    label: 'Scatter Plot',
    description: 'Show relationships between variables',
    icon: '⚬',
    default_query: { type: 'custom_data', aggregation: 'none' }
  },
  area: {
    label: 'Area Chart',
    description: 'Show cumulative values over time',
    icon: '🏔️',
    default_query: { type: 'cumulative_events', aggregation: 'sum' }
  },
  heatmap: {
    label: 'Heat Map',
    description: 'Show intensity across time and categories',
    icon: '🔥',
    default_query: { type: 'events_intensity', aggregation: 'density' }
  },
  pie: {
    label: 'Pie Chart',
    description: 'Show proportions of categories',
    icon: '🥧',
    default_query: { type: 'category_distribution', aggregation: 'percentage' }
  }
};

// Data source configurations
export const DataSources = {
  events: {
    label: 'Timeline Events',
    description: 'Generate charts from your timeline events',
    queries: {
      events_over_time: 'Count events in time buckets',
      events_by_category: 'Group events by category',
      events_by_track: 'Group events by timeline track',
      cumulative_events: 'Running total of events',
      events_intensity: 'Event density heatmap'
    }
  },
  external_api: {
    label: 'External Data',
    description: 'Pull data from external APIs',
    queries: {
      stock_prices: 'Financial market data',
      weather_data: 'Historical weather information',
      population_data: 'Demographic statistics',
      economic_indicators: 'GDP, inflation, etc.'
    }
  },
  manual: {
    label: 'Manual Data',
    description: 'Manually entered data points',
    queries: {}
  },
  computed: {
    label: 'Computed Data',
    description: 'Data derived from calculations',
    queries: {
      event_correlations: 'Statistical correlations between events',
      trend_analysis: 'Trend calculations',
      predictive_models: 'AI-generated predictions'
    }
  }
};

// Validation
export const validateChart = (chart) => {
  const errors = [];
  
  if (!chart.title || chart.title.trim().length === 0) {
    errors.push('Chart title is required');
  }
  
  if (!ChartTypes[chart.chart_type]) {
    errors.push('Invalid chart type');
  }
  
  if (chart.dimensions.width <= 0 || chart.dimensions.height <= 0) {
    errors.push('Chart dimensions must be positive');
  }
  
  if (chart.render_config.transparency < 0 || chart.render_config.transparency > 1) {
    errors.push('Transparency must be between 0 and 1');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};