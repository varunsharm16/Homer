import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ArrowUp, Plus, PanelLeftClose, PanelRightClose, PanelLeft, PanelRight } from 'lucide-react';

export default function CenterView({
    children,
    projectName,
    leftSidebarOpen,
    rightSidebarOpen,
    onToggleLeftSidebar,
    onToggleRightSidebar
}) {
    const [activeFloor, setActiveFloor] = useState(1);

    return (
        <div className="flex-1 relative bg-[#3a3a3a] h-full overflow-hidden">
            {/* 3D Canvas Area - fills the entire center */}
            <div className="absolute inset-0 z-0">
                {children}
            </div>

            {/* ===== OVERLAYS ===== */}

            {/* Top Left: Sidebar Toggle + Project Title */}
            <div className="absolute top-6 left-6 z-10 flex items-center gap-4">
                {/* Left Sidebar Toggle Button */}
                <button
                    onClick={onToggleLeftSidebar}
                    className="w-10 h-10 rounded-lg bg-[#2a2a2a]/80 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-[#2a2a2a] transition-all"
                    title={leftSidebarOpen ? 'Hide Projects' : 'Show Projects'}
                >
                    {leftSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
                </button>

                {/* Project Title with Dropdown */}
                <button className="flex items-center gap-2 text-white group">
                    <h1 className="text-3xl font-normal underline underline-offset-8 decoration-white/40">
                        {projectName}
                    </h1>
                    <ChevronDown className="w-7 h-7 text-white/60 group-hover:text-white transition-colors" />
                </button>
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

            {/* Left Side: Floor Selector (below project title) */}
            <div className="absolute top-24 left-6 z-10 flex flex-col gap-1">
                {[2, 1].map((floor) => (
                    <button
                        key={floor}
                        onClick={() => setActiveFloor(floor)}
                        className={`text-left text-xl font-normal px-2 py-1 transition-all ${activeFloor === floor
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

            {/* Right Side: Vertical scroll/navigation indicator */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
                <div className="flex flex-col items-center text-white/30">
                    <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
                    <ChevronDown className="w-6 h-6 mt-2" />
                </div>
            </div>

            {/* Bottom Center: Chat Input Box */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-[500px] max-w-[90%]">
                <div className="bg-[#2a2a2a]/90 backdrop-blur-md border border-white/20 rounded-2xl p-5">
                    {/* Label */}
                    <div className="text-white/50 text-sm uppercase tracking-wider mb-4">
                        Add Anything
                    </div>

                    {/* Input Row */}
                    <div className="flex items-center justify-between">
                        {/* Plus Button */}
                        <button className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/60 transition-all">
                            <Plus className="w-6 h-6" />
                        </button>

                        {/* Send Button */}
                        <button className="w-12 h-12 rounded-full border-2 border-white/40 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/60 transition-all">
                            <ArrowUp className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
