// Advanced table utilities for spreadsheet-like functionality

export class TableManager {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.sortState = { column: 'start_date', direction: 'asc' };
    this.filterState = { text: '', category: 'all', track: 'all' };
    this.selectedCells = new Set();
    this.editingCell = null;
    this.clipboard = null;
  }

  // Column definitions for the events table
  getEventColumns() {
    return [
      { 
        key: 'title', 
        label: 'Title', 
        type: 'text', 
        width: 200, 
        required: true,
        editable: true 
      },
      { 
        key: 'timeline_id', 
        label: 'Track', 
        type: 'select', 
        width: 150, 
        required: true,
        editable: true,
        options: () => this.stateManager.getTracks().map(t => ({ value: t.id, label: t.name }))
      },
      { 
        key: 'start_date', 
        label: 'Start Date', 
        type: 'date', 
        width: 130, 
        required: true,
        editable: true 
      },
      { 
        key: 'end_date', 
        label: 'End Date', 
        type: 'date', 
        width: 130, 
        required: false,
        editable: true 
      },
      { 
        key: 'category', 
        label: 'Category', 
        type: 'text', 
        width: 120, 
        required: false,
        editable: true 
      },
      { 
        key: 'description', 
        label: 'Description', 
        type: 'textarea', 
        width: 250, 
        required: false,
        editable: true 
      },
      { 
        key: 'color', 
        label: 'Color', 
        type: 'color', 
        width: 80, 
        required: false,
        editable: true 
      },
      { 
        key: 'ai_generated', 
        label: 'AI Generated', 
        type: 'boolean', 
        width: 100, 
        required: false,
        editable: false 
      },
      { 
        key: 'confidence_score', 
        label: 'Confidence', 
        type: 'number', 
        width: 100, 
        required: false,
        editable: false,
        format: (value) => value ? `${Math.round(value * 100)}%` : '-'
      }
    ];
  }

  // Column definitions for the tracks table
  getTrackColumns() {
    return [
      { 
        key: 'name', 
        label: 'Name', 
        type: 'text', 
        width: 200, 
        required: true,
        editable: true 
      },
      { 
        key: 'description', 
        label: 'Description', 
        type: 'textarea', 
        width: 300, 
        required: false,
        editable: true 
      },
      { 
        key: 'color', 
        label: 'Color', 
        type: 'color', 
        width: 100, 
        required: false,
        editable: true 
      },
      { 
        key: 'visible', 
        label: 'Visible', 
        type: 'boolean', 
        width: 80, 
        required: false,
        editable: true 
      },
      { 
        key: 'event_count', 
        label: 'Events', 
        type: 'computed', 
        width: 80, 
        required: false,
        editable: false,
        compute: (track) => this.stateManager.getEventsForTrack(track.id).length
      }
    ];
  }

  // Sorting functionality
  sortData(data, column, direction = 'asc') {
    return [...data].sort((a, b) => {
      let aValue = this.getCellValue(a, column);
      let bValue = this.getCellValue(b, column);

      // Handle different data types
      if (aValue instanceof Date && bValue instanceof Date) {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Filtering functionality
  filterData(data, filters) {
    return data.filter(item => {
      // Text filter
      if (filters.text) {
        const searchText = filters.text.toLowerCase();
        const searchableFields = ['title', 'description', 'category'];
        const matches = searchableFields.some(field => {
          const value = this.getCellValue(item, field);
          return value && value.toString().toLowerCase().includes(searchText);
        });
        if (!matches) return false;
      }

      // Category filter
      if (filters.category && filters.category !== 'all') {
        if (item.category !== filters.category) return false;
      }

      // Track filter
      if (filters.track && filters.track !== 'all') {
        if (item.timeline_id !== filters.track) return false;
      }

      return true;
    });
  }

  // Get cell value with proper handling of different data types
  getCellValue(item, column) {
    const value = item[column];
    
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value;
    if (typeof value === 'boolean') return value;
    
    return value.toString();
  }

  // Format cell value for display
  formatCellValue(item, column, columnDef) {
    const value = this.getCellValue(item, column);
    
    if (columnDef.type === 'computed') {
      return columnDef.compute(item);
    }
    
    if (columnDef.format) {
      return columnDef.format(value);
    }

    if (columnDef.type === 'date' && value instanceof Date) {
      return value.toLocaleDateString();
    }

    if (columnDef.type === 'boolean') {
      return value ? '✓' : '';
    }

    if (columnDef.type === 'select' && columnDef.options) {
      const option = columnDef.options().find(opt => opt.value === value);
      return option ? option.label : value;
    }

    return value;
  }

  // Validate cell value
  validateCellValue(value, columnDef) {
    const errors = [];

    if (columnDef.required && (!value || value.toString().trim() === '')) {
      errors.push(`${columnDef.label} is required`);
    }

    if (columnDef.type === 'date' && value && !(value instanceof Date) && isNaN(Date.parse(value))) {
      errors.push(`${columnDef.label} must be a valid date`);
    }

    if (columnDef.type === 'number' && value && isNaN(Number(value))) {
      errors.push(`${columnDef.label} must be a number`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Convert user input to proper data type
  convertCellValue(value, columnDef) {
    if (!value && !columnDef.required) return null;

    switch (columnDef.type) {
      case 'date':
        return value instanceof Date ? value : new Date(value);
      case 'number':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      default:
        return value;
    }
  }

  // CSV import/export functionality
  exportToCSV(data, columns) {
    const headers = columns.map(col => col.label);
    const rows = data.map(item => 
      columns.map(col => {
        const value = this.formatCellValue(item, col.key, col);
        // Escape commas and quotes for CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      })
    );

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return csvContent;
  }

  // Parse CSV data
  parseCSV(csvText, columns) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return { data: [], errors: ['CSV must have at least a header and one data row'] };

    const headers = this.parseCSVRow(lines[0]);
    const columnMap = new Map();
    
    // Map CSV headers to our column definitions
    headers.forEach((header, index) => {
      const column = columns.find(col => 
        col.label.toLowerCase() === header.toLowerCase() ||
        col.key.toLowerCase() === header.toLowerCase()
      );
      if (column) {
        columnMap.set(index, column);
      }
    });

    const data = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVRow(lines[i]);
      const item = {};
      
      values.forEach((value, index) => {
        const column = columnMap.get(index);
        if (column) {
          try {
            item[column.key] = this.convertCellValue(value, column);
          } catch (error) {
            errors.push(`Row ${i + 1}, ${column.label}: ${error.message}`);
          }
        }
      });

      if (Object.keys(item).length > 0) {
        data.push(item);
      }
    }

    return { data, errors };
  }

  // Parse a single CSV row, handling quotes and commas
  parseCSVRow(row) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }
}