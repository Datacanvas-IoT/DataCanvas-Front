import React, { useState, useEffect } from 'react';
import { FaKey, FaPlusCircle, FaCopy, FaTrash } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import SidebarLayout from '../components/layouts/SidebarLayout';
import PillButton from '../components/input/PillButton';
import Spinner from '../components/Spinner';

const AccessTokenGeneration = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [loading, setLoading] = useState(false);
    const [projectID, setProjectID] = useState(-1);
    const [projectName, setProjectName] = useState(localStorage.getItem('project'));

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
        const token = localStorage.getItem("auth-token");

        if (!token) {
            toast.error("Please login to continue!");
            navigate('/login');
            return;
        }

        setLoading(true);

        try {
            const result = await axios.get(
                `${process.env.REACT_APP_API_URL}/accesstoken?project_id=${projectID}`,
                {
                    headers: {
                        authorization: token,
                    },
                }
            );

            if (result.status === 200) {
                setAccessTokens(result.data);
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

    const handleCopyToken = async (token) => {
        try {
            await navigator.clipboard.writeText(token);
            toast.success('Token copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy token to clipboard');
        }
    };

    const handleDeleteToken = async (tokenId) => {
        setLoading(true);

        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_API_URL}/accesstoken/${tokenId}`,
                {
                    headers: {
                        authorization: localStorage.getItem("auth-token"),
                    },
                }
            );

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
                    <div className="space-y-4">
                        {accessTokens.map((token, index) => (
                            <div
                                key={token.token_id || index}
                                className="bg-black3 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between"
                            >
                                <div className="flex-1">
                                    <h3 className="text-green font-semibold text-lg">{token.token_name}</h3>
                                    {token.description && (
                                        <p className="text-gray2 text-sm mt-1">{token.description}</p>
                                    )}
                                    <div className="flex items-center mt-2">
                                        <code className="text-gray1 text-xs bg-black2 px-3 py-1 rounded-full truncate max-w-xs sm:max-w-md">
                                            {token.token_value ? `${token.token_value.substring(0, 20)}...` : '••••••••••••••••'}
                                        </code>
                                    </div>
                                    {token.created_at && (
                                        <p className="text-gray1 text-xs mt-2">
                                            Created: {new Date(token.created_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                                    {token.token_value && (
                                        <button
                                            onClick={() => handleCopyToken(token.token_value)}
                                            className="text-green hover:text-gray2 transition-colors p-2"
                                            title="Copy token"
                                        >
                                            <FaCopy className="text-lg" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteToken(token.token_id)}
                                        className="text-red hover:text-gray2 transition-colors p-2"
                                        title="Delete token"
                                    >
                                        <FaTrash className="text-lg" />
                                    </button>
                                </div>
                            </div>
                        ))}
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

export default AccessTokenGeneration;
