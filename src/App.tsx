import React, { useState } from 'react';
import { Download, Plus, Table2, Trash2, X } from 'lucide-react';

interface Column {
  id: string;
  name: string;
}

interface Row {
  id: string;
  data: Record<string, string>;
}

function App() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFileName, setExportFileName] = useState('');

  const addColumn = () => {
    if (!newColumnName.trim()) return;
    const newColumn: Column = {
      id: crypto.randomUUID(),
      name: newColumnName.trim()
    };
    setColumns([...columns, newColumn]);
    setNewColumnName('');
  };

  const removeColumn = (columnId: string) => {
    setColumns(columns.filter(col => col.id !== columnId));
    setRows(rows.map(row => {
      const newData = { ...row.data };
      delete newData[columnId];
      return { ...row, data: newData };
    }));
  };

  const addRow = () => {
    const newRow: Row = {
      id: crypto.randomUUID(),
      data: columns.reduce((acc, col) => ({ ...acc, [col.id]: '' }), {})
    };
    setRows([...rows, newRow]);
  };

  const updateCell = (rowId: string, columnId: string, value: string) => {
    setRows(rows.map(row => 
      row.id === rowId 
        ? { ...row, data: { ...row.data, [columnId]: value } }
        : row
    ));
  };

  const removeRow = (rowId: string) => {
    setRows(rows.filter(row => row.id !== rowId));
  };

  const handleExport = () => {
    if (exportFileName.trim()) {
      const headers = ['Row', ...columns.map(col => col.name)].join(',');
      const csvRows = rows.map((row, index) => 
        [index + 1, ...columns.map(col => row.data[col.id] || '')].join(',')
      );
      
      const csvContent = [headers, ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${exportFileName.trim()}.csv`;
      link.click();
      setShowExportDialog(false);
      setExportFileName('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-emerald-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 p-2 rounded-lg">
              <Table2 size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-500 text-transparent bg-clip-text">
              TablaurBase
            </h1>
          </div>
          
          {/* Column Management */}
          <div className="mb-6">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Enter column name"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                onKeyPress={(e) => e.key === 'Enter' && addColumn()}
              />
              <button
                onClick={addColumn}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all flex items-center gap-2"
              >
                <Plus size={20} /> Add Column
              </button>
            </div>
          </div>

          {/* Spreadsheet */}
          <div className="overflow-x-auto">
            {columns.length > 0 ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="sticky left-0 z-10 border p-2 bg-gray-50 text-gray-700 font-semibold w-16">
                      #
                    </th>
                    {columns.map(column => (
                      <th key={column.id} className="border p-2 text-gray-700">
                        <div className="flex items-center justify-between">
                          <span>{column.name}</span>
                          <button
                            onClick={() => removeColumn(column.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </th>
                    ))}
                    <th className="border p-2 w-16">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="sticky left-0 z-10 border p-2 text-center font-medium bg-gray-50 text-gray-700">
                        {index + 1}
                      </td>
                      {columns.map(column => (
                        <td key={column.id} className="border p-2">
                          <input
                            type="text"
                            value={row.data[column.id] || ''}
                            onChange={(e) => updateCell(row.id, column.id, e.target.value)}
                            className="w-full p-1 rounded focus:outline-none focus:bg-cyan-50/50"
                          />
                        </td>
                      ))}
                      <td className="border p-2 text-center">
                        <button
                          onClick={() => removeRow(row.id)}
                          className="text-red-500 hover:text-red-700"
                          aria-label="Remove row"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Add columns to start creating your spreadsheet
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            {columns.length > 0 && (
              <>
                <button
                  onClick={addRow}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2"
                >
                  <Plus size={20} /> Add Row
                </button>
                <button
                  onClick={() => setShowExportDialog(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all flex items-center gap-2"
                >
                  <Download size={20} /> Export CSV
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Export Spreadsheet</h2>
            <input
              type="text"
              value={exportFileName}
              onChange={(e) => setExportFileName(e.target.value)}
              placeholder="Enter file name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleExport()}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowExportDialog(false);
                  setExportFileName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={!exportFileName.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;