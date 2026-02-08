import React, { useState, useEffect } from 'react';
import { FaPlusCircle } from "react-icons/fa";
import { SiGoogleassistant } from "react-icons/si";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarLayout from "../components/layouts/SidebarLayout";
import PillButton from '../components/input/PillButton';
import Spinner from "../components/Spinner";
import AddAnalyticsWidgetPopup from "../components/Widgets/AddAnalyticsWidgetPopup";
import DashboardAnalyticsCard from "../components/cards/DashboardAnalyticsCard";
import AskAssistantPopup from "../components/AskAssistantPopup";
import axios from "axios";
import config from "../config";

export default function Analytics() {
    // ---------- Get states from navigation location for retrieval of project_id ----------
    const { state } = useLocation();

    // ---------- Navigation hooks ----------
    const navigate = useNavigate()

    // ---------- Loading state for spinner ----------
    const [loading, setLoading] = useState(false);

    const [assistantPopupVisible, setAssistantPopupVisible] = useState(false);
    const toggleAssistantPopup = () => {
        setAssistantPopupVisible(!assistantPopupVisible);
    }

    const [analyticTypes, setAnalyticTypes] = useState([
        { id: 0, name: 'Average' },
        { id: 1, name: 'Variance' },
        { id: 2, name: 'Standard Deviation' },
        { id: 3, name: 'Count' },
        { id: 4, name: 'Maximum' },
        { id: 5, name: 'Minimum' },
        { id: 6, name: 'Median' },
        { id: 7, name: 'Mode' },
        { id: 8, name: '1st Quartile' },
        { id: 9, name: '3rd Quartile' },
        { id: 10, name: 'Skewness' },
        { id: 11, name: 'Kurtosis' },
        { id: 12, name: 'Mean Absolute Deviation' },
        { id: 13, name: 'Sum' },
    ]);

    // ---------- States for project ID and data tables ----------
    const [projectID, setProjectID] = useState(-1);
    const [projectName, setProjectName] = useState(localStorage.getItem('project'));
    const [dataTables, setDataTables] = useState([]);
    const [columns, setColumns] = useState([]);

    // ---------- State to store devices of the selected project ----------
    const [devices, setDevices] = useState([]);

    // ---------- State to store widget details ----------
    const [widgets, setWidgets] = useState([
        // Sample array is at bottom of this file
    ]);

    const [isAddWidgetPopupVisible, setIsAddWidgetPopupVisible] = useState(false);
    const toggleAddWidgetPopup = () => {
        setIsAddWidgetPopupVisible(!isAddWidgetPopupVisible);
        setSelectedWidget(null);
    }
    const [selectedWidget, setSelectedWidget] = useState(null);

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

    // Load data tables including their columns
    const loadDataTables = async () => {
        setLoading(true);
        // get request to localhost:3001/api/data/clm?project_id=<projectID>
        try {
            const response = await axios.get(
                `${config.REACT_APP_API_URL}/data/clm/project/${projectID}`,
                {
                    headers: {
                        authorization: localStorage.getItem("auth-token"),
                    },
                }
            );

            if (response.status == 200) {
                setLoading(false);
                let tablesArray = [];
                let columnsArray = [];
                for (let tbl of response.data) {
                    let tableDetails = {
                        tbl_id: tbl.tbl_id,
                        tbl_name: tbl.tbl_name
                    };
                    tablesArray.push(tableDetails);

                    for (let clm of tbl.columns) {
                        let columnDetails = {
                            clm_id: clm.clm_id,
                            clm_name: clm.clm_name,
                            data_type: clm.data_type,
                            tbl_id: tbl.tbl_id,
                            is_system_column: clm.is_system_column
                        };
                        columnsArray.push(columnDetails);
                    }
                }

                setDataTables(tablesArray);
                setColumns(columnsArray);
            }
        } catch (err) {
            console.log(err);
            switch (err.response.status) {
                case 400:
                    toast.error("Bad request!");
                    break;
                case 401:
                    toast.error("Unauthorized access!");
                    navigate('/login');
                    break;
                case 403:
                    toast.error("Unauthorized access!");
                    navigate('/login');
                    break;
                case 404:
                    toast.error("Project not found!");
                    break;
                default:
                    toast.error("Something went wrong!");
                    break;
            }
            setLoading(false);
            return [];
        }
    }

    // ---------- Load devices from the backend ----------
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
                    navigate('/login');
                    break;
                case 403:
                    toast.error("Unauthorized access!");
                    navigate('/login');
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
                `${config.REACT_APP_API_URL}/analytic_widget?project=${projectID}`,
                {
                    headers: {
                        authorization: localStorage.getItem("auth-token"),
                    },
                }
            );

            if (response.status == 200) {
                console.log(response.data);
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
                    navigate('/login');
                    break;
                case 403:
                    toast.error("Unauthorized access!");
                    navigate('/login');
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

    const saveWidget = async (widget) => {
        widget.project = projectID;
        setLoading(true);

        try {
            let response;
            if (widget.widget_id == null) {
                response = await axios.post(
                    `${config.REACT_APP_API_URL}/analytic_widget`,
                    widget,
                    {
                        headers: {
                            authorization: localStorage.getItem("auth-token"),
                        },
                    }
                );
            } else {
                response = await axios.put(
                    `${config.REACT_APP_API_URL}/analytic_widget`,
                    widget,
                    {
                        headers: {
                            authorization: localStorage.getItem("auth-token"),
                        },
                    }
                );
            }


            if (response.status == 200) {
                if (widget.widget_id != null) {
                    toast.success("Widget updated successfully!");
                } else {
                    toast.success("Widget added successfully!");
                }

                setLoading(false);
                loadWidgets();
                toggleAddWidgetPopup();
            }
        } catch (err) {
            switch (err.response.status) {
                case 400:
                    toast.error("Bad request!");
                    break;
                case 401:
                    toast.error("Unauthorized access!");
                    navigate('/login');
                    break;
                case 403:
                    toast.error("Unauthorized access!");
                    navigate('/login');
                    break;
                case 404:
                    toast.error("Project not found!");
                    break;
                default:
                    toast.error("Something went wrong!");
                    break;
            }
            setLoading(false);
        }
    }

    const deleteWidget = async (widget) => {
        setLoading(true);

        try {
            const response = await axios.delete(
                `${config.REACT_APP_API_URL}/analytic_widget/${widget.id}`,
                {
                    headers: {
                        authorization: localStorage.getItem("auth-token"),
                    },
                }
            );

            if (response.status == 200) {
                toast.success("Widget deleted successfully!");
                setLoading(false);
                widgets.splice(widgets.indexOf(widget), 1);
            }
        } catch (err) {
            switch (err.response.status) {
                case 400:
                    toast.error("Bad request!");
                    break;
                case 401:
                    toast.error("Unauthorized access!");
                    navigate('/login');
                    break;
                case 403:
                    toast.error("Unauthorized access!");
                    navigate('/login');
                    break;
                case 404:
                    toast.error("Project not found!");
                    break;
                default:
                    toast.error("Something went wrong!");
                    break;
            }
            setLoading(false);
        }
    }

    return (
        <SidebarLayout active={5} breadcrumb={`${localStorage.getItem('project')} > Analytics`}>
            <div className={`flex flex-row justify-between px-7 sm:px-10 mt-6 sm:mt-2`}>
                <span className={`text-lg font-semibold`}>{projectName}</span>
                <div className='flex justify-center items-center space-x-4'>
                    <PillButton text="Ask Assistant" icon={SiGoogleassistant} onClick={() => { setAssistantPopupVisible(true) }} />
                    <PillButton text="Add Widget" icon={FaPlusCircle} onClick={() => { setIsAddWidgetPopupVisible(true) }} />
                </div>
            </div>

            <div className={`flex-wrap flex ${widgets.length < 3 ? 'justify-start' : 'justify-center'} sm:px-8 px-2 mb-28 mt-6`}>
                {
                    widgets.map((widget, index) => {
                        return (
                            <DashboardAnalyticsCard
                                key={index}
                                widget={widget}
                                columns={columns}
                                deleteWidget={() => { deleteWidget(widget) }}
                                updateWidget={() => {
                                    setSelectedWidget(widget);
                                    setIsAddWidgetPopupVisible(true);
                                }}
                            />
                        );
                    })
                }
            </div>

            <AddAnalyticsWidgetPopup isOpen={isAddWidgetPopupVisible}
                closeFunction={toggleAddWidgetPopup}
                tables={dataTables}
                devices={devices}
                columns={columns}
                analyticTypes={analyticTypes}
                submitFunction={(widget) => { saveWidget(widget) }}
                type={(selectedWidget == null) ? 0 : 1}
                currentWidget={selectedWidget}
            />

            <AskAssistantPopup isOpen={assistantPopupVisible}
                closeFunction={toggleAssistantPopup}
                tables={dataTables}
                columns={columns}
                devices={devices}
                analyticTypes={analyticTypes} />

            {/* Spinner component will be visible when loading state is true */}
            <Spinner isVisible={loading} />

            {/* Toast container for notifications */}
            <ToastContainer
                position="bottom-center"
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
    )
}