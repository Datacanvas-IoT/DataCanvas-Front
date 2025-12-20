import React, { useState, useEffect } from 'react';
import { FaPlusCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import SidebarLayout from '../components/layouts/SidebarLayout';
import PillButton from '../components/input/PillButton';
import Spinner from '../components/Spinner';
import AccessTokenCard from '../components/cards/AccessTokenCard';
import accessTokenService from '../services/accessTokenService';

const AccessToken = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [loading, setLoading] = useState(false);
    const [projectID, setProjectID] = useState(-1);

    // Access tokens list
    const [accessTokens, setAccessTokens] = useState([]);

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

    // Load access tokens when projectID changes
    useEffect(() => {
        if (projectID !== -1) {
            loadAccessTokens();
        }
    }, [projectID]);

    // API call for getting access tokens of the project
    const loadAccessTokens = async () => {
        setLoading(true);

        try {
            const result = await accessTokenService.getAccessKeysByProjectId(projectID);

            if (result.status === 200 && result.data?.success) {
                setAccessTokens(result.data.access_keys);
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
                    // No tokens found
                    setAccessTokens([]);
                    break;
                default:
                    // toast.error("Something Went Wrong!");
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateNewToken = () => {
        navigate('/generatenewtoken', { state: { project_id: projectID } });
    };

    const handleEditToken = (token) => {
        // TODO: Implement edit functionality
        console.log('Edit token:', token);
    };

    const handleDeleteToken = async (accessKeyId) => {
        setLoading(true);

        try {
            const response = await accessTokenService.deleteAccessKey(accessKeyId);

            if (response.status === 200) {
                toast.success('Token deleted successfully!');
                loadAccessTokens();
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
                case 404:
                    toast.error("Token not found!");
                    break;
                default:
                    toast.error("Something went wrong!");
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SidebarLayout active={6} breadcrumb={`${localStorage.getItem('project')} > Access Tokens`}>
            {/* Header with Add Button */}
            <div className="flex flex-row justify-end px-7 sm:px-10 mt-6 sm:mt-2">
                {accessTokens.length > 0 && (
                    <PillButton
                        text="Generate New Token"
                        icon={FaPlusCircle}
                        onClick={handleGenerateNewToken}
                    />
                )}
            </div>

            {/* Access Tokens List */}
            <div className="px-7 sm:px-10 mt-6 mb-28">
                {accessTokens.length === 0 ? (
                    <div className="w-full flex flex-col justify-center items-center">
                        <div className="text-gray2 text-sm">No access tokens found</div>
                        <div className="flex flex-row justify-center items-center mt-4">
                            <PillButton text="Generate Your First Token" icon={FaPlusCircle} onClick={handleGenerateNewToken} />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {accessTokens.map((token, index) => {
                            if (!token.access_key_id) {
                                console.warn('AccessToken: Missing access_key_id for token at index', index, token);
                            }
                            return (
                                <AccessTokenCard
                                    key={token.access_key_id || index}
                                    token={token}
                                    onEdit={handleEditToken}
                                    onDelete={handleDeleteToken}
                                />
                            );
                        })}
                    </div>
                )}
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

export default AccessToken;
