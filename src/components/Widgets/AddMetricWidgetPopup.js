import React, { useEffect, useState } from "react";
import { FaTools, FaCheck } from "react-icons/fa";
import { toast } from 'react-toastify';
import PopupContainer from "../PopupContainer";
import SelectBox from "../input/SelectBox";
import PillButton from "../input/PillButton";
import TextBox from "../input/TextBox";

const AddMetricWidgetPopup = ({
  isOpen,
  closeFunction,
  columns,
  devices,
  configuration,
  setConfiguration,
  submitFunction,
  type = 0,
  oldWidget = {}
}) => {
  const [selectedColumn, setSelectedColumn] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState(-1);
  const [measuringUnit, setMeasuringUnit] = useState("");

  useEffect(() => {
    if (isOpen && oldWidget != null && type === 1 && oldWidget.widget_type === 5) {
      setSelectedColumn(oldWidget.configuration.clm_id);
      setSelectedDevice(oldWidget.configuration.device_id ?? -1);
      setMeasuringUnit(oldWidget.configuration.measuring_unit ?? "");
    }
  }, [isOpen]);

  const saveConfiguration = () => {
    if (selectedColumn === 0 || selectedDevice === -1) {
      toast.error("Please fill all the fields");
      return;
    }

    let selectedDeviceID = null;
    if (selectedDevice === 0) {
      selectedDeviceID = null; // All devices
    } else {
      selectedDeviceID = selectedDevice;
    }

    const newConfiguration = {
      clm_id: selectedColumn,
      device_id: selectedDeviceID,
      measuring_unit: (measuringUnit || "").trim()
    };

    setConfiguration(newConfiguration);
    submitFunction(newConfiguration);
  };

  return (
    <PopupContainer
      title="Configure Widget - Metric"
      Icon={FaTools}
      isOpen={isOpen}
      closeFunction={closeFunction}
      onClose={() => { }}
      closeIconVisible={true}
    >
      <div className="my-3">
        <span className="text-sm">Field Name</span>
        <SelectBox
          value={selectedColumn}
          onChange={(e) => { setSelectedColumn(e.target.value) }}
        >
          <option value={0}>Select Field</option>
          {columns
            .filter((column) => !column.is_system_column && (column.data_type === 1 || column.data_type === 2 || column.data_type === 4))
            .map((column) => (
              <option key={column.clm_id} value={column.clm_id}>{column.clm_name}</option>
            ))}
        </SelectBox>

        <div className="mt-4">
          <span className="text-sm">Measuring Unit</span>
          <TextBox
            placeholder="Unit (max 4 chars)"
            value={measuringUnit}
            onChange={(e) => { setMeasuringUnit(e.target.value) }}
            maxLength={4}
            textAlign={'left'}
          />
        </div>

        <div className="mt-4">
          <span className="text-sm mt-4">Device</span>
          <SelectBox value={selectedDevice} onChange={(e) => { setSelectedDevice(e.target.value) }}>
            <option value={-1}>Select Device</option>
            {devices.map((device) => (
              <option key={device.device_id} value={device.device_id}>{device.device_name}</option>
            ))}
          </SelectBox>
        </div>

        <hr className="border-gray1 border-opacity-30 my-5" />

        <div className="flex justify-center mt-4">
          <PillButton text="Done" onClick={saveConfiguration} icon={FaCheck} />
        </div>
      </div>
    </PopupContainer>
  );
};

export default AddMetricWidgetPopup;
