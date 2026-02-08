import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaAngleRight } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarLayout from "../components/layouts/SidebarLayout";
import PillButton from "../components/input/PillButton";
import TextBox from "../components/input/TextBox";
import Spinner from "../components/Spinner";
import RectangularCard from "../components/cards/RectangularCard";
import axios from "axios";
import PopupContainer from "../components/PopupContainer";
import config from "../config";


const DataTableHandler = () => {

    // ---------- Get states from navigation location for retrieval of project_id ----------
    const { state } = useLocation();

    // ---------- Navigation hooks ----------
    const navigate = useNavigate()

    // ---------- Loading state for spinner ----------
    const [loading, setLoading] = useState(false);

    // ---------- Table name for new addings ------
    const [newTableName, setNewTableName] = useState('');

    //--Add Data table Modal--
    const [isAddDatatableOpen, setIsAddDatatableOpen] = useState(false);

    const toggleAddDatatableModal = () => {
        setIsAddDatatableOpen(!isAddDatatableOpen);
    };

    // ---------- Data Table states ----------
    const [dataTables, setDataTables] = useState([
        //     {
        //     data_table_id: 1,
        //     name: 'sensor-readings-table',
        //     createdAt: '2021-08-01, 00:00:00',
        //     updatedAt: '2021-08-01, 00:00:00',
        // }, {
        //     data_table_id: 2,
        //     name: 'error-log',
        //     createdAt: '2021-08-01, 00:00:00',
        //     updatedAt: '2021-08-01, 00:00:00',
        // }
    ]);
    const [projectID, setProjectID] = useState(-1);

    useEffect(() => {
        // ---------- Getting project_id from the location state and uypdating projectID state ----------
        try {
            setProjectID(state.project_id);
            localStorage.removeItem('datatable');
        } catch (err) {
            console.log(err);
            navigate('/login');
        }
    }, []);

    useEffect(() => {
        if (projectID != -1) {
            loadDataTables();
        }
    }, [projectID]);

    // ---------- Create new table ----------      
    const handleTableAdding = async () => {
        const checkSpaces = (str) => {
            return /\s/.test(str);
        }

        // Function to check a string has special characters or numbers other than letters and underscores
        const checkSpecialCharacters = (str) => {
            var regex = /[^a-zA-Z_]/;
            return regex.test(str);
        }

        if (newTableName === '') {
            toast.error('Please fill in all fields!');
            return;
        }

        if (checkSpaces(newTableName)) {
            toast.error('Table name cannot contain spaces!');
            return;
        }

        if (checkSpecialCharacters(newTableName)) {
            toast.error('Table name cannot contain special characters or numbers! Only letters and underscores are allowed');
            return;
        }

        for (let i = 0; i < dataTables.length; i++) {
            if (dataTables[i].name === newTableName) {
                toast.error('Table already exists!');
                return;
            }
        }

        setLoading(true);

        // Post request to localhost:3001/api/data/tbl?project_id=<project_id> to post new data table
        try {
            const response = await axios.post(`${config.REACT_APP_API_URL}/data/tbl`, {
                project_id: projectID,
                tbl_name: newTableName
            },
                {
                    headers: {
                        'authorization': localStorage.getItem('auth-token')
                    }
                });

            if (response.status === 200) {
                toast.success('Table added successfully!');
                setNewTableName('');
                toggleAddDatatableModal();
                loadDataTables();
            }

        } catch (err) {
            switch (err.response.status) {
                case 400:
                    toast.error('Bad request!');
                    break;
                case 401:
                    toast.error('Unauthorized access!');
                    navigate('/login');
                    break;
                case 403:
                    toast.error('Unauthorized access!');
                    navigate('/login');
                    break;
                case 404:
                    toast.error('Project not found!');
                    navigate('/projects');
                    break;
                case 409:
                    toast.error('Table already exists!');
                    break;
                default:
                    toast.error('Something went wrong!');
                    break;
            }
        } finally {
            setLoading(false);
        }
    }

    // ---------- Load data tables from the backend ----------
    const loadDataTables = async () => {
        setLoading(true);
        // Get request to localhost:3001/api/data/tbl?project_id=<project_id> to get data tables
        try {
            const response = await axios.get(`${config.REACT_APP_API_URL}/data/tbl?project_id=${projectID}`, {
                headers: {
                    'authorization': localStorage.getItem('auth-token')
                }
            });

            if (response.status === 200) {
                let dataTablesArray = [];
                response.data.forEach((dataTable) => {

                    const date = new Date(dataTable.updatedAt);
                    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'GMT' };
                    const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(date);

                    let tableDetails = {
                        tbl_id: dataTable.tbl_id,
                        tbl_name: dataTable.tbl_name,
                        updatedAt: formattedDate,
                    }
                    dataTablesArray.push(tableDetails);
                });
                setDataTables(dataTablesArray);
                setLoading(false);
            }

        } catch (err) {
            switch (err.response.status) {
                case 400:
                    toast.error('Bad request!');
                    break;
                case 401:
                    toast.error('Unauthorized access!');
                    navigate('/login');
                    break;
                case 403:
                    toast.error('Unauthorized access!');
                    navigate('/login');
                    break;
                case 404:
                    toast.error('Project not found!');
                    navigate('/projects');
                    break;
                default:
                    toast.error('Something went wrong!');
                    break;
            }
            setDataTables([]);
            setLoading(false);
        }
    }

    return (
        <SidebarLayout active={3} breadcrumb={`${localStorage.getItem('project')} > Data Tables`}>
            <div className={`flex flex-row justify-between px-7 sm:px-10 mt-6 sm:mt-2`}>
                <span className={`text-lg font-semibold`}>Data Tables</span>
                {dataTables.length > 0 ? (
                    <div className={``}>
                        <PillButton text="Add Data Table" icon={FaPlusCircle} onClick={() => { setIsAddDatatableOpen(true) }} />
                    </div>
                ) : null}
            </div>

            <div className={`flex flex-col justify-center px-7 sm:px-10 mt-2`}>
                {dataTables.length > 0 ? (
                    dataTables.map((table) => {
                        return (
                            <RectangularCard key={table.tbl_id} title={table.tbl_name} subtitle={`Last Update: ${table.updatedAt}`} icon={FaAngleRight}
                                onClick={() => {
                                    navigate("/configtable", {
                                        state: { project_id: projectID, tbl_id: table.tbl_id },
                                    });
                                }} />
                        );
                    })
                ) : (
                    <div className={`w-full flex flex-col justify-center items-center`}>
                        <div className={`text-gray2 text-sm`}>No data tables found</div>
                        <div className={`flex flex-row justify-center items-center mt-4`}>
                            <PillButton text="Add Your First Data Table" icon={FaPlusCircle} onClick={() => { toggleAddDatatableModal() }} />
                        </div>
                    </div>
                )}
            </div>

            <Spinner isVisible={loading} />

            <ToastContainer
                position="bottom-center"
                closeFunction={toggleAddDatatableModal}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />


            <PopupContainer
                isOpen={isAddDatatableOpen}
                onClose={() => { }}
                closeFunction={toggleAddDatatableModal}
                Icon={FaPlusCircle}
                title={"Add New Table"}
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
                        onChange={(e) => { setNewTableName(e.target.value) }}
                        value={newTableName}
                    />
                </div>

                <div className="flex justify-center mt-8">
                    <PillButton
                        text="Add Table"
                        onClick={handleTableAdding}
                        isPopup={true}
                        icon={FaPlusCircle}
                    />
                </div>


            </PopupContainer>


        </SidebarLayout>
    )
}

export default DataTableHandler





