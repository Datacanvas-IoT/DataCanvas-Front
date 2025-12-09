import React from 'react';

const DeviceSelection = ({ devices, selectedDevices, onDeviceToggle, onSelectAll }) => {
    const allSelected = devices.length > 0 && selectedDevices.length === devices.length;

    return (
        <div className="flex flex-col mb-6">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-gray2 font-semibold">
                    Devices <span className="text-red">*</span>
                </label>
                <button
                    onClick={onSelectAll}
                    className="text-xs text-green hover:text-gray2 transition-colors"
                >
                    {allSelected ? 'Deselect All' : 'Select All'}
                </button>
            </div>
            <p className="text-gray1 text-xs mb-3">
                Select the devices this token will have access to
            </p>

            {devices.length === 0 ? (
                <div className="text-gray1 text-sm text-center py-4 bg-black3 rounded-lg">
                    No devices found for this project
                </div>
            ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {devices.map((device) => (
                        <label
                            key={device.device_id}
                            className="flex items-center p-3 bg-black3 rounded-lg cursor-pointer hover:bg-gray3 transition-colors border border-gray1 border-opacity-30"
                        >
                            <input
                                type="checkbox"
                                checked={selectedDevices.includes(device.device_id)}
                                onChange={() => onDeviceToggle(device.device_id)}
                                className="w-4 h-4 accent-green mr-3"
                            />
                            <div className="flex-1">
                                <span className="text-gray2 text-sm font-medium">{device.device_name}</span>
                                {device.description && (
                                    <p className="text-gray1 text-xs mt-0.5">{device.description}</p>
                                )}
                            </div>
                        </label>
                    ))}
                </div>
            )}
            <p className="text-gray1 text-xs mt-2">
                {selectedDevices.length} of {devices.length} devices selected
            </p>
        </div>
    );
};

export default DeviceSelection;
