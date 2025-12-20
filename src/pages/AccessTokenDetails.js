import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import SidebarLayout from '../components/layouts/SidebarLayout';
import PillButton from '../components/input/PillButton';
import DeviceSelection from '../components/input/DeviceSelection';
import DomainSitesInput from '../components/input/DomainSitesInput';
import Spinner from '../components/Spinner';
import accessTokenService from '../services/accessTokenService';

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

    return (
        <SidebarLayout active={6} breadcrumb={`${localStorage.getItem('project')} > Access Tokens > Settings`}>
            <div className="px-7 sm:px-10 mt-6 mb-28">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-green">Token Settings</h1>
                        <p className="text-gray1 text-sm">General Settings </p>
                        <p className="text-gray1 text-xs mt-1">
                            Status: {isExpired ? 'Expired' : 'Active'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <PillButton text="Delete Access Token" onClick={handleDeleteToken} />
                    </div>
                </div>

                <div className="max-w-2xl">
                    {/* General Settings */}
                    <div className="mb-6">
                        <label className="text-sm text-gray2 font-semibold mb-1 block">Token Name</label>
                        <input
                            type="text"
                            value={tokenName}
                            onChange={(e) => setTokenName(e.target.value)}
                            className="w-full bg-black3 text-sm border border-gray2 border-opacity-30 rounded-full px-4 py-1 text-gray2 focus:outline-none focus:border-green"
                        />
                        <div className="mt-3 text-gray1 text-xs">
                            Valid till: {expirationDate ? new Date(expirationDate).toLocaleDateString() : '—'}
                        </div>
                        <div className="mt-1 text-gray1 text-xs">
                            Last used: {lastUseTime ? new Date(lastUseTime).toLocaleString() : '—'}
                        </div>
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
            </div>

            <ToastContainer position="bottom-center" theme="dark" />
            <Spinner isVisible={loading} />
        </SidebarLayout>
    );
};

export default AccessTokenDetails;
