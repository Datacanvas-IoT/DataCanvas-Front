import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import SidebarLayout from '../components/layouts/SidebarLayout';
import PillButton from '../components/input/PillButton';
import TextBox from '../components/input/TextBox';
import DeviceSelection from '../components/input/DeviceSelection';
import DomainSitesInput from '../components/input/DomainSitesInput';
import Spinner from '../components/Spinner';
import accessTokenService from '../services/accessTokenService';
import { FaTrash, FaCheck } from 'react-icons/fa';

const AccessTokenDetails = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { access_key_id: paramAccessKeyId } = useParams();

    const [loading, setLoading] = useState(false);
    const [projectID, setProjectID] = useState(-1);

    // Token states
    const [accessKeyId, setAccessKeyId] = useState(null);
    const [tokenName, setTokenName] = useState('');
    const [expirationDate, setExpirationDate] = useState(null);
    const [lastUseTime, setLastUseTime] = useState(null);
    const [isExpired, setIsExpired] = useState(false);

    // Device/domain states
    const [devices, setDevices] = useState([]);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [domainSites, setDomainSites] = useState(['']);

    // Initialize project and access key IDs
    useEffect(() => {
        try {
            const storedProjectId = localStorage.getItem('project_id');
            if (storedProjectId) setProjectID(parseInt(storedProjectId));

            const fromState = state?.access_key_id;
            const parsedParam = paramAccessKeyId ? parseInt(paramAccessKeyId) : null;
            setAccessKeyId(fromState ?? parsedParam ?? null);
        } catch (err) {
            console.log(err);
            navigate('/login');
        }
    }, []);

    // Load token details and project devices
    useEffect(() => {
        const load = async () => {
            if (!accessKeyId || projectID === -1) return;
            setLoading(true);
            try {
                // Fetch token details
                const res = await accessTokenService.getAccessKeyById(accessKeyId);
                const data = res.data;

                setTokenName(data.access_key_name ?? '');
                setExpirationDate(data.expiration_date ?? null);
                setLastUseTime(data.access_key_last_use_time ?? null);
                setIsExpired(Boolean(data.is_expired));
                setSelectedDevices(Array.isArray(data.device_ids) ? data.device_ids : []);
                setDomainSites(
                    Array.isArray(data.access_key_domain_names) && data.access_key_domain_names.length > 0
                        ? data.access_key_domain_names
                        : ['']
                );

                // Fetch devices in project for display
                const devRes = await accessTokenService.getDevicesByProjectId(projectID);
                setDevices(devRes.data || []);
            } catch (err) {
                const msg = err.response?.data?.message;
                switch (err.response?.status) {
                    case 401:
                        toast.error('Your Session Has Expired! Please Login Again!');
                        navigate('/login');
                        break;
                    case 403:
                        toast.error(msg || 'You Are Not Authorized!');
                        navigate('/login');
                        break;
                    case 404:
                        toast.error(msg || 'Access key not found');
                        break;
                    default:
                        toast.error(msg || 'Failed to load access key details');
                        break;
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [accessKeyId, projectID, navigate]);

    // Handlers reused from Generate page
    const handleDeviceToggle = (deviceId) => {
        setSelectedDevices((prev) =>
            prev.includes(deviceId) ? prev.filter((id) => id !== deviceId) : [...prev, deviceId]
        );
    };
    const handleSelectAllDevices = () => {
        if (selectedDevices.length === devices.length) {
            setSelectedDevices([]);
        } else {
            setSelectedDevices(devices.map((d) => d.device_id));
        }
    };
    const handleSiteChange = (index, value) => {
        const updated = [...domainSites];
        updated[index] = value;
        setDomainSites(updated);
    };
    const handleAddSite = () => {
        setDomainSites((prev) => [...prev, '']);
    };
    const handleRemoveSite = (index) => {
        setDomainSites((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDeleteToken = async () => {
        if (!accessKeyId) return;
        setLoading(true);
        try {
            const response = await accessTokenService.deleteAccessKey(accessKeyId);
            if (response.status === 200) {
                toast.success('Token deleted successfully');
                setTimeout(() => navigate('/accesstoken', { state: { project_id: projectID } }), 1200);
            }
        } catch (err) {
            toast.error('Failed to delete token');
        } finally {
            setLoading(false);
        }
    };

    // Helper for date input formatting
    const toInputDate = (d) => {
        try {
            const dt = new Date(d);
            if (Number.isNaN(dt.getTime())) return '';
            const yyyy = dt.getFullYear();
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const dd = String(dt.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        } catch { return ''; }
    };

    return (
        <SidebarLayout active={6} breadcrumb={`${localStorage.getItem('project')} > Access Tokens > Settings`}>
            <div className="px-7 sm:px-10 mt-6 mb-28">
                <h1 className="text-2xl font-semibold text-green mb-4">Token Settings</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    <div className="lg:col-span-2">
                        <div className="text-m text-gray2 font-semibold mx-2 mt-8">General Settings</div>


                        <div className='flex flex-row ml-8 mt-1 my-4'>
                            <div className='flex flex-col w-1/4 md:w-1/6'>
                                <div className="text-sm md:text-md text-gray1 font-semibold mt-2">Token Name</div>
                            </div>
                            <TextBox
                                value={tokenName}
                                onChange={(e) => setTokenName(e.target.value)}
                                type="text"
                                placeholder="Token name"
                                maxLength={50}
                                textAlign="left"
                                width="w-2/3 md:w-1/3"
                            />
                        </div>

            
                        <div className="flex flex-row ml-8 mt-4 my-4">
                            <div className="flex flex-col w-1/4 md:w-1/6">
                                <div className="text-sm md:text-md text-gray1 font-semibold mt-2">Expiration Date</div>
                            </div>
                            <TextBox
                                value={expirationDate ? toInputDate(expirationDate) : ''}
                                onChange={(e) => setExpirationDate(e.target.value)}
                                type="date"
                                placeholder="Select date"
                                textAlign="left"
                                width="w-2/3 md:w-1/4"
                            />
                        </div>

                        {/* Critical Settings: Devices */}
                        <DeviceSelection
                            devices={devices}
                            selectedDevices={selectedDevices}
                            onDeviceToggle={handleDeviceToggle}
                            onSelectAll={handleSelectAllDevices}
                        />

                        {/* Domains */}
                        <DomainSitesInput
                            domainSites={domainSites}
                            onSiteChange={handleSiteChange}
                            onAddSite={handleAddSite}
                            onRemoveSite={handleRemoveSite}
                        />

                        {/* Save - Backend update will be added later */}
                        <div className="flex justify-end">
                            <PillButton
                                text="Update & Save"
                                onClick={() => toast.info('Update route will be added by backend')}
                            />
                        </div>
                    </div>

                    {/* Right - Status card and delete */}
                    <div className="lg:col-span-1">
                        <div className="bg-black3 rounded-xl p-5 border border-gray1 border-opacity-20 flex items-start justify-between">
                            <div>
                                <div className={`text-3xl font-semibold ${isExpired ? 'text-red' : 'text-green'}`}>
                                    {isExpired ? 'Expired' : 'Active'}
                                </div>
                                <div className="text-gray1 text-sm mt-2">Current status of Token</div>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isExpired ? 'bg-red bg-opacity-20' : 'bg-green bg-opacity-20'}`}>
                                <FaCheck className={`${isExpired ? 'text-red' : 'text-green'}`} />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <PillButton
                                text="Delete Access Token"
                                onClick={handleDeleteToken}
                                color="red"
                                icon={FaTrash}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer position="bottom-center" theme="dark" />
            <Spinner isVisible={loading} />
        </SidebarLayout>
    );
};

export default AccessTokenDetails;


