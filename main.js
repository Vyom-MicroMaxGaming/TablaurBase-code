class TablaurBase {
  constructor() {
    this.columns = [];
    this.rows = [];
    this.initializeElements();
    this.setupEventListeners();
    this.updateUI();
  }

  initializeElements() {
    // Inputs and buttons
    this.columnNameInput = document.getElementById('columnNameInput');
    this.addColumnBtn = document.getElementById('addColumnBtn');
    this.addRowBtn = document.getElementById('addRowBtn');
    this.exportBtn = document.getElementById('exportBtn');
    this.spreadsheet = document.getElementById('spreadsheet');
    this.emptyState = document.getElementById('emptyState');
    
    // Export dialog
    this.exportDialog = document.getElementById('exportDialog');
    this.exportFileName = document.getElementById('exportFileName');
    this.cancelExportBtn = document.getElementById('cancelExportBtn');
    this.confirmExportBtn = document.getElementById('confirmExportBtn');
  }

  setupEventListeners() {
    this.addColumnBtn.addEventListener('click', () => this.addColumn());
    this.columnNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addColumn();
    });
    
    this.addRowBtn.addEventListener('click', () => this.addRow());
    this.exportBtn.addEventListener('click', () => this.showExportDialog());
    
    this.cancelExportBtn.addEventListener('click', () => this.hideExportDialog());
    this.confirmExportBtn.addEventListener('click', () => this.exportToCsv());
    this.exportFileName.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.exportToCsv();
    });
    this.exportFileName.addEventListener('input', () => {
      this.confirmExportBtn.disabled = !this.exportFileName.value.trim();
    });
  }

  generateId() {
    return crypto.randomUUID();
  }

  addColumn() {
    const name = this.columnNameInput.value.trim();
    if (!name) return;

    const column = {
      id: this.generateId(),
      name
    };

    this.columns.push(column);
    this.columnNameInput.value = '';
    this.updateUI();
  }

  removeColumn(columnId) {
    this.columns = this.columns.filter(col => col.id !== columnId);
    this.rows = this.rows.map(row => {
      const { [columnId]: removed, ...rest } = row.data;
      return { ...row, data: rest };
    });
    this.updateUI();
  }

  renameColumn(columnId, newName) {
    this.columns = this.columns.map(col =>
      col.id === columnId ? { ...col, name: newName } : col
    );
    this.updateUI();
  }

  addRow() {
    const row = {
      id: this.generateId(),
      data: this.columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {})
    };
    this.rows.push(row);
    this.updateUI();
  }

  removeRow(rowId) {
    this.rows = this.rows.filter(row => row.id !== rowId);
    this.updateUI();
  }

  updateCell(rowId, columnId, value) {
    this.rows = this.rows.map(row =>
      row.id === rowId
        ? { ...row, data: { ...row.data, [columnId]: value } }
        : row
    );
  }

  showExportDialog() {
    this.exportDialog.classList.remove('hidden');
    this.exportFileName.focus();
  }

  hideExportDialog() {
    this.exportDialog.classList.add('hidden');
    this.exportFileName.value = '';
  }

  exportToCsv() {
    const fileName = this.exportFileName.value.trim();
    if (!fileName) return;

    const headers = ['Row', ...this.columns.map(col => col.name)];
    const csvRows = this.rows.map((row, index) =>
      [index + 1, ...this.columns.map(col => row.data[col.id] || '')].join(',')
    );

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
    this.hideExportDialog();
  }

  updateUI() {
    // Update empty state visibility
    this.emptyState.classList.toggle('hidden', this.columns.length > 0);
    this.addRowBtn.classList.toggle('hidden', this.columns.length === 0);
    this.exportBtn.classList.toggle('hidden', this.columns.length === 0);

    // Update table header
    const headerRow = this.spreadsheet.querySelector('thead tr');
    headerRow.innerHTML = `
      <th class="row-header">#</th>
      ${this.columns.map(col => `
        <th>
          <div class="column-header">
            <input
              type="text"
              class="column-name-input"
              value="${col.name}"
              onchange="tablaurBase.renameColumn('${col.id}', this.value)"
            />
            <button class="remove-column" onclick="tablaurBase.removeColumn('${col.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </th>
      `).join('')}
      ${this.columns.length > 0 ? '<th>Actions</th>' : ''}
    `;

    // Update table body
    const tbody = this.spreadsheet.querySelector('tbody');
    tbody.innerHTML = this.rows.map((row, index) => `
      <tr>
        <td class="row-header">${index + 1}</td>
        ${this.columns.map(col => `
          <td>
            <input
              type="text"
              value="${row.data[col.id] || ''}"
              oninput="tablaurBase.updateCell('${row.id}', '${col.id}', this.value)"
            />
          </td>
        `).join('')}
        ${this.columns.length > 0 ? `
          <td>
            <button class="remove-row" onclick="tablaurBase.removeRow('${row.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </td>
        ` : ''}
      </tr>
    `).join('');
  }
}

// Initialize the application
window.tablaurBase = new TablaurBase();