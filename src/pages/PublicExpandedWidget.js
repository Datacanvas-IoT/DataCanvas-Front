import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaShareAlt, FaArrowLeft } from "react-icons/fa";
import PublicExpandedChart from '../components/Widgets/PublicExpandedChart';
import PublicExpandedTable from '../components/Widgets/PublicExpandedTable';
import Spinner from "../components/Spinner";

/**
 * PublicExpandedWidget - Expanded view for charts and tables in shared dashboards
 * Accessible via /public/dashboard/:shareToken/expand without authentication
 */
function PublicExpandedWidget() {
    const { shareToken } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [widget, setWidget] = useState(null);
    const [shareName, setShareName] = useState('');

    useEffect(() => {
        try {
            if (state?.widget) {
                setWidget(state.widget);
                setShareName(state.shareName || 'Shared Dashboard');
            } else {
                toast.error('Widget data not found');
                navigate(`/public/dashboard/${shareToken}`);
            }
        } catch (err) {
            console.error(err);
            navigate(`/public/dashboard/${shareToken}`);
        }
    }, [state, shareToken, navigate]);

    const handleBack = () => {
        navigate(`/public/dashboard/${shareToken}`);
    };

    if (!widget) {
        return (
            <div className="min-h-screen bg-black2 flex items-center justify-center">
                <Spinner isVisible={true} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black2">
            {/* Header */}
            <header className="bg-black3 border-b border-gray1 border-opacity-40 py-4 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={handleBack}
                            className="text-gray1 hover:text-green transition p-2"
                            title="Back to dashboard"
                        >
                            <FaArrowLeft className="text-xl" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <FaShareAlt className="text-green text-xl" />
                            <div>
                                <h1 className="text-gray2 font-semibold">
                                    {widget.widget_name}
                                </h1>
                                <p className="text-gray1 text-sm">
                                    {shareName}
                                </p>
                            </div>
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
                <div className="px-2 sm:px-10 mt-4 mb-24 h-screen pb-60">
                    <div className="flex flex-row justify-between mb-4">
                        <span className="text-lg font-semibold text-gray2">{widget.widget_name}</span>
                    </div>

                    {/* Expanded widget component based on type */}
                    {widget.widget_type === 1 ? (
                        <PublicExpandedChart 
                            widget={widget} 
                            shareToken={shareToken}
                            setLoading={setLoading} 
                        />
                    ) : widget.widget_type === 2 ? (
                        <PublicExpandedTable 
                            widget={widget} 
                            shareToken={shareToken}
                            setLoading={setLoading} 
                        />
                    ) : (
                        <div className="text-center py-16 text-gray1">
                            <p>This widget type does not support expanded view</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-black3 border-t border-gray1 border-opacity-40 py-3 px-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray1">
                    <span>Powered by DataCanvas IoT</span>
                    <span>Shared Dashboard - View Only</span>
                </div>
            </footer>

            {/* Spinner */}
            <Spinner isVisible={loading} />

            {/* Toast container */}
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
        </div>
    );
}

export default PublicExpandedWidget;
