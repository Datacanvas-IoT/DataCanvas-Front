import React from 'react';
import PopupContainer from './PopupContainer';
import PillButton from './input/PillButton';
import { FaKey, FaCheck } from 'react-icons/fa';

const TokenGeneratedPopup = ({
    isOpen,
    onClose,
    clientAccessKey,
    secretAccessKey,
}) => {
    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            closeFunction={onClose}
            Icon={FaKey}
            title="Token Generated Successfully"
            closeIconVisible={true}
        >
            <div className="flex flex-col justify-center items-center mt-3">
                <label className="text-gray1 text-sm">Client Access Key</label>
                <input
                    type="text"
                    value={clientAccessKey}
                    className="w-full bg-black3 border border-gray2 border-opacity-30 rounded-full text-center px-4 py-1 mt-2 text-gray2"
                    readOnly
                />
                <label className="text-gray1 text-sm mt-4">Secret Access Key</label>
                <input
                    type="text"
                    value={secretAccessKey}
                    className="w-full bg-black3 border border-gray2 border-opacity-30 rounded-full text-center px-4 py-1 mt-2 text-gray2"
                    readOnly
                />
                <span className="text-gray2 text-xs text-center mt-2 mb-2">
                    Use the hashed version of these access keys in every request coming from the provided sites.
                </span>
            </div>
            <div className="flex flex-col items-center justify-center mt-4">
                <PillButton
                    text="Done"
                    onClick={onClose}
                    isPopup={true}
                    icon={FaCheck}
                />
            </div>
        </PopupContainer>
    );
};

export default TokenGeneratedPopup;
