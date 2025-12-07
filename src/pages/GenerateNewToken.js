import React, { useState, useEffect } from 'react';
import { FaKey, FaArrowLeft } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import SidebarLayout from '../components/layouts/SidebarLayout';
import TextBox from '../components/input/TextBox';
import PillButton from '../components/input/PillButton';
import Spinner from '../components/Spinner';

const GenerateNewToken = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const [loading, setLoading] = useState(false);
    const [projectID, setProjectID] = useState(-1);
    const [projectName, setProjectName] = useState(localStorage.getItem('project'));

    // Form states
    const [tokenName, setTokenName] = useState('');
    const [description, setDescription] = useState('');

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

    const handleTokenNameChange = (e) => {
        setTokenName(e.target.value);
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };

    const handleGoBack = () => {
        navigate('/accesstoken', { state: { project_id: projectID } });
    };

    const handleGenerateToken = async () => {
        if (!tokenName.trim()) {
            toast.error('Token name is required');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/accesstoken`,
                {
                    token_name: tokenName,
                    description: description,
                    project_id: projectID,
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
                    <span className="text-lg font-semibold">{projectName}</span>
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

                    {/* Token Name */}
                    <div className="flex flex-col mb-4">
                        <label className="text-sm text-gray2 font-semibold mb-1">
                            Token name <span className="text-red">*</span>
                        </label>
                        <TextBox
                            type="text"
                            value={tokenName}
                            placeholder="Enter token name"
                            maxLength={100}
                            textAlign="left"
                            width="w-full"
                            mt="mt-1"
                            onChange={handleTokenNameChange}
                        />
                        <p className="text-gray1 text-xs mt-1">
                            A unique name for this token. May be visible to resource owners or users with possession of the token.
                        </p>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col mb-6">
                        <label className="text-sm text-gray2 font-semibold mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={handleDescriptionChange}
                            placeholder="Enter description (optional)"
                            maxLength={500}
                            rows={4}
                            className="w-full bg-black3 text-sm border border-gray2 border-opacity-30 rounded-lg px-4 py-2 mt-1 text-gray2 resize-none focus:outline-none focus:border-green"
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
