import { stateManager } from './state/stateManager.js';
import { createTimelineEvent, createTimelineTrack } from './data/schema.js';

console.log('🔧 Testing AdvancedTable import...');

// Test importing AdvancedTable
async function testImports() {
  try {
    console.log('📦 Attempting to import AdvancedTable...');
    const { AdvancedTable } = await import('./components/AdvancedTable.mjs');
    console.log('✅ AdvancedTable imported successfully!');
    window.AdvancedTable = AdvancedTable;
    
    // Now test tableUtils
    console.log('📦 Attempting to import TableManager...');
    const { TableManager } = await import('./utils/tableUtils.mjs');
    console.log('✅ TableManager imported successfully!');
    window.TableManager = TableManager;
    
    // If we get here, imports work - initialize the app
    initializeApp();
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Fall back to simple version
    console.log('🔄 Falling back to simple tables...');
    initializeSimpleApp();
  }
}

function initializeApp() {
  console.log('🚀 Initializing with advanced tables...');
  // We'll add the full app here once imports work
  const app = new TimelineApp(true); // true = use advanced tables
}

function initializeSimpleApp() {
  console.log('📋 Initializing with simple tables...');
  const app = new TimelineApp(false); // false = use simple tables
}

class TimelineApp {
  constructor(useAdvancedTables = false) {
    this.useAdvancedTables = useAdvancedTables;
    this.eventsTable = null;
    this.tracksTable = null;
    this.init();
  }
  
  init() {
    console.log(`🚀 Timeline Tool Initializing... (Advanced: ${this.useAdvancedTables})`);
    
    // Initialize tab system
    this.setupTabSystem();
    
    // Initialize with sample data
    this.loadSampleData();
    
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
    console.log(`📋 Rendering data table... (Advanced: ${this.useAdvancedTables})`);
    const container = document.getElementById('data-table-container');
    
    if (this.useAdvancedTables && window.AdvancedTable) {
      this.renderAdvancedDataTable(container);
    } else {
      this.renderSimpleDataTable(container);
    }
  }
  
  renderAdvancedDataTable(container) {
    console.log('🚀 Rendering ADVANCED data tables...');
    
    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h2 style="margin: 0; color: #333;">Timeline Data Management</h2>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
          Advanced spreadsheet-like functionality with sorting, filtering, and CSV import/export
        </p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; background: white;">
          <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e9ecef;">
            <h3 style="margin: 0; color: #495057; font-size: 16px;">📊 Timeline Tracks</h3>
          </div>
          <div id="tracks-table-container" style="padding: 20px;"></div>
        </div>
      </div>
      
      <div style="margin-bottom: 30px;">
        <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; background: white;">
          <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e9ecef;">
            <h3 style="margin: 0; color: #495057; font-size: 16px;">📅 Timeline Events</h3>
          </div>
          <div id="events-table-container" style="padding: 20px;"></div>
        </div>
      </div>
      
      ${this.renderPlaceholderTables()}
    `;
    
    // Initialize advanced tables
    try {
      const tracksContainer = document.getElementById('tracks-table-container');
      const eventsContainer = document.getElementById('events-table-container');
      
      this.tracksTable = new window.AdvancedTable(tracksContainer, stateManager, 'tracks');
      this.eventsTable = new window.AdvancedTable(eventsContainer, stateManager, 'events');
      
      console.log('✅ Advanced tables initialized successfully!');
    } catch (error) {
      console.error('❌ Error creating advanced tables:', error);
      this.renderSimpleDataTable(container);
    }
  }
  
  renderSimpleDataTable(container) {
    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h2 style="margin: 0; color: #333;">Timeline Data Management</h2>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
          Simple table interface - Advanced features will be restored soon!
        </p>
      </div>
      
      ${this.renderSimpleTracksTable()}
      ${this.renderSimpleEventsTable()}
      ${this.renderPlaceholderTables()}
    `;
  }
  
