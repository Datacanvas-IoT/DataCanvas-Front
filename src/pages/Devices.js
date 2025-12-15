import React, { useState, useEffect } from "react";
import { FaPlusCircle, FaCheck, FaKey, FaCopy } from "react-icons/fa";
import { MdRouter } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarLayout from "../components/layouts/SidebarLayout";
import SquareCard from "../components/cards/SquareCard";
import Spinner from "../components/Spinner";
import TextBox from "../components/input/TextBox";
import ButtonRectangle from "../components/input/ButtonRectangle";
import PillButton from "../components/input/PillButton";
import axios from "axios";
import PopupContainer from "../components/PopupContainer";
import LoginPopup from "../components/LoginPopup";

const Device = () => {
  //------ Navigations -------
  const navigate = useNavigate();

  //-------- States ---------
  const [loading, setLoading] = useState(false);

  //--Get states from navigation location for retrieval of project_id--
  const { state } = useLocation();

  //--Add Device Modal Visiblity--
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);

  const toggleAddDeviceModal = () => {
    setIsAddDeviceOpen(!isAddDeviceOpen);
  };

  const [isDeviceAddingDoneOpen, setIsDeviceAddingDoneOpen] = useState(false);

  const toggleDeviceAddingDoneModal = () => {
    if (isDeviceAddingDoneOpen) {
      getAllDevices();
    }
    setIsDeviceAddingDoneOpen(!isDeviceAddingDoneOpen);
  };

  //--Device Update Modal Visiblity--
  const [isDeviceUpdateOpen, setIsDeviceUpdateOpen] = useState(false);

  const toggleDeviceUpdateModal = () => {
    setIsDeviceUpdateOpen(!isDeviceUpdateOpen);
  };

  const [devices, setDevices] = useState([]); // For storing devices of the project
  const [newDeviceName, setNewDeviceName] = useState(""); // For text box of Add Device
  const [newDeviceDescription, setNewDeviceDescription] = useState(""); // For text box of Add Device
  const [fingerprint, setFingerprint] = useState(""); // For showing device fingerprint of newly added device

  const [projectID, setProjectID] = useState(-1);

  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const handleDeviceSelection = (device) => {
    setSelectedDeviceId(device.device_id);
    setNewDeviceName(device.device_name);
    setNewDeviceDescription(device.description);
    setFingerprint(device.fingerprint);
    console.log(device);
  };

  const handleDeviceNameChange = (name) => {
    setNewDeviceName(name.target.value);
  };

  const handleDeviceDescriptionChange = (discription) => {
    setNewDeviceDescription(discription.target.value);
  };

  useEffect(() => {
    try {
      setProjectID(state.project_id);
    } catch (err) {
      console.log(err);
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    if (projectID !== -1) {
      getAllDevices();
    }
  }, [projectID]);

  //------------ critical section proceeding with authentication
  const [isLoginPopupVisible, setIsLoginPopupVisible] = useState(false);
  const [authenticationResult, setAuthenticationResult] = useState(false);
  useEffect(() => {
    if (authenticationResult) {
      setIsLoginPopupVisible(false);
      toast.success('Login successful, Deleting Device...');
      handleDeviceDelete(selectedDeviceId);

    }
  }, [authenticationResult]);

  //--Api call for adding device--
  const handleDeviceAdding = async () => {
    if (newDeviceName === "") {
      toast.error("Device name cannot be empty!");
      return;
    }

    setLoading(true);

    // post request to localhost:3001/api/device
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/device`,
        {
          device_name: newDeviceName,
          description: newDeviceDescription,
          project_id: projectID,
        },
        {
          headers: {
            authorization: localStorage.getItem("auth-token"),
          },
        }
      );

      if (response.status === 200) {
        setFingerprint(response.data.fingerprint);
        setDevices([...devices, response.data]);
        toggleAddDeviceModal();
        toggleDeviceAddingDoneModal();
      }
    } catch (err) {
      switch (err.response.status) {
        case 400:
          toast.error("Bad request!");
          break;
        case 401:
          toast.error("Unauthorized access!");
          navigate("/login");
          break;
        case 403:
          toast.error("Unauthorized access!");
          navigate("/login");
          break;
        case 404:
          toast.error("Project not found!");
          break;
        default:
          toast.error("Something went wrong!");
          break;
      }
    } finally {
      setNewDeviceDescription("");
      setNewDeviceName("");
      setLoading(false);
    }
  };

  //--API call for deleting device
  const handleDeviceDelete = async (device_id) => {
    setLoading(true);
    // delete request to localhost:3001/api/device
    try {
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/device`, {
        headers: {
          authorization: localStorage.getItem("auth-token"),
        },
        data: { device_id: device_id },
      });

      if (response.status === 200) {
        // Remove the deleted device from the devices array
        let newDevices = devices.filter(
          (device) => device.device_id !== device_id
        );
        setDevices(newDevices);
      }
    } catch (err) {
      switch (err.response.status) {
        case 400:
          toast.error("Bad request!");
          break;
        case 401:
          toast.error("Unauthorized access!");
          navigate("/login");
          break;
        case 403:
          toast.error("Unauthorized access!");
          navigate("/login");
          break;
        case 404:
          toast.error("Project not found!");
          break;
        default:
          toast.error("Something went wrong!");
          break;
      }
    }
    setLoading(false);
  };

  //----API call for updating device
  const handleDeviceUpdate = async (device_id) => {
    if (newDeviceName === "") {
      toast.error("Device name cannot be empty!");
      return;
    }
    setLoading(true);
    // put request to localhost:3001/api/device
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/device`,
        {
          device_id: device_id,
          device_name: newDeviceName,
          description: newDeviceDescription,
        },
        {
          headers: {
            authorization: localStorage.getItem("auth-token"),
          },
        }
      );

      if (response.status === 200) {
        getAllDevices();
      }
    } catch (err) {
      switch (err.response.status) {
        case 400:
          toast.error("Bad request!");
          break;
        case 401:
          toast.error("Unauthorized access!");
          navigate("/login");
          break;
        case 403:
          toast.error("Unauthorized access!");
          navigate("/login");
          break;
        case 404:
          toast.error("Project not found!");
          break;
        default:
          toast.error("Something went wrong!");
          break;
      }
    } finally {
      toggleDeviceUpdateModal();
      setNewDeviceDescription("");
      setNewDeviceName("");
      setLoading(false);
    }
  };

  // API call for getting all devices for project
  const getAllDevices = async () => {
    setLoading(true);
    // get request to localhost:3001/api/device?project_id=<projectID>
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/device?project_id=${projectID}`,
        {
          headers: {
            authorization: localStorage.getItem("auth-token"),
          },
        }
      );

      if (response.status === 200) {
        let devicesArray = [];
        response.data.forEach((device) => {
          // Specify the locale as 'si-LK' for Sri Lanka
          const date = new Date(device.updatedAt);
          const options = {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            timeZone: "GMT",
          };
          const formattedDate = new Intl.DateTimeFormat(
            "en-GB",
            options
          ).format(date);

          let deviceDetails = {
            device_id: device.device_id,
            device_name: device.device_name,
            description: device.description,
            fingerprint: device.fingerprint,
            footer: formattedDate,
          };
          devicesArray.push(deviceDetails);
        });

        setDevices(devicesArray);
        setLoading(false);
      }
    } catch (err) {
      switch (err.response.status) {
        case 400:
          toast.error("Bad request!");
          break;
        case 401:
          toast.error("Unauthorized access!");
          navigate("/login");
          break;
        case 403:
          toast.error("Unauthorized access!");
          navigate("/login");
          break;
        case 404:
          toast.error("Project not found!");
          break;
        default:
          toast.error("Something went wrong!");
          console.log(err);
          navigate("/projects");
          break;
      }
      setDevices([]);
      setLoading(false);
    }
  };

  return (
    <SidebarLayout
      active={2}
      breadcrumb={`${localStorage.getItem('project')} > Devices`}
    >
      <div className={`flex flex-row justify-between px-7 sm:px-10 mt-8 sm:mt-3`}>
        <div className="text-lg text-gray2 font-semibold">Your Devices</div>
        <div className="flex">
          <ButtonRectangle text="Add Device" onClick={toggleAddDeviceModal} />
        </div>
      </div>
      <div className={`flex-wrap flex ${devices.length < 3 ? 'justify-start' : 'justify-center'} sm:px-8 px-2 mb-28 mt-6`}>
        {devices.length === 0 ? (
          <div className={`w-full flex flex-col justify-center items-center`}>
            <div className={`text-gray2 text-sm`}>No devices found</div>
            <div className={`flex flex-row justify-center items-center mt-4`}>
              <PillButton text="Add Your First Device" icon={FaPlusCircle} onClick={toggleAddDeviceModal} />
            </div>
          </div>
        ) : (
          devices.map((device) => (
            <SquareCard
              isIconShown
              key={device.device_id}
              title={device.device_name}
              subtitle={device.description}
              footer={""}
              mx="mx-2"
              onDelete={
                () => {
                  setSelectedDeviceId(device.device_id);
                  setIsLoginPopupVisible(true)
                }
              }
              onUpdate={() => {
                toggleDeviceUpdateModal();
                handleDeviceSelection(device);
              }}
              onClick={() => {
                navigate("/devices", {
                  state: { device_id: device.device_id },
                });
              }}
            />
          ))
        )}
      </div>

      {/* Add Device Modal */}
      <PopupContainer
        isOpen={isAddDeviceOpen}
        onClose={() => { }}
        closeFunction={toggleAddDeviceModal}
        Icon={FaPlusCircle}
        title={"Add New Device"}
        closeIconVisible={true}
      >
        <div className="flex flex-col justify-center mt-4">
          <label className="text-gray1 text-sm">Device Name</label>
          <TextBox
            text=""
            type="text"
            placeholder="Device Name"
            maxLength={50}
            textAlign={"left"}
            onChange={handleDeviceNameChange}
            value={newDeviceName}
          />
        </div>
        <div className="flex flex-col justify-center mt-4">
          <label className="text-gray1 text-sm">Device Description</label>
          <TextBox
            text=""
            type="text"
            placeholder="Device Description"
            maxLength={100}
            textAlign={"left"}
            onChange={handleDeviceDescriptionChange}
            value={newDeviceDescription}
          />
        </div>
        <div className="flex justify-center mt-8">
          <PillButton
            text="Add Device"
            onClick={handleDeviceAdding}
            isPopup={true}
            icon={FaPlusCircle}
          />
        </div>
      </PopupContainer>

      {/* Device Adding Done Modal - Show Device Fingerprint*/}
      <PopupContainer
        isOpen={isDeviceAddingDoneOpen}
        onClose={() => { }}
        closeFunction={toggleDeviceAddingDoneModal}
        Icon={MdRouter}
        title={"Device Added Successfully"}
        closeIconVisible={true}
      >
        <div className="flex flex-col justify-center items-center mt-4">
          <div className="flex mt-1">
            <FaKey className="text-green" />
            <label className="text-gray2 text-sm ml-2">
              Device Fingerprint
            </label>
          </div>
          <div className={`flex items-center space-x-4 w-full`}>
            <input
              type="text"
              value={fingerprint}
              className="w-full bg-black3 border border-gray2 border-opacity-30 rounded-full text-center px-4 py-1 mt-2 text-gray2"
              readOnly
            />
            <FaCopy
              className="text-lg text-green mt-2 cursor-pointer hover:text-gray2 duration-300 transition-all ease-in-out"
              onClick={() => {
                navigator.clipboard.writeText(fingerprint);
                toast.success("Fingerprint copied to clipboard");
              }} />
          </div>
          <span className="text-red text-xs text-center mt-4">
            This device fingerprint should be included in data send requests. This can be viewed once. Copy this fingerprint in a safe place
          </span>
        </div>
        <div className="flex flex-col items-center justify-center mt-6">
          <PillButton
            text="Done"
            onClick={toggleDeviceAddingDoneModal}
            isPopup={true}
            icon={FaCheck}
          />
        </div>
      </PopupContainer>

      {/* Update Device Modal */}
      <PopupContainer
        isOpen={isDeviceUpdateOpen}
        onClose={() => { }}
        closeFunction={toggleDeviceUpdateModal}
        Icon={MdRouter}
        title={"Update Device"}
        closeIconVisible={true}
      >
        <div className="flex flex-col justify-center mt-4">
          <label className="text-gray1 text-sm">Device Name</label>
          <TextBox
            text=""
            type="text"
            placeholder="Device Name"
            maxLength={50}
            textAlign={"left"}
            onChange={handleDeviceNameChange}
            value={newDeviceName}
          />
        </div>
        <div className="flex flex-col justify-center mt-4">
          <label className="text-gray1 text-sm">Device Description</label>
          <TextBox
            text=""
            type="text"
            placeholder="Device Description"
            maxLength={100}
            textAlign={"left"}
            onChange={handleDeviceDescriptionChange}
            value={newDeviceDescription}
          />
        </div>
        <div className="flex flex-col justify-center mt-4">
          <label className="text-gray1 text-sm">Device Fingerprint</label>
          <TextBox
            text=""
            type="text"
            placeholder="Device Fingerprint"
            maxLength={100}
            textAlign={"left"}
            onChange={() => { }}
            value={fingerprint}
            disabled={true}
          />
        </div>
        <div className="flex justify-center mt-8">
          <PillButton
            text="Update Device"
            onClick={() => handleDeviceUpdate(selectedDeviceId)}
            isPopup={true}
            icon={MdRouter}
          />
        </div>
      </PopupContainer>

      {/* Popup container for login authentication popup */}
      <LoginPopup
        isOpen={isLoginPopupVisible}
        closeFunction={() => setIsLoginPopupVisible(false)}
        setAuthenticationResult={(e) => setAuthenticationResult(e)}
        email={localStorage.getItem('email')} />

      {/* Spinner */}
      <Spinner isVisible={loading} />

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </SidebarLayout>
  );
};

export default Device;
