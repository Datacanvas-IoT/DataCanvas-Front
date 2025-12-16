import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import AddWidgetPopup from "./AddWidgetPopup";
import AddChartWidgetPopup from "./AddChartWidgetPopup";
import AddParameterTablePopup from "./AddParameterTablePopup";
import AddToggleWidgetPopup from "./AddToggleWidgetPopup";
import AddGaugeWidgetPopup from "./AddGaugeWidgetPopup";
import AddMetricWidgetPopup from "./AddMetricWidgetPopup";
import axios from "axios";

const AddWidgetContainer = ({
    isOpen,
    closeFunction,
    tables = [],
    setLoading,
    devices,
    projectID,
    loadWidgets,
    type = 0, // 0: Add Widget, 1: Edit Widget
    selectedWidget = {} // Widget details if type is 1
}) => {
    /*
        * State to manage the visibility of various popups
        * 1: Add Widget Popup
        * 2: Add Chart Widget Popup
        * 3: Add Parameter Table Popup
        * 4: Add Toggle Widget Popup
        * 5: Add Gauge Widget Popup
    */
    const [visiblePopup, setVisiblePopup] = useState(1);
    const togglePopup = async () => {
        if (widgetType == 0 || dataset == 0 || widgetName.trim == '') {
            toast.error('Please fill all the fields');
            return;
        }

        if (type == 1) {
            if (widgetType != selectedWidget.widget_type || dataset != selectedWidget.dataset) {

            }
        }

        let columnLoadingResult = await loadColumns(dataset);
        if (!columnLoadingResult) {
            closePopup();
            return;
        }

        setVisiblePopup(Number(widgetType) + 1);
    }
    /*
        * Function to close the popup
        * This function will; unmount component and reset all states to default
    */
    const closePopup = () => {
        setVisiblePopup(1);
        setWidgetName('');
        setWidgetType(0);
        setDataset(0);
        closeFunction();
    }

    // ---------- States for widget name, widget type and dataset ----------
    const [widgetName, setWidgetName] = useState('');
    const [widgetType, setWidgetType] = useState(0);
    const [dataset, setDataset] = useState(0);

    // ---------- State to store configuration of the selected widget after configuring ----------
    const [configuration, setConfiguration] = useState({});

    // ---------- State to store columns of the selected dataset ----------
    const [columns, setColumns] = useState([]);

    const loadColumns = (tbl_id) => {
        return new Promise((resolve, reject) => {
            setLoading(true);
            const token = localStorage.getItem('auth-token');
            axios.get(`${process.env.REACT_APP_API_URL}/data/clm?tbl_id=` + tbl_id, {
                headers: {
                    'authorization': token
                }
            })
                .then(res => {
                    res.data.sort((a, b) => (a.clm_id > b.clm_id) ? 1 : -1);
                    setColumns(res.data);
                    setLoading(false);
                    resolve(true);
                })
                .catch(err => {
                    setLoading(false);
                    console.log(err);
                    switch (err.response.status) {
                        case 401 || 403:
                            toast.error('Unauthorized access! Please login again');
                            break;
                        default:
                            console.log('Error in getting table column details');
                            toast.error('Error in getting table column details');
                            break;
                    }
                    reject(false);
                });
        });
    }

    const addWidget = async (configuration) => {
        if (widgetType == 0 || dataset == 0 || widgetName.trim() == '') {
            toast.error('Please fill all the fields');
            return;
        }

        if (Object.keys(configuration).length == 0) {
            toast.error('Please configure the widget');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('auth-token');
            let response = await axios.post(`${process.env.REACT_APP_API_URL}/widget`,
                {
                    widget_name: widgetName,
                    widget_type: widgetType,
                    dataset: dataset,
                    project_id: projectID,
                    configuration: configuration
                },
                {
                    headers: {
                        'authorization': token
                    }
                })

            if (response.status == 200) {
                toast.success('Widget added successfully');
                loadWidgets();
                closePopup();
            }

            setLoading(false);
        } catch (err) {
            setLoading(false);
            console.log(err);
            switch (err.response.status) {
                case 401 || 403:
                    toast.error('Unauthorized access! Please login again');
                    break;
                default:
                    toast.error('Something Went Wrong');
                    break;
            }
        }
    }

    /*
        * API Endpoint: ${process.env.REACT_APP_API_URL}/widget
        * Method: PUT
        * Function to update the widget
        * @param {Object} configuration - Configuration of the widget
        * @returns {void}
    */
    const updateWidget = async (configuration) => {
        if (widgetType == 0 || dataset == 0 || widgetName.trim() == '') {
            toast.error('Please fill all the fields');
            return;
        }

        if (Object.keys(configuration).length == 0) {
            toast.error('Please configure the widget');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('auth-token');
            let response = await axios.put(`${process.env.REACT_APP_API_URL}/widget`,
                {
                    widget_id: selectedWidget.id,
                    widget_name: widgetName,
                    widget_type: widgetType,
                    dataset: dataset,
                    project_id: projectID,
                    configuration: configuration
                },
                {
                    headers: {
                        'authorization': token
                    }
                })

            if (response.status == 200) {
                toast.success('Widget updated successfully');
                loadWidgets();
                closePopup();
            }
        } catch (err) {
            setLoading(false);
            console.log(err);
            switch (err.response.status) {
                case 401 || 403:
                    toast.error('Unauthorized access! Please login again');
                    break;
                case 404:
                    toast.error('Widget not found');
                    break;
                default:
                    toast.error('Something Went Wrong');
                    break;
            }
        }

    }

    const renderPopup = () => {
        switch (visiblePopup) {
            case 1:
                return (
                    <AddWidgetPopup
                        isOpen={isOpen}
                        closeFunction={closePopup}
                        tables={tables}
                        widgetName={widgetName}
                        setWidgetName={setWidgetName}
                        widgetType={widgetType}
                        setWidgetType={setWidgetType}
                        dataset={dataset}
                        setDataset={setDataset}
                        nextFunction={togglePopup}
                        type={type}
                        currentWidget={selectedWidget}
                    />
                );
            case 2:
                return (
                    <AddChartWidgetPopup
                        isOpen={isOpen}
                        closeFunction={closePopup}
                        columns={columns}
                        devices={devices}
                        configuration={configuration}
                        setConfiguration={setConfiguration}
                        submitFunction={(type == 0 ? addWidget : updateWidget)}
                        type={type}
                        oldWidget={type == 1 ? selectedWidget : {}}
                    />
                );
            case 3:
                return (
                    <AddParameterTablePopup
                        isOpen={isOpen}
                        closeFunction={closePopup}
                        columns={columns}
                        devices={devices}
                        configuration={configuration}
                        setConfiguration={setConfiguration}
                        submitFunction={(type == 0 ? addWidget : updateWidget)}
                        type={type}
                        oldWidget={type == 1 ? selectedWidget : {}}
                    />
                );
            case 4:
                return (
                    <AddToggleWidgetPopup
                        isOpen={isOpen}
                        closeFunction={closePopup}
                        columns={columns}
                        devices={devices}
                        configuration={configuration}
                        setConfiguration={setConfiguration}
                        submitFunction={(type == 0 ? addWidget : updateWidget)}
                        type={type}
                        oldWidget={type == 1 ? selectedWidget : {}}
                    />
                );
            case 5:
                return (
                    <AddGaugeWidgetPopup
                        isOpen={isOpen}
                        closeFunction={closePopup}
                        columns={columns}
                        devices={devices}
                        configuration={configuration}
                        setConfiguration={setConfiguration}
                        submitFunction={(type == 0 ? addWidget : updateWidget)}
                        type={type}
                        oldWidget={type == 1 ? selectedWidget : {}}
                    />
                );
            case 6:
                return (
                    <AddMetricWidgetPopup
                        isOpen={isOpen}
                        closeFunction={closePopup}
                        columns={columns}
                        devices={devices}
                        configuration={configuration}
                        setConfiguration={setConfiguration}
                        submitFunction={(type == 0 ? addWidget : updateWidget)}
                        type={type}
                        oldWidget={type == 1 ? selectedWidget : {}}
                    />
                );
            default:
                return null;
        }
    }

    return (
        <>
            {renderPopup()}
        </>
    )
}

// default props
AddWidgetContainer.defaultProps = {
    isOpen: false,
    closeFunction: () => { }
}

export default AddWidgetContainer;
