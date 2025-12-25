import React, { useState, useEffect } from 'react';
import { FaKey, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarLayout from '../components/layouts/SidebarLayout';
import PillButton from '../components/input/PillButton';
import SelectBox from '../components/input/SelectBox';
import DeviceSelection from '../components/input/DeviceSelection';
import DomainSitesInput from '../components/input/DomainSitesInput';
import Spinner from '../components/Spinner';
import accessTokenService from '../services/accessTokenService';

const GenerateNewToken = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [loading, setLoading] = useState(false);
    const [projectID, setProjectID] = useState(-1);
    const [projectName, setProjectName] = useState(localStorage.getItem('project'));

    // Form states
    const [accessTokenName, setAccessTokenName] = useState('');
    const [expiration, setExpiration] = useState(30);
    const [devices, setDevices] = useState([]);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [domainSites, setDomainSites] = useState(['']);

    // Expiration options
    const expirationOptions = [
        { value: 7, label: '7 days' },
        { value: 30, label: '30 days' },
        { value: 60, label: '60 days' },
        { value: 90, label: '90 days' },
        { value: 180, label: '180 days' },
        { value: 365, label: '1 year' },
    ];

    // Calculate expiration date for a given number of days
    const getExpirationDate = (days) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    // Validate domain format
    const isValidDomain = (domain) => {
        const domainRegex = /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|localhost|(?:\d{1,3}\.){3}\d{1,3})(?::\d+)?$/;
        return domainRegex.test(domain.trim());
    };

    // Get project_id from location state
    useEffect(() => {
        try {
            if (state?.project_id) {
                setProjectID(state.project_id);
                localStorage.setItem('project_id', state.project_id);
            } else {
                const storedProjectId = localStorage.getItem('project_id');
                if (storedProjectId) {
                    setProjectID(parseInt(storedProjectId));
                }
            }
        } catch (err) {
            console.log(err);
            navigate('/login');
        }
    }, []);

    // Load devices when projectID changes
    useEffect(() => {
        if (projectID !== -1) {
            loadDevices();
        }
    }, [projectID]);

    // API call for getting devices of the project
    const loadDevices = async () => {
        setLoading(true);
        try {
            const response = await accessTokenService.getDevicesByProjectId(projectID);

            if (response.status === 200) {
                setDevices(response.data);
            }
        } catch (err) {
            switch (err.response?.status) {
                case 401:
                    toast.error("Your Session Has Expired! Please Login Again!");
                    navigate('/login');
                    break;
                case 403:
                    toast.error("You Are Not Authorized!");
                    navigate('/login');
                    break;
                case 404:
                    setDevices([]);
                    break;
                default:
                    // toast.error("Something Went Wrong!");
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAccessTokenNameChange = (e) => {
        const words = e.target.value.split(/\s+/).filter(word => word.length > 0);
        if (words.length <= 30) {
            setAccessTokenName(e.target.value);
        }
    };

    const handleExpirationChange = (e) => {
        setExpiration(parseInt(e.target.value));
    };

    const handleDeviceToggle = (deviceId) => {
        setSelectedDevices(prev => {
            if (prev.includes(deviceId)) {
                return prev.filter(id => id !== deviceId);
            } else {
                return [...prev, deviceId];
            }
        });
    };

    const handleSelectAllDevices = () => {
        if (selectedDevices.length === devices.length) {
            setSelectedDevices([]);
        } else {
            setSelectedDevices(devices.map(device => device.device_id));
        }
    };

    const handleSiteChange = (index, value) => {
        const updatedSites = [...domainSites];
        updatedSites[index] = value;
        setDomainSites(updatedSites);
    };

    const handleAddSite = () => {
        if (domainSites[domainSites.length - 1].trim() === '') {
            toast.error('Please enter a site name before adding another');
            return;
        }
        setDomainSites([...domainSites, '']);
    };

    const handleRemoveSite = (index) => {
        if (domainSites.length === 1) {
            toast.error('At least one site is required');
            return;
        }
        const updatedSites = domainSites.filter((_, i) => i !== index);
        setDomainSites(updatedSites);
    };

    const handleGoBack = () => {
        navigate('/accesstoken', { state: { project_id: projectID } });
    };

    const handleGenerateToken = async () => {
        if (!accessTokenName.trim()) {
            toast.error('access token name is required');
            return;
        }

        if (selectedDevices.length === 0) {
            toast.error('Please select at least one device');
            return;
        }

        const validSites = domainSites.filter(site => site.trim() !== '');
        if (validSites.length === 0) {
            toast.error('Please add at least one domain site');
            return;
        }

        // Validate domain format for each site
        const invalidDomains = validSites.filter(site => !isValidDomain(site));
        if (invalidDomains.length > 0) {
            toast.error(`Invalid domain format: ${invalidDomains[0]}. Use format like example.com`);
            return;
        }
        //Validate for dublicate sites
        const uniqueSites = [...new Set(validSites)];
        if (uniqueSites.length !== validSites.length) {
            toast.error('Duplicate domains detected. Please remove duplicates.');
            return;
        }

        setLoading(true);

        try {
            const response = await accessTokenService.createAccessKey({
                access_key_name: accessTokenName,
                project_id: projectID,
                domain_name_array: domainSites.filter(site => site.trim() !== ''),
                device_id_array: selectedDevices,
                valid_duration_for_access_key: expiration,
            });

            if (response.status === 200 || response.status === 201) {
                toast.success('Token generated successfully!');
                // Navigate back to access tokens list
                setTimeout(() => {
                    navigate('/accesstoken', { state: { project_id: projectID } });
                }, 1500);
            }
        } catch (err) {
            switch (err.response?.status) {
                case 400:
                    toast.error(err.response?.data?.message || "Bad request!");
                    break;
                case 401:
                    toast.error("Your Session Has Expired! Please Login Again!");
                    navigate('/login');
                    break;
                case 403:
                    toast.error("You Are Not Authorized!");
                    navigate('/login');
                    break;
                case 404:
                    toast.error("Resource not found!");
                    break;
                default:
                    toast.error("Something went wrong!");
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    // Count words in access token name
    const wordCount = accessTokenName.split(/\s+/).filter(word => word.length > 0).length;

    return (
        <SidebarLayout active={6} breadcrumb={`${localStorage.getItem('project')} > Access Tokens > Generate New`}>
            {/* Token Generation Form */}
            <div className="px-7 sm:px-10 mb-28">
                <div className="w-full">
                    <h1 className="text-2xl font-semibold text-green mb-2">Generate New Access Token</h1>
                    <p className="text-gray2 text-sm mb-6">
                        Create a fine-grained access token for API access to this project.
                    </p>

                    <div className="border-t border-gray1 border-opacity-30 mb-6"></div>

                    {/* access token name */}
                    <div className="flex flex-col mb-6">
                        <label className="text-sm text-gray2 font-semibold mb-1">
                            Access Token Name <span className="text-red">*</span>
                        </label>
                        <textarea
                            value={accessTokenName}
                            onChange={handleAccessTokenNameChange}
                            placeholder="Enter access token name"
                            rows={3}
                            className="w-full bg-black3 text-sm border border-gray2 border-opacity-30 rounded-lg px-4 py-2 mt-1 text-gray2 resize-none focus:outline-none focus:border-green"
                        />
                        <p className="text-gray1 text-xs mt-1">
                            {wordCount}/30 words
                        </p>
                    </div>

                    {/* Expiration */}
                    <div className="flex flex-col mb-6">
                        <label className="text-sm text-gray2 font-semibold mb-1">
                            Expiration
                        </label>
                        <div className="flex items-center mt-1">
                            <FaCalendarAlt className="text-gray2 mr-2" />
                            <SelectBox
                                value={expiration}
                                onChange={handleExpirationChange}
                                width="w-auto"
                                mt="mt-0"
                            >
                                {expirationOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label} ({getExpirationDate(option.value)})
                                    </option>
                                ))}
                            </SelectBox>
                        </div>
                        <p className="text-gray1 text-xs mt-1">
                            The token will expire on the selected date
                        </p>
                    </div>

                    {/* Device Selection */}
                    <DeviceSelection
                        devices={devices}
                        selectedDevices={selectedDevices}
                        onDeviceToggle={handleDeviceToggle}
                        onSelectAll={handleSelectAllDevices}
                    />

                    {/* Domain Sites */}
                    <div className="w-full">
                        <DomainSitesInput
                            domainSites={domainSites}
                            onSiteChange={handleSiteChange}
                            onAddSite={handleAddSite}
                            onRemoveSite={handleRemoveSite}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between mt-8">
                        <PillButton
                            text="Cancel"
                            onClick={handleGoBack}
                            isPopup={true}
                            icon={FaArrowLeft}
                            color="red"
                        />
                        <PillButton
                            text="Generate Token"
                            onClick={handleGenerateToken}
                            isPopup={true}
                            icon={FaKey}
                        />
                    </div>
                </div>
            </div>

            <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            <Spinner isVisible={loading} />
        </SidebarLayout>
    );
};

export default GenerateNewToken;
