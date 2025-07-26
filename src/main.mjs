// @ts-nocheck
import { stateManager } from './state/stateManager.js';
// ... rest of your importsrenderTimeline() {
  const container = document.getElementById('timeline-container');
  
  container.innerHTML = `
    <div class="timeline-header" style="
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 20px 30px; 
      background: white; 
      border-bottom: 1px solid #e9ecef;
    ">
      <div>
        <h2 style="margin: 0; color: #333;">Timeline Visualization</h2>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
          Interactive 2D timeline with pan, zoom, and event selection
        </p>
      </div>
      
      <div class="timeline-controls" style="display: flex; gap: 10px;">
        <button id="zoom-fit-btn" style="
          padding: 8px 16px; 
          background: #007bff; 
          color: white; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer;
          font-size: 14px;
        ">
          Zoom to Fit
        </button>
        
        <button id="export-image-btn" style="
          padding: 8px 16px; 
          background: #28a745; 
          color: white; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer;
          font-size: 14px;
        ">
          Export Image
        </button>
        
        <div style="
          padding: 8px 12px; 
          background: #f8f9fa; 
          border: 1px solid #dee2e6; 
          border-radius: 4px; 
          font-size: 12px; 
          color: #666;
        ">
          <strong>Controls:</strong> Drag to pan • Scroll to zoom • Click events to select
        </div>
      </div>
    </div>
    
    <div id="timeline-canvas-container" style="
      flex: 1; 
      background: #fafafa; 
      position: relative;
      min-height: 400px;
    ">
      <!-- 2D Timeline will be rendered here -->
    </div>
    
    <div class="timeline-footer" style="
      padding: 15px 30px; 
      background: white; 
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #666;
    ">
      <divimport { stateManager } from './state/stateManager.js';
import { createTimelineEvent, createTimelineTrack } from './data/schema.js';
import { AdvancedTable } from './components/AdvancedTable.js';
import { Timeline2D } from './components/Timeline2D.js';

class TimelineApp {
constructor() {
  this.eventsTable = null;
  this.tracksTable = null;
  this.timeline2D = null;
  this.init();
}

renderConnectionsTable(container) {
  // For now, render a simple placeholder table for connections
  container.innerHTML = `
    <div style="text-align: center; padding: 40px; color: #666;">
      <div style="font-size: 48px; margin-bottom: 15px;">🔗</div>
      <h4 style="margin: 0 0 10px 0; color: #495057;">Event Connections</h4>
      <p style="margin: 0 0 15px 0; font-size: 14px;">
        Define relationships between events to create beautiful 3D arched lines
      </p>
      <button onclick="timelineApp.addSampleConnection()" style="
        padding: 10px 20px; 
        background: #28a745; 
        color: white; 
        border: none; 
        border-radius: 4px; 
        cursor: pointer;
        font-size: 14px;
      ">
        Add Sample Connection
      </button>
      <div style="margin-top: 20px; font-size: 12px; color: #999;">
        <strong>Coming in Phase 5:</strong> Full connections management with relationship types,<br>
        strength indicators, and visual 3D curve customization
      </div>
    </div>
  `;
}

renderChartsTable(container) {
  // For now, render a simple placeholder table for D3 charts
  container.innerHTML = `
    <div style="text-align: center; padding: 40px; color: #666;">
      <div style="font-size: 48px; margin-bottom: 15px;">📈</div>
      <h4 style="margin: 0 0 10px 0; color: #495057;">D3 Charts</h4>
      <p style="margin: 0 0 15px 0; font-size: 14px;">
        Independent data visualizations that float above your timelines in 3D space
      </p>
      <button onclick="timelineApp.addSampleChart()" style="
        padding: 10px 20px; 
        background: #17a2b8; 
        color: white; 
        border: none; 
        border-radius: 4px; 
        cursor: pointer;
        font-size: 14px;
      ">
        Add Sample Chart
      </button>
      <div style="margin-top: 20px; font-size: 12px; color: #999;">
        <strong>Coming in Phase 6:</strong> Full D3 chart creation with line, bar, scatter, heatmap,<br>
        and area charts. Position anywhere in 3D space with real-time data binding.
      </div>
    </div>
  `;
}

addSampleConnection() {
  alert('Sample Connection Created!\\n\\nThis will create a beautiful arched line between events in 3D space.\\n\\nFeatures coming in Phase 5:\\n• Relationship types (causes, influences, leads to)\\n• Strength indicators (line thickness)\\n• Interactive curve height adjustment\\n• AI-suggested connections');
}

addSampleChart() {
  alert('Sample Chart Created!\\n\\nThis will create a D3 visualization floating above your timeline.\\n\\nFeatures coming in Phase 6:\\n• Multiple chart types (line, bar, scatter, heatmap)\\n• Real-time data binding to events\\n• 3D positioning anywhere in space\\n• Interactive hover and zoom\\n• AI-generated insights');
}

init() {
  console.log('🚀 Timeline Tool Initializing...');
  
  // Initialize tab system
  this.setupTabSystem();
  
  // Initialize with sample data
  this.loadSampleData();
  
  // Setup state listeners
  this.setupStateListeners();
  
  // Initialize current tab
  this.renderActiveTab();
  
  console.log('✅ Timeline Tool Ready');
}

setupTabSystem() {
  const tabButtons = document.querySelectorAll('.tab-button');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      this.switchTab(tabName);
    });
  });
}

switchTab(tabName) {
  console.log(`🔄 Switching to ${tabName} tab`);
  
  // Update button states
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Update tab panes
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');
  
  // Update state manager
  stateManager.switchTab(tabName);
  
  // Render the active tab
  this.renderActiveTab();
}

renderActiveTab() {
  const activeTab = stateManager.state.activeTab;
  
  if (activeTab === 'table') {
    this.renderDataTable();
  } else if (activeTab === 'timeline') {
    this.renderTimeline();
  }
}

renderDataTable() {
  const container = document.getElementById('data-table-container');
  
  container.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h2 style="margin: 0; color: #333;">Timeline Data Management</h2>
      <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
        Manage your timeline tracks, events, connections, and D3 charts with advanced spreadsheet-like functionality
      </p>
    </div>
    
    <div style="margin-bottom: 30px;">
      <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; background: white;">
        <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e9ecef;">
          <h3 style="margin: 0; color: #495057; font-size: 16px;">📊 Timeline Tracks</h3>
        </div>
        <div id="tracks-table-container" style="padding: 20px;">
          <!-- Advanced tracks table will be rendered here -->
        </div>
      </div>
    </div>
    
    <div style="margin-bottom: 30px;">
      <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; background: white;">
        <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e9ecef;">
          <h3 style="margin: 0; color: #495057; font-size: 16px;">📅 Timeline Events</h3>
        </div>
        <div id="events-table-container" style="padding: 20px;">
          <!-- Advanced events table will be rendered here -->
        </div>
      </div>
    </div>
    
    <div style="margin-bottom: 30px;">
      <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; background: white;">
        <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e9ecef;">
          <h3 style="margin: 0; color: #495057; font-size: 16px;">🔗 Event Connections</h3>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Define relationships between events for 3D arched lines</p>
        </div>
        <div id="connections-table-container" style="padding: 20px;">
          <!-- Connections table will be rendered here -->
        </div>
      </div>
    </div>
    
    <div>
      <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; background: white;">
        <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e9ecef;">
          <h3 style="margin: 0; color: #495057; font-size: 16px;">📈 D3 Charts</h3>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Independent charts that float above timelines in 3D space</p>
        </div>
        <div id="charts-table-container" style="padding: 20px;">
          <!-- D3 Charts table will be rendered here -->
        </div>
      </div>
    </div>
  `;
  
  // Initialize advanced tables
  const tracksContainer = document.getElementById('tracks-table-container');
  const eventsContainer = document.getElementById('events-table-container');
  const connectionsContainer = document.getElementById('connections-table-container');
  const chartsContainer = document.getElementById('charts-table-container');
  
  try {
    this.tracksTable = new AdvancedTable(tracksContainer, stateManager, 'tracks');
    this.eventsTable = new AdvancedTable(eventsContainer, stateManager, 'events');
    
    // Add placeholder tables for connections and charts
    this.renderConnectionsTable(connectionsContainer);
    this.renderChartsTable(chartsContainer);
    
    console.log('✅ Advanced tables initialized');
  } catch (error) {
    console.error('❌ Error initializing tables:', error);
    // Fallback to simple table
    this.renderFallbackTable();
  }
}

