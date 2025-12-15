import React, { useState, useEffect } from "react";
import { FaFilter, FaSave, FaUndo } from "react-icons/fa";
import PopupContainer from "./PopupContainer";
import SelectBox from "./input/SelectBox";
import PillButton from "./input/PillButton";

function FilterPopup({ isOpen, closeFunction, currentOrder, onApplyFilters }) {
    const [order, setOrder] = useState(currentOrder || 'DESC');

    useEffect(() => {
        setOrder(currentOrder);
    }, [currentOrder]);

    const handleApply = () => {
        onApplyFilters({ order });
        closeFunction();
    };

    const handleReset = () => {
        setOrder('DESC');
        onApplyFilters({ order: 'DESC' });
        closeFunction();
    };

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={() => { }}
            closeFunction={closeFunction}
            Icon={FaFilter}
            title="Filter Data"
            closeIconVisible={true}
            width="450px"
        >
            <div className="flex flex-col mt-4 space-y-4">
                <div className="flex flex-col">
                    <label className="text-gray2 text-sm">Sort Order</label>
                    <SelectBox
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                    >
                        <option value="DESC">Descending (Newest First)</option>
                        <option value="ASC">Ascending (Oldest First)</option>
                    </SelectBox>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center mt-6 space-x-0 sm:space-x-4 space-y-4 sm:space-y-0">
                <PillButton 
                    text="Reset" 
                    onClick={handleReset} 
                    icon={FaUndo}
                    isPopup={true} 
                />
                <PillButton 
                    text="Apply Filters" 
                    onClick={handleApply} 
                    icon={FaSave} 
                    isPopup={true} 
                />
            </div>
        </PopupContainer>
    );
}

export default FilterPopup;
