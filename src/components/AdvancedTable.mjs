export class AdvancedTable {
  constructor(container, stateManager, dataType = 'events') {
    this.container = container;
    this.stateManager = stateManager;
    this.dataType = dataType; // 'events' or 'tracks'
    this.selectedRows = new Set();
    this.sortState = { column: dataType === 'events' ? 'start_date' : 'name', direction: 'asc' };
    this.filterState = { text: '', category: 'all', track: 'all' };
    
    this.init();
  }

  init() {
    this.render();
    this.setupEventListeners();
  }

  getData() {
    return this.dataType === 'events' 
      ? this.stateManager.getEvents() 
      : this.stateManager.getTracks();
  }

  getColumns() {
    if (this.dataType === 'events') {
      return [
        { key: 'title', label: 'Title', type: 'text', width: 200, editable: true },
        { key: 'timeline_id', label: 'Track', type: 'select', width: 150, editable: true },
        { key: 'start_date', label: 'Start Date', type: 'date', width: 130, editable: true },
        { key: 'category', label: 'Category', type: 'text', width: 120, editable: true },
        { key: 'description', label: 'Description', type: 'text', width: 250, editable: true },
        { key: 'ai_generated', label: 'AI Generated', type: 'boolean', width: 100, editable: false }
      ];
    } else {
      return [
        { key: 'name', label: 'Name', type: 'text', width: 200, editable: true },
        { key: 'description', label: 'Description', type: 'text', width: 300, editable: true },
        { key: 'color', label: 'Color', type: 'color', width: 100, editable: true },
        { key: 'visible', label: 'Visible', type: 'boolean', width: 80, editable: true }
      ];
    }
  }

  render() {
    const data = this.getData();
    const columns = this.getColumns();
    
    // Apply filtering and sorting
    let processedData = this.filterData(data);
    processedData = this.sortData(processedData);

    this.container.innerHTML = `
      <div class="advanced-table-container">
        ${this.renderToolbar()}
        ${this.dataType === 'events' ? this.renderFilters() : ''}
        ${this.renderTable(processedData, columns)}
      </div>
    `;

    this.attachEventListeners();
  }

  renderToolbar() {
    const selectedCount = this.selectedRows.size;
    const dataCount = this.getData().length;
    
    return `
      <div style="
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        padding: 15px 0; 
        border-bottom: 1px solid #eee;
        margin-bottom: 15px;
      ">
        <div>
          <h3 style="margin: 0; color: #333;">
            ${this.dataType === 'events' ? 'Timeline Events' : 'Timeline Tracks'} (${dataCount})
          </h3>
          ${selectedCount > 0 ? `
            <span style="margin-left: 15px; color: #666; font-size: 14px;">
              ${selectedCount} selected
            </span>
          ` : ''}
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button class="btn-secondary" data-action="export">
            Export CSV
          </button>
          ${selectedCount > 0 ? `
            <button class="btn-danger" data-action="delete-selected">
              Delete Selected
            </button>
          ` : ''}
          <button class="btn-primary" data-action="add-row">
            Add ${this.dataType === 'events' ? 'Event' : 'Track'}
          </button>
        </div>
      </div>
    `;
  }

  renderFilters() {
    if (this.dataType !== 'events') return '';
    
    const tracks = this.stateManager.getTracks();
    const categories = [...new Set(this.stateManager.getEvents().map(e => e.category))].filter(Boolean);

    return `
      <div style="
        display: flex; 
        gap: 15px; 
        padding: 15px; 
        background: #f8f9fa; 
        border-radius: 6px; 
        margin-bottom: 15px;
      ">
        <div style="flex: 1;">
          <input 
            type="text" 
            placeholder="Search events..." 
            value="${this.filterState.text}"
            data-filter="text"
            style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px;"
          />
        </div>
        
        <div style="min-width: 150px;">
          <select data-filter="category" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="all">All Categories</option>
            ${categories.map(cat => `
              <option value="${cat}" ${this.filterState.category === cat ? 'selected' : ''}>
                ${cat}
              </option>
            `).join('')}
          </select>
        </div>
        
        <div style="min-width: 150px;">
          <select data-filter="track" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="all">All Tracks</option>
            ${tracks.map(track => `
              <option value="${track.id}" ${this.filterState.track === track.id ? 'selected' : ''}>
                ${track.name}
              </option>
            `).join('')}
          </select>
        </div>
        
        ${Object.values(this.filterState).some(v => v && v !== 'all') ? `
          <button data-action="clear-filters" style="
            padding: 8px 12px; 
            background: #6c757d; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer;
          ">
            Clear
          </button>
        ` : ''}
      </div>
    `;
  }

  renderTable(data, columns) {
    return `
      <div style="
        background: white; 
        border-radius: 8px; 
        overflow: hidden; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border: 1px solid #e9ecef;
      ">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${this.renderHeader(columns)}
          ${this.renderBody(data, columns)}
        </table>
      </div>
    `;
  }

  renderHeader(columns) {
    return `
      <thead style="background: #f8f9fa; border-bottom: 2px solid #dee2e6;">
        <tr>
          <th style="
            width: 40px; 
            padding: 12px 8px; 
            text-align: center; 
            border-right: 1px solid #dee2e6;
          ">
            <input type="checkbox" data-action="select-all" />
          </th>
          ${columns.map(col => `
            <th 
              data-column="${col.key}"
              style="
                width: ${col.width}px; 
                padding: 12px; 
                text-align: left; 
                font-weight: 600; 
                color: #495057;
                border-right: 1px solid #dee2e6;
                cursor: pointer;
                user-select: none;
              "
            >
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>${col.label}</span>
                <span style="font-size: 12px; color: #6c757d; margin-left: 5px;">
                  ${this.sortState.column === col.key ? 
                    (this.sortState.direction === 'asc' ? '▲' : '▼') : 
                    '⇅'
                  }
                </span>
              </div>
            </th>
          `).join('')}
          <th style="width: 100px; padding: 12px; text-align: center; font-weight: 600; color: #495057;">
            Actions
          </th>
        </tr>
      </thead>
    `;
  }

  renderBody(data, columns) {
    if (data.length === 0) {
      return `
        <tbody>
          <tr>
            <td colspan="${columns.length + 2}" style="
              padding: 40px; 
              text-align: center; 
              color: #6c757d; 
              font-style: italic;
            ">
              No ${this.dataType} found. ${Object.values(this.filterState).some(v => v && v !== 'all') ? 'Try adjusting your filters.' : `Create your first ${this.dataType === 'events' ? 'event' : 'track'}!`}
            </td>
          </tr>
        </tbody>
      `;
    }

    return `
      <tbody>
        ${data.map((item, index) => this.renderRow(item, columns, index)).join('')}
      </tbody>
    `;
  }

  renderRow(item, columns, index) {
    const isSelected = this.selectedRows.has(item.id);
    
    return `
      <tr 
        data-row-id="${item.id}"
        style="
          background: ${isSelected ? '#e3f2fd' : (index % 2 === 0 ? 'white' : '#f8f9fa')};
          border-bottom: 1px solid #dee2e6;
        "
      >
        <td style="padding: 8px; text-align: center; border-right: 1px solid #dee2e6;">
          <input 
            type="checkbox" 
            data-action="select-row" 
            data-row-id="${item.id}"
            ${isSelected ? 'checked' : ''}
          />
        </td>
        ${columns.map(col => `
          <td style="
            padding: 8px 12px; 
            border-right: 1px solid #dee2e6;
            max-width: ${col.width}px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          " title="${this.formatCellValue(item, col)}">
            ${this.renderCellContent(item, col)}
          </td>
        `).join('')}
        <td style="padding: 8px; text-align: center;">
          <button 
            data-action="edit-row" 
            data-row-id="${item.id}"
            style="
              padding: 4px 8px; 
              background: #007bff; 
              color: white; 
              border: none; 
              border-radius: 3px; 
              cursor: pointer; 
              font-size: 12px;
              margin-right: 5px;
            "
          >
            Edit
          </button>
          <button 
            data-action="delete-row" 
            data-row-id="${item.id}"
            style="
              padding: 4px 8px; 
              background: #dc3545; 
              color: white; 
              border: none; 
              border-radius: 3px; 
              cursor: pointer; 
              font-size: 12px;
            "
          >
            Delete
          </button>
        </td>
      </tr>
    `;
  }

  renderCellContent(item, col) {
    const value = this.formatCellValue(item, col);
    
    if (col.type === 'color') {
      return `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="
            width: 16px; 
            height: 16px; 
            background: ${item[col.key]}; 
            border-radius: 3px; 
            border: 1px solid #ccc;
          "></div>
          <span style="font-size: 12px; color: #666;">${item[col.key]}</span>
        </div>
      `;
    }
    
    if (col.type === 'boolean') {
      return `<span style="font-size: 16px; color: ${value ? '#28a745' : '#6c757d'};">${value ? '✓' : '○'}</span>`;
    }
    
    return value;
  }

  formatCellValue(item, col) {
    const value = item[col.key];
    
    if (value === null || value === undefined) return '';
    
    if (col.type === 'date' && value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    if (col.type === 'boolean') {
      return value;
    }
    
    if (col.key === 'timeline_id' && this.dataType === 'events') {
      const track = this.stateManager.getTrack(value);
      return track ? track.name : value;
    }
    
    return value.toString();
  }

  // Data operations
  filterData(data) {
    return data.filter(item => {
      if (this.filterState.text) {
        const searchText = this.filterState.text.toLowerCase();
        const searchableFields = ['title', 'description', 'category', 'name'];
        const matches = searchableFields.some(field => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(searchText);
        });
        if (!matches) return false;
      }

      if (this.filterState.category && this.filterState.category !== 'all') {
        if (item.category !== this.filterState.category) return false;
      }

      if (this.filterState.track && this.filterState.track !== 'all') {
        if (item.timeline_id !== this.filterState.track) return false;
      }

      return true;
    });
  }

  sortData(data) {
    return [...data].sort((a, b) => {
      let aValue = a[this.sortState.column];
      let bValue = b[this.sortState.column];

      if (aValue instanceof Date && bValue instanceof Date) {
        return this.sortState.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return this.sortState.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Event handlers
  attachEventListeners() {
    const style = document.createElement('style');
    style.textContent = `
      .advanced-table tr:hover {
        background-color: #f8f9fa !important;
      }
      .btn-primary {
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .btn-secondary {
        background: #6c757d;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .btn-danger {
        background: #dc3545;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);

    this.container.addEventListener('click', this.handleClick.bind(this));
    this.container.addEventListener('change', this.handleChange.bind(this));
    this.container.addEventListener('input', this.handleInput.bind(this));
  }

  handleClick(e) {
    const action = e.target.dataset.action;
    const rowId = e.target.dataset.rowId;
    const column = e.target.dataset.column;

    switch (action) {
      case 'add-row':
        this.showAddModal();
        break;
      case 'edit-row':
        this.showEditModal(rowId);
        break;
      case 'delete-row':
        this.deleteRow(rowId);
        break;
      case 'select-row':
        this.toggleRowSelection(rowId);
        break;
      case 'select-all':
        this.toggleSelectAll();
        break;
      case 'delete-selected':
        this.deleteSelectedRows();
        break;
      case 'export':
        this.exportData();
        break;
      case 'clear-filters':
        this.clearFilters();
        break;
    }

    if (column && e.target.closest('th')) {
      this.handleSort(column);
    }
  }

  handleChange(e) {
    if (e.target.dataset.filter) {
      this.handleFilterChange(e.target.dataset.filter, e.target.value);
    }
  }

  handleInput(e) {
    if (e.target.dataset.filter === 'text') {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.handleFilterChange('text', e.target.value);
      }, 300);
    }
  }

  handleSort(column) {
    if (this.sortState.column === column) {
      this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortState.column = column;
      this.sortState.direction = 'asc';
    }
    this.render();
  }

  handleFilterChange(filterType, value) {
    this.filterState[filterType] = value;
    this.render();
  }

  clearFilters() {
    this.filterState = { text: '', category: 'all', track: 'all' };
    this.render();
  }

  toggleRowSelection(rowId) {
    if (this.selectedRows.has(rowId)) {
      this.selectedRows.delete(rowId);
    } else {
      this.selectedRows.add(rowId);
    }
    this.render();
  }

  toggleSelectAll() {
    const data = this.getData();
    if (this.selectedRows.size === data.length) {
      this.selectedRows.clear();
    } else {
      data.forEach(item => this.selectedRows.add(item.id));
    }
    this.render();
  }

  deleteRow(rowId) {
    if (confirm('Are you sure you want to delete this item?')) {
      if (this.dataType === 'events') {
        this.stateManager.deleteEvent(rowId);
      } else {
        this.stateManager.deleteTrack(rowId);
      }
      this.selectedRows.delete(rowId);
    }
  }

  deleteSelectedRows() {
    if (this.selectedRows.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${this.selectedRows.size} items?`)) {
      this.selectedRows.forEach(rowId => {
        if (this.dataType === 'events') {
          this.stateManager.deleteEvent(rowId);
        } else {
          this.stateManager.deleteTrack(rowId);
        }
      });
      this.selectedRows.clear();
    }
  }

  showAddModal() {
    const itemType = this.dataType === 'events' ? 'event' : 'track';
    const title = prompt(`Enter ${itemType} title:`);
    
    if (title && title.trim()) {
      if (this.dataType === 'events') {
        const tracks = this.stateManager.getTracks();
        if (tracks.length === 0) {
          alert('Please create at least one track first!');
          return;
        }
        
        const event = {
          id: Date.now().toString(),
          title: title.trim(),
          timeline_id: tracks[0].id,
          start_date: new Date(),
          category: 'general',
          description: '',
          color: '#007bff',
          ai_generated: false,
          confidence_score: 1.0,
          created_at: new Date(),
          updated_at: new Date()
        };
        this.stateManager.addEvent(event);
      } else {
        const track = {
          id: Date.now().toString(),
          name: title.trim(),
          description: '',
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
          visible: true,
          created_at: new Date(),
          updated_at: new Date()
        };
        this.stateManager.addTrack(track);
      }
    }
  }

  showEditModal(rowId) {
    const item = this.dataType === 'events' 
      ? this.stateManager.getEvent(rowId)
      : this.stateManager.getTrack(rowId);
    
    if (!item) return;
    
    const newTitle = prompt('Edit title:', item.title || item.name);
    if (newTitle !== null && newTitle.trim()) {
      const updates = {
        [this.dataType === 'events' ? 'title' : 'name']: newTitle.trim(),
        updated_at: new Date()
      };
      
      if (this.dataType === 'events') {
        this.stateManager.updateEvent(rowId, updates);
      } else {
        this.stateManager.updateTrack(rowId, updates);
      }
    }
  }

  exportData() {
    const data = this.getData();
    const columns = this.getColumns();
    
    const headers = columns.map(col => col.label);
    const rows = data.map(item => 
      columns.map(col => this.formatCellValue(item, col))
    );

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.dataType}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  setupEventListeners() {
    this.stateManager.on('dataChanged', () => {
      this.render();
    });
  }
}