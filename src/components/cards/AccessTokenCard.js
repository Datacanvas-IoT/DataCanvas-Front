import React from 'react';
import { FaTrash, FaPencilAlt } from 'react-icons/fa';

const AccessTokenCard = ({ token, onEdit, onDelete }) => {
    // Format expiration date
    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString();
    };

    // Check if token is expired
    const isExpired = token.expiration_date && new Date(token.expiration_date) < new Date();

    // Get device names from the devices array
    const deviceNames = token.devices?.map(d => d.device?.device_name).filter(Boolean).join(', ');

    // Get domain names from the domains array
    const domainNames = token.domains?.map(d => d.access_key_domain_name).filter(Boolean);

    return (
        <div className={`bg-black3 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between ${isExpired ? 'opacity-60' : ''}`}>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-green font-semibold text-lg">{token.access_key_name}</h3>
                    {isExpired && (
                        <span className="text-xs bg-red text-white px-2 py-0.5 rounded-full">
                            Expired
                        </span>
                    )}
                </div>

                {/* Devices */}
                {deviceNames && (
                    <p className="text-gray2 text-sm mt-1">
                        <span className="text-gray1">Devices:</span> {deviceNames}
                    </p>
                )}

                {/* Domains */}
                {domainNames && domainNames.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {domainNames.map((domain, index) => (
                            <code key={index} className="text-gray1 text-xs bg-black2 px-2 py-0.5 rounded-full">
                                {domain}
                            </code>
                        ))}
                    </div>
                )}

                {/* Dates */}
                <div className="flex flex-wrap gap-4 mt-2">
                    {token.created_at && (
                        <p className="text-gray1 text-xs">
                            Created: {formatDate(token.created_at)}
                        </p>
                    )}
                    {token.expiration_date && (
                        <p className={`text-xs ${isExpired ? 'text-red' : 'text-gray1'}`}>
                            {isExpired ? 'Expired:' : 'Expires:'} {formatDate(token.expiration_date)}
                        </p>
                    )}
                    {token.access_key_last_use_time && (
                        <p className="text-gray1 text-xs">
                            Last used: {formatDate(token.access_key_last_use_time)}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                {!isExpired && (
                    <button
                        onClick={() => onEdit(token)}
                        className="text-green hover:text-gray2 transition-colors p-2"
                        title="Edit token"
                    >
                        <FaPencilAlt className="text-lg" />
                    </button>
                )}
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
