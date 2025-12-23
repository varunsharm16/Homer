import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUp, Plus, PanelLeftClose, PanelRightClose, PanelLeft, PanelRight, X, Image, Upload } from 'lucide-react';

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
    onRemoveImage
}) {
    const [activeFloor, setActiveFloor] = useState(1);
    const [inputText, setInputText] = useState('');
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const fileInputRef = useRef(null);
    const containerRef = useRef(null);

    const handleSubmit = () => {
        if (inputText.trim() || selectedSurfaces.length > 0 || uploadedImages.length > 0) {
            console.log('Submitted:', { text: inputText, surfaces: selectedSurfaces, images: uploadedImages });
            setInputText('');
        }
    };

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
        // Reset file input
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

    return (
        <div ref={containerRef} className="flex-1 relative bg-[#3a3a3a] h-full overflow-hidden">
            {/* 3D Canvas Area - fills the entire center */}
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

            {/* Right Side: Floor Selector + Navigation Indicator */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                {/* Floor Labels */}
                <div className="flex flex-col gap-1 mb-4">
                    {[...floors].sort((a, b) => b - a).map((floor) => (
                        <button
                            key={floor}
                            onClick={() => setActiveFloor(floor)}
                            className={`text-right text-xl font-normal px-2 py-1 transition-all ${activeFloor === floor
                                    ? 'text-white'
                                    : 'text-white/40 hover:text-white/70'
                                }`}
                        >
                            <span className={activeFloor === floor ? 'underline underline-offset-4' : ''}>
                                floor {floor}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Vertical Navigation Indicator */}
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

            {/* Bottom Center: Chat Input Box */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-[500px] max-w-[90%]">
                <div className="bg-[#2a2a2a]/90 backdrop-blur-md border border-white/20 rounded-2xl p-4">

                    {/* Selected Surfaces Tags */}
                    {(selectedSurfaces.length > 0 || uploadedImages.length > 0) && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {/* Surface tags */}
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
                            {/* Image tags */}
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
                        {/* Plus Button with popup menu */}
                        <div className="relative plus-menu-container">
                            <button
                                onClick={() => setShowPlusMenu(!showPlusMenu)}
                                className="text-white/60 hover:text-white transition-colors p-1"
                            >
                                <Plus className="w-6 h-6" />
                            </button>

                            {/* Popup Menu */}
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

                        {/* Text Input */}
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe what you want to add..."
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 text-base"
                        />

                        {/* Send Button */}
                        <button
                            onClick={handleSubmit}
                            className={`text-white/60 hover:text-white transition-colors p-1 ${inputText.trim() || selectedSurfaces.length > 0 || uploadedImages.length > 0 ? 'text-white' : ''
                                }`}
                        >
                            <ArrowUp className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
