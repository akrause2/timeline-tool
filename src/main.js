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
    
    this.tracksTable = new AdvancedTable(tracksContainer, stateManager, 'tracks');
    this.eventsTable = new AdvancedTable(eventsContainer, stateManager, 'events');
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
            Your data architecture and advanced table interface are complete. 
            Ready to build the 2D timeline renderer with pan, zoom, and interactive events.
          </p>
        </div>
      </div>
    `;
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
    
    // Create sample events with more variety
    const events = [
      createTimelineEvent({
        title: 'World Wide Web Invented',
        timeline_id: track2.id,
        start_date: new Date('1989-03-12'),
        category: 'technology',
        description: 'Tim Berners-Lee proposes the World Wide Web at CERN',
        ai_generated: true,
        confidence_score: 0.92,
        color: '#fd7e14'
      }),
      createTimelineEvent({
        title: 'Human Genome Project Completed',
        timeline_id: track3.id,
        start_date: new Date('2003-04-14'),
        category: 'biology',
        description: 'International scientific research project to determine the DNA sequence of the entire human genome',
        color: '#20c997'
      }),
      createTimelineEvent({
        title: 'Fall of Berlin Wall',
        timeline_id: track1.id,
        start_date: new Date('1989-11-09'),
        category: 'politics',
        description: 'Symbol of the Cold War\'s end and German reunification',
        color: '#6c757d'
      })
    ];
    
    events.forEach(event => stateManager.addEvent(event));
    
    console.log('✅ Sample data loaded');
  }
  
  setupStateListeners() {
    // Listen for data changes to update UI
    stateManager.on('dataChanged', () => {
      if (stateManager.state.activeTab === 'table') {
        // Tables will auto-update through their own listeners
        console.log('Data changed, tables will auto-refresh');
      }
    });
    
    // Listen for tab changes
    stateManager.on('tabChanged', (data) => {
      console.log(`Tab changed from ${data.from} to ${data.to}`);
    });
  }
}

// Initialize the application
const timelineApp = new TimelineApp();

// Make it globally available for button onclick handlers
window.timelineApp = timelineApp;TimelineEvent({
        title: 'World War II Begins',
        timeline_id: track1.id,
        start_date: new Date('1939-09-01'),
        end_date: new Date('1945-09-02'),
        category: 'war',
        description: 'Global conflict that lasted from 1939 to 1945, involving most of the world\'s nations.',
        color: '#dc3545'
      }),
      createTimelineEvent({
        title: 'Internet Created (ARPANET)',
        timeline_id: track2.id,
        start_date: new Date('1969-10-29'),
        category: 'technology',
        description: 'First message sent over ARPANET, precursor to the modern internet',
        ai_generated: true,
        confidence_score: 0.95,
        color: '#007bff'
      }),
      createTimelineEvent({
        title: 'Apollo 11 Moon Landing',
        timeline_id: track1.id,
        start_date: new Date('1969-07-20'),
        category: 'space',
        description: 'First crewed lunar landing mission, Neil Armstrong and Buzz Aldrin walk on the moon',
        color: '#6f42c1'
      }),
      createTimelineEvent({
        title: 'Personal Computer Revolution',
        timeline_id: track2.id,
        start_date: new Date('1975-01-01'),
        end_date: new Date('1985-12-31'),
        category: 'technology',
        description: 'Rise of personal computers with Apple II, IBM PC, and early home computing',
        ai_generated: true,
        confidence_score: 0.87,
        color: '#17a2b8'
      }),
      createTimelineEvent({
        title: 'Discovery of DNA Structure',
        timeline_id: track3.id,
        start_date: new Date('1953-04-25'),
        category: 'biology',
        description: 'Watson and Crick publish the double helix structure of DNA',
        color: '#28a745'
      }),
      createimport { stateManager } from './state/stateManager.js';
import { createTimelineEvent, createTimelineTrack } from './data/schema.js';

class TimelineApp {
  constructor() {
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
    const events = stateManager.getEvents();
    const tracks = stateManager.getTracks();
    
    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h2>Timeline Data</h2>
        <div style="margin: 10px 0;">
          <button id="add-track-btn" style="margin-right: 10px; padding: 8px 16px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer;">Add Track</button>
          <button id="add-event-btn" style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Add Event</button>
        </div>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3>Timeline Tracks (${tracks.length})</h3>
        <div id="tracks-table"></div>
      </div>
      
      <div>
        <h3>Timeline Events (${events.length})</h3>
        <div id="events-table"></div>
      </div>
    `;
    
    this.renderTracksTable();
    this.renderEventsTable();
    
    // Setup button listeners
    document.getElementById('add-track-btn').addEventListener('click', () => {
      this.addNewTrack();
    });
    
    document.getElementById('add-event-btn').addEventListener('click', () => {
      this.addNewEvent();
    });
  }
  
  renderTracksTable() {
    const tracks = stateManager.getTracks();
    const container = document.getElementById('tracks-table');
    
    const tableHTML = `
      <table style="width: 100%; border-collapse: collapse; margin: 10px 0; background: white; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <thead style="background: #f8f9fa;">
          <tr>
            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Name</th>
            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Description</th>
            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Color</th>
            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Events</th>
            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tracks.map(track => {
            const eventCount = stateManager.getEventsForTrack(track.id).length;
            return `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px; font-weight: 500;">${track.name}</td>
                <td style="padding: 12px; color: #666;">${track.description || '-'}</td>
                <td style="padding: 12px;">
                  <div style="width: 20px; height: 20px; background: ${track.color}; border-radius: 3px; display: inline-block;"></div>
                </td>
                <td style="padding: 12px;">${eventCount}</td>
                <td style="padding: 12px;">
                  <button onclick="timelineApp.deleteTrack('${track.id}')" style="padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">Delete</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = tracks.length > 0 ? tableHTML : '<p style="color: #666; font-style: italic;">No tracks yet. Create your first track!</p>';
  }
  
  renderEventsTable() {
    const events = stateManager.getEvents();
    const container = document.getElementById('events-table');
    
    // Sort events by start date
    const sortedEvents = events.sort((a, b) => a.start_date - b.start_date);
    
    const tableHTML = `
      <table style="width: 100%; border-collapse: collapse; margin: 10px 0; background: white; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <thead style="background: #f8f9fa;">
          <tr>
            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Title</th>
            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Track</th>
            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Start Date</th>
            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Category</th>
            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">AI Generated</th>
            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${sortedEvents.map(event => {
            const track = stateManager.getTrack(event.timeline_id);
            return `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px; font-weight: 500;">${event.title}</td>
                <td style="padding: 12px; color: #666;">${track ? track.name : 'Unknown'}</td>
                <td style="padding: 12px;">${event.start_date.toLocaleDateString()}</td>
                <td style="padding: 12px;">
                  <span style="padding: 2px 8px; background: ${event.color}20; color: ${event.color}; border-radius: 12px; font-size: 12px;">${event.category}</span>
                </td>
                <td style="padding: 12px;">
                  ${event.ai_generated ? 
                    `<span style="color: #007acc;">✨ AI (${Math.round(event.confidence_score * 100)}%)</span>` : 
                    '<span style="color: #666;">Manual</span>'
                  }
                </td>
                <td style="padding: 12px;">
                  <button onclick="timelineApp.deleteEvent('${event.id}')" style="padding: 4px 8px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">Delete</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    
    container.innerHTML = events.length > 0 ? tableHTML : '<p style="color: #666; font-style: italic;">No events yet. Create your first event!</p>';
  }
  
  renderTimeline() {
    const container = document.getElementById('timeline-container');
    const events = stateManager.getEvents();
    const tracks = stateManager.getTracks();
    
    container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h2>Timeline Visualization</h2>
        <p>Timeline renderer will be implemented in Phase 3</p>
        <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3>Current Data Summary</h3>
          <p><strong>Tracks:</strong> ${tracks.length}</p>
          <p><strong>Events:</strong> ${events.length}</p>
          ${events.length > 0 ? 
            `<p><strong>Date Range:</strong> ${new Date(Math.min(...events.map(e => e.start_date))).toLocaleDateString()} - ${new Date(Math.max(...events.map(e => e.start_date))).toLocaleDateString()}</p>` : 
            ''
          }
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
        timeline_id: tracks[0].id, // Use first track for now
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
      description: 'Major historical events',
      color: '#e74c3c'
    });
    
    const track2 = createTimelineTrack({
      name: 'Technology',
      description: 'Technological milestones',
      color: '#3498db'
    });
    
    stateManager.addTrack(track1);
    stateManager.addTrack(track2);
    
    // Create sample events
    const events = [
      createTimelineEvent({
        title: 'World War II Begins',
        timeline_id: track1.id,
        start_date: new Date('1939-09-01'),
        end_date: new Date('1945-09-02'),
        category: 'war',
        description: 'Global conflict that lasted from 1939 to 1945'
      }),
      createTimelineEvent({
        title: 'Internet Created',
        timeline_id: track2.id,
        start_date: new Date('1969-10-29'),
        category: 'technology',
        description: 'ARPANET sends first message',
        ai_generated: true,
        confidence_score: 0.95
      }),
      createTimelineEvent({
        title: 'Moon Landing',
        timeline_id: track1.id,
        start_date: new Date('1969-07-20'),
        category: 'space',
        description: 'Apollo 11 lands on the moon'
      }),
      createTimelineEvent({
        title: 'Personal Computer Revolution',
        timeline_id: track2.id,
        start_date: new Date('1975-01-01'),
        end_date: new Date('1985-12-31'),
        category: 'technology',
        description: 'Rise of personal computers',
        ai_generated: true,
        confidence_score: 0.87
      })
    ];
    
    events.forEach(event => stateManager.addEvent(event));
    
    console.log('✅ Sample data loaded');
  }
  
  setupStateListeners() {
    // Listen for data changes to update UI
    stateManager.on('dataChanged', () => {
      if (stateManager.state.activeTab === 'table') {
        this.renderDataTable();
      }
    });
    
    // Listen for tab changes
    stateManager.on('tabChanged', (data) => {
      console.log(`Tab changed from ${data.from} to ${data.to}`);
    });
  }
}

// Initialize the application
const timelineApp = new TimelineApp();

// Make it globally available for button onclick handlers
window.timelineApp = timelineApp;