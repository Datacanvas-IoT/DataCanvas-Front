import React, { useState, useEffect } from "react";
import { FaShareAlt, FaCopy, FaTrash, FaPencilAlt, FaCheck, FaPlus, FaTimes } from "react-icons/fa";
import PopupContainer from "./PopupContainer";
import PillButton from "./input/PillButton";
import shareService from "../services/shareService";
import { toast } from "react-toastify";
import { ScaleLoader } from "react-spinners";

const ShareDashboardPopup = ({
    isOpen,
    onClose,
    projectId,
    widgets = []
}) => {
    const [loading, setLoading] = useState(false);
    const [shares, setShares] = useState([]);
    const [selectedWidgets, setSelectedWidgets] = useState([]);
    const [shareName, setShareName] = useState("");
    const [editingShare, setEditingShare] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [copiedToken, setCopiedToken] = useState(null);

    useEffect(() => {
        if (isOpen && projectId) {
            loadShares();
        }
    }, [isOpen, projectId]);

    const loadShares = async () => {
        setLoading(true);
        try {
            const response = await shareService.getSharesByProjectId(projectId);
            if (response.data.success) {
                setShares(response.data.shares);
            }
        } catch (error) {
            toast.error("Failed to load shared dashboards");
            console.error("Error loading shares:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleWidgetToggle = (widgetId) => {
        setSelectedWidgets(prev => {
            if (prev.includes(widgetId)) {
                return prev.filter(id => id !== widgetId);
            } else {
                return [...prev, widgetId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedWidgets.length === widgets.length) {
            setSelectedWidgets([]);
        } else {
            setSelectedWidgets(widgets.map(w => w.id));
        }
    };

    const handleCreateShare = async () => {
        if (selectedWidgets.length === 0) {
            toast.error("Please select at least one widget to share");
            return;
        }

        setLoading(true);
        try {
            const response = await shareService.createShare({
                project_id: projectId,
                allowed_widget_ids: selectedWidgets,
                share_name: shareName || `Share ${new Date().toLocaleDateString()}`
            });

            if (response.data.success) {
                toast.success("Share link created successfully!");
                setShares(prev => [response.data.share, ...prev]);
                setSelectedWidgets([]);
                setShareName("");
                setShowCreateForm(false);

                // Copy to clipboard - handle separately to avoid triggering the catch block
                try {
                    const shareUrl = shareService.generateShareUrl(response.data.share.share_token);
                    await navigator.clipboard.writeText(shareUrl);
                    toast.info("Share link copied to clipboard!");
                } catch (clipboardError) {
                    console.error("Failed to copy to clipboard:", clipboardError);
                    // Don't show error toast as the share was still created successfully
                }
            }
        } catch (error) {
            toast.error("Failed to create share link");
            console.error("Error creating share:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleupdateSharedDashboard = async () => {
        if (!editingShare) return;

        if (selectedWidgets.length === 0) {
            toast.error("Please select at least one widget to share");
            return;
        }

        setLoading(true);
        try {
            const response = await shareService.updateSharedDashboard({
                share_id: editingShare.share_id,
                allowed_widget_ids: selectedWidgets,
                share_name: shareName
            });

            if (response.data.success) {
                toast.success("Share updated successfully!");
                setShares(prev => prev.map(s =>
                    s.share_id === editingShare.share_id ? response.data.share : s
                ));
                setEditingShare(null);
                setSelectedWidgets([]);
                setShareName("");
            }
        } catch (error) {
            toast.error("Failed to update share");
            console.error("Error updating share:", error);
        } finally {
            setLoading(false);
        }
    };

    const handledeleteSharedDashboard = async (shareId) => {
        if (!window.confirm("Are you sure you want to revoke this share link? Anyone with the link will no longer be able to view the dashboard.")) {
            return;
        }

        setLoading(true);
        try {
            const response = await shareService.deleteSharedDashboard(shareId);
            if (response.data.success) {
                toast.success("Share link revoked successfully!");
                setShares(prev => prev.filter(s => s.share_id !== shareId));
            }
        } catch (error) {
            toast.error("Failed to revoke share link");
            console.error("Error deleting share:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async (shareToken) => {
        const shareUrl = shareService.generateShareUrl(shareToken);
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopiedToken(shareToken);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopiedToken(null), 2000);
        } catch (error) {
            toast.error("Failed to copy link");
        }
    };

    const handleEditShare = (share) => {
        setEditingShare(share);
        setSelectedWidgets(share.allowed_widget_ids);
        setShareName(share.share_name);
        setShowCreateForm(true);
    };

    const handleCancelEdit = () => {
        setEditingShare(null);
        setSelectedWidgets([]);
        setShareName("");
        setShowCreateForm(false);
    };

    const getWidgetName = (widgetId) => {
        const widget = widgets.find(w => w.id === widgetId);
        return widget ? widget.widget_name : `Widget ${widgetId}`;
    };

    return (
        <PopupContainer
            isOpen={isOpen}
            onClose={onClose}
            Icon={FaShareAlt}
            title="Share Dashboard"
            closeIconVisible={true}
            closeFunction={onClose}
        >
            {loading && (
                <div className="flex justify-center py-4">
                    <ScaleLoader color="#3ECF8E" loading={true} size={30} />
                </div>
            )}

            {!loading && !showCreateForm && (
                <>
                    {/* Create New Share Button */}
                    <div className="mb-4">
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="w-full py-3 border border-dashed border-gray1 rounded-lg text-gray2 hover:border-green hover:text-green transition duration-300 flex items-center justify-center"
                        >
                            <FaPlus className="mr-2" />
                            Create New Share Link
                        </button>
                    </div>

                    {/* Existing Shares List */}
                    {shares.length > 0 && (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto">
                            <h3 className="text-sm text-gray1 mb-2">Active Share Links</h3>
                            {shares.map(share => (
                                <div
                                    key={share.share_id}
                                    className="bg-black bg-opacity-40 rounded-lg p-3 border border-gray1 border-opacity-40"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-gray2 font-medium">{share.share_name}</span>
                                            <span className={`ml-2 text-xs px-2 py-0.5 rounded ${share.is_active ? 'bg-green bg-opacity-20 text-green' : 'bg-red bg-opacity-20 text-red'}`}>
                                                {share.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleCopyLink(share.share_token)}
                                                className="text-gray1 hover:text-green transition"
                                                title="Copy link"
                                            >
                                                {copiedToken === share.share_token ? <FaCheck className="text-green" /> : <FaCopy />}
                                            </button>
                                            <button
                                                onClick={() => handleEditShare(share)}
                                                className="text-gray1 hover:text-green transition"
                                                title="Edit"
                                            >
                                                <FaPencilAlt />
                                            </button>
                                            <button
                                                onClick={() => handledeleteSharedDashboard(share.share_id)}
                                                className="text-gray1 hover:text-red transition"
                                                title="Revoke"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray1">
                                        <span>{share.allowed_widget_ids.length} widget(s) shared</span>
                                        <span className="mx-2">•</span>
                                        <span>Created {new Date(share.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="mt-2 text-xs text-gray1 flex flex-wrap gap-1">
                                        {share.allowed_widget_ids.slice(0, 3).map(id => (
                                            <span key={id} className="bg-gray1 bg-opacity-20 px-2 py-0.5 rounded">
                                                {getWidgetName(id)}
                                            </span>
                                        ))}
                                        {share.allowed_widget_ids.length > 3 && (
                                            <span className="text-gray1">+{share.allowed_widget_ids.length - 3} more</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {shares.length === 0 && (
                        <div className="text-center py-8 text-gray1">
                            <FaShareAlt className="text-4xl mx-auto mb-3 opacity-50" />
                            <p>No shared dashboards yet</p>
                            <p className="text-xs mt-1">Create a share link to let others view your dashboard</p>
                        </div>
                    )}
                </>
            )}

            {!loading && showCreateForm && (
                <>
                    {/* Share Name Input */}
                    <div className="mb-4">
                        <label className="block text-sm text-gray1 mb-1">Share Name (optional)</label>
                        <input
                            type="text"
                            value={shareName}
                            onChange={(e) => setShareName(e.target.value)}
                            placeholder="e.g., Public Dashboard, Client View"
                            className="w-full bg-black bg-opacity-40 border border-gray1 border-opacity-40 rounded-lg px-3 py-2 text-gray2 placeholder-gray1 focus:border-green focus:outline-none"
                        />
                    </div>

                    {/* Widget Selection */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm text-gray1">Select Widgets to Share</label>
                            <button
                                onClick={handleSelectAll}
                                className="text-xs text-green hover:text-gray2 transition"
                            >
                                {selectedWidgets.length === widgets.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>

                        <div className="max-h-[200px] overflow-y-auto space-y-2 bg-black bg-opacity-40 rounded-lg p-3">
                            {widgets.length === 0 ? (
                                <p className="text-gray1 text-sm text-center py-4">No widgets available</p>
                            ) : (
                                widgets.map(widget => (
                                    <label
                                        key={widget.id}
                                        className="flex items-center space-x-3 cursor-pointer hover:bg-gray1 hover:bg-opacity-10 p-2 rounded transition"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedWidgets.includes(widget.id)}
                                            onChange={() => handleWidgetToggle(widget.id)}
                                            className="form-checkbox h-4 w-4 text-green bg-black border-gray1 rounded focus:ring-green focus:ring-offset-0"
                                        />
                                        <span className="text-gray2 text-sm">{widget.widget_name}</span>
                                        <span className="text-xs text-gray1">
                                            ({widget.widget_type === 1 ? 'Chart' :
                                                widget.widget_type === 2 ? 'Table' :
                                                    widget.widget_type === 3 ? 'Toggle' :
                                                        widget.widget_type === 4 ? 'Gauge' : 'Metric'})
                                        </span>
                                    </label>
                                ))
                            )}
                        </div>
                        <p className="text-xs text-gray1 mt-1">
                            {selectedWidgets.length} of {widgets.length} widgets selected
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-4">
                        <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 text-gray1 hover:text-gray2 transition flex items-center"
                        >
                            <FaTimes className="mr-1" />
                            Cancel
                        </button>
                        <PillButton
                            text={editingShare ? "Update Share" : "Generate Link"}
                            icon={editingShare ? FaCheck : FaShareAlt}
                            onClick={editingShare ? handleupdateSharedDashboard : handleCreateShare}
                            disabled={selectedWidgets.length === 0}
                        />
                    </div>
                </>
            )}
        </PopupContainer>
    );
};

export default ShareDashboardPopup;
