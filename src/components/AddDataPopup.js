import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import PopupContainer from "./PopupContainer";
import ButtonRectangle from "./input/ButtonRectangle";
import TextBox from "./input/TextBox";
import SelectBox from "./input/SelectBox";
import { toast } from 'react-toastify';
import axios from "axios";
import 'react-toastify/dist/ReactToastify.css';
import config from "../config";

const AddDataPopup = ({ isOpen, closeFunction, columns, projectID, tblName, setLoading }) => {
    const [devices, setDevices] = useState([]);
    const [newData, setNewData] = useState({
        device: 0
    });

    useEffect(() => {
        loadDevices();
        setNewDataObject(columns);
    }, [])


    // setNewData() -> Make this a JSON object with fields same as the clm_name of each element of columns object, except id column
    /* Column Structure
        {
            clm_id: 1,
            clm_name: 'id',
            data_type: 1,
            default_value: 'N/A',
            max_length: 0,
            constraints: [
                {
                    constraint_id: 1
                },
                {
                    constraint_id: 2
                }
            ]
         }
        */
    const setNewDataObject = (columns) => {
        let newDataObject = {};
        newDataObject['device'] = 0;
        columns.map((column, index) => {
            if (!column.is_system_column) {
                // If column does not have constraint_id 1 newDataObject[column.clm_name] = ''
                let isAutoIncrement = column.constraints.find((constraint) => { if (constraint.constraint_id == 1) { return true } else { return false } });
                if (!isAutoIncrement) {
                    newDataObject[column.clm_name] = '';
                }
            }
        })
        setNewData(newDataObject);
    }

    const handleColumnValueChanged = (clm_name, value) => {
        setNewData({ ...newData, [clm_name]: value });
    }

    /*
        * Following is the request body structure
        {
            "project_id": 23,
            "fingerprint": "BV1OgcPxo3rlPVqBkknxgv9aimMZYbv8",
            "table": "tbl_data",
            "data":{
                "temperature": 33,
                "humidity": 83,
                "wind_direction": 154,
                "wind_speed": 11,
                "soil_temperature": 21,
                "station_name": "Kurunegala"
            }
        }
        * POST request URL : localhost:3001/api/data/feed/insert
        * fingerprint should be retrieved from devices list according to the device_id in newData
    */
    const uploadNewData = async () => {
        if (newData.device == 0) {
            toast.error("Please select a device!");
            return;
        }

        // Validate numeric fields
        for (let column of columns) {
            if (column.clm_name !== 'id' && column.clm_name !== 'device' && !column.is_system_column) {
                const value = newData[column.clm_name];
                if ((column.data_type == 1 || column.data_type == 2) && value !== '' && value !== undefined) {
                    if (isNaN(value)) {
                        toast.error(`${column.clm_name} must be a valid number.`);
                        return;
                    }
                    if (column.data_type == 1 && !Number.isInteger(Number(value))) {
                        toast.error(`${column.clm_name} must be an integer.`);
                        return;
                    }
                }
            }
        }

        // get fingerprint from devices list
        let fingerprint = '';
        devices.map((device) => {
            if (device.device_id == newData.device) {
                fingerprint = device.fingerprint;
            }
        })

        // Remove device field from newData and create request body
        let requestBody = {
            project_id: projectID,
            fingerprint: fingerprint,
            table: tblName,
            data: {}
        }

        columns.map((column, index) => {
            if (column.clm_name !== 'id' && column.clm_name !== 'device') {
                requestBody.data[column.clm_name] = newData[column.clm_name];
            }
        })

        setLoading(true);
        // post request to localhost:3001/api/data/feed/insert
        try {
            const response = await axios.post(
                `${config.REACT_APP_API_URL}/data/feed/insert`,
                requestBody,
            );

            if (response.status === 200) {
                toast.success("Data added successfully!");
                setLoading(false);
                closeFunction();
            }
        } catch (err) {
            switch (err.response.status) {
                case 400:
                    toast.error(err.response.data.error);
                    break;
                case 401:
                    toast.error("Unauthorized access!");
                    break;
                case 403:
                    toast.error("Unauthorized access!");
                    break;
                case 404:
                    toast.error("Project not found!");
                    break;
                default:
                    toast.error("Something went wrong!");
                    break;
            }
            setLoading(false);
            closeFunction();
        }
    }

    const loadDevices = async () => {
        setLoading(true);
        // get request to localhost:3001/api/device?project_id=<projectID>
        try {
            const response = await axios.get(
                `${config.REACT_APP_API_URL}/device?project_id=${projectID}`,
                {
                    headers: {
                        authorization: localStorage.getItem("auth-token"),
                    },
                }
            );

            if (response.status === 200) {
                setDevices(response.data);
                setLoading(false);
            }
        } catch (err) {
            switch (err.response.status) {
                case 400:
                    toast.error("Bad request!");
                    break;
                case 401:
                    toast.error("Unauthorized access!");
                    break;
                case 403:
                    toast.error("Unauthorized access!");
                    break;
                case 404:
                    toast.error("Project not found!");
                    break;
                default:
                    toast.error("Something went wrong!");
                    break;
            }
            setDevices([]);
            setLoading(false);
            closeFunction();
        }
    }

    const InputContainer = (caption, placeholder, value, onChange, dataType) => {
        return (
            <div className="my-3">
                <span className="text-sm">{caption}</span>
                {dataType == 4 ? (
                    <SelectBox value={value}
                        onChange={(e) => onChange(caption, e.target.value)}>
                        <option value={0}>Select Value</option>
                        <option value="true">TRUE</option>
                        <option value="false">FALSE</option>
                    </SelectBox>
                ) : (
                    <TextBox
                        type={((dataType == 1 || dataType == 2) ? 'number' : 'text')}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(caption, e.target.value)} />
                )}
            </div>
        )
    }

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={() => { }}
            closeFunction={closeFunction}
            title="Add Data"
            Icon={FaPlus}
            closeIconVisible={true}>
            <div className=" h-80 overflow-y-scroll overflow-x-hidden pe-4 sm:pe-8 ps-0 sm:ps-2 pb-4">

                <div className="my-3">
                    <span className="text-sm">Device</span>
                    <SelectBox value={newData.device}
                        onChange={(e) => { handleColumnValueChanged('device', e.target.value) }}>
                        <option value={0}>Select Device</option>
                        {devices.map((device) => {
                            return (
                                <option
                                    key={device.device_id}
                                    value={device.device_id}>
                                    {device.device_name}
                                </option>
                            )
                        })}
                    </SelectBox>
                </div>
                {columns.map((column, index) => {
                    if (!column.is_system_column && !column.constraints.find((constraint) => { if (constraint.constraint_id == 1) { return true } else { return false } })) {
                        return (
                            <div key={index}>
                                {InputContainer(
                                    column.clm_name,
                                    'Enter ' + column.clm_name + ' value',
                                    newData[column.clm_name] ? newData[column.clm_name] : '',
                                    (clm_name, value) => handleColumnValueChanged(clm_name, value),
                                    column.data_type
                                )}
                            </div>
                        )
                    }
                })}
            </div>
            {/* Horizontal Rule */}
            <hr className="my-4 border-1 border-gray1 border-opacity-30" />
            <div className="flex justify-end space-x-4">
                <ButtonRectangle text="Add" onClick={() => { uploadNewData() }} />
                <ButtonRectangle text="Cancel" onClick={closeFunction} />
            </div>
        </PopupContainer>

    )

}

export default AddDataPopup;