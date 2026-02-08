import React, { useState, useEffect } from "react";
import { FaUpload } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarLayout from "../components/layouts/SidebarLayout";
import TextBox from "../components/input/TextBox";
import PillButton from "../components/input/PillButton";
import Spinner from "../components/Spinner";
import axios from "axios";
import CriticalAction from "../components/CriticalAction";
import LoginPopup from "../components/LoginPopup";
import config from "../config";


function ProjectSettings() {
    // ---------- Navigation hooks ----------
    const navigate = useNavigate();

    // ---------- Get states from navigation location for retrieval of project_id ----------
    const { state } = useLocation();

    // ---------- Loading state for spinner ----------
    const [loading, setLoading] = useState(false);

    // ---------- Project Details states ----------
    const [projectID, setProjectID] = useState(-1);
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [realTimeEnabled, setRealTimeEnabled] = useState(false);
    const [mqttKey, setMqttKey] = useState("");

    // ---------- Login for proceed with critical actions
    const [isLoginPopupVisible, setIsLoginPopupVisible] = useState(false);
    const [actionType, setActionType] = useState(''); // 1 - delete all data , 2 - Delete tables, 3 - Delete devices, 4 - Delete project
    const [authenticationResult, setAuthenticationResult] = useState(false);

    useEffect(() => {
        if (authenticationResult) {
            setIsLoginPopupVisible(false);
            if (actionType == 1) {
                toast.success('Login successful, Deleting data');
                handleDeleteData(projectID);

            } else if (actionType == 2) {
                toast.success('Login successful, Deleting tables');
                handleTableDelete(projectID);
            }
            else if (actionType == 3) {
                toast.success('Login successful, Deleting devices');
                handleDeviceDelete(projectID);
            }
            else if (actionType == 4) {
                toast.success('Login successful, Deleting project');
                handleProjectDelete(projectID);
            }
        }
    }, [authenticationResult]);


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
        if (projectID !== -1) {
            loadProjectDetails();
        }
    }, [projectID]);

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
                console.log(response.data);
                setProjectName(response.data.project_name);
                setProjectDescription(response.data.description);
                setRealTimeEnabled(response.data.real_time_enabled);
                setMqttKey(response.data.mqtt_key);
                setLoading(false);
            }

        } catch (err) {
            switch (err.response.status) {
                case 400:
                    toast.error('Bad request!');
                    navigate('/login');
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
            setLoading(false);
        }
    }

    //----API call for updating project details----
    const handleProjectUpdate = async (project_id) => {
        if (projectName === "" || projectDescription === "") {
            toast.error("Project name and description cannot be empty!");
            return;
        }
        setLoading(true);
        // put request to localhost:3001/api/project
        try {
            const response = await axios.put(
                `${config.REACT_APP_API_URL}/project`,
                {
                    project_id: project_id,
                    project_name: projectName,
                    description: projectDescription,
                    real_time_enabled: realTimeEnabled
                },
                {
                    headers: {
                        authorization: localStorage.getItem("auth-token"),
                    },
                }
            );

            if (response.status === 200) {
                toast.success("Project updated!");
            }
        } catch (err) {
            switch (err.response.status) {
                case 400:
                    toast.error("Bad request!");
                    break;
                case 401:
                    toast.error("Unauthorized access!");
                    navigate("/login");
                    break;
                case 403:
                    toast.error("Unauthorized access!");
                    navigate("/login");
                    break;
                case 404:
                    toast.error("Project not found!");
                    break;
                default:
                    toast.error("Something went wrong!");
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    //--API call for deleting all device
    const handleDeviceDelete = async (project_id) => {
        setLoading(true);
        // delete request to localhost:3001/api/device/all
        try {
            const response = await axios.delete(`${config.REACT_APP_API_URL}/device/all`, {
                headers: {
                    authorization: localStorage.getItem("auth-token"),
                },
                data: { project_id },
            });

            if (response.status === 200) {
                toast.success("All devices deleted!");
            }
        } catch (err) {
            switch (err.response.status) {
                case 400:
                    toast.error("Bad request!");
                    break;
                case 401:
                    toast.error("Unauthorized access!");
                    navigate("/login");
                    break;
                case 403:
                    toast.error("Token not provided!");
                    break;
                case 404:
                    toast.warning("Devices not found!");
                    break;
                default:
                    toast.error("Something went wrong!");
                    break;
            }
        }
        finally {
            setLoading(false);
        }
    };

    //--API call for deleting all tables
    const handleTableDelete = async (project_id) => {
        setLoading(true);
        // delete request to localhost:3001/api/table/all
        try {
            const response = await axios.delete(`${config.REACT_APP_API_URL}/data/tbl/all`, {
                headers: {
                    authorization: localStorage.getItem("auth-token"),
                },
                data: { project_id },
            });

            if (response.status === 200) {
                toast.success("All tables deleted!");
            }
        } catch (err) {
            switch (err.response.status) {
                case 400:
                    toast.error("Bad request!");
                    break;
                case 401:
                    toast.error("Unauthorized access!");
                    navigate("/login");
                    break;
                case 403:
                    toast.error("Token not provided!");
                    break;
                case 404:
                    toast.warning("Tables not found!");
                    break;
                default:
                    toast.error("Something went wrong!");
                    break;
            }
        }
        finally {
            setLoading(false);
        }
    };

    //--API call for deleting all data
    /*
        * API endpoint : ${config.REACT_APP_API_URL}/data/tbl/truncateall
        * Method : POST
        * Request body : { project_id: <project_id> }
        * Response : 
        * 200 : { message: "All tables truncated successfully" }
        * 400 : { message: "Bad request" }
        * 401 : { message: "Unauthorized access" }
        * 403 : { message: "Token not provided" }
        * 404 : { message: "Tables not found" }
        * 500 : { error: "Failed to truncate all tables" }
    */
    const handleDeleteData = async (project_id) => {
        setLoading(true);
        try {
            const response = await axios.post(`${config.REACT_APP_API_URL}/data/tbl/truncateall`, { project_id }, {
                headers: {
                    authorization: localStorage.getItem("auth-token"),
                }
            });

            if (response.status == 200) {
                toast.success("All data deleted!");
            }
        } catch (err) {
            switch (err.response.status) {
                case 400:
                    toast.error("Bad request!");
                    navigate("/projects");
                    break;
                case 401:
                    toast.error("Unauthorized access!");
                    navigate("/login");
                    break;
                case 403:
                    toast.error("Token not provided!");
                    navigate("/login");
                    break;
                case 404:
                    toast.warning("Data not found!");
                    break;
                default:
                    toast.error("Something went wrong!");
                    break;
            }
        }
        finally {
            setLoading(false);
        }
    }

    const handleProjectDelete = async (project_id) => {
        setLoading(true);
        // delete request to localhost:3001/api/project
        try {
            const response = await axios.delete(`${config.REACT_APP_API_URL}/project`, {
                headers: {
                    authorization: localStorage.getItem("auth-token"),
                },
                data: { project_id },
            });

            if (response.status == 200) {
                toast.success("Project successfully deleted!");
                navigate('/projects');
            }
        } catch (err) {
            switch (err.response.status) {
                case 400:
                    toast.error("Bad request!");
                    break;
                case 401:
                    toast.error("Unauthorized access!");
                    navigate("/login");
                    break;
                case 403:
                    toast.error("Token not provided!");
                    navigate("/login");
                    break;
                case 404:
                    toast.warning("Project not found!");
                    break;
                default:
                    toast.error("Something went wrong!");
                    break;
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <SidebarLayout active={4} breadcrumb={`${localStorage.getItem('project')} > Project Settings`}>
            <div className="text-lg text-gray2 font-semibold mx-8 mt-2">Project Settings</div>
            <div className="text-m text-gray2 font-semibold mx-8 mt-8">General Settings</div>

            <div className='flex flex-row ml-8 mt-1'>
                <div className='flex flex-col w-1/4 md:w-1/6'>
                    <div className="text-sm md:text-md text-gray1 font-semibold mt-2">Project Name</div>
                </div>
                <TextBox value={projectName} onChange={(e) => {
                    setProjectName(e.target.value)
                }} type="text" placeholder="UoM-SUPSI Weather Station" maxLength={50} textAlign="left" width="w-2/3 md:w-1/4" />
            </div>
            <div className="flex flex-row ml-8 mt-4">
                <div className="flex flex-col w-1/4 md:w-1/6">
                    <div className="text-sm md:text-md text-gray1 font-semibold mt-2">Project Description</div>
                </div>
                <textarea className="w-2/3 md:w-1/4 h-24 border-2 border-gray1 border-opacity-30 rounded-xl p-2 text-gray2 bg-black3" placeholder="Description" value={projectDescription} onChange={(e) => { setProjectDescription(e.target.value) }}></textarea>
            </div>
            <div className='flex flex-row ml-8 mt-2'>
                <div className='flex flex-col w-1/4 md:w-1/6'>
                    <div className="text-sm md:text-md text-gray1 font-semibold mt-2">Project ID</div>
                </div>
                <TextBox value={projectID} onChange={(e) => { }} type="text" placeholder="256" maxLength={50} textAlign="left" width="w-2/3 md:w-1/4" disabled={true} />
            </div>
            <div className='flex flex-row ml-8 mt-4 items-center'>
                <div className='flex flex-col w-1/4 md:w-1/6'>
                    <div className="text-sm md:text-md text-gray1 font-semibold mt-2">Real Time Enabled</div>
                </div>
                <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-green ml-2"
                    checked={realTimeEnabled}
                    onChange={() => setRealTimeEnabled(!realTimeEnabled)}
                />
            </div>
            {realTimeEnabled && (
                <div className='flex flex-row ml-8 mt-2'>
                    <div className='flex flex-col w-1/4 md:w-1/6'>
                        <div className="text-sm md:text-md text-gray1 font-semibold mt-2">MQTT Key</div>
                    </div>
                    <TextBox value={mqttKey} onChange={(e) => { }} type="text" placeholder="256" maxLength={50} textAlign="left" width="w-2/3 md:w-1/4" disabled={true} />
                </div>
            )}
            <div className='flex w-full sm:w-3/5 items-center justify-center mt-4 '>
                <PillButton
                    text="Update Project"
                    onClick={() => { handleProjectUpdate(projectID) }}
                    isPopup={true}
                    icon={FaUpload}
                />
            </div>

            <div className="border-t border-gray1 border-opacity-80 mx-8 my-8 mr-8"></div>

            <div className="text-m text-gray2 font-semibold mx-8 mt-8">Critical Settings</div>

            <div className="flex flex-col mx-6 mt-4 mb-36">
                <CriticalAction title="Delete all data" subtitle="This will delete all the gathered data in the tables. This will not delete tables" buttonText={"Delete"} buttonColor={"red"} onClick={() => {
                    setActionType(1);
                    setIsLoginPopupVisible(true)
                }} />
                <CriticalAction title="Delete all tables" subtitle="This will delete all the gathered data as well as tables" buttonText={"Delete"} buttonColor={"red"} onClick={() => {
                    setActionType(2);
                    setIsLoginPopupVisible(true)
                }} />
                <CriticalAction title="Delete all devices" subtitle="This will delete all the devices and their respective gathered data" buttonText={"Delete"} buttonColor={"red"} onClick={() => {
                    setActionType(3);
                    setIsLoginPopupVisible(true)
                }} />
                <CriticalAction title="Delete project" subtitle="This will delete this project, including all devices, tables, data and dashboard" buttonText={"Delete"} buttonColor={"red"} onClick={() => {
                    setActionType(4);
                    setIsLoginPopupVisible(true)
                }} />
            </div>

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

        </SidebarLayout>
    );

}

export default ProjectSettings;