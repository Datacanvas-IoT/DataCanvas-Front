import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaShareAlt, FaExclamationTriangle } from "react-icons/fa";
import { ScaleLoader } from "react-spinners";
import shareService from '../services/shareService';
import DashboardChartCard from '../components/cards/DashboardChartCard';
import DashboardTableCard from '../components/cards/DashboardTableCard';
import DashboardToggleCard from '../components/cards/DashboardToggleCard';
import DashboardGaugeCard from '../components/cards/DashboardGaugeCard';
import DashboardMetricCard from '../components/cards/DashboardMetricCard';

/**
 * PublicDashboard - A read-only view of shared dashboard widgets
 * Accessible via /public/dashboard/:shareToken without authentication
 */
function PublicDashboard() {
    const { shareToken } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [widgets, setWidgets] = useState([]);

    // Polling interval for real-time data updates (in milliseconds)
    const POLLING_INTERVAL = 30000; // 30 seconds

    /**
     * Load the public dashboard data
     */
    const loadPublicDashboard = useCallback(async () => {
        try {
            const response = await shareService.getPublicDashboard(shareToken);
            
            if (response.data.success) {
                setDashboardData({
                    shareName: response.data.share_name,
                    projectName: response.data.project.project_name,
                });
                setWidgets(response.data.widgets);
                setError(null);
            }
        } catch (err) {
            console.error('Error loading public dashboard:', err);
            
            if (err.response?.status === 404) {
                setError({
                    title: 'Dashboard Not Found',
                    message: 'This shared dashboard does not exist or has expired.',
                });
            } else {
                setError({
                    title: 'Error Loading Dashboard',
                    message: 'Unable to load the dashboard. Please try again later.',
                });
            }
        } finally {
            setLoading(false);
        }
    }, [shareToken]);

    useEffect(() => {
        if (shareToken) {
            loadPublicDashboard();
        } else {
            setError({
                title: 'Invalid Link',
                message: 'The share link is invalid.',
            });
            setLoading(false);
        }
    }, [shareToken, loadPublicDashboard]);

    /**
     * Custom widget data loader for public dashboard
     * This replaces the authenticated API calls in the widget cards
     */
    const createPublicDataLoader = (widgetType, widgetId) => {
        switch (widgetType) {
            case 3: // Toggle
                return async () => {
                    const response = await shareService.getPublicToggleData(shareToken, widgetId);
                    return response.data;
                };
            case 4: // Gauge
                return async () => {
                    const response = await shareService.getPublicGaugeData(shareToken, widgetId);
                    return response.data;
                };
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black2 flex flex-col items-center justify-center">
                <ScaleLoader color="#3ECF8E" loading={true} size={50} />
                <p className="text-gray2 mt-4">Loading shared dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black2 flex flex-col items-center justify-center p-4">
                <div className="bg-black3 rounded-2xl border border-gray1 border-opacity-60 p-8 max-w-md text-center">
                    <FaExclamationTriangle className="text-5xl text-red mx-auto mb-4" />
                    <h1 className="text-xl text-gray2 font-semibold mb-2">{error.title}</h1>
                    <p className="text-gray1 mb-6">{error.message}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-green text-black3 rounded-full font-medium hover:bg-opacity-80 transition"
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black2">
            {/* Header */}
            <header className="bg-black3 border-b border-gray1 border-opacity-40 py-4 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <FaShareAlt className="text-green text-xl" />
                        <div>
                            <h1 className="text-gray2 font-semibold">
                                {dashboardData?.shareName || 'Shared Dashboard'}
                            </h1>
                            <p className="text-gray1 text-sm">
                                {dashboardData?.projectName}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray1 bg-gray1 bg-opacity-20 px-3 py-1 rounded-full">
                            Read-only View
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
                {widgets.length === 0 ? (
                    <div className="text-center py-16">
                        <FaShareAlt className="text-5xl text-gray1 mx-auto mb-4 opacity-50" />
                        <p className="text-gray1">No widgets available in this shared dashboard</p>
                    </div>
                ) : (
                    <div className={`flex-wrap flex ${widgets.length < 3 ? 'justify-start' : 'justify-center'}`}>
                        {widgets.map((widget, index) => {
                            const commonProps = {
                                key: index,
                                widget: widget,
                                readOnly: true,
                                deleteWidget: () => {},
                                updateWidget: () => {},
                            };

                            switch (widget.widget_type) {
                                case 1: // Chart
                                    return (
                                        <DashboardChartCard
                                            {...commonProps}
                                            onClick={() => {
                                                navigate(`/public/dashboard/${shareToken}/expand`, {
                                                    state: { 
                                                        widget: widget,
                                                        shareName: dashboardData?.shareName 
                                                    }
                                                });
                                            }}
                                        />
                                    );
                                case 2: // Table
                                    return (
                                        <DashboardTableCard
                                            {...commonProps}
                                            onClick={() => {
                                                navigate(`/public/dashboard/${shareToken}/expand`, {
                                                    state: { 
                                                        widget: widget,
                                                        shareName: dashboardData?.shareName 
                                                    }
                                                });
                                            }}
                                        />
                                    );
                                case 3: // Toggle
                                    return (
                                        <PublicToggleCard
                                            {...commonProps}
                                            shareToken={shareToken}
                                        />
                                    );
                                case 4: // Gauge
                                    return (
                                        <PublicGaugeCard
                                            {...commonProps}
                                            shareToken={shareToken}
                                        />
                                    );
                                case 5: // Metric
                                    return (
                                        <PublicMetricCard
                                            {...commonProps}
                                            shareToken={shareToken}
                                        />
                                    );
                                default:
                                    return null;
                            }
                        })}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-black3 border-t border-gray1 border-opacity-40 py-3 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray1">
                    <span>Powered by DataCanvas IoT</span>
                    <span>Data updates every 30 seconds</span>
                </div>
            </footer>

            {/* Toast container for notifications */}
            <ToastContainer
                position="bottom-center"
                hideProgressBar={true}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
        </div>
    );
}

/**
 * PublicToggleCard - Toggle widget wrapper that uses public API
 */
function PublicToggleCard({ widget, shareToken, readOnly }) {
    const [loading, setLoading] = useState(true);
    const [toggleState, setToggleState] = useState(false);

    useEffect(() => {
        loadToggleData();
        // Set up polling for updates
        const interval = setInterval(loadToggleData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadToggleData = async () => {
        try {
            const response = await shareService.getPublicToggleData(shareToken, widget.id);
            if (response.data && widget.configuration?.Column?.clm_name) {
                setToggleState(response.data[widget.configuration.Column.clm_name]);
            }
        } catch (error) {
            console.error('Error loading toggle data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Modify widget to include loaded toggle state
    const modifiedWidget = {
        ...widget,
        _publicToggleState: toggleState,
        _publicLoading: loading,
    };

    return (
        <DashboardToggleCard
            widget={modifiedWidget}
            readOnly={readOnly}
            deleteWidget={() => {}}
            updateWidget={() => {}}
        />
    );
}

/**
 * PublicGaugeCard - Gauge widget wrapper that uses public API
 */
function PublicGaugeCard({ widget, shareToken, readOnly }) {
    const [loading, setLoading] = useState(true);
    const [gaugeValue, setGaugeValue] = useState(widget.configuration?.min_value || 0);

    useEffect(() => {
        loadGaugeData();
        // Set up polling for updates
        const interval = setInterval(loadGaugeData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadGaugeData = async () => {
        try {
            const response = await shareService.getPublicGaugeData(shareToken, widget.id);
            if (response.data && widget.configuration?.Column?.clm_name) {
                setGaugeValue(response.data[widget.configuration.Column.clm_name]);
            }
        } catch (error) {
            console.error('Error loading gauge data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardGaugeCard
            widget={widget}
            readOnly={readOnly}
            deleteWidget={() => {}}
            updateWidget={() => {}}
            publicData={loading ? null : { value: gaugeValue }}
        />
    );
}

/**
 * PublicMetricCard - Metric widget wrapper that uses public API
 */
function PublicMetricCard({ widget, shareToken, readOnly }) {
    const [loading, setLoading] = useState(true);
    const [metricData, setMetricData] = useState({ value: null, created_at: null });

    useEffect(() => {
        loadMetricData();
        // Set up polling for updates
        const interval = setInterval(loadMetricData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadMetricData = async () => {
        try {
            const response = await shareService.getPublicMetricData(shareToken, widget.id);
            if (response.data) {
                setMetricData({
                    value: response.data.value,
                    created_at: response.data.created_at,
                });
            }
        } catch (error) {
            console.error('Error loading metric data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardMetricCard
            widget={widget}
            readOnly={readOnly}
            deleteWidget={() => {}}
            updateWidget={() => {}}
            publicData={loading ? null : metricData}
        />
    );
}

export default PublicDashboard;
