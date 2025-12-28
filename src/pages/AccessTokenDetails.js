import React, { useEffect, useState } from "react";
import SelectBox from "../components/input/SelectBox";
import { FaCalendarAlt, FaTimes } from "react-icons/fa";
import { useNavigate, useLocation, useParams } from "react-router-dom";
const expirationOptions = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
  { value: 180, label: '180 days' },
  { value: 365, label: '1 year' },
];
const getExpirationDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidebarLayout from "../components/layouts/SidebarLayout";
import PillButton from "../components/input/PillButton";
import TextBox from "../components/input/TextBox";
import InsightCard from "../components/cards/InsightCard";
import RectangularCard from "../components/cards/RectangularCard";
import Spinner from "../components/Spinner";
import DeleteConfirmationPopup from "../components/DeleteConfirmationPopup";
import accessTokenService from "../services/accessTokenService";
import {
  FaTrash,
  FaCheck,
  FaCog,
  FaPlus,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import DomainSitesInput from "../components/input/DomainSitesInput";

const GreenTrashIcon = (props) => {
  const { className, ...rest } = props;
  const cls = className
    ? className + " text-green text-sm"
    : "text-green text-sm";
  return <FaTrash {...rest} className={cls} />;
};

const GreenPlusIcon = (props) => {
  const { className, ...rest } = props;
  const cls = className
    ? className + " text-green text-sm"
    : "text-green text-sm";
  return <FaPlus {...rest} className={cls} />;
};

const AccessTokenDetails = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { access_key_id: paramAccessKeyId } = useParams();
  // Expiration renewal popup state (move hooks inside component)
  const [showRenewPopup, setShowRenewPopup] = useState(false);
  const [renewDuration, setRenewDuration] = useState(7);

  const [loading, setLoading] = useState(false);
  const [projectID, setProjectID] = useState(-1);

  // Token states
  const [accessKeyId, setAccessKeyId] = useState(null);
  const [tokenName, setTokenName] = useState("");
  const [expirationDate, setExpirationDate] = useState(null);
  const [lastUseTime, setLastUseTime] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  // Device/domain states
  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [domainSites, setDomainSites] = useState([""]);
  const [showAllDevices, setShowAllDevices] = useState(false);
  const [showAllDomains, setShowAllDomains] = useState(false);

  const [origTokenName, setOrigTokenName] = useState("");
  const [origExpirationDate, setOrigExpirationDate] = useState(null);
  const [origSelectedDevices, setOrigSelectedDevices] = useState([]);
  const [origDomainSites, setOrigDomainSites] = useState([""]);

  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

  useEffect(() => {
    try {
      const storedProjectId = localStorage.getItem("project_id");
      if (storedProjectId) {
        setProjectID(parseInt(storedProjectId));
      } else {
        navigate("/projects");
        return;
      }

      const fromState = state?.access_key_id;
      const parsedParam = paramAccessKeyId ? parseInt(paramAccessKeyId) : null;
      setAccessKeyId(fromState ?? parsedParam ?? null);
    } catch (err) {
      console.log(err);
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!accessKeyId || projectID === -1) return;
      setLoading(true);
      try {
        const res = await accessTokenService.getAccessKeyById(accessKeyId);
        const data = res.data;

        const name = data.access_key_name ?? "";
        const exp = data.expiration_date ?? null;
        const lastUse = data.access_key_last_use_time ?? null;
        const isExp = Boolean(data.is_expired);
        const devs = Array.isArray(data.device_ids) ? data.device_ids : [];
        const domainsArr =
          Array.isArray(data.access_key_domain_names) &&
            data.access_key_domain_names.length > 0
            ? data.access_key_domain_names
            : [""];

        setTokenName(name);
        setExpirationDate(exp);
        setLastUseTime(lastUse);
        setIsExpired(isExp);
        setSelectedDevices(devs);
        setDomainSites(domainsArr);

        setOrigTokenName(name);
        setOrigExpirationDate(exp);
        setOrigSelectedDevices(devs);
        setOrigDomainSites(domainsArr);

        const devRes = await accessTokenService.getDevicesByProjectId(
          projectID
        );
        setDevices(devRes.data || []);
      } catch (err) {
        const msg = err.response?.data?.message;
        switch (err.response?.status) {
          case 401:
            toast.error("Your Session Has Expired! Please Login Again!");
            navigate("/login");
            break;
          case 403:
            toast.error(msg || "You Are Not Authorized!");
            navigate("/login");
            break;
          case 404:
            toast.error(msg || "Access key not found");
            navigate("/accesstoken", { state: { project_id: projectID } });
            break;
          default:
            toast.error(msg || "Failed to load access key details");
            navigate("/accesstoken", { state: { project_id: projectID } });
            break;
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accessKeyId, projectID, navigate]);

  const handleDeviceToggle = (deviceId) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleSelectAllDevices = () => {
    if (selectedDevices.length === devices.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(devices.map((d) => d.device_id));
    }
  };

  const handleSiteChange = (index, value) => {
    const updated = [...domainSites];
    updated[index] = value;
    setDomainSites(updated);
  };

  const handleAddSite = () => {
    setDomainSites((prev) => [...prev, ""]);
  };

  const handleRemoveSite = (index) => {
    setDomainSites((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveDevice = (deviceId) => {
    setSelectedDevices((prev) => prev.filter((id) => id !== deviceId));
  };

  const handleAddDevice = (deviceId) => {
    setSelectedDevices((prev) => [...prev, deviceId]);
  };

  const toggleShowAllDevices = () => {
    setShowAllDevices((prev) => !prev);
  };

  const toggleShowAllDomains = () => {
    setShowAllDomains((prev) => !prev);
  };

  const handleCancel = () => {
    navigate("/accesstoken", { state: { project_id: projectID } });
  };

  const handleDeleteClick = () => {
    setIsDeletePopupOpen(true);
  };

  const handleCloseDeletePopup = () => {
    setIsDeletePopupOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!accessKeyId) return;
    setIsDeletePopupOpen(false);
    setLoading(true);
    try {
      const response = await accessTokenService.deleteAccessKey(accessKeyId);
      if (response.status === 200) {
        toast.success("Token deleted successfully");
        navigate("/accesstoken", { state: { project_id: projectID } });
      }
    } catch (err) {
      toast.error("Failed to delete token");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateToken = async () => {
    if (!accessKeyId) return;

    // Filter out empty domain sites
    const validDomains = domainSites.filter((s) => (s || "").trim() !== "");
    const origValidDomains = origDomainSites.filter((s) => (s || "").trim() !== "");

    // Check if there are any changes
    const hasNameChange = tokenName !== origTokenName;

    const hasDeviceChange =
      selectedDevices.length !== origSelectedDevices.length ||
      selectedDevices.some((id) => !origSelectedDevices.includes(id));

    const hasDomainsChange =
      validDomains.length !== origValidDomains.length ||
      validDomains.some((domain) => !origValidDomains.includes(domain));

    if (!hasNameChange && !hasDeviceChange && !hasDomainsChange) {
      toast.info("No changes to save");
      return;
    }

    setLoading(true);
    try {
      const updateData = {};

      if (hasNameChange) {
        updateData.access_key_name = tokenName;
      }
      if (hasDomainsChange) {
        updateData.domain_name_array = validDomains;
      }
      if (hasDeviceChange) {
        updateData.device_id_array = selectedDevices;
      }

      const response = await accessTokenService.updateAccessKey(
        accessKeyId,
        updateData
      );

      if (response.status === 200) {
        toast.success("Access token updated successfully!");
        setOrigTokenName(tokenName);
        setOrigSelectedDevices([...selectedDevices]);
        setOrigDomainSites([...validDomains]);
        setDomainSites(validDomains.length > 0 ? validDomains : [""]);
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      switch (err.response?.status) {
        case 400:
          toast.error(msg || "Invalid request. Please check your inputs.");
          break;
        case 401:
          toast.error("Your Session Has Expired! Please Login Again!");
          navigate("/login");
          break;
        case 403:
          toast.error(msg || "You are not authorized to update this token.");
          break;
        case 404:
          toast.error(msg || "Access token or device not found.");
          break;
        default:
          toast.error(msg || "Failed to update access token.");
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const toInputDate = (d) => {
    try {
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "";
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const dd = String(dt.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return "";
    }
  };

  return (
    <SidebarLayout
      active={6}
      breadcrumb={`${localStorage.getItem(
        "project"
      )} > Access Tokens > Settings`}
    >
      <div className="px-7 sm:px-10 mb-28">
        <h1 className="text-2xl font-semibold text-green">Token Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <div className="text-m text-gray2 font-semibold mt-6">
              General Settings
            </div>

            <div className="flex flex-row mt-1 my-4">
              <div className="flex flex-col w-1/4 md:w-1/6">
                <div className="text-sm md:text-md text-gray1 font-semibold mt-2">
                  Token Name
                </div>
              </div>
              <TextBox
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                type="text"
                placeholder="Token name"
                maxLength={50}
                textAlign="left"
                width="w-2/3 md:w-1/3"
              />
            </div>

            <div className="flex flex-row mt-4 my-4">
              <div className="flex flex-col w-1/4 md:w-1/6">
                <div className="text-sm md:text-md text-gray1 font-semibold mt-2">
                  Expiration Date
                </div>
              </div>
              <TextBox
                value={expirationDate ? toInputDate(expirationDate) : ""}
                onChange={(e) => setExpirationDate(e.target.value)}
                type="date"
                placeholder="Select date"
                textAlign="left"
                width="w-2/3 md:w-1/4"
                disabled
              />
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col items-stretch -mt-2">
            <div className="w-full">
              <InsightCard
                title={isExpired ? "Expired" : "Active"}
                subtitle="Current status of Token"
                icon={FaCheck}
                textSize="lg"
                variant={isExpired ? "danger" : "default"}
              />
            </div>

            {isExpired && (
              <div className="mt-3 w-full mx-12">
                <PillButton
                  text="Extend Expiration Date"
                  onClick={() => setShowRenewPopup(true)}
                  icon={FaCog}
                />
                {showRenewPopup && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-black2 rounded-xl p-6 w-full max-w-md shadow-lg relative">
                      <div className="flex items-center mb-4">
                        <FaCalendarAlt className="text-green mr-2" />
                        <span className="text-green font-semibold text-lg">Extend Expiration Date</span>
                      </div>
                      <div className="mb-4">
                        <label className="block text-gray2 text-sm mb-1">Expiration</label>
                        <SelectBox value={renewDuration} onChange={e => setRenewDuration(Number(e.target.value))} width="w-full" mt="mt-0">
                          {expirationOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label} ({getExpirationDate(option.value)})
                            </option>
                          ))}
                        </SelectBox>
                        <p className="text-gray1 text-xs mt-1">The token will expire on the selected date</p>
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <button
                          className="absolute top-3 right-3 text-gray2 hover:text-green text-xl focus:outline-none"
                          onClick={() => setShowRenewPopup(false)}
                          aria-label="Close"
                        >
                          <FaTimes />
                        </button>
                        <PillButton
                          text="Update & Save"
                          onClick={async () => {
                            setLoading(true);
                            try {
                              const res = await accessTokenService.renewAccessKey(accessKeyId, renewDuration);
                              if (res.data && res.data.success) {
                                toast.success('Expiration extended!');
                                setShowRenewPopup(false);
                                setTimeout(() => navigate('/accesstoken', { state: { project_id: projectID } }), 1200);
                              } else {
                                toast.error('Failed to renew expiration.');
                              }
                            } catch (err) {
                              toast.error('Failed to renew expiration.');
                            } finally {
                              setLoading(false);
                            }
                          }}
                          isPopup={true}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 w-full mx-12">
              <PillButton
                text="Delete Access Token"
                onClick={handleDeleteClick}
                color="red"
                icon={FaTrash}
              />
            </div>
          </div>

          <div className="col-span-1 lg:col-span-3">
            <div className="border-t border-gray1 border-opacity-80 w-full"></div>
          </div>

          <div className="col-span-1 lg:col-span-3">
            <div className="text-gray2 text-base font-semibold mx-2 mb-4">
              Critical Settings
            </div>

            <div className="mx-4 mb-6 ">
              <div className="text-sm text-gray2 font-semibold mb-2">
                Devices
              </div>
              <div className="space-y-2">
                {(() => {
                  const selectedList = devices.filter((d) =>
                    selectedDevices.includes(d.device_id)
                  );
                  const unselectedList = devices.filter(
                    (d) => !selectedDevices.includes(d.device_id)
                  );
                  const visibleSelected = showAllDevices
                    ? selectedList
                    : selectedList.slice(0, 2);

                  if (visibleSelected.length === 0 && !showAllDevices) {
                    return (
                      <div className="text-gray1 text-sm py-3">
                        No devices selected
                      </div>
                    );
                  }

                  return (
                    <>
                      {visibleSelected.map((d) => (
                        <RectangularCard
                          key={d.device_id}
                          title={d.device_name}
                          subtitle={
                            <span className="flex items-center gap-2">
                              Remove
                              <span
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveDevice(d.device_id);
                                }}
                              >
                                <GreenTrashIcon />
                              </span>
                            </span>
                          }
                        />
                      ))}
                      {showAllDevices &&
                        unselectedList.map((d) => (
                          <RectangularCard
                            key={d.device_id}
                            title={<span className="text-gray1">{d.device_name}</span>}
                            subtitle="Add"
                            icon={GreenPlusIcon}
                            onClick={() => handleAddDevice(d.device_id)}
                          />
                        ))}
                    </>
                  );
                })()}
              </div>
              <div className="flex justify-center my-3">
                <button
                  onClick={toggleShowAllDevices}
                  className="flex items-center gap-2 px-6 py-2 rounded-full border border-green text-green text-sm font-medium hover:bg-green hover:bg-opacity-10 transition-colors"
                >
                  All Devices
                  {showAllDevices ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
            </div>

            <div className="mx-4 mb-10">
              <DomainSitesInput
                domainSites={domainSites}
                onSiteChange={handleSiteChange}
                onAddSite={handleAddSite}
                onRemoveSite={handleRemoveSite}
              />
            </div>

            <div className="flex items-center justify-between mx-4 mt-10">
              <PillButton text="Cancel" onClick={handleCancel} />
              <PillButton
                text="Update & Save"
                onClick={handleUpdateToken}
              />
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-center" theme="dark" />
      <Spinner isVisible={loading} />

      {/* Delete Confirmation Popup */}
      <DeleteConfirmationPopup
        isOpen={isDeletePopupOpen}
        onClose={handleCloseDeletePopup}
        onConfirm={handleConfirmDelete}
        title="Delete Access Token"
        itemName={tokenName || "this token"}
        warningMessage="This action cannot be undone. Any applications using this token will lose access."
      />
    </SidebarLayout>
  );
};

export default AccessTokenDetails;