renderFallbackTable() {
  console.log('📋 Rendering fallback simple table...');
  const tracksContainer = document.getElementById('tracks-table-container');
  const eventsContainer = document.getElementById('events-table-container');
  
  // Simple tracks table
  const tracks = stateManager.getTracks();
  tracksContainer.innerHTML = `
    <button onclick="timelineApp.addNewTrack()" style="margin-bottom: 15px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
      Add Track
    </button>
    <table style="width: 100%; border-collapse: collapse;">
      <thead style="background: #f8f9fa;">
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd;">Name</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Description</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Color</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Events</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${tracks.map(track => `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${track.name}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${track.description || '-'}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">
              <div style="width: 20px; height: 20px; background: ${track.color}; border-radius: 3px;"></div>
            </td>
            <td style="padding: 10px; border: 1px solid #ddd;">${stateManager.getEventsForTrack(track.id).length}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">
              <button onclick="timelineApp.deleteTrack('${track.id}')" style="padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  
  // Simple events table
  const events = stateManager.getEvents();
  eventsContainer.innerHTML = `
    <button onclick="timelineApp.addNewEvent()" style="margin-bottom: 15px; padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
      Add Event
    </button>
    <table style="width: 100%; border-collapse: collapse;">
      <thead style="background: #f8f9fa;">
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd;">Title</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Track</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Date</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Category</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${events.map(event => {
          const track = stateManager.getTrack(event.timeline_id);
          return `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">${event.title}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${track ? track.name : 'Unknown'}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${event.start_date.toLocaleDateString()}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${event.category}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">
                <button onclick="timelineApp.deleteEvent('${event.id}')" style="padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Delete</button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

      <div id="timeline-stats">
        Loading timeline data...
      </div>
      
      <div style="display: flex; gap: 15px;">
        <span id="selected-count">No events selected</span>
        <span>•</span>
        <span>Phase 3: 2D Timeline Renderer ✅</span>
      </div>
    </div>
  `;
  
  // Initialize 2D Timeline
  const canvasContainer = document.getElementById('timeline-canvas-container');
  
  try {
    this.timeline2D = new Timeline2D(canvasContainer, stateManager);
    
    // Setup timeline controls
    document.getElementById('zoom-fit-btn').addEventListener('click', () => {
      this.timeline2D.zoomToFit();
    });
    
    document.getElementById('export-image-btn').addEventListener('click', () => {
      this.timeline2D.exportAsImage();
    });
    
    // Update stats
    this.updateTimelineStats();
    
    // Listen for selection changes
    stateManager.on('timelineSelection', (data) => {
      this.updateSelectedCount(data.selectedEvents.length);
    });
    
    console.log('✅ 2D Timeline initialized');
  } catch (error) {
    console.error('❌ Error initializing 2D timeline:', error);
    this.renderTimelineFallback(canvasContainer);
  }
}

renderTimelineFallback(container) {
  const events = stateManager.getEvents();
  const tracks = stateManager.getTracks();
  
  container.innerHTML = `
    <div style="padding: 60px; text-align: center; color: #666;">
      <div style="font-size: 64px; margin-bottom: 20px;">📈</div>
      <h3 style="margin: 0 0 15px 0; color: #495057;">2D Timeline Renderer</h3>
      <p style="margin: 0 0 25px 0; font-size: 16px;">
        Interactive timeline visualization with pan, zoom, and event selection
      </p>
      
      <div style="
        display: inline-block;
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        text-align: left;
        max-width: 500px;
      ">
        <h4 style="margin: 0 0 15px 0; color: #333;">Features Available:</h4>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
          <li><strong>${tracks.length}</strong> timeline tracks with visual separation</li>
          <li><strong>${events.length}</strong> events with interactive hover tooltips</li>
          <li>Pan and zoom with smooth mouse controls</li>
          <li>Click events to select and highlight them</li>
          <li>Export timeline as high-resolution image</li>
          <li>High-performance canvas rendering</li>
          <li>Responsive design for all screen sizes</li>
        </ul>
        
        ${events.length > 0 ? `
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
            <strong>Date Range:</strong><br>
            ${new Date(Math.min(...events.map(e => e.start_date))).toLocaleDateString()} - 
            ${new Date(Math.max(...events.map(e => e.start_date))).toLocaleDateString()}
          </div>
        ` : ''}
      </div>
      
      <div style="margin-top: 30px; font-size: 14px; color: #999;">
        <strong>Ready for Phase 4:</strong> AI Integration for automatic event generation and connections
      </div>
    </div>
  `;
}

updateTimelineStats() {
  const events = stateManager.getEvents();
  const tracks = stateManager.getTracks();
  const aiEvents = events.filter(e => e.ai_generated).length;
  
  const statsElement = document.getElementById('timeline-stats');
  if (statsElement) {
    statsElement.innerHTML = `
      <strong>${tracks.length}</strong> tracks • 
      <strong>${events.length}</strong> events • 
      <strong>${aiEvents}</strong> AI-generated
    `;
  }
}

updateSelectedCount(count) {
  const selectedElement = document.getElementById('selected-count');
  if (selectedElement) {
    selectedElement.textContent = count === 0 
      ? 'No events selected' 
      : `${count} event${count === 1 ? '' : 's'} selected`;
  }

addNewTrack() {
  const name = prompt('Enter track name:');
  if (name && name.trim()) {
    const track = createTimelineTrack({
      name: name.trim(),
      description: '',
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    });
    stateManager.addTrack(track);
  }
}

addNewEvent() {
  const tracks = stateManager.getTracks();
  if (tracks.length === 0) {
    alert('Please create at least one track first!');
    return;
  }
  
  const title = prompt('Enter event title:');
  if (title && title.trim()) {
    const event = createTimelineEvent({
      title: title.trim(),
      timeline_id: tracks[0].id,
      start_date: new Date(),
      category: 'general'
    });
    stateManager.addEvent(event);
  }
}

deleteTrack(id) {
  if (confirm('Are you sure? This will delete all events in this track.')) {
    stateManager.deleteTrack(id);
  }
}

deleteEvent(id) {
  if (confirm('Are you sure you want to delete this event?')) {
    stateManager.deleteEvent(id);
  }
}

loadSampleData() {
  console.log('📊 Loading sample data...');
  
  // Create sample tracks
  const track1 = createTimelineTrack({
    name: 'World History',
    description: 'Major historical events and milestones',
    color: '#e74c3c'
  });
  
  const track2 = createTimelineTrack({
    name: 'Technology',
    description: 'Technological breakthroughs and innovations',
    color: '#3498db'
  });
  
  const track3 = createTimelineTrack({
    name: 'Science',
    description: 'Scientific discoveries and achievements',
    color: '#2ecc71'
  });
  
  stateManager.addTrack(track1);
  stateManager.addTrack(track2);
  stateManager.addTrack(track3);
  
  // Create sample events
  const events = [
    createTimelineEvent({
      title: 'World War II Begins',
      timeline_id: track1.id,
      start_date: new Date('1939-09-01'),
      end_date: new Date('1945-09-02'),
      category: 'war',
      description: 'Global conflict that lasted from 1939 to 1945',
      color: '#dc3545'
    }),
    createTimelineEvent({
      title: 'Internet Created (ARPANET)',
      timeline_id: track2.id,
      start_date: new Date('1969-10-29'),
      category: 'technology',
      description: 'First message sent over ARPANET',
      ai_generated: true,
      confidence_score: 0.95,
      color: '#007bff'
    }),
    createTimelineEvent({
      title: 'Apollo 11 Moon Landing',
      timeline_id: track1.id,
      start_date: new Date('1969-07-20'),
      category: 'space',
      description: 'First crewed lunar landing mission',
      color: '#6f42c1'
    }),
    createTimelineEvent({
      title: 'World Wide Web Invented',
      timeline_id: track2.id,
      start_date: new Date('1989-03-12'),
      category: 'technology',
      description: 'Tim Berners-Lee proposes the World Wide Web',
      ai_generated: true,
      confidence_score: 0.92,
      color: '#fd7e14'
    }),
    createTimelineEvent({
      title: 'Discovery of DNA Structure',
      timeline_id: track3.id,
      start_date: new Date('1953-04-25'),
      category: 'biology',
      description: 'Watson and Crick publish DNA double helix',
      color: '#28a745'
    })
  ];
  
  events.forEach(event => stateManager.addEvent(event));
  
  console.log('✅ Sample data loaded');
}

setupStateListeners() {
  stateManager.on('dataChanged', () => {
    if (stateManager.state.activeTab === 'table') {
      console.log('Data changed, refreshing table...');
      this.renderDataTable();
    } else if (stateManager.state.activeTab === 'timeline') {
      console.log('Data changed, refreshing timeline...');
      this.updateTimelineStats();
      // Timeline2D will auto-update through its own listener
    }
  });
  
  stateManager.on('tabChanged', (data) => {
    console.log(`Tab changed from ${data.from} to ${data.to}`);
    
    // Update timeline stats when switching to timeline tab
    if (data.to === 'timeline') {
      setTimeout(() => this.updateTimelineStats(), 100);
    }
  });
}
}

// Initialize the application
const timelineApp = new TimelineApp();

// Make it globally available
window.timelineApp = timelineApp;