import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

const DomainSitesInput = ({ domainSites, onSiteChange, onAddSite, onRemoveSite }) => {
    const validSitesCount = domainSites.filter(site => site.trim() !== '').length;

    return (
        <div className="flex flex-col mb-6">
            <label className="text-sm text-gray2 font-semibold mb-1">
                Domain Sites <span className="text-red">*</span>
            </label>
            <p className="text-gray1 text-xs mb-3">
                Add the domain sites that are allowed to use this token
            </p>

            <div className="space-y-2">
                {domainSites.map((site, index) => (
                    <div
                        key={index}
                        className="group w-full bg-black3 rounded-lg my-1 border border-gray1 border-opacity-60 relative overflow-hidden transition duration-300 hover:border-green hover:border-opacity-50 hover:text-green"
                    >
                        <div className="w-full h-full py-1 pl-6 pr-4 flex items-center justify-between gap-3">
                            <input
                                type="text"
                                value={site}
                                onChange={(e) => onSiteChange(index, e.target.value)}
                                placeholder="e.g., example.com"
                                className="flex-1 bg-transparent text-sm text-gray2 placeholder:text-gray1 focus:outline-none border-none"
                            />
                            {domainSites.length > 1 && (
                                <button
                                    onClick={() => onRemoveSite(index)}
                                    className="flex items-center gap-1 text-gray1 group-hover:text-green transition-colors"
                                    title="Remove site"
                                >
                                    <span className="text-sm">Remove</span>
                                    <FaTrash className="text-sm text-green" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={onAddSite}
                className="flex items-center text-green hover:text-gray2 transition-colors mt-3 text-sm"
            >
                <FaPlus className="mr-2" />
                Add another site
            </button>

            <p className="text-gray1 text-xs mt-2">
                {validSitesCount} site(s) added
            </p>
        </div>
    );
};

export default DomainSitesInput;
