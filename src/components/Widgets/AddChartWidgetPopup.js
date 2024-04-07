import React, { useState } from "react";
import { FaPlus, FaCheck, FaTrash, FaTools } from "react-icons/fa";
import { toast } from 'react-toastify';
import PopupContainer from "../PopupContainer";
import PillButton from "../input/PillButton";
import TextBox from "../input/TextBox";
import SelectBox from "../input/SelectBox";

const AddChartWidgetPopup = ({
  isOpen,
  closeFunction,
  columns,
  devices,
}) => {
  const [chartTypes, setChartTypes] = useState([
    { id: 1, name: "Area Chart" },
    { id: 2, name: "Bar Chart" },
    { id: 3, name: "Pie Chart" },
    { id: 4, name: "Line Chart" },
  ]);

  // ------------- States for X-Axis Parameter and Chart Type -------------
  const [XAxisParameter, setXAxisParameter] = useState(-1);
  const [selectedChartType, setSelectedChartType] = useState(0);

  // ------------- States for storing added Series -------------
  const [series, setSeries] = useState([
    // {
    //   name: "Temperature",
    //   parameter: 1,
    //   device: 1,
    // },
  ])

  // ------------- Function to add series to the series list -------------
  const addSeries = () => {
    // Check for series with the same name
    let seriesExists = series.filter((s) => s.name === seriesName);
    if (seriesExists.length > 0) {
      toast.warn("Series with the same name already exists");
      return;
    }

    // Add the series to the series list
    let newSeries = [...series, { name: seriesName, parameter: yParameter, device: device }];
    setSeries(newSeries);

    // Reset the input fields
    setSeriesName("");
    setYParameter(0);
    setDevice(0);
  }

  // ------------- States for Series Name, Y-Axis Parameter and Device when adding a new series -------------
  const [seriesName, setSeriesName] = useState("");
  const [yParameter, setYParameter] = useState(0);
  const [device, setDevice] = useState(0);

  // THis card is used to list down series with the delete button
  const SeriesCard = ({ text, onDelete }) => {
    return (
      <div className="flex justify-between items-center bg-black3 p-3 rounded-lg text-gray2
      border border-gray1 border-opacity-60 my-1">
        <div className="text-gray2 font-normal text-sm">{text}</div>
        <FaTrash className="text-red hover:text-gray2 transition-all duration-300 ease-out cursor-pointer" onClick={onDelete} />
      </div>
    )
  }

  return (
    <PopupContainer
      isOpen={isOpen}
      closeFunction={closeFunction}
      onClose={() => { }}
      title={"Configure Widget - Chart"}
      Icon={FaTools}
      closeIconVisible={true}
      width={"675px"}
    >
      <div className=" h-96 pe-2 pb-4 overflow-scroll flex flex-col mt-4">
        <div className="flex justify-between sm:space-x-6">
          <div className="flex-col">
            <label className="text-gray2 font-normal text-sm">
              X-Axis Parameter
            </label>
            <SelectBox value={XAxisParameter} onChange={(e) => { setXAxisParameter(e.target.value) }}>
              <option value={-1}>Select Parameter</option>
              <option value={0}>Timestamp</option>
              {columns.map((column) => {
                return (
                  column.clm_name != 'id' ? (
                    <option key={column.clm_id} value={column.clm_id}>
                      {column.clm_name}
                    </option>
                  ) : null
                )
              })}
            </SelectBox>
          </div>

          <div className="flex-col">
            <label className="text-gray2 font-normal text-sm">
              Variation Type
            </label>
            <SelectBox value={selectedChartType} onChange={(e) => { setSelectedChartType(e.target.value) }}>
              <option value={0}>Select Chart Type</option>
              {chartTypes.map((chart) => {
                return (
                  <option key={chart.id} value={chart.id}>
                    {chart.name}
                  </option>
                );
              })}
            </SelectBox>
          </div>
        </div>

        {/* ------------------Series------------------- */}
        <hr className="border-gray1 border-opacity-30 my-5" />
        <span className="text-gray1 font-normal text-sm mb-3">Add Series</span>

        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row justify-between">
          <div className="flex flex-col">
            <label className="text-gray2 font-normal text-sm">
              Series Name
            </label>
            <TextBox
              placeholder="Enter widget name"
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
              maxLength={50}
              textAlign={"left"}
            />
          </div>
          <div className="flex flex-col sm:w-60">
            <label className="text-gray2 font-normal text-sm">
              Parameter Column
            </label>
            <SelectBox value={yParameter} onChange={(e) => setYParameter(e.target.value)}>
              <option value={0}>Select Parameter</option>
              {columns.map((column) => {
                return (
                  column.clm_name != 'id' ? (
                    <option key={column.clm_id} value={column.clm_id}>
                      {column.clm_name}
                    </option>
                  ) : null
                )
              })}
            </SelectBox>
          </div>
        </div>
        <label className="text-gray2 font-normal text-sm mt-2">
          Device
        </label>
        <SelectBox value={device} onChange={(e) => setDevice(e.target.value)}>
          <option value={0}>All Devices</option>
          {devices.map((device) => {
            return (
              <option key={device.device_id} value={device.device_id}>
                {device.device_name}
              </option>
            )
          })}
        </SelectBox>
        <div className="flex justify-center mt-4">
          <PillButton text="Add Series" onClick={() => addSeries()} icon={FaPlus} />
        </div>
        <div className="flex flex-col mt-4">
          {series.map((seriesItem) => {
            return (
              <SeriesCard
                key={seriesItem.name}
                text={`${seriesItem.name}`}
                onDelete={() => {
                  let newSeries = [...series].filter((s) => s.name !== seriesItem.name);
                  setSeries(newSeries);
                }}
              />
            )
          })}
        </div>

        {/* Horizontal Rule */}
        <hr className="border-gray1 border-opacity-30 my-5" />

        <div className="flex justify-center mt-4">
          <PillButton text="Done" onClick={() => { }} icon={FaCheck} />
        </div>
      </div>
    </PopupContainer>
  );
};

// default props
AddChartWidgetPopup.defaultProps = {
  isOpen: false,
  closeFunction: () => { },
};

export default AddChartWidgetPopup;
