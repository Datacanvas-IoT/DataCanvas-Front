import React, { useState } from 'react';
import { FaKey } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NonSidebarLayout from '../components/layouts/NonSidebarLayout';
import TextBox from '../components/input/TextBox';
import PillButton from '../components/input/PillButton';

const AccessTokenGeneration = () => {
    const [tokenName, setTokenName] = useState('');
    const [description, setDescription] = useState('');

    const handleTokenNameChange = (e) => {
        setTokenName(e.target.value);
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };

    const handleGenerateToken = () => {
        if (!tokenName.trim()) {
            toast.error('Token name is required');
            return;
        }
        // TODO: Implement token generation logic
        toast.success('Token generated successfully!');
    };

    return (
        <NonSidebarLayout breadcrumb="Access Token Generation">
            <div className="text-white mb-20 px-0 sm:px-12 lg:px-12 xl:px-32">
                <div className="flex flex-col justify-center mx-1 sm:mx-4 lg:mx-40 my-4 bg-black3 px-4 md:px-20 py-8 rounded-xl">
                    <h1 className="text-2xl font-semibold text-green mb-2">New fine-grained personal access token</h1>
                    <p className="text-gray2 text-sm mb-6">
                        Create a fine-grained, repository-scoped token suitable for personal API use and for using Git over HTTPS.
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

                    {/* Generate Button */}
                    <div className="flex justify-start mt-4">
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
        </NonSidebarLayout>
    );
};

export default AccessTokenGeneration;
