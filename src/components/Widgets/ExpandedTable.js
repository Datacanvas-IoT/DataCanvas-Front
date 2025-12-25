import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from "axios";
import Pagination from './../Pagination';

export default function ExpandedTable({ widget, setLoading, navigate }) {

    const [data, setData] = useState([]);
    const [recordCount, setRecordCount] = useState(0);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(100);

    useEffect(() => {
        /*
            * widget.configuration structure is as follows
            * [
            *   {
            *       id: 1,
                    widget_id: 2,
                    clm_id: 146,
                    device_id: 72,
                    Column : {
                        clm_name: 'id'
                    },
                    Device : {
                        device_name: 'IT Department'
                    }
            *   },
            *   // More columns
            * ]
            * Sort the above array in alphabetical order
            * After that, if there is a column with the name 'id', move it as the first element of the array and shift others backward
            * If there is a column with the name 'device', move it as the second element of the array and shift others backwards
        */
        widget.configuration.sort((a, b) => a.Column.clm_name.localeCompare(b.Column.clm_name));
        let idIndex = widget.configuration.findIndex(column => column.Column.clm_name == 'id');
        if (idIndex != -1) {
            let idColumn = widget.configuration.splice(idIndex, 1);
            widget.configuration.unshift(idColumn[0]);
        }
        let deviceIndex = widget.configuration.findIndex(column => column.Column.clm_name == 'device');
        if (deviceIndex != -1) {
            let deviceColumn = widget.configuration.splice(deviceIndex, 1);
            widget.configuration.splice(1, 0, deviceColumn[0]);
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        // Validate limit before making API call
        if (!limit || limit === '' || isNaN(limit) || limit <= 0 || !Number.isInteger(Number(limit))) {
            toast.error('Please enter a valid positive integer for the limit.');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/data/get/table?widget_id=${widget.id}&offset=${page}&limit=${limit}`,
                {
                    headers: {
                        "authorization": localStorage.getItem("auth-token")
                    }
                });

            if (response.status == 200) {
                console.log(response.data);
                setData(response.data.data);
                setRecordCount(response.data.count[0].count);
            }
            setLoading(false);
        } catch (err) {
            console.log(err);
            switch (err.response.status) {
                case 401:
                    toast.error("Unauthorized access");
                    navigate('/login');
                    break;
                case 403:
                    toast.error("Forbidden access");
                    navigate('/login');
                    break;
                case 404:
                    toast.error("Data not found");
                    navigate('/dashboard');
                    break;
                default:
                    toast.error("Something went wrong");
            }
            setLoading(false);
        }
    }

    return (
        <div className={``}>
            <div className="overflow-x-scroll overflow-y-scroll max-h-[610px] px-7 sm:px-10 mt-5 sm:mt-6">
                <table className="table-fixed w-full mb-4">
                    <thead>
                        <tr className={`bg-black3 `}>
                            {widget.configuration.map((column, index) => {
                                return (
                                    <th key={column.clm_id} className="w-[200px] border border-gray1 border-opacity-40 text-gray2 text-sm py-2 font-normal">{column.Column.clm_name}</th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => {
                            return (
                                <tr key={index}>
                                    {widget.configuration.map((column, index) => {
                                        return (
                                            <td key={column.clm_id} className="border border-gray1 border-opacity-40 text-white text-xs text-center px-2 py-2">
                                                {column.Column.clm_name == 'device' ? (
                                                    widget.configuration[0].Device.device_name
                                                ) : row[column.Column.clm_name].toString()}
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <Pagination recordCount={recordCount}
                limit={limit}
                offset={page}
                setOffset={setPage}
                loadAllData={fetchData} />
        </div>
    )
}