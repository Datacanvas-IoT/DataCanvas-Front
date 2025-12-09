import React from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';

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
                    <div key={index} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={site}
                            onChange={(e) => onSiteChange(index, e.target.value)}
                            placeholder="e.g., example.com"
                            className="flex-1 bg-black3 text-sm border border-gray2 border-opacity-30 rounded-full px-4 py-1 text-gray2 focus:outline-none focus:border-green"
                        />
                        {domainSites.length > 1 && (
                            <button
                                onClick={() => onRemoveSite(index)}
                                className="text-red hover:text-gray2 transition-colors p-2"
                                title="Remove site"
                            >
                                <FaTimes className="text-sm" />
                            </button>
                        )}
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
