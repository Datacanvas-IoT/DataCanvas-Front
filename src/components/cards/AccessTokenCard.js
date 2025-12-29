import React from 'react';
import { FaTrash, FaPencilAlt } from 'react-icons/fa';

const AccessTokenCard = ({ token, onEdit, onDelete }) => {
  return (
    <div
      className={`w-full bg-black3 rounded-lg my-1 sm:my-1 cursor-pointer text-gray2
            border border-gray1 border-opacity-60 relative 
            transition duration-300 hover:border-green hover:border-opacity-50 hover:text-green overflow-hidden`}
      onClick={() => onEdit(token)}
    >
      <div className="w-full h-full py-3 pl-6 pr-4 flex flex-row justify-between items-center">
        <div className="flex flex-row justify-start items-center">
          <div className="text-md text-gray2 w-48 sm:w-64 md:w-80 mr-6 sm:mr-10">
            <div className="flex flex-col justify-between items-start">
              <div className="text-gray1 text-xs font-sm overflow-hidden">
                Token Name:
              </div>
              <div className="text-gray2 text-sm truncate w-full">
                {token.access_key_name}
              </div>
            </div>
          </div>

          <div className="text-md text-gray2 w-28 hidden sm:block">
            <div className="flex flex-col justify-between items-start">
              <div className="text-gray1 text-xs font-sm overflow-hidden">
                Valid till:
              </div>
              <div className="text-gray2 text-sm">{token.expiration_date}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row justify-end items-center space-x-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(token);
            }}
            className="flex items-center space-x-2 text-green hover:text-gray2 transition-all duration-300 px-3 py-1"
            title="Edit token"
          >
            <FaPencilAlt className="text-sm" />
            <span className="text-sm hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(token.access_key_id);
            }}
            className="flex items-center space-x-2 text-red hover:text-gray2 transition-all duration-300 px-3 py-1"
            title="Delete token"
          >
            <FaTrash className="text-sm" />
            <span className="text-sm hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessTokenCard;
