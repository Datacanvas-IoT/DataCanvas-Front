import React, { useState, useEffect } from 'react';
import { FaPlusCircle } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarLayout from "../components/layouts/SidebarLayout";
import PillButton from '../components/input/PillButton';
import Spinner from "../components/Spinner";
import axios from "axios";
import AddWidgetContainer from '../components/Widgets/AddWidgetContainer';
import DashboardChartCard from '../components/cards/DashboardChartCard';
import DashboardTableCard from '../components/cards/DashboardTableCard';
import DashboardToggleCard from '../components/cards/DashboardToggleCard';
import DashboardGaugeCard from '../components/cards/DashboardGaugeCard';

function Dashboard() {
    // ---------- Get states from navigation location for retrieval of project_id ----------
    const { state } = useLocation();

    // ---------- Navigation hooks ----------
    const navigate = useNavigate()

    // ---------- Loading state for spinner ----------
    const [loading, setLoading] = useState(false);

    // ---------- States for project ID and data tables ----------
    const [projectID, setProjectID] = useState(-1);
    const [projectName, setProjectName] = useState(localStorage.getItem('project'));
    const [dataTables, setDataTables] = useState([]);

    // ---------- State to store devices of the selected project ----------
    const [devices, setDevices] = useState([]);

    // ---------- states and functions for Add Widget Popup visibility ----------
    const [isAddWidgetPopupVisible, setIsAddWidgetPopupVisible] = useState(false);
    const toggleAddDatatableModal = () => setIsAddWidgetPopupVisible(!isAddWidgetPopupVisible);

    // ---------- State to store widget details ----------
    const [widgets, setWidgets] = useState([
        // Sample array is at bottom of this file
    ]);

    useEffect(() => {
        // ---------- Getting project_id from the location state and uypdating projectID state ----------
        try {
            setProjectID(state.project_id);
        } catch (err) {
            console.log(err);
            navigate('/login');
        }
    }, []);

    useEffect(() => {
        if (projectID != -1) {
            loadDataTables();
            loadDevices();
        }
    }, [projectID]);

    useEffect(() => {
        if (projectID != -1 && dataTables.length > 0 && devices.length > 0) {
            loadWidgets();
        }
    }, [dataTables, devices]);

    // ---------- Load data tables from the backend ----------
    const loadDataTables = async () => {
        setLoading(true);
        // Get request to localhost:3001/api/data/tbl?project_id=<project_id> to get data tables
        try {
            const response = await axios.get(`http://localhost:3001/api/data/tbl?project_id=${projectID}`, {
                headers: {
                    'authorization': localStorage.getItem('auth-token')
                }
            });

            if (response.status == 200) {
                let dataTablesArray = [];
                response.data.forEach((dataTable) => {
                    let tableDetails = {
                        tbl_id: dataTable.tbl_id,
                        tbl_name: dataTable.tbl_name,
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

    // ---------- Load devices from the backend ----------
    const loadDevices = async () => {
        setLoading(true);
        // get request to localhost:3001/api/device?project_id=<projectID>
        try {
            const response = await axios.get(
                `http://localhost:3001/api/device?project_id=${projectID}`,
                {
                    headers: {
                        authorization: localStorage.getItem("auth-token"),
                    },
                }
            );

            if (response.status == 200) {
                let devicesArray = [];
                response.data.forEach((device) => {
                    let deviceDetails = {
                        device_id: device.device_id,
                        device_name: device.device_name,
                    };
                    devicesArray.push(deviceDetails);
                });

                setDevices(devicesArray);
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
        }
    }

    const loadWidgets = async () => {
        setLoading(true);
        // get request to localhost:3001/api/widget?project_id=<projectID>
        try {
            const response = await axios.get(
                `http://localhost:3001/api/widget?project_id=${projectID}`,
                {
                    headers: {
                        authorization: localStorage.getItem("auth-token"),
                    },
                }
            );

            if (response.status == 200) {
                setWidgets(response.data);
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
            setWidgets([]);
            setLoading(false);
        }
    }

    /*
        * Delete widget function
        * API Endpoint : http://localhost:3001/api/widget
        * Method : DELETE
        * Request Body : {
        *   widget_id: <widget_id>
        * }
        * Headers : {
        *  authorization: <auth-token>
        * }
        * @param {number} widget_id - The widget_id of the widget to be deleted
        * @returns {void}
        * After deleting the widget, the widgets state should be updated to remove the deleted widget
    */
    const deleteWidget = async (widget_id) => {

    }

    return (
        <SidebarLayout active={1}
            breadcrumb={`${localStorage.getItem('project')} > Dashboard`}>
            <div className={`flex flex-row justify-between px-7 sm:px-10 mt-6 sm:mt-2`}>
                <span className={`text-lg font-semibold`}>{projectName}</span>
                <PillButton text="Add Widget" icon={FaPlusCircle} onClick={() => { setIsAddWidgetPopupVisible(true) }} />
            </div>

            {/* This popup series will open when Add Widget button is clicked */}
            <AddWidgetContainer isOpen={isAddWidgetPopupVisible}
                closeFunction={toggleAddDatatableModal}
                tables={dataTables}
                devices={devices}
                setLoading={setLoading}
                projectID={projectID}
                loadWidgets={loadWidgets}
            />

            <div className={`flex-wrap flex ${widgets.length < 3 ? 'justify-start' : 'justify-center'} sm:px-8 px-2 mb-28 mt-6`}>
                {widgets.map((widget, index) => {
                    return (
                        (widget.widget_type == 1) ? <DashboardChartCard key={index} widget={widget} onClick={() => {
                            navigate('/expand', { state: { project_id: projectID, widget: widget } })
                        }}
                            deleteWidget={(widget_id) => deleteWidget(widget_id)} />
                            : (widget.widget_type == 2) ? <DashboardTableCard key={index} widget={widget} onClick={() => {
                                navigate('/expand', { state: { project_id: projectID, widget: widget } })
                            }}
                                deleteWidget={(widget_id) => deleteWidget(widget_id)} />
                                : (widget.widget_type == 3) ? <DashboardToggleCard key={index} widget={widget} onClick={() => {
                                }}
                                    deleteWidget={(widget_id) => deleteWidget(widget_id)} />
                                    : (widget.widget_type == 4) ? <DashboardGaugeCard key={index} widget={widget} onClick={() => {
                                    }}
                                        deleteWidget={(widget_id) => deleteWidget(widget_id)} />
                                        : null
                    )
                })}
            </div>

            {/* Spinner component will be visible when loading state is true */}
            <Spinner isVisible={loading} />

            {/* Toast container for notifications */}
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
        </SidebarLayout>
    );
}

export default Dashboard;


/*
    * Sample array of widgets
    [
        {
            widget_id: 1,
            widget_name: "IT Dept. Temperature Variation",
            dataset: 59,
            DataTable: {
                tbl_name: 'tbl_data'
            },
            widget_type: 1,
            project_id: 53,
            configuration: {
                id: 1,
                widget_id: 1,
                x_axis: 0,
                chart_type: 1,
                ChartSeries: [
                    {
                        id: 1,
                        chart_id: 1,
                        series_name: "Temperature",
                        clm_id: 146,
                        device_id: 72
                    }
                ]
            }
        },
        {
            widget_id: 2,
            widget_name: "IT Department Readings ",
            dataset: 59,
            widget_type: 2,
            configuration: {
                columns: [
                    {
                        id: 1,
                        widget_id: 2,
                        clm_id: 146,
                        device_id: 72,
                        Column : {
                            clm_name: 'id'
                        },
                        Device : {
                            device_name: 'IT Department'
                        }
                    },
                    {
                        id: 1,
                        widget_id: 2,
                        clm_id: 146,
                        device_id: 72,
                        Column : {
                            clm_name: 'id'
                        },
                        Device : {
                            device_name: 'IT Department'
                        }
                    },
                    {
                        id: 1,
                        widget_id: 2,
                        clm_id: 146,
                        device_id: 72,
                        Column : {
                            clm_name: 'id'
                        },
                        Device : {
                            device_name: 'IT Department'
                        }
                    },
                ]
            }
        },
        {
            widget_id: 3,
            widget_name: "IT Department Device Status",
            dataset: 59,
            widget_type: 3,
            configuration: {
                id: 1,
                widget_id: 3,
                clm_id: 154,
                write_enabled: true,
                device_id: 72
            }
        },
        {
            widget_id: 4,
            widget_name: "IT Dept. CO2 Index",
            dataset: 59,
            widget_type: 4,
            configuration: {
                id: 1,
                widget_id: 3,
                clm_id: 151,
                min_value: 0,
                max_value: 100,
                gauge_type: 1,
                device_id: 72
            }
        },
    ]
*/