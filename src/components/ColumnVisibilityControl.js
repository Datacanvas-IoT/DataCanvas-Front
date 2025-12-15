import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ColumnVisibilityControl({ columns, visibleColumns, setVisibleColumns }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleColumn = (columnId) => {
        setVisibleColumns(prev => {
            if (prev.includes(columnId)) {
                return prev.filter(id => id !== columnId);
            } else {
                return [...prev, columnId];
            }
        });
    };

    const toggleAll = () => {
        if (visibleColumns.length === columns.length) {
            setVisibleColumns([]);
        } else {
            setVisibleColumns(columns.map(col => col.clm_id));
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-2 px-4 py-2 bg-black3 hover:bg-gray1 hover:bg-opacity-50 text-white rounded-md transition-all duration-200 hover:shadow-lg"
            >
                {isExpanded ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                <span className="text-sm">Columns ({visibleColumns.length}/{columns.length})</span>
            </button>

            {isExpanded && (
                <div className="absolute right-0 mt-2 w-64 bg-black3 border border-gray1 border-opacity-40 rounded-md shadow-lg z-10 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray1 border-opacity-40">
                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray1 hover:bg-opacity-10 p-2 rounded">
                            <input
                                type="checkbox"
                                checked={visibleColumns.length === columns.length}
                                onChange={toggleAll}
                                className="w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm font-semibold text-white">Toggle All</span>
                        </label>
                    </div>
                    <div className="p-2">
                        {columns.map((column) => (
                            <label
                                key={column.clm_id}
                                className="flex items-center space-x-2 cursor-pointer hover:bg-gray1 hover:bg-opacity-10 p-2 rounded"
                            >
                                <input
                                    type="checkbox"
                                    checked={visibleColumns.includes(column.clm_id)}
                                    onChange={() => toggleColumn(column.clm_id)}
                                    className="w-4 h-4 cursor-pointer"
                                />
                                <span className="text-sm text-gray2">{column.clm_name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ColumnVisibilityControl;
