import React from 'react';
import { FaTrash, FaPencilAlt } from 'react-icons/fa';

const AccessTokenCard = ({ token, onEdit, onDelete }) => {
    return (
        <div className="bg-black3 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex-1">
                <h3 className="text-green font-semibold text-lg">{token.access_key_name}</h3>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <button
                    onClick={() => onEdit(token)}
                    className="text-green hover:text-gray2 transition-colors p-2"
                    title="Edit token"
                >
                    <FaPencilAlt className="text-lg" />
                </button>
                <button
                    onClick={() => onDelete(token.access_key_id)}
                    className="text-red hover:text-gray2 transition-colors p-2"
                    title="Delete token"
                >
                    <FaTrash className="text-lg" />
                </button>
            </div>
        </div>
    );
};

export default AccessTokenCard;
