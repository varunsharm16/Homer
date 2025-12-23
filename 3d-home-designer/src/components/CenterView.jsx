import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ArrowUp, Plus, PanelLeftClose, PanelRightClose, PanelLeft, PanelRight, X, Image, Upload, Loader2, Home, Check } from 'lucide-react';
import { classifyImage, parseFloorplan, executeSceneCommand, applyOperations } from '../lib/api';
import { useSceneStore } from '../lib/sceneStore';

export default function CenterView({
    children,
    projectName,
    floors = [1, 2],
    leftSidebarOpen,
    rightSidebarOpen,
    onToggleLeftSidebar,
    onToggleRightSidebar,
    selectedSurfaces = [],
    onRemoveSurface,
    uploadedImages = [],
    onImageUpload,
    onRemoveImage,
    onClearImages
}) {
    const [activeFloor, setActiveFloor] = useState(1);
    const [inputText, setInputText] = useState('');
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [previewData, setPreviewData] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const containerRef = useRef(null);

    // Scene store
    const loadScene = useSceneStore((s) => s.loadScene);
    const scene = useSceneStore((s) => s.scene);

    // Process uploaded images through AI classification
    const processImages = useCallback(async () => {
        if (uploadedImages.length === 0) return null;

        // For now, just process the first image
        const image = uploadedImages[0];

        setIsProcessing(true);
        setProcessingMessage('Analyzing image...');
        setError(null);

        try {
            // Step 1: Classify the image
            const classification = await classifyImage(image.data);

            if (classification.type === 'floor_plan') {
                setProcessingMessage('Floor plan detected! Extracting rooms...');

                // Step 2: Parse floor plan
                const parsed = await parseFloorplan(image.data);

                // Show preview for confirmation
                setPreviewData({
                    type: 'floor_plan',
                    classification,
                    preview: parsed.preview,
                    sceneDsl: parsed.sceneDsl
                });

                return parsed;
            } else {
                // For other image types, just store the classification
                setPreviewData({
                    type: classification.type,
                    classification,
                    details: classification.details
                });
                return classification;
            }
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsProcessing(false);
            setProcessingMessage('');
        }
    }, [uploadedImages]);

    // Handle generate (confirm floor plan preview)
    const handleGenerate = useCallback(async () => {
        if (!previewData?.sceneDsl) return;

        setIsProcessing(true);
        setProcessingMessage('Generating 3D model...');

        try {
            // Load the scene DSL into the store
            loadScene(previewData.sceneDsl);

            // Clear preview and uploaded images
            setPreviewData(null);
            if (onClearImages) onClearImages();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsProcessing(false);
            setProcessingMessage('');
        }
    }, [previewData, loadScene, onClearImages]);

    // Handle text command submission
    const handleSubmit = useCallback(async () => {
        // If there are images, process them first
        if (uploadedImages.length > 0 && !previewData) {
            await processImages();
            return;
        }

        // Handle text commands
        if (inputText.trim()) {
            setIsProcessing(true);
            setProcessingMessage('Processing command...');

            try {
                const result = await executeSceneCommand(
                    inputText,
                    scene,
                    uploadedImages[0]?.data
                );

                // Apply operations to scene
                applyOperations(result.operations, useSceneStore.getState());
                setInputText('');
                if (onClearImages) onClearImages();
            } catch (err) {
                setError(err.message);
            } finally {
                setIsProcessing(false);
                setProcessingMessage('');
            }
        }
    }, [inputText, uploadedImages, previewData, scene, processImages, onClearImages]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        onImageUpload({
                            name: file.name,
                            data: event.target.result,
                            type: file.type
                        });
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        setShowPlusMenu(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle paste events for images
    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData?.items;
            if (items) {
                for (const item of items) {
                    if (item.type.startsWith('image/')) {
                        const file = item.getAsFile();
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                onImageUpload({
                                    name: `pasted-image-${Date.now()}.png`,
                                    data: event.target.result,
                                    type: file.type
                                });
                            };
                            reader.readAsDataURL(file);
                        }
                    }
                }
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [onImageUpload]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showPlusMenu && !e.target.closest('.plus-menu-container')) {
                setShowPlusMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPlusMenu]);

    // Cancel preview
    const cancelPreview = () => {
        setPreviewData(null);
        if (onClearImages) onClearImages();
    };

    return (
        <div ref={containerRef} className="flex-1 relative bg-[#3a3a3a] h-full overflow-hidden">
            {/* 3D Canvas Area */}
            <div className="absolute inset-0 z-0">
                {children}
            </div>

            {/* ===== OVERLAYS ===== */}

            {/* Top Left: Sidebar Toggle */}
            <div className="absolute top-6 left-6 z-10">
                <button
                    onClick={onToggleLeftSidebar}
                    className="w-10 h-10 rounded-lg bg-[#2a2a2a]/80 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-[#2a2a2a] transition-all"
                    title={leftSidebarOpen ? 'Hide Projects' : 'Show Projects'}
                >
                    {leftSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
                </button>
            </div>

            {/* Top Center: Project Title */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
                <h1 className="text-xl font-normal text-white/80">
                    {projectName}
                </h1>
            </div>

            {/* Top Right: Sidebar Toggle */}
            <div className="absolute top-6 right-6 z-10">
                <button
                    onClick={onToggleRightSidebar}
                    className="w-10 h-10 rounded-lg bg-[#2a2a2a]/80 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-[#2a2a2a] transition-all"
                    title={rightSidebarOpen ? 'Hide Products' : 'Show Products'}
                >
                    {rightSidebarOpen ? <PanelRightClose size={20} /> : <PanelRight size={20} />}
                </button>
            </div>

            {/* Right Side: Floor Selector */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                <div className="flex flex-col gap-1 mb-4">
                    {[...floors].sort((a, b) => b - a).map((floor) => (
                        <button
                            key={floor}
                            onClick={() => setActiveFloor(floor)}
                            className={`text-right text-xl font-normal px-2 py-1 transition-all ${activeFloor === floor ? 'text-white' : 'text-white/40 hover:text-white/70'
                                }`}
                        >
                            <span className={activeFloor === floor ? 'underline underline-offset-4' : ''}>
                                floor {floor}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="flex flex-col items-center text-white/30">
                    <div className="w-px h-24 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
                    <ChevronDown className="w-6 h-6 mt-2" />
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Preview Card (for floor plan confirmation) */}
            {previewData && previewData.type === 'floor_plan' && (
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 w-[400px] max-w-[90%]">
                    <div className="bg-[#2a2a2a]/95 backdrop-blur-md border border-green-500/40 rounded-2xl p-4 shadow-xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Home className="w-5 h-5 text-green-400" />
                            <span className="text-white font-medium">Floor Plan Detected</span>
                        </div>

                        <div className="text-white/70 text-sm mb-4">
                            <p>Found <strong>{previewData.preview?.roomCount || '?'}</strong> rooms</p>
                            {previewData.preview?.rooms && (
                                <p className="text-white/50 mt-1">
                                    {previewData.preview.rooms.slice(0, 5).join(', ')}
                                    {previewData.preview.rooms.length > 5 && '...'}
                                </p>
                            )}
                            {previewData.preview?.totalSqFt && (
                                <p className="mt-1">~{previewData.preview.totalSqFt.toLocaleString()} sq ft</p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleGenerate}
                                disabled={isProcessing}
                                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                Generate 3D
                            </button>
                            <button
                                onClick={cancelPreview}
                                className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-red-900/90 border border-red-500/40 text-red-200 px-4 py-2 rounded-lg flex items-center gap-2">
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="text-red-300 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Center: Chat Input Box */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-[500px] max-w-[90%]">
                <div className="bg-[#2a2a2a]/90 backdrop-blur-md border border-white/20 rounded-2xl p-4">

                    {/* Processing indicator */}
                    {isProcessing && (
                        <div className="flex items-center gap-2 mb-3 text-blue-300">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">{processingMessage}</span>
                        </div>
                    )}

                    {/* Selected Surfaces and Images Tags */}
                    {(selectedSurfaces.length > 0 || uploadedImages.length > 0) && !isProcessing && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {selectedSurfaces.map((surface) => (
                                <div
                                    key={surface}
                                    className="flex items-center gap-1.5 bg-[#3a3a3a] border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white/80"
                                >
                                    <span>{surface}</span>
                                    <button
                                        onClick={() => onRemoveSurface(surface)}
                                        className="text-white/40 hover:text-white transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            {uploadedImages.map((img, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-1.5 bg-[#3a3a3a] border border-blue-400/40 rounded-lg px-3 py-1.5 text-sm text-blue-300"
                                >
                                    <Image size={14} />
                                    <span className="max-w-[100px] truncate">{img.name}</span>
                                    <button
                                        onClick={() => onRemoveImage(index)}
                                        className="text-white/40 hover:text-white transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Input Row */}
                    <div className="flex items-center gap-3">
                        <div className="relative plus-menu-container">
                            <button
                                onClick={() => setShowPlusMenu(!showPlusMenu)}
                                className="text-white/60 hover:text-white transition-colors p-1"
                                disabled={isProcessing}
                            >
                                <Plus className="w-6 h-6" />
                            </button>

                            {showPlusMenu && (
                                <div className="absolute bottom-full left-0 mb-2 bg-[#333] border border-white/20 rounded-lg shadow-xl py-1 min-w-[150px] z-50">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <Upload size={16} />
                                        <span>Upload Photo</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={uploadedImages.length > 0 ? "Press enter to analyze image..." : "Describe what you want to add..."}
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 text-base"
                            disabled={isProcessing}
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={isProcessing}
                            className={`text-white/60 hover:text-white transition-colors p-1 ${(inputText.trim() || uploadedImages.length > 0) ? 'text-white' : ''
                                } disabled:opacity-50`}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <ArrowUp className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
