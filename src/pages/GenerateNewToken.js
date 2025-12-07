import React, { useState, useEffect } from 'react';
import { FaKey, FaArrowLeft, FaCalendarAlt, FaPlus, FaTimes } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import SidebarLayout from '../components/layouts/SidebarLayout';
import TextBox from '../components/input/TextBox';
import PillButton from '../components/input/PillButton';
import SelectBox from '../components/input/SelectBox';
import Spinner from '../components/Spinner';

const GenerateNewToken = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [loading, setLoading] = useState(false);
    const [projectID, setProjectID] = useState(-1);
    const [projectName, setProjectName] = useState(localStorage.getItem('project'));

    // Form states
    const [description, setDescription] = useState('');
    const [expiration, setExpiration] = useState(30);
    const [devices, setDevices] = useState([]);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [domainSites, setDomainSites] = useState(['']);
    const [newSite, setNewSite] = useState('');

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
        // Domain regex: allows subdomains, main domain, and TLD
        // Examples: example.com, sub.example.com, my-site.co.uk, localhost
        const domainRegex = /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|localhost)$/;
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
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/device?project_id=${projectID}`,
                {
                    headers: {
                        authorization: localStorage.getItem("auth-token"),
                    },
                }
            );

            if (response.status === 200) {
                setDevices(response.data);
            }
        } catch (err) {
            switch (err.response?.status) {
                case 401:
                    toast.error("Unauthorized access!");
                    navigate('/login');
                    break;
                case 403:
                    toast.error("Unauthorized access!");
                    navigate('/login');
                    break;
                case 404:
                    setDevices([]);
                    break;
                default:
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDescriptionChange = (e) => {
        const words = e.target.value.split(/\s+/).filter(word => word.length > 0);
        if (words.length <= 30) {
            setDescription(e.target.value);
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
        if (!description.trim()) {
            toast.error('Description is required');
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

        setLoading(true);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/accesstoken`,
                {
                    description: description,
                    project_id: projectID,
                    expiration_days: expiration,
                    device_ids: selectedDevices,
                    domain_sites: domainSites.filter(site => site.trim() !== ''),
                },
                {
                    headers: {
                        authorization: localStorage.getItem("auth-token"),
                    },
                }
            );

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
                default:
                    toast.error("Something went wrong!");
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    // Count words in description
    const wordCount = description.split(/\s+/).filter(word => word.length > 0).length;

    return (
        <SidebarLayout active={6} breadcrumb={`${localStorage.getItem('project')} > Access Tokens > Generate New`}>
            {/* Header with Back Button */}
            <div className="flex flex-row justify-between items-center px-7 sm:px-10 mt-6 sm:mt-2">
                <div className="flex items-center">
                    <button
                        onClick={handleGoBack}
                        className="text-green hover:text-gray2 transition-colors mr-4"
                    >
                        <FaArrowLeft className="text-xl" />
                    </button>
                    <span className="text-lg font-semibold">Back to Access Tokens</span>
                </div>
            </div>

            {/* Token Generation Form */}
            <div className="px-7 sm:px-10 mt-6 mb-28">
                <div className="bg-black3 rounded-xl p-6 md:p-10 max-w-2xl">
                    <h1 className="text-2xl font-semibold text-green mb-2">Generate New Access Token</h1>
                    <p className="text-gray2 text-sm mb-6">
                        Create a fine-grained access token for API access to this project.
                    </p>

                    <div className="border-t border-gray1 border-opacity-30 mb-6"></div>

                    {/* Description */}
                    <div className="flex flex-col mb-6">
                        <label className="text-sm text-gray2 font-semibold mb-1">
                            Description <span className="text-red">*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={handleDescriptionChange}
                            placeholder="Enter description"
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
                    <div className="flex flex-col mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm text-gray2 font-semibold">
                                Devices <span className="text-red">*</span>
                            </label>
                            <button
                                onClick={handleSelectAllDevices}
                                className="text-xs text-green hover:text-gray2 transition-colors"
                            >
                                {selectedDevices.length === devices.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <p className="text-gray1 text-xs mb-3">
                            Select the devices this token will have access to
                        </p>

                        {devices.length === 0 ? (
                            <div className="text-gray1 text-sm text-center py-4 bg-black2 rounded-lg">
                                No devices found for this project
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {devices.map((device) => (
                                    <label
                                        key={device.device_id}
                                        className="flex items-center p-3 bg-black2 rounded-lg cursor-pointer hover:bg-gray3 transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedDevices.includes(device.device_id)}
                                            onChange={() => handleDeviceToggle(device.device_id)}
                                            className="w-4 h-4 accent-green mr-3"
                                        />
                                        <div className="flex-1">
                                            <span className="text-gray2 text-sm font-medium">{device.device_name}</span>
                                            {device.description && (
                                                <p className="text-gray1 text-xs mt-0.5">{device.description}</p>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                        <p className="text-gray1 text-xs mt-2">
                            {selectedDevices.length} of {devices.length} devices selected
                        </p>
                    </div>

                    {/* Domain Sites */}
                    <div className="flex flex-col mb-6">
                        <label className="text-sm text-gray2 font-semibold mb-1">
                            Domain Sites <span className="text-red">*</span>
                        </label>
                        <p className="text-gray1 text-xs mb-3">
                            Add the domain sites that are allowed to use this token
                        </p>

                        <div className="space-y-2">
                            {domainSites.map((site, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={site}
                                        onChange={(e) => handleSiteChange(index, e.target.value)}
                                        placeholder="e.g., example.com"
                                        className="flex-1 bg-black3 text-sm border border-gray2 border-opacity-30 rounded-full px-4 py-1 text-gray2 focus:outline-none focus:border-green"
                                    />
                                    {domainSites.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveSite(index)}
                                            className="text-red hover:text-gray2 transition-colors p-2"
                                            title="Remove site"
                                        >
                                            <FaTimes className="text-sm" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAddSite}
                            className="flex items-center text-green hover:text-gray2 transition-colors mt-3 text-sm"
                        >
                            <FaPlus className="mr-2" />
                            Add another site
                        </button>

                        <p className="text-gray1 text-xs mt-2">
                            {domainSites.filter(site => site.trim() !== '').length} site(s) added
                        </p>
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
