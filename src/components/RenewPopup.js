
import { FaCalendarAlt } from "react-icons/fa";
import PopupContainer from "./PopupContainer";
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
    return (
        <PopupContainer
            isOpen={show}
            onClose={onClose}
            closeFunction={onClose}
            Icon={FaCalendarAlt}
            title="Extend Expiration Date"
            closeIconVisible={true}
            width="450px"
        >
            <div className="flex flex-col mt-4 space-y-4">
                <div className="flex flex-col">
                    <label className="text-gray2 text-sm">Expiration</label>
                    <SelectBox value={renewDuration} onChange={e => setRenewDuration(Number(e.target.value))} width="w-full" mt="mt-0">
                        {expirationOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label} ({getExpirationDate(option.value)})
                            </option>
                        ))}
                    </SelectBox>
                    <p className="text-gray1 text-xs mt-1">The token will expire on the selected date</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center mt-6 space-x-0 sm:space-x-4 space-y-4 sm:space-y-0">
                <PillButton
                    text="Update & Save"
                    onClick={onRenew}
                    isPopup={true}
                    disabled={loading}
                />
            </div>
        </PopupContainer>
    );
};

export default RenewPopup;
