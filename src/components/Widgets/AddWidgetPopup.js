import React, { useEffect, useState } from "react";
import { FaPlus, FaPencilAlt } from "react-icons/fa";
import PopupContainer from "../PopupContainer";
import PillButton from "../input/PillButton";
import TextBox from "../input/TextBox";
import SelectBox from "../input/SelectBox";
import 'react-toastify/dist/ReactToastify.css';

const AddWidgetPopup = ({
    isOpen,
    closeFunction,
    tables = [],
    widgetName, setWidgetName,
    widgetType, setWidgetType,
    dataset, setDataset,
    nextFunction,
    type = 0, // 0: Add Widget, 1: Edit Widget
    currentWidget = {} // Widget details if type is 1
}) => {
    const [widgetTypes, setWidgetTypes] = useState([
        { id: 1, name: 'Chart (Any)' },
        { id: 2, name: 'Table' },
        { id: 3, name: 'Toggle Switch' },
        { id: 4, name: 'Gauge' },
        { id: 5, name: 'Metric' }
    ]);

    useEffect(() => {
        if (currentWidget != null && type == 1) {
            setWidgetName(currentWidget.widget_name);
            setWidgetType(currentWidget.widget_type);
            setDataset(currentWidget.dataset);
        }
    }, [isOpen])

    return (
        <PopupContainer
            isOpen={isOpen}
            closeFunction={closeFunction}
            onClose={() => { }}
            title={type == 0 ? 'Add New Widget' : 'Edit Widget' + ' - ' + currentWidget.widget_name}
            Icon={type == 0 ? FaPlus : FaPencilAlt}
            closeIconVisible={true}>
            <div className="flex flex-col space-y-5 mt-4">
                <div className="flex flex-col">
                    <label className="text-gray2 font-normal text-sm">Widget Name</label>
                    <TextBox
                        placeholder="Enter widget name"
                        value={widgetName}
                        onChange={(e) => { setWidgetName(e.target.value) }}
                        maxLength={50}
                        textAlign={'left'} />
                </div>
                {(type == 0) ? (
                    <div className="flex flex-col">
                        <label className="text-gray2 font-normal text-sm">Widget Type</label>
                        <SelectBox value={widgetType} onChange={(e) => { setWidgetType(e.target.value) }}>
                            <option value={0}>Select Widget Type</option>
                            {widgetTypes.map((widgetType) => {
                                return (
                                    <option key={widgetType.id} value={widgetType.id}>{widgetType.name}</option>
                                )
                            })}
                        </SelectBox>
                    </div>
                ) : null}
                <div className="flex flex-col">
                    <label className="text-gray2 font-normal text-sm">Dataset</label>
                    <SelectBox value={dataset} onChange={(e) => { setDataset(e.target.value) }}>
                        <option value={0}>Select Dataset</option>
                        {tables.map((table) => {
                            return (
                                <option key={table.tbl_id} value={table.tbl_id}>{table.tbl_name}</option>
                            )
                        })}
                    </SelectBox>
                </div>

                {/* Horizontal Rule */}
                <hr className="border-gray2 border-opacity-10" />

                <div className="flex justify-center mt-4">
                    <PillButton text="Next" onClick={() => { nextFunction() }} icon={FaPlus} />
                </div>

            </div>
        </PopupContainer>
    )
}

// default props
AddWidgetPopup.defaultProps = {
    isOpen: false,
    closeFunction: () => { }
}

export default AddWidgetPopup;