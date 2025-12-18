import React, { useEffect, useState } from "react";
import { FaPlus, FaPencilAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import PopupContainer from "../PopupContainer";
import PillButton from "../input/PillButton";
import TextBox from "../input/TextBox";
import SelectBox from "../input/SelectBox";
import 'react-toastify/dist/ReactToastify.css';

const AddAnalyticsWidgetPopup = ({
    isOpen = false,
    closeFunction = () => { },
    tables = [],
    columns = [],
    devices = [],
    analyticTypes = [],
    submitFunction = () => { },
    type = 0, // 0: Add Widget, 1: Edit Widget
    currentWidget = null // Widget details if type is 1
}) => {
    const [widgetName, setWidgetName] = useState('');
    const [widgetType, setWidgetType] = useState(0);
    const [dataset, setDataset] = useState(0);
    const [parameter, setParameter] = useState(0);
    const [device, setDevice] = useState(0);

    useEffect(() => {
        if (currentWidget != null && type == 1) {
            setWidgetName(currentWidget.widget_name);
            setWidgetType(currentWidget.widget_type);
            setDataset(currentWidget.dataset);
            setParameter(currentWidget.parameter);
            setDevice(currentWidget.device);
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) {
            setWidgetName('');
            setWidgetType(0);
            setDataset(0);
            setParameter(0);
            setDevice(0);
        }
    }, [isOpen])

    const handleSubmit = () => {
        // Validation
        if (widgetName == '') {
            toast.error('Please enter widget name');
            return;
        }
        if (dataset == 0) {
            toast.error('Please select dataset');
            return;
        }
        if (parameter == 0) {
            toast.error('Please select parameter');
            return;
        }
        if (device == 0) {
            toast.error('Please select device');
            return;
        }
        if (widgetType == -1) {
            toast.error('Please select analytic type');
            return;
        }

        let object = {
            widget_name: widgetName,
            widget_type: widgetType,
            dataset: dataset,
            parameter: parameter,
            device: device,
        }

        if (type == 0) {
            submitFunction(object);
            closeFunction();
        } else {
            // Edit widget
            object.widget_id = currentWidget.id;
            submitFunction(object);
            console.log(object);
        }
    }

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
                <div className="flex flex-col">
                    <label className="text-gray2 font-normal text-sm">Parameter</label>
                    <SelectBox value={parameter} onChange={(e) => { setParameter(e.target.value) }}>
                        <option value={0}>Select Parameter</option>
                        {columns.map((column) => {
                            if (column.tbl_id != dataset) {
                                return null;
                            }
                            if (column.is_system_column === true) {
                                return null;
                            }
                            if (![1, 2].includes(column.data_type)) {
                                return null;
                            }
                            return (
                                <option key={column.clm_id} value={column.clm_id}>{column.clm_name}</option>
                            )
                        })}
                    </SelectBox>
                </div>

                {/* Device List */}
                <div className="flex flex-col">
                    <label className="text-gray2 font-normal text-sm">Device</label>
                    <SelectBox value={device} onChange={(e) => { setDevice(e.target.value) }}>
                        <option value={0}>Select Device</option>
                        {devices.map((device) => {
                            return (
                                <option key={device.device_id} value={device.device_id}>{device.device_name}</option>
                            )
                        })}
                    </SelectBox>
                </div>

                <div className="flex flex-col">
                    <label className="text-gray2 font-normal text-sm">Analytic Type</label>
                    <SelectBox value={widgetType} onChange={(e) => { setWidgetType(e.target.value) }}>
                        <option value={-1}>Select Analytic Type</option>
                        {analyticTypes.map((analyticType) => {
                            return (
                                <option key={analyticType.id} value={analyticType.id}>{analyticType.name}</option>
                            )
                        })}
                    </SelectBox>
                </div>

                {/* Horizontal Rule */}
                <hr className="border-gray2 border-opacity-10" />

                <div className="flex justify-center mt-4">
                    <PillButton text="Save Widget" onClick={() => { handleSubmit() }} icon={FaPlus} />
                </div>
            </div>
        </PopupContainer>
    )
}

export default AddAnalyticsWidgetPopup;