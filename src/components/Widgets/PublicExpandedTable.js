import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Pagination from './../Pagination';
import shareService from '../../services/shareService';

/**
 * PublicExpandedTable - Expanded table view for public/shared dashboards
 * Uses public API endpoints (no authentication required)
 */
export default function PublicExpandedTable({ widget, shareToken, setLoading }) {
    const [data, setData] = useState([]);
    const [recordCount, setRecordCount] = useState(0);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(100);

    useEffect(() => {
        // Sort configuration columns
        if (widget.configuration && Array.isArray(widget.configuration)) {
            widget.configuration.sort((a, b) => a.Column.clm_name.localeCompare(b.Column.clm_name));
            
            let idIndex = widget.configuration.findIndex(column => column.Column.clm_name === 'id');
            if (idIndex !== -1) {
                let idColumn = widget.configuration.splice(idIndex, 1);
                widget.configuration.unshift(idColumn[0]);
            }
            
            let deviceIndex = widget.configuration.findIndex(column => column.Column.clm_name === 'device');
            if (deviceIndex !== -1) {
                let deviceColumn = widget.configuration.splice(deviceIndex, 1);
                widget.configuration.splice(1, 0, deviceColumn[0]);
            }
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        if (!limit || limit === '' || isNaN(limit) || limit <= 0 || !Number.isInteger(Number(limit))) {
            toast.error('Please enter a valid positive integer for the limit.');
            return;
        }

        try {
            setLoading(true);
            const response = await shareService.getPublicFullTableData(shareToken, widget.id, page, limit);

            if (response.status === 200) {
                setData(response.data.data);
                setRecordCount(response.data.count[0].count);
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 404) {
                toast.error("Data not found");
            } else if (err.response?.status === 403) {
                toast.error("Access denied to this widget");
            } else {
                toast.error("Something went wrong loading table data");
            }
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="overflow-x-scroll overflow-y-scroll max-h-[610px] px-7 sm:px-10 mt-5 sm:mt-6">
                <table className="table-fixed w-full mb-4">
                    <thead>
                        <tr className="bg-black3">
                            {widget.configuration && widget.configuration.map((column, index) => (
                                <th 
                                    key={column.clm_id || index} 
                                    className="w-[200px] border border-gray1 border-opacity-40 text-gray2 text-sm py-2 font-normal"
                                >
                                    {column.Column.clm_name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {widget.configuration && widget.configuration.map((column, colIndex) => (
                                    <td 
                                        key={column.clm_id || colIndex} 
                                        className="border border-gray1 border-opacity-40 text-white text-xs text-center px-2 py-2"
                                    >
                                        {column.Column.clm_name === 'device' 
                                            ? (widget.configuration[0]?.Device?.device_name || row[column.Column.clm_name])
                                            : (row[column.Column.clm_name] !== null && row[column.Column.clm_name] !== undefined 
                                                ? row[column.Column.clm_name].toString() 
                                                : '')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination 
                recordCount={recordCount}
                limit={limit}
                offset={page}
                setOffset={setPage}
                loadAllData={fetchData} 
            />
        </div>
    );
}
