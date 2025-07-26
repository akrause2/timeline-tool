export class Timeline2D {
  constructor(container, stateManager) {
    this.container = container;
    this.stateManager = stateManager;
    this.canvas = null;
    this.ctx = null;
    
    // View state
    this.viewState = {
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      timeRange: {
        start: new Date('1950-01-01'),
        end: new Date('2030-12-31')
      }
    };
    
    // Visual configuration
    this.config = {
      trackHeight: 80,
      trackSpacing: 20,
      eventMinWidth: 4,
      eventMaxWidth: 200,
      eventHeight: 24,
      colors: {
        background: '#fafafa',
        gridLines: '#e9ecef',
        trackBackground: '#ffffff',
        trackBorder: '#dee2e6',
        timeAxis: '#495057',
        eventDefault: '#007bff',
        eventHover: '#0056b3',
        eventSelected: '#fd7e14',
        text: '#333333',
        textLight: '#666666'
      },
      fonts: {
        track: '14px Inter, system-ui, sans-serif',
        event: '12px Inter, system-ui, sans-serif',
        axis: '11px Inter, system-ui, sans-serif'
      }
    };
    
    // Interaction state
    this.interaction = {
      isDragging: false,
      dragStart: { x: 0, y: 0 },
      hoveredEvent: null,
      selectedEvents: new Set(),
      tooltip: null
    };
    
    this.init();
  }
  
  init() {
    this.createCanvas();
    this.setupEventListeners();
    this.calculateTimeRange();
    this.render();
    
    // Listen for data changes
    this.stateManager.on('dataChanged', () => {
      this.calculateTimeRange();
      this.render();
    });
    
    // Listen for window resize
    window.addEventListener('resize', () => {
      this.resize();
    });
  }
  
  createCanvas() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.cursor = 'grab';
    
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    // Set up high DPI rendering
    this.resize();
  }
  
  resize() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    this.ctx.scale(dpr, dpr);
    this.render();
  }
  
  setupEventListeners() {
    // Mouse events for pan and interaction
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    
    // Wheel event for zoom
    this.canvas.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
    
    // Click events for selection
    this.canvas.addEventListener('click', this.onClick.bind(this));
    
    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  
  calculateTimeRange() {
    const events = this.stateManager.getEvents();
    if (events.length === 0) {
      this.viewState.timeRange = {
        start: new Date('1950-01-01'),
        end: new Date('2030-12-31')
      };
      return;
    }
    
    const dates = events.flatMap(event => [
      event.start_date,
      event.end_date || event.start_date
    ]);
    
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // Add 10% padding on each side
    const timeSpan = maxDate - minDate;
    const padding = timeSpan * 0.1;
    
    this.viewState.timeRange = {
      start: new Date(minDate - padding),
      end: new Date(maxDate + padding)
    };
  }
  
  render() {
    if (!this.ctx) return;
    
    const rect = this.container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Clear canvas
    this.ctx.fillStyle = this.config.colors.background;
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw timeline components
    this.drawTimeAxis(width, height);
    this.drawTracks(width, height);
    this.drawEvents(width, height);
    this.drawTooltip();
  }
  
  drawTimeAxis(width, height) {
    const axisHeight = 40;
    const axisY = height - axisHeight;
    
    // Draw axis background
    this.ctx.fillStyle = this.config.colors.trackBackground;
    this.ctx.fillRect(0, axisY, width, axisHeight);
    
    // Draw axis border
    this.ctx.strokeStyle = this.config.colors.trackBorder;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, axisY);
    this.ctx.lineTo(width, axisY);
    this.ctx.stroke();
    
    // Draw time labels and grid lines
    this.drawTimeLabels(width, height, axisY, axisHeight);
  }
  
  drawTimeLabels(width, height, axisY, axisHeight) {
    const timeSpan = this.viewState.timeRange.end - this.viewState.timeRange.start;
    const pixelsPerMs = (width / timeSpan) * this.viewState.zoom;
    
    // Calculate appropriate time intervals
    const intervals = this.calculateTimeIntervals(timeSpan, width);
    
    this.ctx.font = this.config.fonts.axis;
    this.ctx.fillStyle = this.config.colors.timeAxis;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    intervals.forEach(interval => {
      const x = this.timeToX(interval.date, width);
      if (x >= 0 && x <= width) {
        // Draw grid line
        this.ctx.strokeStyle = this.config.colors.gridLines;
        this.ctx.lineWidth = 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, axisY);
        this.ctx.stroke();
        
        // Draw time label
        this.ctx.fillText(interval.label, x, axisY + axisHeight / 2);
      }
    });
  }
  
  calculateTimeIntervals(timeSpan, width) {
    const targetIntervals = Math.floor(width / 100); // One label per ~100px
    const msPerInterval = timeSpan / targetIntervals;
    
    // Define time units in milliseconds
    const units = [
      { ms: 1000 * 60 * 60 * 24 * 365, format: (d) => d.getFullYear().toString() },
      { ms: 1000 * 60 * 60 * 24 * 30, format: (d) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
      { ms: 1000 * 60 * 60 * 24 * 7, format: (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
      { ms: 1000 * 60 * 60 * 24, format: (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
    ];
    
    // Find appropriate unit
    const unit = units.find(u => msPerInterval >= u.ms) || units[units.length - 1];
    
    // Generate intervals
    const intervals = [];
    const startTime = new Date(this.viewState.timeRange.start);
    startTime.setTime(Math.floor(startTime.getTime() / unit.ms) * unit.ms);
    
    for (let time = startTime.getTime(); time <= this.viewState.timeRange.end; time += unit.ms) {
      const date = new Date(time);
      intervals.push({
        date,
        label: unit.format(date)
      });
    }
    
    return intervals;
  }
  
  drawTracks(width, height) {
    const tracks = this.stateManager.getTracks().filter(track => track.visible !== false);
    const timeAxisHeight = 40;
    const availableHeight = height - timeAxisHeight;
    const totalTrackHeight = this.config.trackHeight + this.config.trackSpacing;
    
    tracks.forEach((track, index) => {
      const trackY = index * totalTrackHeight + this.config.trackSpacing;
      
      if (trackY + this.config.trackHeight <= availableHeight) {
        this.drawTrack(track, trackY, width);
      }
    });
  }
  
  drawTrack(track, y, width) {
    // Draw track background
    this.ctx.fillStyle = this.config.colors.trackBackground;
    this.ctx.fillRect(0, y, width, this.config.trackHeight);
    
    // Draw track border
    this.ctx.strokeStyle = this.config.colors.trackBorder;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0, y, width, this.config.trackHeight);
    
    // Draw track label
    this.ctx.font = this.config.fonts.track;
    this.ctx.fillStyle = this.config.colors.text;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(track.name, 10, y + this.config.trackHeight / 2);
    
    // Draw track color indicator
    this.ctx.fillStyle = track.color;
    this.ctx.fillRect(5, y + 5, 4, this.config.trackHeight - 10);
  }
  
  drawEvents(width, height) {
    const events = this.stateManager.getEvents();
    const tracks = this.stateManager.getTracks();
    const trackMap = new Map(tracks.map(track => [track.id, track]));
    
    events.forEach(event => {
      const track = trackMap.get(event.timeline_id);
      if (track && track.visible !== false) {
        const trackIndex = tracks.findIndex(t => t.id === track.id);
        const trackY = trackIndex * (this.config.trackHeight + this.config.trackSpacing) + this.config.trackSpacing;
        
        this.drawEvent(event, trackY, width);
      }
    });
  }
  
  drawEvent(event, trackY, width) {
    const startX = this.timeToX(event.start_date, width);
    const endX = event.end_date ? this.timeToX(event.end_date, width) : startX;
    
    // Calculate event dimensions
    const eventWidth = Math.max(
      this.config.eventMinWidth,
      Math.min(this.config.eventMaxWidth, Math.abs(endX - startX))
    );
    const eventHeight = this.config.eventHeight;
    const eventY = trackY + (this.config.trackHeight - eventHeight) / 2;
    const eventX = Math.min(startX, endX);
    
    // Skip if event is outside visible area
    if (eventX + eventWidth < 0 || eventX > width) return;
    
    // Determine event color
    let eventColor = event.color || this.config.colors.eventDefault;
    if (this.interaction.selectedEvents.has(event.id)) {
      eventColor = this.config.colors.eventSelected;
    } else if (this.interaction.hoveredEvent === event.id) {
      eventColor = this.config.colors.eventHover;
    }
    
    // Draw event background
    this.ctx.fillStyle = eventColor;
    this.ctx.fillRect(eventX, eventY, eventWidth, eventHeight);
    
    // Draw event border
    this.ctx.strokeStyle = this.darkenColor(eventColor, 0.2);
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(eventX, eventY, eventWidth, eventHeight);
    
    // Draw event text if there's enough space
    if (eventWidth > 30) {
      this.ctx.font = this.config.fonts.event;
      this.ctx.fillStyle = this.getContrastColor(eventColor);
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'middle';
      
      const maxTextWidth = eventWidth - 8;
      const text = this.truncateText(event.title, maxTextWidth);
      this.ctx.fillText(text, eventX + 4, eventY + eventHeight / 2);
    }
    
    // Draw AI indicator if AI generated
    if (event.ai_generated && eventWidth > 20) {
      this.ctx.font = '10px Inter, system-ui, sans-serif';
      this.ctx.fillStyle = this.getContrastColor(eventColor);
      this.ctx.textAlign = 'right';
      this.ctx.fillText('✨', eventX + eventWidth - 4, eventY + 8);
    }
  }
  
  drawTooltip() {
    if (!this.interaction.hoveredEvent || !this.interaction.tooltip) return;
    
    const event = this.stateManager.getEvent(this.interaction.hoveredEvent);
    if (!event) return;
    
    const tooltip = this.interaction.tooltip;
    const padding = 10;
    const maxWidth = 250;
    
    // Prepare tooltip content
    const lines = [
      event.title,
      `Date: ${event.start_date.toLocaleDateString()}`,
      event.end_date ? `End: ${event.end_date.toLocaleDateString()}` : null,
      `Category: ${event.category}`,
      event.description ? `Description: ${event.description}` : null
    ].filter(Boolean);
    
    // Measure text
    this.ctx.font = this.config.fonts.event;
    const lineHeight = 16;
    const textWidth = Math.min(maxWidth, Math.max(...lines.map(line => this.ctx.measureText(line).width)));
    const tooltipWidth = textWidth + padding * 2;
    const tooltipHeight = lines.length * lineHeight + padding * 2;
    
    // Position tooltip
    let tooltipX = tooltip.x + 10;
    let tooltipY = tooltip.y - tooltipHeight - 10;
    
    // Keep tooltip in bounds
    const rect = this.container.getBoundingClientRect();
    if (tooltipX + tooltipWidth > rect.width) tooltipX = tooltip.x - tooltipWidth - 10;
    if (tooltipY < 0) tooltipY = tooltip.y + 20;
    
    // Draw tooltip background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    
    // Draw tooltip border
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);
    
    // Draw tooltip text
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    
    lines.forEach((line, index) => {
      this.ctx.fillText(
        line,
        tooltipX + padding,
        tooltipY + padding + index * lineHeight
      );
    });
  }
  
  // Coordinate conversion methods
  timeToX(date, width) {
    const timeSpan = this.viewState.timeRange.end - this.viewState.timeRange.start;
    const progress = (date - this.viewState.timeRange.start) / timeSpan;
    return (progress * width * this.viewState.zoom) + this.viewState.offsetX;
  }
  
  xToTime(x, width) {
    const adjustedX = (x - this.viewState.offsetX) / this.viewState.zoom;
    const timeSpan = this.viewState.timeRange.end - this.viewState.timeRange.start;
    const progress = adjustedX / width;
    return new Date(this.viewState.timeRange.start.getTime() + progress * timeSpan);
  }
  
  getEventAtPosition(x, y, width) {
    const events = this.stateManager.getEvents();
    const tracks = this.stateManager.getTracks();
    const trackMap = new Map(tracks.map(track => [track.id, track]));
    
    // Find which track the y-coordinate is in
    const trackIndex = Math.floor((y - this.config.trackSpacing) / (this.config.trackHeight + this.config.trackSpacing));
    if (trackIndex < 0 || trackIndex >= tracks.length) return null;
    
    const track = tracks[trackIndex];
    const trackY = trackIndex * (this.config.trackHeight + this.config.trackSpacing) + this.config.trackSpacing;
    
    // Check if y is within the track bounds
    if (y < trackY || y > trackY + this.config.trackHeight) return null;
    
    // Find events in this track that contain the x-coordinate
    const trackEvents = events.filter(event => event.timeline_id === track.id);
    
    for (const event of trackEvents) {
      const startX = this.timeToX(event.start_date, width);
      const endX = event.end_date ? this.timeToX(event.end_date, width) : startX;
      const eventWidth = Math.max(this.config.eventMinWidth, Math.abs(endX - startX));
      const eventX = Math.min(startX, endX);
      
      if (x >= eventX && x <= eventX + eventWidth) {
        return event;
      }
    }
    
    return null;
  }
  
  // Event handlers
  onMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.interaction.isDragging = true;
    this.interaction.dragStart = { x, y };
    this.canvas.style.cursor = 'grabbing';
  }
  
  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (this.interaction.isDragging) {
      // Pan the timeline
      const deltaX = x - this.interaction.dragStart.x;
      const deltaY = y - this.interaction.dragStart.y;
      
      this.viewState.offsetX += deltaX;
      this.viewState.offsetY += deltaY;
      
      this.interaction.dragStart = { x, y };
      this.render();
    } else {
      // Handle hover
      const hoveredEvent = this.getEventAtPosition(x, y, rect.width);
      
      if (hoveredEvent) {
        if (this.interaction.hoveredEvent !== hoveredEvent.id) {
          this.interaction.hoveredEvent = hoveredEvent.id;
          this.interaction.tooltip = { x, y };
          this.canvas.style.cursor = 'pointer';
          this.render();
        }
      } else {
        if (this.interaction.hoveredEvent) {
          this.interaction.hoveredEvent = null;
          this.interaction.tooltip = null;
          this.canvas.style.cursor = 'grab';
          this.render();
        }
      }
    }
  }
  
  onMouseUp(e) {
    this.interaction.isDragging = false;
    this.canvas.style.cursor = 'grab';
  }
  
  onMouseLeave(e) {
    this.interaction.isDragging = false;
    this.interaction.hoveredEvent = null;
    this.interaction.tooltip = null;
    this.canvas.style.cursor = 'grab';
    this.render();
  }
  
  onWheel(e) {
    e.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Zoom factor
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(10, this.viewState.zoom * zoomFactor));
    
    // Zoom towards mouse position
    const zoomRatio = newZoom / this.viewState.zoom;
    this.viewState.offsetX = mouseX - (mouseX - this.viewState.offsetX) * zoomRatio;
    this.viewState.zoom = newZoom;
    
    this.render();
  }
  
  onClick(e) {
    if (this.interaction.isDragging) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedEvent = this.getEventAtPosition(x, y, rect.width);
    
    if (clickedEvent) {
      // Toggle event selection
      if (this.interaction.selectedEvents.has(clickedEvent.id)) {
        this.interaction.selectedEvents.delete(clickedEvent.id);
      } else {
        if (!e.ctrlKey && !e.metaKey) {
          this.interaction.selectedEvents.clear();
        }
        this.interaction.selectedEvents.add(clickedEvent.id);
      }
      
      this.render();
      
      // Emit selection event
      this.stateManager.emit('timelineSelection', {
        selectedEvents: Array.from(this.interaction.selectedEvents),
        clickedEvent
      });
    } else {
      // Clear selection if clicking empty space
      if (!e.ctrlKey && !e.metaKey) {
        this.interaction.selectedEvents.clear();
        this.render();
      }
    }
  }
  
  // Utility methods
  darkenColor(color, factor) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return `rgb(${Math.floor(r * (1 - factor))}, ${Math.floor(g * (1 - factor))}, ${Math.floor(b * (1 - factor))})`;
  }
  
  getContrastColor(hexColor) {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }
  
  truncateText(text, maxWidth) {
    this.ctx.font = this.config.fonts.event;
    if (this.ctx.measureText(text).width <= maxWidth) return text;
    
    let truncated = text;
    while (this.ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    
    return truncated + '...';
  }
  
  // Public API methods
  zoomToFit() {
    this.calculateTimeRange();
    this.viewState.zoom = 1;
    this.viewState.offsetX = 0;
    this.viewState.offsetY = 0;
    this.render();
  }
  
  zoomToEvent(eventId) {
    const event = this.stateManager.getEvent(eventId);
    if (!event) return;
    
    const rect = this.container.getBoundingClientRect();
    const targetX = this.timeToX(event.start_date, rect.width);
    
    // Center the event
    this.viewState.offsetX = rect.width / 2 - targetX;
    this.viewState.zoom = 2;
    
    this.render();
  }
  
  exportAsImage() {
    // Create a link element to download the canvas
    const link = document.createElement('a');
    link.download = `timeline-${new Date().toISOString().split('T')[0]}.png`;
    link.href = this.canvas.toDataURL();
    link.click();
  }
}