import { TableManager } from '../utils/tableUtils.js';

export class AdvancedTable {
  constructor(container, stateManager, dataType = 'events') {
    this.container = container;
    this.stateManager = stateManager;
    this.dataType = dataType; // 'events' or 'tracks'
    this.tableManager = new TableManager(stateManager);
    this.selectedRows = new Set();
    this.editingCell = null;
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
    return this.dataType === 'events' 
      ? this.tableManager.getEventColumns() 
      : this.tableManager.getTrackColumns();
  }

  render() {
    const data = this.getData();
    const columns = this.getColumns();
    
    // Apply sorting and filtering
    let processedData = this.tableManager.filterData(data, this.filterState);
    processedData = this.tableManager.sortData(processedData, this.sortState.column, this.sortState.direction);

    this.container.innerHTML = `
      <div class="advanced-table-container">
        ${this.renderToolbar()}
        ${this.renderFilters()}
        ${this.renderTable(processedData, columns)}
      </div>
    `;

    this.attachEventListeners();
  }

  renderToolbar() {
    const selectedCount = this.selectedRows.size;
    return `
      <div class="table-toolbar" style="
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
        padding: 15px 0; 
        border-bottom: 1px solid #eee;
        margin-bottom: 15px;
      ">
        <div class="toolbar-left">
          <h3 style="margin: 0; color: #333;">
            ${this.dataType === 'events' ? 'Timeline Events' : 'Timeline Tracks'} 
            (${this.getData().length})
          </h3>
          ${selectedCount > 0 ? `
            <span style="margin-left: 15px; color: #666; font-size: 14px;">
              ${selectedCount} selected
            </span>
          ` : ''}
        </div>
        
        <div class="toolbar-right" style="display: flex; gap: 10px;">
          <button class="btn-secondary" data-action="import">
            📁 Import CSV
          </button>
          <button class="btn-secondary" data-action="export">
            💾 Export CSV
          </button>
          ${selectedCount > 0 ? `
            <button class="btn-danger" data-action="delete-selected">
              🗑️ Delete Selected
            </button>
          ` : ''}
          <button class="btn-primary" data-action="add-row">
            ➕ Add ${this.dataType === 'events' ? 'Event' : 'Track'}
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
      <div class="table-filters" style="
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
            placeholder="🔍 Search events..." 
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
      <div class="table-wrapper" style="
        background: white; 
        border-radius: 8px; 
        overflow: hidden; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border: 1px solid #e9ecef;
      ">
        <table class="advanced-table" style="
          width: 100%; 
          border-collapse: collapse; 
          font-size: 14px;
        ">
          ${this.renderHeader(columns)}
          ${this.renderBody(data, columns)}
        </table>
      </div>
      
      ${this.renderContextMenu()}
      ${this.renderEditModal()}
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
              data-sortable="true"
              style="
                width: ${col.width}px; 
                padding: 12px; 
                text-align: left; 
                font-weight: 600; 
                color: #495057;
                border-right: 1px solid #dee2e6;
                cursor: pointer;
                user-select: none;
                position: relative;
              "
            >
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>${col.label}</span>
                <span class="sort-indicator" style="
                  font-size: 12px; 
                  color: #6c757d;
                  margin-left: 5px;
                ">
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
    const rowClass = index % 2 === 0 ? 'even' : 'odd';
    
    return `
      <tr 
        data-row-id="${item.id}"
        class="table-row ${rowClass} ${isSelected ? 'selected' : ''}"
        style="
          background: ${isSelected ? '#e3f2fd' : (index % 2 === 0 ? 'white' : '#f8f9fa')};
          border-bottom: 1px solid #dee2e6;
          transition: background-color 0.2s ease;
        "
      >
        <td style="
          padding: 8px; 
          text-align: center; 
          border-right: 1px solid #dee2e6;
        ">
          <input 
            type="checkbox" 
            data-action="select-row" 
            data-row-id="${item.id}"
            ${isSelected ? 'checked' : ''}
          />
        </td>
        ${columns.map(col => `
          <td 
            data-cell="${item.id}-${col.key}"
            data-editable="${col.editable}"
            style="
              padding: 8px 12px; 
              border-right: 1px solid #dee2e6;
              ${col.editable ? 'cursor: text;' : ''}
              max-width: ${col.width}px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            "
            title="${this.tableManager.formatCellValue(item, col.key, col)}"
          >
            ${this.renderCellContent(item, col)}
          </td>
        `).join('')}
        <td style="padding: 8px; text-align: center; border-right: 1px solid #dee2e6;">
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
            ✏️
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
            🗑️
          </button>
        </td>
      </tr>
    `;
  }

  renderCellContent(item, col) {
    const value = this.tableManager.formatCellValue(item, col.key, col);
    
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
      return `<span style="font-size: 16px; color: ${value ? '#28a745' : '#6c757d'};">${value || '○'}</span>`;
    }
    
    return value;
  }

  renderContextMenu() {
    return `
      <div id="context-menu" style="
        position: fixed;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        padding: 5px 0;
        z-index: 1000;
        display: none;
      ">
        <div class="context-item" data-action="copy-row">Copy Row</div>
        <div class="context-item" data-action="paste-row">Paste Row</div>
        <div class="context-item" data-action="duplicate-row">Duplicate Row</div>
        <hr style="margin: 5px 0; border: none; border-top: 1px solid #eee;">
        <div class="context-item" data-action="delete-row">Delete Row</div>
      </div>
    `;
  }

  renderEditModal() {
    return `
      <div id="edit-modal" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 2000;
        display: none;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          background: white;
          border-radius: 8px;
          padding: 20px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
        ">
          <div id="edit-modal-content">
            <!-- Modal content will be rendered here -->
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Add CSS styles for hover effects
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
      .context-item {
        padding: 8px 16px;
        cursor: pointer;
        font-size: 14px;
      }
      .context-item:hover {
        background: #f8f9fa;
      }
    `;
    document.head.appendChild(style);

    // Event delegation for all table interactions
    this.container.addEventListener('click', this.handleClick.bind(this));
    this.container.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    this.container.addEventListener('change', this.handleChange.bind(this));
    this.container.addEventListener('input', this.handleInput.bind(this));
    this.container.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    
    // Global click to hide context menu
    document.addEventListener('click', () => {
      const contextMenu = document.getElementById('context-menu');
      if (contextMenu) contextMenu.style.display = 'none';
    });
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
      case 'import':
        this.showImportModal();
        break;
      case 'export':
        this.exportData();
        break;
      case 'clear-filters':
        this.clearFilters();
        break;
    }

    // Handle column sorting
    if (column && e.target.closest('th')) {
      this.handleSort(column);
    }
  }

  handleDoubleClick(e) {
    const cell = e.target.closest('td[data-editable="true"]');
    if (cell) {
      this.startInlineEdit(cell);
    }
  }

  handleChange(e) {
    if (e.target.dataset.filter) {
      this.handleFilterChange(e.target.dataset.filter, e.target.value);
    }
  }

  handleInput(e) {
    if (e.target.dataset.filter === 'text') {
      // Debounce text search
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.handleFilterChange('text', e.target.value);
      }, 300);
    }
  }

  handleContextMenu(e) {
    e.preventDefault();
    const row = e.target.closest('tr[data-row-id]');
    if (row) {
      const contextMenu = document.getElementById('context-menu');
      contextMenu.style.display = 'block';
      contextMenu.style.left = e.pageX + 'px';
      contextMenu.style.top = e.pageY + 'px';
      contextMenu.dataset.rowId = row.dataset.rowId;
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
    const columns = this.getColumns().filter(col => col.editable);
    const modal = document.getElementById('edit-modal');
    const content = document.getElementById('edit-modal-content');
    
    content.innerHTML = `
      <h3>Add New ${this.dataType === 'events' ? 'Event' : 'Track'}</h3>
      <form id="add-form">
        ${columns.map(col => this.renderFormField(col, null)).join('')}
        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" onclick="document.getElementById('edit-modal').style.display='none'" style="
            padding: 8px 16px; 
            background: #6c757d; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer;
          ">Cancel</button>
          <button type="submit" style="
            padding: 8px 16px; 
            background: #28a745; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer;
          ">Add ${this.dataType === 'events' ? 'Event' : 'Track'}</button>
        </div>
      </form>
    `;
    
    modal.style.display = 'flex';
    
    // Handle form submission
    document.getElementById('add-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(e.target, 'add');
    });
  }

  showEditModal(rowId) {
    const item = this.dataType === 'events' 
      ? this.stateManager.getEvent(rowId)
      : this.stateManager.getTrack(rowId);
    
    if (!item) return;
    
    const columns = this.getColumns().filter(col => col.editable);
    const modal = document.getElementById('edit-modal');
    const content = document.getElementById('edit-modal-content');
    
    content.innerHTML = `
      <h3>Edit ${this.dataType === 'events' ? 'Event' : 'Track'}</h3>
      <form id="edit-form" data-item-id="${item.id}">
        ${columns.map(col => this.renderFormField(col, item)).join('')}
        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" onclick="document.getElementById('edit-modal').style.display='none'" style="
            padding: 8px 16px; 
            background: #6c757d; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer;
          ">Cancel</button>
          <button type="submit" style="
            padding: 8px 16px; 
            background: #007bff; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer;
          ">Save Changes</button>
        </div>
      </form>
    `;
    
    modal.style.display = 'flex';
    
    // Handle form submission
    document.getElementById('edit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(e.target, 'edit', item.id);
    });
  }

  renderFormField(col, item) {
    const value = item ? item[col.key] : '';
    const displayValue = col.type === 'date' && value instanceof Date 
      ? value.toISOString().split('T')[0] 
      : value;

    let fieldHTML = '';
    
    switch (col.type) {
      case 'textarea':
        fieldHTML = `
          <textarea 
            name="${col.key}" 
            placeholder="${col.label}"
            ${col.required ? 'required' : ''}
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-height: 80px; resize: vertical;"
          >${displayValue || ''}</textarea>
        `;
        break;
        
      case 'select':
        const options = col.options ? col.options() : [];
        fieldHTML = `
          <select 
            name="${col.key}" 
            ${col.required ? 'required' : ''}
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
          >
            <option value="">Select ${col.label}</option>
            ${options.map(opt => `
              <option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>
                ${opt.label}
              </option>
            `).join('')}
          </select>
        `;
        break;
        
      case 'boolean':
        fieldHTML = `
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input 
              type="checkbox" 
              name="${col.key}"
              ${value ? 'checked' : ''}
            />
            <span>Enable ${col.label}</span>
          </label>
        `;
        break;
        
      case 'color':
        fieldHTML = `
          <div style="display: flex; gap: 10px; align-items: center;">
            <input 
              type="color" 
              name="${col.key}" 
              value="${displayValue || '#007bff'}"
              style="width: 50px; height: 40px; border: none; border-radius: 4px; cursor: pointer;"
            />
            <input 
              type="text" 
              value="${displayValue || '#007bff'}"
              readonly
              style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa;"
            />
          </div>
        `;
        break;
        
      default:
        fieldHTML = `
          <input 
            type="${col.type === 'date' ? 'date' : col.type === 'number' ? 'number' : 'text'}" 
            name="${col.key}" 
            value="${displayValue || ''}"
            placeholder="${col.label}"
            ${col.required ? 'required' : ''}
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
          />
        `;
    }

    return `
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #333;">
          ${col.label} ${col.required ? '<span style="color: #dc3545;">*</span>' : ''}
        </label>
        ${fieldHTML}
      </div>
    `;
  }

  handleFormSubmit(form, action, itemId = null) {
    const formData = new FormData(form);
    const data = {};
    const columns = this.getColumns();
    
    // Process form data
    for (const [key, value] of formData.entries()) {
      const column = columns.find(col => col.key === key);
      if (column) {
        try {
          data[key] = this.tableManager.convertCellValue(value, column);
        } catch (error) {
          alert(`Error in ${column.label}: ${error.message}`);
          return;
        }
      }
    }
    
    // Handle checkboxes (they don't appear in FormData if unchecked)
    columns.filter(col => col.type === 'boolean').forEach(col => {
      if (!formData.has(col.key)) {
        data[col.key] = false;
      }
    });
    
    // Validate data
    const errors = [];
    columns.forEach(col => {
      if (col.editable) {
        const validation = this.tableManager.validateCellValue(data[col.key], col);
        if (!validation.isValid) {
          errors.push(...validation.errors);
        }
      }
    });
    
    if (errors.length > 0) {
      alert('Validation errors:\n' + errors.join('\n'));
      return;
    }
    
    // Submit data
    try {
      if (action === 'add') {
        if (this.dataType === 'events') {
          const event = this.stateManager.stateManager ? 
            this.stateManager.stateManager.createTimelineEvent(data) :
            { id: Date.now().toString(), ...data, created_at: new Date(), updated_at: new Date() };
          this.stateManager.addEvent(event);
        } else {
          const track = this.stateManager.stateManager ?
            this.stateManager.stateManager.createTimelineTrack(data) :
            { id: Date.now().toString(), ...data, created_at: new Date(), updated_at: new Date() };
          this.stateManager.addTrack(track);
        }
      } else if (action === 'edit') {
        if (this.dataType === 'events') {
          this.stateManager.updateEvent(itemId, data);
        } else {
          this.stateManager.updateTrack(itemId, data);
        }
      }
      
      // Close modal
      document.getElementById('edit-modal').style.display = 'none';
      
    } catch (error) {
      alert('Error saving data: ' + error.message);
    }
  }

  exportData() {
    const data = this.getData();
    const columns = this.getColumns();
    const csv = this.tableManager.exportToCSV(data, columns);
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.dataType}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  showImportModal() {
    const modal = document.getElementById('edit-modal');
    const content = document.getElementById('edit-modal-content');
    
    content.innerHTML = `
      <h3>Import ${this.dataType === 'events' ? 'Events' : 'Tracks'} from CSV</h3>
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">
          Select CSV File
        </label>
        <input 
          type="file" 
          id="csv-file" 
          accept=".csv"
          style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
        />
      </div>
      
      <div style="margin-bottom: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: 500;">
          Expected Columns:
        </label>
        <div style="background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 12px;">
          ${this.getColumns().filter(col => col.editable).map(col => col.label).join(', ')}
        </div>
      </div>
      
      <div id="import-preview" style="display: none; margin-bottom: 15px;">
        <h4>Preview:</h4>
        <div id="preview-content" style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px;"></div>
      </div>
      
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button type="button" onclick="document.getElementById('edit-modal').style.display='none'" style="
          padding: 8px 16px; 
          background: #6c757d; 
          color: white; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer;
        ">Cancel</button>
        <button id="import-btn" disabled style="
          padding: 8px 16px; 
          background: #28a745; 
          color: white; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer;
          opacity: 0.5;
        ">Import Data</button>
      </div>
    `;
    
    modal.style.display = 'flex';
    
    // Handle file selection
    document.getElementById('csv-file').addEventListener('change', (e) => {
      this.handleFileSelect(e.target.files[0]);
    });
  }

  handleFileSelect(file) {
    if (!file || file.type !== 'text/csv') {
      alert('Please select a valid CSV file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target.result;
      const columns = this.getColumns().filter(col => col.editable);
      const result = this.tableManager.parseCSV(csvText, columns);
      
      if (result.errors.length > 0) {
        alert('Import errors:\n' + result.errors.join('\n'));
      }
      
      if (result.data.length > 0) {
        this.showImportPreview(result.data);
        document.getElementById('import-btn').disabled = false;
        document.getElementById('import-btn').style.opacity = '1';
        document.getElementById('import-btn').onclick = () => this.importData(result.data);
      }
    };
    
    reader.readAsText(file);
  }

  showImportPreview(data) {
    const preview = document.getElementById('import-preview');
    const content = document.getElementById('preview-content');
    
    content.innerHTML = `
      <p>Found ${data.length} rows to import</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background: #f8f9fa;">
            ${this.getColumns().filter(col => col.editable).map(col => 
              `<th style="padding: 5px; border: 1px solid #ddd;">${col.label}</th>`
            ).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.slice(0, 5).map(item => `
            <tr>
              ${this.getColumns().filter(col => col.editable).map(col => 
                `<td style="padding: 5px; border: 1px solid #ddd;">${item[col.key] || ''}</td>`
              ).join('')}
            </tr>
          `).join('')}
          ${data.length > 5 ? `<tr><td colspan="${this.getColumns().filter(col => col.editable).length}" style="padding: 5px; text-align: center; font-style: italic;">... and ${data.length - 5} more rows</td></tr>` : ''}
        </tbody>
      </table>
    `;
    
    preview.style.display = 'block';
  }

  importData(data) {
    try {
      data.forEach(item => {
        if (this.dataType === 'events') {
          const event = { 
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...item, 
            created_at: new Date(), 
            updated_at: new Date() 
          };
          this.stateManager.addEvent(event);
        } else {
          const track = { 
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...item, 
            created_at: new Date(), 
            updated_at: new Date() 
          };
          this.stateManager.addTrack(track);
        }
      });
      
      document.getElementById('edit-modal').style.display = 'none';
      alert(`Successfully imported ${data.length} ${this.dataType}!`);
      
    } catch (error) {
      alert('Error importing data: ' + error.message);
    }
  }

  setupEventListeners() {
    // Listen for state changes to re-render
    this.stateManager.on('dataChanged', () => {
      this.render();
    });
  }
}