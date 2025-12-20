import React from "react";
import { FaTrash, FaWindowClose } from "react-icons/fa";
import PopupContainer from "./PopupContainer";
import PillButton from "./input/PillButton";

const DeleteConfirmationPopup = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Confirmation",
    itemName = "this item",
    warningMessage = "This action cannot be undone."
}) => {
    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={() => {}}
            closeFunction={onClose}
            Icon={FaTrash}
            title={title}
            closeIconVisible={true}
            width={'550px'}
        >
            <div className="text-center mt-4 px-4 text-gray2 text-md">
                Are you sure you want to delete <span className="text-green font-semibold">{itemName}</span>?
            </div>
            <div className="text-center mt-4 px-4 text-red text-sm">
                {warningMessage}
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center mt-6 space-x-0 sm:space-x-4 space-y-4 sm:space-y-0">
                <PillButton 
                    text={'No, Cancel'} 
                    onClick={onClose} 
                    icon={FaWindowClose} 
                    isPopup={true} 
                />
                <PillButton 
                    text={'Yes, Delete'} 
                    onClick={onConfirm} 
                    icon={FaTrash} 
                    isPopup={true} 
                    color={'red'} 
                />
            </div>
        </PopupContainer>
    );
};

export default DeleteConfirmationPopup;
