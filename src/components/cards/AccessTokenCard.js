import React from 'react';
import { FaCopy, FaTrash } from 'react-icons/fa';

const AccessTokenCard = ({ token, onCopy, onDelete }) => {
    return (
        <div className="bg-black3 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between">
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
                        onClick={() => onCopy(token.token_value)}
                        className="text-green hover:text-gray2 transition-colors p-2"
                        title="Copy token"
                    >
                        <FaCopy className="text-lg" />
                    </button>
                )}
                <button
                    onClick={() => onDelete(token.token_id)}
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
