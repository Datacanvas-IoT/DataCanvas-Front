import React, { useState, useEffect } from "react";
import { FaTools, FaCheck } from "react-icons/fa";
import { toast } from 'react-toastify';
import PopupContainer from "../PopupContainer";
import TextBox from "../input/TextBox";
import SelectBox from "../input/SelectBox";
import PillButton from "../input/PillButton"

const AddGaugeWidgetPopup = ({
  isOpen,
  closeFunction,
  columns,
  devices,
  configuration,
  setConfiguration,
  submitFunction,
  type = 0, // 0: Add Widget, 1: Edit Widget
  oldWidget = {} // Widget configuration details if type is 1
}) => {
  const [selectedColumn, setSelectedColumn] = useState(0);
  const [maxValue, setMaxValue] = useState(0);
  const [minValue, setMinValue] = useState(0);
  const [gaugeType, setGaugeType] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState(-1);

  useEffect(() => {
    if (isOpen && oldWidget != null && type == 1 && oldWidget.widget_type == 4) {
      setSelectedColumn(oldWidget.configuration.clm_id);
      setMaxValue(oldWidget.configuration.max_value);
      setMinValue(oldWidget.configuration.min_value);
      setGaugeType(oldWidget.configuration.gauge_type);
      setSelectedDevice(oldWidget.configuration.device_id);
    }
  }, [isOpen])

  const saveConfiguration = () => {

    if (selectedColumn == 0 || maxValue.toString().trim() == '' || minValue.toString().trim() == '' || selectedDevice == -1) {
      toast.error("Please fill all the fields");
      return;
    }

    let selectedDeviceID = null
    if (selectedDevice == -1) {
      toast.error("Please select a device");
      return;
    } else if (selectedDevice == 0) {
      selectedDeviceID = null;
    } else {
      selectedDeviceID = selectedDevice;
    }

    if (minValue >= maxValue) {
      toast.error("Minimum value should be less than maximum value");
      return;
    }

    let newConfiguration = {
      clm_id: selectedColumn,
      max_value: maxValue,
      min_value: minValue,
      gauge_type: gaugeType,
      device_id: selectedDeviceID
    }
    setConfiguration(newConfiguration)

    submitFunction(newConfiguration);
  }

  return (
    <PopupContainer
      title="Configure Widget - Gauge"
      Icon={FaTools}
      isOpen={isOpen}
      closeFunction={closeFunction}
      onClose={() => { }}
      closeIconVisible={true}
    >
      {/* Content of the popup */}
      <div className="my-3">
        <span className="text-sm">Field Name</span>
        <SelectBox
          value={selectedColumn}
          onChange={(e) => { setSelectedColumn(e.target.value) }}>
          <option value={0}>Select Field</option>
          {columns.map((column) => {
            return (
              (column.data_type == 1 || column.data_type == 2) ? (
                <option key={column.clm_id} value={column.clm_id}>
                  {column.clm_name}
                </option>
              ) : null
            );
          })}
        </SelectBox>

        <div className="mt-4">
          <span className="text-sm">Minimum Value</span>
          <TextBox type="number" placeholder="Enter minimum value"
            value={minValue}
            onChange={(e) => { setMinValue(e.target.value) }} />
        </div>

        <div className="mt-4">
          <span className="text-sm">Maximum Value</span>
          <TextBox type="number" placeholder="Enter maximum value"
            value={maxValue}
            onChange={(e) => { setMaxValue(e.target.value) }} />
        </div>

        <div className="mt-4">
          <span className="text-sm mt-4">Gauge Type</span>
          <SelectBox value={gaugeType}
            onChange={(e) => { setGaugeType(e.target.value) }}>
            <option value={0}>Select Gauge Type</option>
            <option value={1}>Radial (Speedometer)</option>
            <option value={2}>Linear (Progress Bar)</option>
          </SelectBox>
        </div>

        <div className="mt-4">
          <span className="text-sm mt-4">Device</span>
          <SelectBox value={selectedDevice} onChange={(e) => { setSelectedDevice(e.target.value) }}>
            <option value={-1}>Select Device</option>
            <option value={0}>All Devices</option>
            {devices.map((device) => {
              return (
                <option key={device.device_id} value={device.device_id}>
                  {device.device_name}
                </option>
              );
            })}
          </SelectBox>
        </div>

        <hr className="border-gray1 border-opacity-30 my-5" />

        <div className="flex justify-center mt-4">
          <PillButton text="Done" onClick={() => { saveConfiguration() }} icon={FaCheck} />
        </div>
      </div>
    </PopupContainer >
  );
};

export default AddGaugeWidgetPopup;
