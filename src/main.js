import { stateManager } from './state/stateManager.js';
import { createTimelineEvent, createTimelineTrack } from './data/schema.js';
import { AdvancedTable } from './components/AdvancedTable.js';

class TimelineApp {
  constructor() {
    this.eventsTable = null;
    this.tracksTable = null;
    this.init();
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
          Manage your timeline tracks and events with advanced spreadsheet-like functionality
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
      
      <div>
        <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; background: white;">
          <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e9ecef;">
            <h3 style="margin: 0; color: #495057; font-size: 16px;">📅 Timeline Events</h3>
          </div>
          <div id="events-table-container" style="padding: 20px;">
            <!-- Advanced events table will be rendered here -->
          </div>
        </div>
      </div>
    `;
    
    // Initialize advanced tables
    const tracksContainer = document.getElementById('tracks-table-container');
    const eventsContainer = document.getElementById('events-table-container');
    
    try {
      this.tracksTable = new AdvancedTable(tracksContainer, stateManager, 'tracks');
      this.eventsTable = new AdvancedTable(eventsContainer, stateManager, 'events');
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
  
  renderTimeline() {
    const container = document.getElementById('timeline-container');
    const events = stateManager.getEvents();
    const tracks = stateManager.getTracks();
    
    container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h2>Timeline Visualization</h2>
        <p style="color: #666; margin-bottom: 30px;">Timeline renderer will be implemented in Phase 3</p>
        
        <div style="
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
          gap: 20px; 
          margin: 30px 0; 
          text-align: left;
        ">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 10px 0; color: #007bff;">📊 Data Summary</h3>
            <p style="margin: 5px 0;"><strong>Tracks:</strong> ${tracks.length}</p>
            <p style="margin: 5px 0;"><strong>Events:</strong> ${events.length}</p>
            ${events.length > 0 ? `
              <p style="margin: 5px 0;"><strong>Date Range:</strong></p>
              <p style="margin: 5px 0; font-size: 12px; color: #666;">
                ${new Date(Math.min(...events.map(e => e.start_date))).toLocaleDateString()} - 
                ${new Date(Math.max(...events.map(e => e.start_date))).toLocaleDateString()}
              </p>
            ` : ''}
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 10px 0; color: #28a745;">🤖 AI Integration</h3>
            <p style="margin: 5px 0;"><strong>AI Events:</strong> ${events.filter(e => e.ai_generated).length}</p>
            <p style="margin: 5px 0;"><strong>Manual Events:</strong> ${events.filter(e => !e.ai_generated).length}</p>
            <p style="margin: 5px 0; font-size: 12px; color: #666;">
              AI functionality will be added in Phase 4
            </p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 10px 0; color: #6f42c1;">🎯 Next Features</h3>
            <ul style="margin: 5px 0; padding-left: 20px; font-size: 14px; color: #666;">
              <li>2D Timeline Renderer</li>
              <li>3D Visualization</li>
              <li>D3 Chart Integration</li>
              <li>AI Data Processing</li>
            </ul>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
          <h3 style="margin: 0 0 10px 0;">🚀 Ready for Phase 3!</h3>
          <p style="margin: 0; opacity: 0.9;">
            Your data architecture and table interface are working. 
            Ready to build the 2D timeline renderer with pan, zoom, and interactive events.
          </p>
        </div>
      </div>
    `;
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
      }
    });
    
    stateManager.on('tabChanged', (data) => {
      console.log(`Tab changed from ${data.from} to ${data.to}`);
    });
  }
}

// Initialize the application
const timelineApp = new TimelineApp();

// Make it globally available
window.timelineApp = timelineApp;