import React, { useState, useEffect } from "react";
import { FaMicrochip, FaDatabase, FaClock, FaPlusCircle, FaAngleRight, FaForward } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarLayout from "../components/layouts/SidebarLayout";
import PillButton from "../components/input/PillButton";
import Spinner from "../components/Spinner";
import InsightCard from "../components/cards/InsightCard";
import RectangularCard from "../components/cards/RectangularCard";
import axios from "axios";
import config from "../config";

function ProjectOverview() {
    // ---------- Navigation hooks ----------
    const navigate = useNavigate();

    // ---------- Get states from navigation location for retrieval of project_id ----------
    const { state } = useLocation();

    // ---------- Loading state for spinner ----------
    const [loading, setLoading] = useState(false);

    // ---------- Project Details states ----------
    const [projectID, setProjectID] = useState(-1);
    const [projectDetails, setProjectDetails] = useState({
        name: '',
        description: '',
        created_at: '',
        updated_at: '',
        user_id: -1,
    });

    // ---------- Devices states ----------
    const [devices, setDevices] = useState([]);

    // ---------- Data Table states ----------
    const [dataTables, setDataTables] = useState([]);

    // ---------- Miscallenous states ----------
    const [dataRecordsCount, setDataRecordsCount] = useState('N/A');
    const [lastRecordUpdate, setLastRecordUpdate] = useState('N/A');

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
        if (projectID !== -1) {
            loadProjectDetails();
        }
    }, [projectID]);

    useEffect(() => {
        if (projectDetails.name !== '') {
            loadDevices();
            loadDataTables();
            loadProjectDataRecordCount();
            getLatestDataRecordUpdate();
        }
    }, [projectDetails]);

    useEffect(() => {

    }, [devices]);
    // ---------- Load project details from the backend ----------
    const loadProjectDetails = async () => {
        setLoading(true);
        // Get request to localhost:3001/api/project/<project_id> to get project details
        try {
            const response = await axios.get(`${config.REACT_APP_API_URL}/project/${projectID}`, {
                headers: {
                    'authorization': localStorage.getItem('auth-token')
                }
            });

            if (response.status === 200) {
                let details = {
                    name: response.data.project_name,
                    description: response.data.description,
                    createdAt: response.data.createdAt,
                    updatedAt: response.data.updatedAt,
                    user_id: response.data.user_id,
                }

                setProjectDetails(details);
                localStorage.setItem('project', response.data.project_name);

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
                    break;
                default:
                    toast.error('Something went wrong!');
                    break;
            }
            setLoading(false);
        }
    }

    // ---------- Load devices from the backend ----------
    const loadDevices = async () => {
        setLoading(true);

        // Get request to localhost:3001/api/device?project_id=<project_id> to get devices
        try {
            const response = await axios.get(`${config.REACT_APP_API_URL}/device?project_id=${projectID}`, {
                headers: {
                    'authorization': localStorage.getItem('auth-token')
                }
            });

            if (response.status === 200) {
                let devicesArray = [];
                response.data.forEach((device) => {
                    // Specify the locale as 'si-LK' for Sri Lanka
                    const date = new Date(device.updatedAt);
                    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', timeZone: 'GMT' };
                    const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(date);

                    let deviceDetails = {
                        device_id: device.device_id,
                        device_name: device.device_name,
                        updatedAt: formattedDate,
                    }
                    devicesArray.push(deviceDetails);
                });
                setDevices(devicesArray);
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
                    break;
                default:
                    toast.error('Something went wrong!');
                    break;
            }
            setDevices([]);
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
                    break;
                default:
                    toast.error('Something went wrong!');
                    break;
            }
            setDataTables([]);
            setLoading(false);
        }
    }

    // ---------- Load data records count of the project from all data tables from the backend ----------
    const loadProjectDataRecordCount = async () => {
        /*
            * URL - localhost:3001/api/data/get/count/project/?project_id=<project_id>
            * Method - GET
            * Headers - authorization
            * Response - { count: <count> }
            * Description - Get the total data records count of the project from all data tables
        */

        try {
            const response = await axios.get(`${config.REACT_APP_API_URL}/data/get/count/project/?project_id=${projectID}`, {
                headers: {
                    'authorization': localStorage.getItem('auth-token')
                }
            });

            if (response.status === 200) {
                setDataRecordsCount(response.data.count);
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
                    setDataRecordsCount(0);
                    break;
                default:
                    toast.error('Something went wrong while loading insights!');
                    break;
            }
        }
    }

    // Get latest data record update date and time
    const getLatestDataRecordUpdate = async () => {
        /*
            * URL - localhost:3001/api/data/get/latest/project/?project_id=<project_id>
            * Method - GET
            * Headers - authorization
            * Response - { timestamp: <timestamp> }
            * Description - Get the latest data record update date and time of the project
        */

        try {
            const response = await axios.get(`${config.REACT_APP_API_URL}/data/get/latest/project/?project_id=${projectID}`, {
                headers: {
                    'authorization': localStorage.getItem('auth-token')
                }
            });

            if (response.status === 200) {
                setLastRecordUpdate(response.data.timestamp);
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
                    setLastRecordUpdate('N/A');
                    break;
                default:
                    toast.error('Something went wrong while loading insights!');
                    break;
            }
        }
    }

    return (
        // Sidebar Layout Component
        <SidebarLayout active={0} breadcrumb={`${localStorage.getItem('project')} > Overview`}>

            {/* Page Title - Project Name */}
            <div className="container mb-32">
                <div className={`text-lg font-semibold px-7 sm:px-10 mb-3`}>{projectDetails.name}</div>

                {/* Insights Section */}
                <div className={`flex flex-wrap justify-center`}>
                    <InsightCard title={devices.length} subtitle="Registered Devices" icon={FaMicrochip} />
                    <InsightCard title={dataRecordsCount} subtitle="Total Data Records" icon={FaDatabase} />
                    <InsightCard title={lastRecordUpdate} subtitle="Last Record Update" icon={FaClock} textSize={'sm'} />
                </div>

                {/* Devices Section */}
                <div className={`flex flex-row justify-between px-7 sm:px-10 mt-8 sm:mt-3`}>
                    <span className={`text-lg`}>Devices</span>
                    <div className={`bg-green px-4 py-1 text-sm text-black3 border border-black2 rounded-full`}>
                        {devices.length} Devices Found
                    </div>
                </div>
                <div className={`flex flex-col justify-center px-7 sm:px-10 mt-2`}>
                    {devices.length > 0 ? (
                        devices.slice(0, 5).map((device) => {
                            return (
                                <RectangularCard key={device.device_id} title={device.device_name} subtitle={`Last Update: ${device.updatedAt}`} icon={FaAngleRight}
                                    onClick={() => {
                                        navigate('/devices', { state: { project_id: projectID } });
                                    }} />
                            );
                        })
                    ) : (
                        <div className={`flex flex-row justify-center items-center mt-4`}>
                            <PillButton text="Add Your First Device" icon={FaPlusCircle} onClick={() => {
                                navigate('/devices', { state: { project_id: projectID } });
                            }} />
                        </div>
                    )}
                </div>

                {devices.length > 0 ? (
                    <div className={`flex flex-row justify-center items-center mt-4`}>
                        <PillButton text="View All" icon={FaForward} onClick={() => {
                            navigate('/devices', { state: { project_id: projectID } });
                        }} />
                    </div>
                ) : null}

                {/* Data Tables Section */}
                <div className={`flex flex-row justify-between px-7 sm:px-10 mt-12 sm:mt-10`}>
                    <span className={`text-lg`}>Data Tables</span>
                    <div className={`bg-green px-4 py-1 text-sm text-black3 border border-black2 rounded-full`}>
                        {dataTables.length} Table Found
                    </div>
                </div>
                <div className={`flex flex-col justify-center px-7 sm:px-10 mt-2`}>
                    {dataTables.length > 0 ? (
                        dataTables.slice(0, 5).map((table) => {
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
                        <div className={`flex flex-row justify-center items-center mt-4`}>
                            <PillButton text="Add Your First Table" icon={FaPlusCircle} onClick={() => {
                                navigate('/datahandler', { state: { project_id: projectID } });
                            }} />
                        </div>
                    )}
                </div>

                {dataTables.length > 0 ? (
                    <div className={`flex flex-row justify-center items-center mt-4`}>
                        <PillButton text="View All" icon={FaForward} onClick={() => {
                            navigate('/datahandler', { state: { project_id: projectID } });
                        }} />
                    </div>
                ) : null}
            </div>

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
        </SidebarLayout>
    );
}

export default ProjectOverview;

