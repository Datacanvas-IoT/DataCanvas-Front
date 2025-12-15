import React from "react";
import { FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ConfigTableCard = ({ columnName, dataType, defaultValue, isAutoIncrement, isNullAllowed, isUnique, onClick, onEdit, onDelete, disabled }) => {
    return (
        <div className={
            `w-full bg-black3 rounded-lg my-1 sm:my-1 cursor-pointer text-gray2
        border border-gray1 border-opacity-60 relative 
        transition duration-300 hover:border-green hover:border-opacity-50 hover:text-green overflow-hidden`
        }
            onClick={(disabled) ? () => { toast.warning('This is a system defined field. You are not allowed to edit this') } : onClick}>
            <div className="w-full h-full py-2 pl-6 pr-4 flex flex-row justify-between items-center">

                <div className={`flex flex-row justify-start items-center space-x-20`}>

                    {/* Field Name Section */}
                    <div className="text-md w-28 text-gray2 max-w-full truncate mr-3 ">
                        <div className="flex flex-col justify-between items-start">
                            <div className="text-gray1 text-xs font-sm overflow-hidden hidden sm:block">
                                Field Name
                            </div>
                            <div className="text-gray2 text-sm">
                                {columnName}
                            </div>
                        </div>
                    </div>

                    {/* Data Type Section */}
                    <div className="text-md w-20 text-gray2 max-w-full truncate mr-3  hidden sm:block ">
                        <div className="flex flex-col justify-between items-start">
                            <div className="text-gray1 text-xs font-sm overflow-hidden hidden sm:block">
                                Data Type
                            </div>
                            <div className="text-gray2 text-sm">
                                {dataType}
                            </div>
                        </div>
                    </div>

                    {/* Default Value Section */}
                    <div className="text-md w-20 text-gray2 max-w-full truncate mr-3 hidden md:block  ">
                        <div className="flex flex-col justify-between items-start">
                            <div className="text-gray1 text-xs font-sm overflow-hidden hidden sm:block">
                                Default Value
                            </div>
                            <div className="text-gray2 text-sm">
                                {defaultValue}
                            </div>
                        </div>
                    </div>

                    {/* Auto Increment Section - In second row, there should be a checkbox with the caption Auto Increment */}
                    <div className="text-md text-gray2 max-w-full truncate mr-3 hidden xl:block ">
                        <div className={`flex items-center`}>
                            <input
                                type="checkbox"
                                checked={isAutoIncrement}
                                onChange={() => { }}
                                className="h-4 w-4 accent-green hover:accent-gray2 transition-all duration-300"
                            />
                            <span className="text-gray2 ml-2 text-sm">Auto Increment</span>
                        </div>
                    </div>


                    {/* Not Null Section - In second row, there should be a checkbox with the caption Not Null */}
                    <div className="text-md text-gray2 max-w-full truncate mr-3 hidden xl:block  ">
                        <div className={`flex items-center`}>
                            <input
                                type="checkbox"
                                checked={isNullAllowed}
                                onChange={() => { }}
                                className="h-4 w-4 accent-green hover:accent-gray2 transition-all duration-300"
                            />
                            <span className="text-gray2 ml-2 text-sm">Not Null</span>
                        </div>
                    </div>

                    {/* Unique Section - In second row, there should be a checkbox with the caption Unique */}
                    <div className="text-md text-gray2 max-w-full truncate mr-3 hidden xl:block">
                        <div className={`flex items-center`}>
                            <input
                                type="checkbox"
                                checked={isUnique}
                                onChange={() => { }}
                                className="h-4 w-4 accent-green hover:accent-gray2 transition-all duration-300"
                            />
                            <span className="text-gray2 ml-2 text-sm">Unique</span>
                        </div>
                    </div>
                </div>

                {disabled ? (
                    <div className="px-3 bg-green bg-opacity-20 border border-green border-opacity-40 rounded-full">
                        <span className="text-white text-xs font-medium">System Column</span>
                    </div>
                ) : (
                    <div className={`flex flex-row justify-start items-center space-x-12`}>
                        <div className={`flex flex-row justify-between items-center space-x-2 cursor-pointer text-red transition-all duration-300 hover:text-gray2`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete()
                            }}>
                            <FaTrash className="text-lg" />
                        </div>
                    </div>
                )}

            </div>

            <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
        </div>
    );
}

// Default Props
ConfigTableCard.defaultProps = {
    onClick: () => { },
    onEdit: () => { },
    onDelete: () => { },
    disabled: false
}

export default ConfigTableCard;