  renderSimpleTracksTable() {
    const tracks = stateManager.getTracks();
    
    return `
      <div style="margin-bottom: 30px;">
        <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; background: white;">
          <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e9ecef;">
            <h3 style="margin: 0; color: #495057; font-size: 16px;">Timeline Tracks (${tracks.length})</h3>
          </div>
          <div style="padding: 20px;">
            <button onclick="timelineApp.addNewTrack()" style="
              margin-bottom: 15px; 
              padding: 8px 16px; 
              background: #007bff; 
              color: white; 
              border: none; 
              border-radius: 4px; 
              cursor: pointer;
            ">Add Track</button>
            
            <table style="width: 100%; border-collapse: collapse;">
              <thead style="background: #f8f9fa;">
                <tr>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Name</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Description</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Color</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Events</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${tracks.map(track => `
                  <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${track.name}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${track.description || '-'}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                      <div style="width: 20px; height: 20px; background: ${track.color}; border-radius: 3px; display: inline-block;"></div>
                    </td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${stateManager.getEventsForTrack(track.id).length}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                      <button onclick="timelineApp.deleteTrack('${track.id}')" style="
                        padding: 4px 8px; 
                        background: #dc3545; 
                        color: white; 
                        border: none; 
                        border-radius: 3px; 
                        cursor: pointer; 
                        font-size: 12px;
                      ">Delete</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
  
  renderSimpleEventsTable() {
    const events = stateManager.getEvents();
    
    return `
      <div style="margin-bottom: 30px;">
        <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; background: white;">
          <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e9ecef;">
            <h3 style="margin: 0; color: #495057; font-size: 16px;">Timeline Events (${events.length})</h3>
          </div>
          <div style="padding: 20px;">
            <button onclick="timelineApp.addNewEvent()" style="
              margin-bottom: 15px; 
              padding: 8px 16px; 
              background: #28a745; 
              color: white; 
              border: none; 
              border-radius: 4px; 
              cursor: pointer;
            ">Add Event</button>
            
            <table style="width: 100%; border-collapse: collapse;">
              <thead style="background: #f8f9fa;">
                <tr>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Title</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Track</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Date</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Category</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">AI</th>
                  <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${events.map(event => {
                  const track = stateManager.getTrack(event.timeline_id);
                  return `
                    <tr>
                      <td style="padding: 10px; border: 1px solid #ddd; font-weight: 500;">${event.title}</td>
                      <td style="padding: 10px; border: 1px solid #ddd;">${track ? track.name : 'Unknown'}</td>
                      <td style="padding: 10px; border: 1px solid #ddd;">${event.start_date.toLocaleDateString()}</td>
                      <td style="padding: 10px; border: 1px solid #ddd;">
                        <span style="padding: 2px 8px; background: ${event.color}20; color: ${event.color}; border-radius: 12px; font-size: 12px;">${event.category}</span>
                      </td>
                      <td style="padding: 10px; border: 1px solid #ddd;">
                        ${event.ai_generated ? 
                          `<span style="color: #007bff;">AI (${Math.round(event.confidence_score * 100)}%)</span>` : 
                          '<span style="color: #666;">Manual</span>'
                        }
                      </td>
                      <td style="padding: 10px; border: 1px solid #ddd;">
                        <button onclick="timelineApp.deleteEvent('${event.id}')" style="
                          padding: 4px 8px; 
                          background: #dc3545; 
                          color: white; 
                          border: none; 
                          border-radius: 3px; 
                          cursor: pointer; 
                          font-size: 12px;
                        ">Delete</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
  
  renderPlaceholderTables() {
    return `
      <div style="margin-bottom: 30px;">
        <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; background: white;">
          <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e9ecef;">
            <h3 style="margin: 0; color: #495057; font-size: 16px;">Event Connections</h3>
          </div>
          <div style="padding: 40px; text-align: center; color: #666;">
            <div style="font-size: 48px; margin-bottom: 15px;">🔗</div>
            <p>Coming in Phase 5: 3D arched lines between events</p>
          </div>
        </div>
      </div>
      
      <div>
        <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; background: white;">
          <div style="background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e9ecef;">
            <h3 style="margin: 0; color: #495057; font-size: 16px;">D3 Charts</h3>
          </div>
          <div style="padding: 40px; text-align: center; color: #666;">
            <div style="font-size: 48px; margin-bottom: 15px;">📈</div>
            <p>Coming in Phase 6: Floating charts above timelines</p>
          </div>
        </div>
      </div>
    `;
  }
  
  renderTimeline() {
    const container = document.getElementById('timeline-container');
    const events = stateManager.getEvents();
    const tracks = stateManager.getTracks();
    
    container.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h2>Timeline Visualization</h2>
        <p style="color: #666; margin-bottom: 30px;">2D Timeline Renderer - Coming in Phase 3!</p>
        
        <div style="
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
          gap: 20px; 
          margin: 30px 0; 
          text-align: left;
        ">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 10px 0; color: #007bff;">Data Summary</h3>
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
            <h3 style="margin: 0 0 10px 0; color: #28a745;">AI Integration</h3>
            <p style="margin: 5px 0;"><strong>AI Events:</strong> ${events.filter(e => e.ai_generated).length}</p>
            <p style="margin: 5px 0;"><strong>Manual Events:</strong> ${events.filter(e => !e.ai_generated).length}</p>
          </div>
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
      this.renderActiveTab(); // Refresh the view
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
      this.renderActiveTab(); // Refresh the view
    }
  }
  
  deleteTrack(id) {
    if (confirm('Are you sure? This will delete all events in this track.')) {
      stateManager.deleteTrack(id);
      this.renderActiveTab(); // Refresh the view
    }
  }
  
  deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
      stateManager.deleteEvent(id);
      this.renderActiveTab(); // Refresh the view
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
      description: 'Tech innovations',
      color: '#3498db'
    });
    
    const track3 = createTimelineTrack({
      name: 'Science',
      description: 'Scientific discoveries',
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
        description: 'Global conflict from 1939 to 1945',
        color: '#dc3545'
      }),
      createTimelineEvent({
        title: 'Internet Created',
        timeline_id: track2.id,
        start_date: new Date('1969-10-29'),
        category: 'technology',
        description: 'ARPANET first message',
        ai_generated: true,
        confidence_score: 0.95,
        color: '#007bff'
      }),
      createTimelineEvent({
        title: 'Moon Landing',
        timeline_id: track1.id,
        start_date: new Date('1969-07-20'),
        category: 'space',
        description: 'Apollo 11 mission',
        color: '#6f42c1'
      }),
      createTimelineEvent({
        title: 'World Wide Web',
        timeline_id: track2.id,
        start_date: new Date('1989-03-12'),
        category: 'technology',
        description: 'Tim Berners-Lee invention',
        ai_generated: true,
        confidence_score: 0.92,
        color: '#fd7e14'
      }),
      createTimelineEvent({
        title: 'DNA Structure',
        timeline_id: track3.id,
        start_date: new Date('1953-04-25'),
        category: 'biology',
        description: 'Watson and Crick discovery',
        color: '#28a745'
      })
    ];
    
    events.forEach(event => stateManager.addEvent(event));
    
    console.log('✅ Sample data loaded');
  }
}

// Make timelineApp globally available
window.timelineApp = null;

// Start the import test
testImports();