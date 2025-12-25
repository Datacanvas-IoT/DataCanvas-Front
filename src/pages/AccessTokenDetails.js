import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SidebarLayout from '../components/layouts/SidebarLayout';
import PillButton from '../components/input/PillButton';
import TextBox from '../components/input/TextBox';
import InsightCard from '../components/cards/InsightCard';
import SelectBox from '../components/input/SelectBox';
import RectangularRowCard from '../components/cards/RectangularCard';
import Spinner from '../components/Spinner';
import DeleteConfirmationPopup from '../components/DeleteConfirmationPopup';
import accessTokenService from '../services/accessTokenService';
import { FaTrash, FaCheck, FaCog } from 'react-icons/fa';

const GreenTrashIcon = (props) => {
    const { className, ...rest } = props;
    const cls = className ? className + ' text-green text-sm' : 'text-green text-sm';
    return <FaTrash {...rest} className={cls} />;
};

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
    const [devicesSelectVal, setDevicesSelectVal] = useState('');
    const [domainsSelectVal, setDomainsSelectVal] = useState('');
    const [showAllDevices, setShowAllDevices] = useState(false);
    const [showAllDomains, setShowAllDomains] = useState(false);

    const [origTokenName, setOrigTokenName] = useState('');
    const [origExpirationDate, setOrigExpirationDate] = useState(null);
    const [origSelectedDevices, setOrigSelectedDevices] = useState([]);
    const [origDomainSites, setOrigDomainSites] = useState(['']);

    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

    useEffect(() => {
        try {
            const storedProjectId = localStorage.getItem('project_id');
                if (storedProjectId) {
                    setProjectID(parseInt(storedProjectId));
                } else {
                    navigate('/projects');
                    return;
                }

            const fromState = state?.access_key_id;
            const parsedParam = paramAccessKeyId ? parseInt(paramAccessKeyId) : null;
            setAccessKeyId(fromState ?? parsedParam ?? null);
        } catch (err) {
            console.log(err);
            navigate('/login');
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            if (!accessKeyId || projectID === -1) return;
            setLoading(true);
            try {

                const res = await accessTokenService.getAccessKeyById(accessKeyId);
                const data = res.data;

                const name = data.access_key_name ?? '';
                const exp = data.expiration_date ?? null;
                const lastUse = data.access_key_last_use_time ?? null;
                const isExp = Boolean(data.is_expired);
                const devs = Array.isArray(data.device_ids) ? data.device_ids : [];
                const domainsArr = (
                    Array.isArray(data.access_key_domain_names) && data.access_key_domain_names.length > 0
                        ? data.access_key_domain_names
                    : ['']
                );

                setTokenName(name);
                setExpirationDate(exp);
                setLastUseTime(lastUse);
                setIsExpired(isExp);
                setSelectedDevices(devs);
                setDomainSites(domainsArr);

                setOrigTokenName(name);
                setOrigExpirationDate(exp);
                setOrigSelectedDevices(devs);
                setOrigDomainSites(domainsArr);

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
                        navigate('/accesstoken', { state: { project_id: projectID } });
                        break;
                    default:
                        toast.error(msg || 'Failed to load access key details');
                        navigate('/accesstoken', { state: { project_id: projectID } });
                        break;
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [accessKeyId, projectID, navigate]);


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

    const handleRemoveDevice = (deviceId) => {
        setSelectedDevices((prev) => prev.filter((id) => id !== deviceId));
    };

    const handleDevicesDropdownChange = (e) => {
        const val = e.target.value;
        if (val === 'all') {
            setShowAllDevices(true);
        } else {
            setShowAllDevices(false);
        }
        setDevicesSelectVal('');
    };

    const handleDomainsDropdownChange = (e) => {
        const val = e.target.value;
        if (val === 'all') {
            setShowAllDomains(true);
        } else {
            setShowAllDomains(false);
        }
        setDomainsSelectVal('');
    };

    const handleCancel = () => {
        setTokenName(origTokenName);
        setExpirationDate(origExpirationDate);
        setSelectedDevices(origSelectedDevices);
        setDomainSites(origDomainSites);
        setShowAllDevices(false);
        setShowAllDomains(false);
        toast.info('Changes reverted');
    };

    const handleDeleteClick = () => {
        setIsDeletePopupOpen(true);
    };

    const handleCloseDeletePopup = () => {
        setIsDeletePopupOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!accessKeyId) return;
        setIsDeletePopupOpen(false);
        setLoading(true);
        try {
            const response = await accessTokenService.deleteAccessKey(accessKeyId);
            if (response.status === 200) {
                toast.success('Token deleted successfully');
                navigate('/accesstoken', { state: { project_id: projectID } });
            }
        } catch (err) {
            toast.error('Failed to delete token');
        } finally {
            setLoading(false);
        }
    };

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
                                disabled
                            />
                        </div>
                        </div>

                    <div className="lg:col-span-1 flex flex-col items-stretch -mt-2">
                        <div className="w-full">
                            <InsightCard
                                title={isExpired ? 'Expired' : 'Active'}
                                subtitle="Current status of Token"
                                icon={FaCheck}
                                textSize="lg"
                                variant={isExpired ? 'danger' : 'default'}
                            />
                        </div>

                        {isExpired && (
                            <div className="mt-3 w-full mx-12">
                                <PillButton
                                    text="Extend Expiration Date"
                                    onClick={() => toast.info('Extend expiration flow will be added')}
                                    icon={FaCog}
                                />
                            </div>
                        )}

                        <div className="mt-3 w-full mx-12">
                            <PillButton
                                text="Delete Access Token"
                                onClick={handleDeleteClick}
                                color="red"
                                icon={FaTrash}
                            />
                        </div>
                    </div>

                    <div className="col-span-1 lg:col-span-3">
                        <div className="border-t border-gray1 border-opacity-80 w-full mt-2"></div>
                    </div>


                    <div className="col-span-1 lg:col-span-3 my-4">
                        <div className="text-gray2 text-base font-semibold mx-2 mb-4">Critical Settings</div>

                        <div className="mx-4 mb-6 ">
                            <div className="text-md text-gray2 font-semibold mb-2">Devices</div>
                            <div className="space-y-5">
                                {(() => {
                                    const selectedList = devices.filter(d => selectedDevices.includes(d.device_id));
                                    const visible = showAllDevices ? selectedList : selectedList.slice(0, 2);
                                    if (visible.length === 0) {
                                        return (
                                            <div className="text-gray1 text-sm py-3">No devices selected</div>
                                        );
                                    }
                                    return visible.map((d) => (
                                        <RectangularRowCard
                                            key={d.device_id}
                                            title={d.device_name}
                                            icon={GreenTrashIcon}
                                            onClick={() => handleRemoveDevice(d.device_id)}
                                        />
                                    ));
                                })()}
                            </div>
                            <div className="flex justify-center my-3">
                                <SelectBox
                                    value={devicesSelectVal}
                                    onChange={handleDevicesDropdownChange}
                                    width="w-44"
                                    mt="mt-0"
                                >
                                    <option value="all">All Devices</option>
                                </SelectBox>
                            </div>
                        </div>


                        <div className="mx-4 mb-10">
                            <div className="text-md text-gray2 font-semibold mb-2">Domains</div>
                            <div className="space-y-2">
                                {(() => {
                                    const validSites = domainSites.filter(s => (s || '').trim() !== '');
                                    const visibleSites = showAllDomains ? validSites : validSites.slice(0, 2);
                                    if (visibleSites.length === 0) {
                                        return (
                                            <div className="text-gray1 text-sm py-3">No domains added</div>
                                        );
                                    }
                                    return visibleSites.map((s, idx) => (
                                        <RectangularRowCard
                                            key={`${s}-${idx}`}
                                            title={s}
                                            icon={GreenTrashIcon}
                                            onClick={() => {
                                                const indexInFull = domainSites.findIndex(x => x === s);
                                                if (indexInFull !== -1) handleRemoveSite(indexInFull);
                                            }}
                                        />
                                    ));
                                })()}
                            </div>
                            <div className="flex justify-center my-3">
                                <SelectBox
                                    value={domainsSelectVal}
                                    onChange={handleDomainsDropdownChange}
                                    width="w-44"
                                    mt="mt-0"
                                >
                                    <option value="all">All Domains</option>
                                </SelectBox>
                            </div>
                        </div>


                        <div className="flex items-center justify-between mx-4 mt-10">
                            <PillButton text="Cancel" onClick={handleCancel} />
                            <PillButton text="Update & Save" onClick={() => toast.info('Update route will be added by backend')} />
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer position="bottom-center" theme="dark" />
            <Spinner isVisible={loading} />

            {/* Delete Confirmation Popup */}
            <DeleteConfirmationPopup
                isOpen={isDeletePopupOpen}
                onClose={handleCloseDeletePopup}
                onConfirm={handleConfirmDelete}
                title="Delete Access Token"
                itemName={tokenName || 'this token'}
                warningMessage="This action cannot be undone. Any applications using this token will lose access."
            />
        </SidebarLayout>
    );
};

export default AccessTokenDetails;


