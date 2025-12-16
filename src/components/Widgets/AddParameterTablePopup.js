import React, { useState, useEffect } from "react";
import { FaTools, FaCheck, FaTrash } from "react-icons/fa";
import { toast } from 'react-toastify';
import PopupContainer from "../PopupContainer";
import SelectBox from "../input/SelectBox";
import PillButton from "../input/PillButton";

const AddParameterTablePopup = ({
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
      const [selectedFields, setSelectedFields] = useState([]);
      const [selectedDevice, setSelectedDevice] = useState(-1);

      useEffect(() => {
            if (type == 1 && oldWidget != null && oldWidget.widget_type == 2 && isOpen) {
                  let fields = [];
                  oldWidget.configuration.map((column) => {
                        fields.push(column.clm_id);
                  });
                  setSelectedFields(fields);
                  if (oldWidget.configuration[0].device_id == null) {
                        setSelectedDevice(0);
                  } else {
                        setSelectedDevice(oldWidget.configuration[0].device_id);
                  }
            }

      }, [isOpen]);

      // ------------- Function to handle field selecting -------------
      const handleFieldSelect = (field) => {
            if (selectedFields.includes(field)) {
                  setSelectedFields(selectedFields.filter((f) => f !== field));
            } else {
                  setSelectedFields([...selectedFields, field]);
            }
      }

      // ------------- Function to handle configuration saving -------------
      const handleSaveConfiguration = () => {
            if (selectedFields.length == 0 || selectedDevice == -1) {
                  toast.error('Please select fields and device');
                  return;
            }

            let newConfiguration = {
                  columns: selectedFields,
                  device_id: (selectedDevice == 0) ? null : selectedDevice
            }
            setConfiguration(newConfiguration);

            submitFunction(newConfiguration);
      }

      return (
            <PopupContainer
                  isOpen={isOpen}
                  onClose={() => { }}
                  Icon={FaTools}
                  title="Configure Widget - Table"
                  closeFunction={closeFunction}
                  width="w-[950px]"
                  closeIconVisible={true}>
                  <div className="flex flex-col text-sm text-gray1 mt-6">Select fields to display</div>

                  <div className="grid grid-cols-3 gap-3 my-4">
                        {columns.map((column) => {
                              return (
                                    <div key={column.clm_id} className="w-2/3 flex">
                                          <input type="checkbox"
                                                className="w-4 h-4"
                                                checked={selectedFields.includes(column.clm_id)}
                                                onChange={(e) => {
                                                      handleFieldSelect(column.clm_id)
                                                }} />
                                          <label className="text-sm ml-2">{column.clm_name}</label>
                                    </div>
                              )
                        })}
                  </div>

                  {/* Horizontal Rule */}
                  <hr className="border-gray1 border-opacity-30 my-5" />

                  <label className="text-gray2 font-normal text-sm mt-2">
                        Device
                  </label>
                  <SelectBox value={selectedDevice} onChange={(e) => { setSelectedDevice(e.target.value) }}>
                        <option value={-1}>Select Device</option>
                        {devices.map((device) => {
                              return (
                                    <option key={device.device_id} value={device.device_id}>
                                          {device.device_name}
                                    </option>
                              )
                        })}
                  </SelectBox>

                  {/* Horizontal Rule */}
                  <hr className="border-gray1 border-opacity-30 my-5" />

                  {/* <div className="flex flex-col text-md text-gray1">Select records only if,</div>
                  <div className="w-48 flex flex-row justify-between my-2">
                        <div className="text-sm">Field Name</div>
                        <div className="text-sm">Value</div>
                  </div>
                  <div className="flex flex-row justify-between items-center space-x-2">
                        <div className="w-32">
                              <SelectBox value={0}
                                    onChange={(e) => { }}>
                                    <option value={0}>Field</option>

                              </SelectBox>
                        </div>
                        <div className="my-2">=</div>
                        <div className="w-32">
                              <TextBox placeholder="Value" />
                        </div>
                        <div className="">
                              <PillButton
                                    text="Add Condition"
                                    isPopup={true}
                                    icon={FaPlusCircle}
                              />
                        </div>
                  </div>
                  <div className="flex flex-col mt-4">
                        <SeriesCard text={'device = Elpitiya'} onClick={() => { }} />
                  </div> */}
                  <div className="flex flex-col items-center justify-center mt-4">
                        <PillButton
                              text="Done"
                              isPopup={true}
                              icon={FaCheck}
                              onClick={handleSaveConfiguration}
                        />
                  </div>


            </PopupContainer>
      );

}



export default AddParameterTablePopup;