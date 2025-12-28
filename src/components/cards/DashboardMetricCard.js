import React, { useEffect, useState } from "react";
import { FaTrash, FaPencilAlt, FaHashtag } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";

const DashboardMetricCard = ({
  onClick = () => {},
  widget,
  deleteWidget = () => {},
  updateWidget = () => {},
  mqttPayload = null,
  readOnly = false,
  publicData = null, // Pre-loaded data for public dashboards
}) => {
  const [loading, setLoading] = useState(publicData === null);
  const [metricValue, setMetricValue] = useState(
    publicData !== null && publicData.value != null ? publicData.value : "N/A"
  );
  const [createdAt, setCreatedAt] = useState(
    publicData !== null ? publicData.created_at : null
  );

  useEffect(() => {
    // Only load from API if no publicData is provided AND not in readOnly mode
    // readOnly mode means it's a public dashboard, which uses publicData instead
    if (publicData === null && !readOnly) {
      loadMetricData(widget.id);
    }
  }, []);

  // Update state when publicData changes (from wrapper component)
  useEffect(() => {
    if (publicData !== null) {
      setMetricValue(publicData.value != null ? publicData.value : "N/A");
      setCreatedAt(publicData.created_at ?? null);
      setLoading(false);
    }
  }, [publicData]);

  useEffect(() => {
    if (!mqttPayload) return;

    const columnName = widget?.configuration?.Column?.clm_name;
    const deviceFilter = widget?.configuration?.device_id;

    if (
      mqttPayload.tbl_id === widget.dataset &&
      (deviceFilter == null || deviceFilter === mqttPayload.device_id) &&
      mqttPayload.data &&
      columnName in mqttPayload.data
    ) {
      setMetricValue(
        mqttPayload.data[columnName] != null ? mqttPayload.data[columnName] : "N/A"
      );
    }
  }, [mqttPayload, widget]);

  const loadMetricData = async (metricId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/data/get/metric/${metricId}`,
        {
          headers: {
            Authorization: localStorage.getItem("auth-token"),
          },
        }
      );

      if (response.status === 200) {
        setMetricValue(
          response?.data?.value != null ? response.data.value : "N/A"
        );
        setCreatedAt(response?.data?.created_at ?? null);
      } else {
        setMetricValue("N/A");
        setCreatedAt(null);
      }
    } catch (error) {
      if (error?.response?.status === 404) {
        toast.error(`No data available for ${widget.widget_name}`);
        setMetricValue("N/A");
        setCreatedAt(null);
      } else {
        toast.error(
          `Error occurred while loading ${widget.widget_name} data. Data may be empty`
        );
        setMetricValue("N/A");
        setCreatedAt(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`w-full sm:w-[400px] h-[300px] bg-black3 rounded-2xl mx-3 my-1 sm:my-5
        border border-gray1 border-opacity-60 relative overflow-hidden
        transition duration-300 hover:border-green cursor-pointer`}
      onClick={onClick}
    >
      <div className="w-full h-full pt-4 pl-4 pb-4 flex flex-col justify-between">
        <div className="flex items-center justify-start">
          <FaHashtag className="text-xl text-green" />
          <div className="text-md text-gray2 font-medium max-w-full truncate ms-2">
            {widget.widget_name}
          </div>
        </div>

        {loading ? (
          <div className={`flex flex-col justify-center items-center mt-5`}>
            <ScaleLoader color={"#3ECF8E"} loading={true} size={30} />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center">
            <span className="text-sm text-green opacity-100 mb-4">
              {`Attribute: ${widget?.configuration?.Column?.clm_name ?? "N/A"}`}
            </span>
            <span className="text-5xl font-semibold text-gray2">
              {metricValue}
            </span>
            <span className="text-base text-gray2 opacity-70 mb-2">
              {widget?.configuration?.measuring_unit?.trim?.() ? widget.configuration.measuring_unit.trim() : "-"}
            </span>
            <span className="text-xs text-gray2 opacity-60">
              {createdAt ? new Date(createdAt).toLocaleString() : "N/A"}
            </span>
          </div>
        )}

        <div className="flex justify-end w-full px-4">
          {readOnly ? (
            <span className="text-xs text-gray1 bg-gray1 bg-opacity-20 px-2 py-1 rounded">View Only</span>
          ) : (
            <div className="flex">
              <FaPencilAlt
                className="text-green text-lg hover:text-gray2 transition duration-300"
                onClick={() => {
                  updateWidget(widget);
                }}
              />
              <FaTrash
                className="text-red text-lg ms-5 hover:text-gray2 transition duration-300"
                onClick={() => {
                  deleteWidget(widget.id);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardMetricCard;
