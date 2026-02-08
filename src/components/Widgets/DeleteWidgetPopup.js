import { useState } from "react";
import { FaTrash, FaWindowClose } from "react-icons/fa";
import { toast } from "react-toastify";
import PopupContainer from "../PopupContainer";
import PillButton from "../input/PillButton";
import axios from "axios";
import config from "../../config";

const DeleteWidgetPopup = ({
    widget,
    widgets,
    setWidgets,
    isDeleteWidgetPopupVisible,
    setSelectedWidget,
    setLoading,
    navigate
}) => {
    const deleteWidget = async () => {
        setLoading(true);
        try {
            const response = await axios.delete(
                `${config.REACT_APP_API_URL}/widget`,
                {
                    headers: {
                        authorization: localStorage.getItem("auth-token"),
                    },
                    data: {
                        widget_id: widget.id,
                    },
                }
            );

            if (response.status == 200) {
                setWidgets(widgets.filter(widgetItem => widgetItem.id != widget.id));
                setSelectedWidget(null);
                toast.success("Widget deleted successfully!");
            }
            setLoading(false);
        } catch (err) {
            console.log(err);
            switch (err.response.status) {
                case 400:
                    toast.error("Bad request!");
                    break;
                case 401:
                    toast.error("Unauthorized access!");
                    navigate('/login');
                    break;
                case 403:
                    toast.error("Unauthorized access!");
                    navigate('/login');
                    break;
                case 404:
                    toast.error("Widget not found!");
                    navigate('/dashboard');
                    break;
                default:
                    toast.error("Something went wrong!");
                    break;
            }
            setLoading(false);
        }
    }

    return (
        <PopupContainer isOpen={isDeleteWidgetPopupVisible}
            onClose={() => { }}
            closeFunction={() => setSelectedWidget(null)}
            Icon={FaTrash}
            title={'Delete Widget'}
            closeIconVisible={true}
            width={'550px'}>
            <div className="text-center mt-4 px-4 text-gray2 text-md">
                Are you sure want to delete widget {widget.widget_name}?
            </div>
            <div className="text-center mt-4 px-4 text-red text-sm">
                This action cannot be undone and this will affect existing dashboard configurations
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center mt-6 space-x-0 sm:space-x-4 space-y-4 sm:space-y-0">
                <PillButton text={'No, Cancel'} onClick={() => { setSelectedWidget(null) }} icon={FaWindowClose} isPopup={true} />
                <PillButton text={'Yes, Delete'} onClick={() => { deleteWidget() }} icon={FaTrash} isPopup={true} color={'red'} />
            </div>
        </PopupContainer>
    )
};

export default DeleteWidgetPopup;
