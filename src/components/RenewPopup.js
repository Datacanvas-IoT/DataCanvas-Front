import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import PillButton from "./input/PillButton";
import SelectBox from "./input/SelectBox";

const RenewPopup = ({
    show,
    onClose,
    onRenew,
    renewDuration,
    setRenewDuration,
    expirationOptions,
    getExpirationDate,
    loading,
}) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-black2 rounded-xl p-6 w-full max-w-md shadow-lg relative">
                <div className="flex items-center mb-4">
                    <FaCalendarAlt className="text-green mr-2" />
                    <span className="text-green font-semibold text-lg">Extend Expiration Date</span>
                </div>
                <div className="mb-4">
                    <label className="block text-gray2 text-sm mb-1">Expiration</label>
                    <SelectBox value={renewDuration} onChange={e => setRenewDuration(Number(e.target.value))} width="w-full" mt="mt-0">
                        {expirationOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label} ({getExpirationDate(option.value)})
                            </option>
                        ))}
                    </SelectBox>
                    <p className="text-gray1 text-xs mt-1">The token will expire on the selected date</p>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        className="absolute top-3 right-3 text-gray2 hover:text-green text-xl focus:outline-none"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>
                    <PillButton
                        text="Update & Save"
                        onClick={onRenew}
                        isPopup={true}
                        disabled={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default RenewPopup;
