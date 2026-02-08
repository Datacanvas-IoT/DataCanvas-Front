import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaDatabase, FaTrash, FaUpload, FaWindowClose, FaCog, FaSave } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarLayout from "../components/layouts/SidebarLayout";
import PopupContainer from "../components/PopupContainer";
import PillButton from "../components/input/PillButton";
import TextBox from "../components/input/TextBox";
import SelectBox from "../components/input/SelectBox";
import Spinner from "../components/Spinner";
import CriticalAction from "../components/CriticalAction";
import ConfigTableCard from "../components/cards/ConfigTableCard";
import LoginPopup from "../components/LoginPopup";
import axios from "axios";
import config from "../config";

function ConfigureTable() {
    // ---------- Navigation hooks ----------
    const navigate = useNavigate();

    // ---------- Get states from navigation location for retrieval of tbl_id ----------
    const { state } = useLocation();

    // ---------- Loading state for spinner ----------
    const [loading, setLoading] = useState(false);

    // ---------- Popup states ----------
    const [isAddColumnPopupVisible, setIsAddColumnPopupVisible] = useState(false);
    useEffect(() => {
        if (!isAddColumnPopupVisible) {
            setNewColumnName('');
            setNewColumnDataType(-1);
            setNewColumnMaxLength(0);
            setNewColumnDefaultValue('');
            setNewColumnAutoIncrement(false);
            setNewColumnNullAllowed(false);
            setNewColumnUnique(false);
            setSelectedColumnID(-1);
        }

    }, [isAddColumnPopupVisible]);

    const [isDeleteColumnPopupVisible, setIsDeleteColumnPopupVisible] = useState(false);
    useEffect(() => {
        if (!isDeleteColumnPopupVisible) {
            setDeletingColumnID(-1);
        }
    }, [isDeleteColumnPopupVisible]);

    const [isTableSettingsPopupVisible, setIsTableSettingsPopupVisible] = useState(false);

    const [isUpdateTablePopupVisible, setIsUpdateTablePopupVisible] = useState(false);

    const [isLoginPopupVisible, setIsLoginPopupVisible] = useState(false);
    const [actionType, setActionType] = useState(''); // 1 - Truncate, 2 - Delete Table

    const [authenticationResult, setAuthenticationResult] = useState(false);
    useEffect(() => {
        if (authenticationResult) {
            setIsLoginPopupVisible(false);
            if (actionType == 1) {
                toast.success('Login successful, Truncating table');
                truncateTable();
            } else {
                toast.success('Login successful, Deleting table');
                deleteTable();
            }

        }
    }, [authenticationResult]);

    const [selectedColumnID, setSelectedColumnID] = useState(-1);
    const [deletingColumnID, setDeletingColumnID] = useState(-1);
    const [newColumnName, setNewColumnName] = useState('');
    const [newColumnDataType, setNewColumnDataType] = useState(-1);
    useEffect(() => {
        if (newColumnDataType == 3) {
            if (newColumnMaxLength == 0 || newColumnMaxLength == '' || newColumnMaxLength == null) {
                setNewColumnMaxLength(255);
            }
            setNewColumnAutoIncrement(false);
        } else {
            setNewColumnMaxLength(0);
        }
    }, [newColumnDataType]);
    const [newColumnMaxLength, setNewColumnMaxLength] = useState(0);
    const [newColumnDefaultValue, setNewColumnDefaultValue] = useState('');
    const [newColumnAutoIncrement, setNewColumnAutoIncrement] = useState(false);
    const [newColumnNullAllowed, setNewColumnNullAllowed] = useState(false);
    const [newColumnUnique, setNewColumnUnique] = useState(false);

    // ---------- Table Details ----------
    const [projectID, setProjectID] = useState(-1);
    const [tblID, setTblID] = useState(-1);
    const [tblName, setTblName] = useState([]);

    const [dataTypes, setDataTypes] = useState([
        // {
        //     type_id: 1,
        //     type_name: 'Integer'
        // },
    ])

    const [constraints, setConstraints] = useState([
        // {
        //     constraint_id: 1,
        //     constraint_name: 'Auto Increment'
        // },
    ])

    const [columns, setColumns] = useState([
        // {
        //     clm_id: 1,
        //     clm_name: 'id',
        //     data_type: 1,
        //     default_value: 'N/A',
        //     max_length: 0,
        //     constraints: [
        //         {
        //             constraint_id: 1
        //         },
        //         {
        //             constraint_id: 2
        //         }
        //     ]
        // }
    ]);


    useEffect(() => {
        // ---------- Getting tbl_id from the location state and uypdating tblID state ----------
        try {
            setTblID(state.tbl_id);
            setProjectID(state.project_id);
            // ---------- Get auth-token from local storage ----------
            const token = localStorage.getItem('auth-token');
            getDataTypes(token);
            getConstraints(token);
        } catch (err) {
            console.log(err);
            navigate('/login');
        }
    }, []);

    useEffect(() => {
        // ---------- Get table details ----------
        if (tblID != -1) {
            getTableDetails();
        }
    }, [tblID]);

    useEffect(() => {
        // ---------- Get table details ----------
        if (tblID != -1 && dataTypes.length > 0 && constraints.length > 0 && columns.length == 0) {
            getColumnDetails();
        }
    }, [dataTypes, constraints]);

    // ---------- Function to get data types ----------
    const getDataTypes = async (token) => {
        try {
            setLoading(true);
            const res = await axios.get(`${config.REACT_APP_API_URL}/data/config/type/`, {
                headers: {
                    'authorization': token
                }
            });
            setDataTypes(res.data);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.log(err);
            switch (err.response.status) {
                case 401 || 403:
                    navigate('/login');
                    break;
                default:
                    console.log('Error in getting data types');
                    toast.error('Error in getting data types');
                    navigate('/overview');
                    break;
            }
        }
    }

    // ---------- Function to get constraints ----------
    const getConstraints = async (token) => {
        try {
            setLoading(true);
            const res = await axios.get(`${config.REACT_APP_API_URL}/data/config/constraint/`, {
                headers: {
                    'authorization': token
                }
            });
            setConstraints(res.data);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.log(err);
            switch (err.response.status) {
                case 401 || 403:
                    navigate('/login');
                    break;
                default:
                    console.log('Error in getting constraints');
                    toast.error('Error in getting constraints');
                    navigate('/overview');
                    break;
            }
        }
    }

    // ---------- Function to get table details ----------
    const getTableDetails = async () => {
        try {
            setLoading(true);
            // ---------- Get auth-token from local storage ----------
            const token = localStorage.getItem('auth-token');
            const res = await axios.get(`${config.REACT_APP_API_URL}/data/tbl/` + tblID, {
                headers: {
                    'authorization': token
                }
            });
            setTblName(res.data.tbl_name);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.log(err);
            switch (err.response.status) {
                case 401 || 403:
                    navigate('/login');
                    break;
                default:
                    console.log('Error in getting table details');
                    toast.error('Error in getting table details');
                    navigate('/overview');
                    break;
            }
        }
    }

    // ---------- Function to get column details ----------
    const getColumnDetails = async () => {
        try {
            setLoading(true);
            // ---------- Get auth-token from local storage ----------
            const token = localStorage.getItem('auth-token');
            const res = await axios.get(`${config.REACT_APP_API_URL}/data/clm?tbl_id=` + tblID, {
                headers: {
                    'authorization': token
                }
            });
            // Sort columns: system columns first, then by clm_id
            res.data.sort((a, b) => {
                // First, sort by is_system_column (true first)
                if (a.is_system_column !== b.is_system_column) {
                    return b.is_system_column ? 1 : -1;
                }
                // Then sort by clm_id
                return a.clm_id - b.clm_id;
            });
            setColumns(res.data);
            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.log(err);
            switch (err.response.status) {
                case 401 || 403:
                    navigate('/login');
                    break;
                default:
                    console.log('Error in getting table column details');
                    toast.error('Error in getting table column details');
                    navigate('/overview');
                    break;
            }
        }
    }

    // ---------- Function to trigger when user clicks on a column in the list ----------
    const selectColumn = (column) => {
        if (column) {
            setIsAddColumnPopupVisible(true);
            setSelectedColumnID(column.clm_id);
            setNewColumnName(column.clm_name);
            setNewColumnDataType(column.data_type);
            setNewColumnMaxLength(column.max_length);
            setNewColumnDefaultValue((column.default_value == null) ? '' : column.default_value);
            setNewColumnAutoIncrement(column.constraints.find(x => x.constraint_id == 1) != undefined);
            setNewColumnNullAllowed(column.constraints.find(x => x.constraint_id == 2) != undefined);
            setNewColumnUnique(column.constraints.find(x => x.constraint_id == 3) != undefined);
        }
    }

    const selectDeletingColumn = (columnID) => {
        if (columnID && columnID != -1) {
            setIsDeleteColumnPopupVisible(true);
            setDeletingColumnID(columnID);
        }
    }

    const AddColumnPopup = () => {
        const checkSpaces = (str) => {
            return /\s/.test(str);
        }

        // Function to check a string has special characters or numbers other than letters and underscores
        const checkSpecialCharacters = (str) => {
            var regex = /[^a-zA-Z_]/;
            return regex.test(str);
        }

        const validateNewColumn = () => {
            if (newColumnName.trim() == '' || newColumnName.trim() == null) {
                toast.warning('Field Name cannot be empty');
                return false;
            }

            if (checkSpaces(newColumnName)) {
                toast.warning('Field Name cannot contain spaces');
                return false;
            }

            if (checkSpecialCharacters(newColumnName)) {
                toast.error('Table name cannot contain special characters or numbers! Only letters and underscores are allowed');
                return false;
            }

            // Check column name is duplocated
            if (columns.find(x => x.clm_name == newColumnName) && selectedColumnID == -1) {
                toast.warning('Field Name already exists');
                return false;
            }

            // When updating column name, check for column name duplication. But if the already existing column name's column ID equals to selectedColumnID, then it's the same column name
            if (columns.find(x => x.clm_name == newColumnName && x.clm_id != selectedColumnID) && selectedColumnID != -1) {
                toast.warning('Field Name already exists');
                return false;
            }

            if (newColumnDataType == -1) {
                toast.warning('Please select a data type');
                return false;
            }

            if (newColumnDataType == 3) {
                if ((newColumnMaxLength == 0 || newColumnMaxLength == '' || newColumnMaxLength == null)) {
                    toast.warning('Maximum length should be more than 0 for Text data type');
                    return false;
                }
            } else if (newColumnDataType == 4) {
                console.log(newColumnDefaultValue.toLowerCase());
                if (newColumnDefaultValue.toLowerCase() != 'true' && newColumnDefaultValue.toLowerCase() != 'false') {
                    toast.warning('Default value should be either true or false for Boolean data type');
                    return false;
                }
            } else {
                if (isNaN(newColumnDefaultValue)) {
                    toast.warning('Default value should be a number for numerical data types');
                    return false;
                }

                if (newColumnAutoIncrement && newColumnDataType != 1) {
                    toast.warning('Auto Increment is only allowed for Integer data type');
                    return false;
                }

                // For data type = 2, default value should be an integer, not a decimal number
                if (newColumnDataType == 1 && (newColumnDefaultValue % 1 != 0)) {
                    toast.warning('Default value should be an integer for Integer data type');
                    return false;
                }
            }

            return true;
        }

        const saveNewColumn = async () => {
            if (validateNewColumn()) {
                setLoading(true);
                // ---------- Get auth-token from local storage ----------
                const token = localStorage.getItem('auth-token');

                /*
                    REQUEST BODY STRUCTURE
                    {
                        "clm_name": "humidity",
                        "data_type": 2,
                        "tbl_id": 1,
                        "default_value": null,
                        "max_length": null,
                        "constraints": [1,2]
                    }
                */

                let constraintsArray = [];
                if (newColumnAutoIncrement) {
                    constraintsArray.push(constraints.find(x => x.constraint_name == 'Auto Increment').constraint_id);
                }
                if (newColumnNullAllowed) {
                    constraintsArray.push(constraints.find(x => x.constraint_name == 'Not Null').constraint_id);
                }
                if (newColumnUnique) {
                    constraintsArray.push(constraints.find(x => x.constraint_name == 'Unique').constraint_id);
                }

                const requestBody = {
                    clm_name: newColumnName.trim(),
                    data_type: newColumnDataType,
                    tbl_id: tblID,
                    default_value: newColumnDefaultValue.toLowerCase(),
                    max_length: newColumnMaxLength,
                    constraints: constraintsArray
                }

                try {
                    const res = await axios.post(`${config.REACT_APP_API_URL}/data/clm/`, requestBody, {
                        headers: {
                            'authorization': token
                        }
                    });

                    if (res.status == 201) {
                        toast.success('Field added successfully');
                        setIsAddColumnPopupVisible(false);
                        getColumnDetails();
                    }
                } catch (err) {
                    console.log(err);
                    switch (err.response.status) {
                        case 401 || 403:
                            toast.error('Session expired. Please login again');
                            navigate('/login');
                            break;
                        default:
                            toast.error(`Error: ` + err.response.data.error);
                            break;
                    }
                } finally {
                    setLoading(false);
                    setIsAddColumnPopupVisible(false);
                }

            }
        }

        const updateColumn = async () => {
            if (validateNewColumn()) {
                setLoading(true);
                // ---------- Get auth-token from local storage ----------
                const token = localStorage.getItem('auth-token');

                /*
                    REQUEST BODY STRUCTURE
                    {
                        "clm_id":5,
                        "clm_name": "temperature",
                        "data_type": 1,
                        "default_value": null,
                        "max_length": null,
                        "tbl_id": int,
                        "constraints": []
                    }
                */

                let constraintsArray = [];
                if (newColumnAutoIncrement) {
                    constraintsArray.push(constraints.find(x => x.constraint_name == 'Auto Increment').constraint_id);
                }
                if (newColumnNullAllowed) {
                    constraintsArray.push(constraints.find(x => x.constraint_name == 'Not Null').constraint_id);
                }
                if (newColumnUnique) {
                    constraintsArray.push(constraints.find(x => x.constraint_name == 'Unique').constraint_id);
                }

                const requestBody = {
                    clm_id: selectedColumnID,
                    clm_name: newColumnName.trim(),
                    data_type: newColumnDataType,
                    default_value: newColumnDefaultValue,
                    max_length: newColumnMaxLength,
                    tbl_id: tblID,
                    constraints: constraintsArray
                }

                try {
                    const res = await axios.put(`${config.REACT_APP_API_URL}/data/clm/`, requestBody, {
                        headers: {
                            'authorization': token
                        }
                    });

                    if (res.status == 200) {
                        toast.success('Field updated successfully');
                        setIsAddColumnPopupVisible(false);
                        getColumnDetails();
                    }

                } catch (err) {
                    console.log(err);
                    switch (err.response.status) {
                        case 401 || 403:
                            toast.error('Session expired. Please login again');
                            navigate('/login');
                            break;
                        default:
                            toast.error(`Error: ` + err.response.data.error);
                            break;
                    }
                } finally {
                    setLoading(false);
                    setIsAddColumnPopupVisible(false);
                }

            }
        }

        return (
            <PopupContainer isOpen={isAddColumnPopupVisible}
                onClose={() => { }}
                closeFunction={() => setIsAddColumnPopupVisible(false)}
                Icon={(selectedColumnID == -1) ? FaPlusCircle : FaSave}
                title={selectedColumnID == -1 ? 'Add Field' : 'Edit Field'}
                closeIconVisible={true}
                width={'550px'}>
                <div className="sm:flex justify-between items-center mt-4 space-y-4 sm:space-y-0 space-x-0 sm:space-x-4">
                    <div className="flex flex-col justify-center sm:w-1/2">
                        <label className="text-gray1 text-sm">Field Name</label>
                        <TextBox
                            type="text"
                            placeholder="Field Name"
                            maxLength={20}
                            textAlign={'left'}
                            onChange={((e) => setNewColumnName(e.target.value))}
                            value={newColumnName} />
                    </div>

                    <div className="flex flex-col justify-center sm:w-1/2">
                        <label className="text-gray1 text-sm">Data Type</label>
                        <SelectBox disabled={(selectedColumnID == -1) ? false : true} onChange={(e) => setNewColumnDataType(e.target.value)}
                            value={newColumnDataType}>
                            <option value={-1}>Select Data Type</option>
                            {dataTypes.map((type) => {
                                return (
                                    <option key={type.type_id} value={type.type_id}>{type.type_name}</option>
                                )
                            })}
                        </SelectBox>
                    </div>
                </div>

                <div className="sm:flex justify-between items-center mt-4 space-y-4 sm:space-y-0 space-x-0 sm:space-x-4">
                    <div className="flex flex-col justify-center">
                        <label className="text-gray1 text-sm">Maximum Length</label>
                        <TextBox
                            type='number'
                            placeholder="Maximum Length"
                            maxLength={20}
                            textAlign={'left'}
                            onChange={((e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setNewColumnMaxLength('');
                              } else {
                                const intVal = parseInt(val, 10);
                                if (!isNaN(intVal) && intVal > 0 && String(intVal) === val) {
                                  setNewColumnMaxLength(intVal);
                                } else {
                                  toast.error('Maximum length must be a positive integer.');
                                }
                              }
                            })}
                            value={newColumnMaxLength}
                            disabled={(newColumnDataType == 3) ? false : true} />
                    </div>
                    <div className="flex flex-col justify-center">
                        <label className="text-gray1 text-sm">Default Value</label>
                        <TextBox
                            type='text'
                            placeholder="Default Value"
                            maxLength={255}
                            textAlign={'left'}
                            onChange={((e) => setNewColumnDefaultValue(e.target.value))}
                            value={newColumnDefaultValue} />
                    </div>
                </div>

                {/* Auto Increment, Not Null, Unique Checkboxes */}
                {(selectedColumnID != -1) ? null : (
                    <div className="sm:flex justify-center items-center mt-4 sm:mt-8 space-y-4 sm:space-y-0 space-x-0 sm:space-x-12">
                        {newColumnDataType == 1 ? (
                            <div className="flex justify-center items-center space-x-2">
                                <input type="checkbox" className="w-4 h-4"
                                    checked={newColumnAutoIncrement}
                                    onChange={(e) => setNewColumnAutoIncrement(e.target.checked)} />
                                <label className="text-gray2 text-sm">Auto Increment</label>
                            </div>
                        ) : null}

                        <div className="flex justify-center items-center space-x-2">
                            <input type="checkbox" className="w-4 h-4"
                                checked={newColumnNullAllowed}
                                onChange={(e) => setNewColumnNullAllowed(e.target.checked)} />
                            <label className="text-gray2 text-sm">Not Null</label>
                        </div>
                        <div className="flex justify-center items-center space-x-2">
                            <input type="checkbox" className="w-4 h-4"
                                checked={newColumnUnique}
                                onChange={(e) => setNewColumnUnique(e.target.checked)} />
                            <label className="text-gray2 text-sm">Unique</label>
                        </div>
                    </div>
                )}

                <div className="flex justify-center items-center mt-6">
                    <PillButton text={selectedColumnID == -1 ? 'Save Field' : 'Update Field'} onClick={() => { (selectedColumnID == -1) ? saveNewColumn() : updateColumn() }} icon={FaUpload} isPopup={true} />
                </div>
            </PopupContainer>
        )
    }

    const deleteColumnPopup = () => {
        const deleteColumn = async () => {
            setLoading(true);
            // ---------- Get auth-token from local storage ----------
            const token = localStorage.getItem('auth-token');

            /*
                    REQUEST BODY STRUCTURE
                    {
                        "clm_id": 5
                    }
            */

            const requestBody = {
                clm_id: deletingColumnID
            }

            try {
                const res = await axios.delete(`${config.REACT_APP_API_URL}/data/clm/`, {
                    headers: {
                        'authorization': token
                    },
                    data: requestBody
                });

                if (res.status == 200) {
                    toast.success('Field deleted successfully');
                    setIsDeleteColumnPopupVisible(false);
                    getColumnDetails();
                }
            } catch (err) {
                console.log(err);
                switch (err.response.status) {
                    case 401 || 403:
                        toast.error('Session expired. Please login again');
                        navigate('/login');
                        break;
                    default:
                        toast.error(`Error: ` + err.response.data.error);
                        break;
                }
            } finally {
                setLoading(false);
                setIsDeleteColumnPopupVisible(false);
            }
        }

        return (
            <PopupContainer isOpen={isDeleteColumnPopupVisible}
                onClose={() => { }}
                closeFunction={() => setIsDeleteColumnPopupVisible(false)}
                Icon={FaTrash}
                title={'Delete Field'}
                closeIconVisible={true}
                width={'550px'}>
                <div className="text-center mt-4 px-4 text-gray2 text-md">
                    Are you sure want to delete field {columns.find(x => x.clm_id == deletingColumnID).clm_name}?
                </div>
                <div className="text-center mt-4 px-4 text-red text-sm">
                    This action cannot be undone and this will affect existing dashboard configurations
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-center mt-6 space-x-0 sm:space-x-4 space-y-4 sm:space-y-0">
                    <PillButton text={'No, Cancel'} onClick={() => { setIsDeleteColumnPopupVisible(false) }} icon={FaWindowClose} isPopup={true} />
                    <PillButton text={'Yes, Delete'} onClick={() => { deleteColumn() }} icon={FaTrash} isPopup={true} color={'red'} />
                </div>
            </PopupContainer>
        );
    }

    const truncateTable = async () => {
        setLoading(true);
        // ---------- Get auth-token from local storage ----------
        const token = localStorage.getItem('auth-token');

        try {
            const res = await axios.post(`${config.REACT_APP_API_URL}/data/tbl/truncate/${tblID}`, {
                tbl_id: tblID
            },
                {
                    headers: {
                        'authorization': token
                    },
                });

            if (res.status == 200) {
                toast.success('Table truncated successfully');
            }
        } catch (err) {
            console.log(err);
            switch (err.response.status) {
                case 401 || 403:
                    toast.error('Session expired. Please login again');
                    navigate('/login');
                    break;
                default:
                    toast.error(`Error: ` + err.response.data.error);
                    break;
            }
        } finally {
            setLoading(false);
            setIsTableSettingsPopupVisible(false);
        }
    }

    const deleteTable = async () => {
        setLoading(true);
        // ---------- Get auth-token from local storage ----------
        const token = localStorage.getItem('auth-token');

        try {
            const res = await axios.delete(`${config.REACT_APP_API_URL}/data/tbl/`, {
                headers: {
                    'authorization': token
                },
                data: {
                    tbl_id: tblID
                }
            });

            if (res.status == 200) {
                toast.success('Table deleted successfully');
                navigate('/datahandler', { state: { project_id: projectID } });
            }
        } catch (err) {
            console.log(err);
            switch (err.response.status) {
                case 401 || 403:
                    toast.error('Session expired. Please login again');
                    navigate('/login');
                    break;
                default:
                    toast.error(`Error: ` + err.response.data.error);
                    break;
            }
        } finally {
            setLoading(false);
            setIsTableSettingsPopupVisible(false);
        }
    }

    const TableSettingsPopup = () => {
        return (
            <PopupContainer isOpen={isTableSettingsPopupVisible}
                onClose={() => { }}
                closeFunction={() => setIsTableSettingsPopupVisible(false)}
                Icon={FaCog}
                title={'Table Settings'}
                closeIconVisible={true}
                width={'550px'}>
                <div className="flex flex-col justify-between items-center mt-4">
                    <CriticalAction title="Change Table Name" subtitle='Update the name of the table' buttonText='Change' onClick={() => {
                        setIsUpdateTablePopupVisible(true);
                        setIsTableSettingsPopupVisible(false);
                    }} buttonColor={'green'} />
                    <CriticalAction
                        title="Truncate Table"
                        subtitle='Delete all gathered data in this table'
                        buttonText='Truncate'
                        onClick={() => {
                            {
                                setActionType(1);
                                setIsLoginPopupVisible(true)
                                setIsTableSettingsPopupVisible(false);
                            }
                        }} />
                    <CriticalAction
                        title="Delete Table"
                        subtitle='Delete the whole table including its data'
                        buttonText='Delete'
                        onClick={() => {
                            {
                                setActionType(2);
                                setIsLoginPopupVisible(true)
                                setIsTableSettingsPopupVisible(false);
                            }
                        }} />
                </div>
            </PopupContainer>
        );
    }

    const UpdateTablePopup = () => {

        const updateTable = async () => {
            if (tblName.trim() == '' || tblName.trim() == null) {
                toast.warning('Table Name cannot be empty');
                return;
            }

            setLoading(true);
            // ---------- Get auth-token from local storage ----------
            const token = localStorage.getItem('auth-token');

            /*
                    REQUEST BODY STRUCTURE
                    {
                        "tbl_id": 5,
                        "tbl_name": "tbl_sensordata"
                    }
            */

            const requestBody = {
                tbl_id: tblID,
                tbl_name: tblName
            }

            try {
                const res = await axios.put(`${config.REACT_APP_API_URL}/data/tbl/`, requestBody, {
                    headers: {
                        'authorization': token
                    }
                });

                if (res.status == 200) {
                    toast.success('Table name updated successfully');
                }

            } catch (err) {
                console.log(err);
                getTableDetails();
                switch (err.response.status) {
                    case 401 || 403:
                        toast.error('Session expired. Please login again');
                        navigate('/login');
                        break;
                    case 400 || 404:
                        toast.error('Error in updating table name');
                        break;
                    default:
                        toast.error('Something went wrong');
                        break;
                }
            } finally {
                setLoading(false);
                setIsUpdateTablePopupVisible(false);
            }
        }

        return (
            <PopupContainer
                isOpen={isUpdateTablePopupVisible}
                onClose={() => { }}
                closeFunction={() => setIsUpdateTablePopupVisible(false)}
                Icon={FaUpload}
                title={"Update Table"}
                closeIconVisible={true}
            >
                <div className="flex flex-col justify-center mt-4">
                    <label className="text-gray1 text-sm">Table Name</label>
                    <TextBox
                        text=""
                        type="text"
                        placeholder="Enter table name"
                        maxLength={25}
                        textAlign={"left"}
                        onChange={(e) => { setTblName(e.target.value) }}
                        value={tblName}
                    />
                </div>

                <div className="flex justify-center mt-8">
                    <PillButton
                        text="Update Table"
                        onClick={updateTable}
                        isPopup={true}
                        icon={FaPlusCircle}
                    />
                </div>
            </PopupContainer>
        );
    }

    return (
        <SidebarLayout active={3} breadcrumb={`${localStorage.getItem('project')} > ${tblName} > Configure`}>
            <div className="pb-24">
            <div className={`flex flex-col sm:flex-row justify-center items-center text-center sm:justify-between px-7 sm:px-10 mt-5 sm:mt-3`}>
                <span className={`text-lg font-semibold`}>Configure Table - {tblName}</span>
                <div className={`mt-2 sm:mt-0`}>
                    <PillButton text="Table Settings" icon={FaPlusCircle} onClick={() => { setIsTableSettingsPopupVisible(true) }} />
                </div>
            </div>

            <div className={`flex flex-col justify-center px-7 sm:px-10 mt-2`}>
                {columns.map((column) => {
                    return (
                        <ConfigTableCard key={column.clm_id}
                            columnName={column.clm_name}
                            dataType={`${(dataTypes.find(x => x.type_id == column.data_type).type_name)}` + `${(column.max_length != null) ? `(${column.max_length})` : ''}`}
                            defaultValue={(column.default_value == null || column.default_value == '') ? 'N/A' : column.default_value}
                            isAutoIncrement={column.constraints.find(x => x.constraint_id == 1) != undefined}
                            isNullAllowed={column.constraints.find(x => x.constraint_id == 2) != undefined}
                            isUnique={column.constraints.find(x => x.constraint_id == 3) != undefined}
                            onClick={() => { selectColumn(column) }}
                            onDelete={() => {
                                {
                                    selectDeletingColumn(column.clm_id)
                                }
                            }}
                            disabled={column.is_system_column} />
                    )
                })}
            </div>

            <div className={`flex flex-row justify-center items-center mt-12 space-x-4`}>
                <PillButton text="Add Fields" icon={FaPlusCircle} onClick={() => {
                    setIsAddColumnPopupVisible(true)
                }} />
                <PillButton text="View Data" icon={FaDatabase} onClick={() => {
                    navigate('/dataset', { state: { project_id: projectID, tbl_id: tblID } });
                }} />
            </div>

            {/* Popup container for column adding */}
            {isAddColumnPopupVisible ? AddColumnPopup() : null}

            {/* Popup container for column deleting */}
            {isDeleteColumnPopupVisible ? deleteColumnPopup() : null}

            {/* Popup container for table settings */}
            {isTableSettingsPopupVisible ? TableSettingsPopup() : null}

            {/* Popup container for updating table name */}
            {isUpdateTablePopupVisible ? UpdateTablePopup() : null}

            {/* Popup container for login authentication popup */}
            <LoginPopup
                isOpen={isLoginPopupVisible}
                closeFunction={() => setIsLoginPopupVisible(false)}
                setAuthenticationResult={(e) => setAuthenticationResult(e)}
                email={localStorage.getItem('email')} />

            {/* Spinner */}
            <Spinner isVisible={loading} />

            <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            </div>
        </SidebarLayout>
    )
}

export default ConfigureTable;