import React, { useState } from 'react';
import { User, MoreVertical, Plus, X, Check } from 'lucide-react';

export default function LeftSidebar({
    projects,
    activeProjectId,
    onSelectProject,
    onAddProject,
    onDeleteProject,
    onEditProject,
    isOpen
}) {
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const toggleMenu = (e, projectId) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === projectId ? null : projectId);
    };

    const startEditing = (project) => {
        setEditingId(project.id);
        setEditName(project.name);
        setOpenMenuId(null);
    };

    const saveEdit = () => {
        if (editName.trim()) {
            onEditProject(editingId, editName.trim());
        }
        setEditingId(null);
        setEditName('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const handleDelete = (projectId) => {
        onDeleteProject(projectId);
        setOpenMenuId(null);
    };

    if (!isOpen) return null;

    return (
        <div className="w-[220px] min-w-[220px] bg-[#2a2a2a] flex flex-col h-full border-r border-white/10">
            {/* Header with Add Button */}
            <div className="p-6 pt-8 flex items-center justify-between">
                <h2 className="text-2xl font-normal text-white underline underline-offset-8 decoration-white/40">
                    Projects
                </h2>
                <button
                    onClick={onAddProject}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    title="Add Project"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto px-4 pt-4">
                {projects.map((project) => {
                    const isActive = project.id === activeProjectId;
                    const isMenuOpen = openMenuId === project.id;
                    const isEditing = editingId === project.id;

                    return (
                        <div key={project.id} className="mb-2 relative">
                            {/* Project Row */}
                            {isEditing ? (
                                <div className="flex items-center gap-2 px-2 py-2">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveEdit();
                                            if (e.key === 'Escape') cancelEdit();
                                        }}
                                        className="flex-1 bg-transparent border border-white/40 rounded px-2 py-1 text-white text-lg focus:outline-none focus:border-white"
                                        autoFocus
                                    />
                                    <button onClick={saveEdit} className="p-1 text-green-400 hover:text-green-300">
                                        <Check size={18} />
                                    </button>
                                    <button onClick={cancelEdit} className="p-1 text-red-400 hover:text-red-300">
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => onSelectProject(project.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-lg font-normal transition-all rounded-lg cursor-pointer ${isActive
                                            ? 'border border-white text-white bg-white/5'
                                            : 'border border-transparent text-white/70 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span>{project.name}</span>

                                    {/* Vertical Ellipsis */}
                                    <button
                                        onClick={(e) => toggleMenu(e, project.id)}
                                        className="p-1 rounded hover:bg-white/10 transition-colors"
                                    >
                                        <MoreVertical size={18} className="text-white/60 hover:text-white" />
                                    </button>
                                </div>
                            )}

                            {/* Dropdown Menu */}
                            {isMenuOpen && !isEditing && (
                                <div className="absolute right-4 top-12 z-50 bg-[#333] border border-white/20 rounded-lg shadow-xl py-1 min-w-[120px]">
                                    <button
                                        onClick={() => startEditing(project)}
                                        className="w-full text-left px-4 py-2 text-base text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setOpenMenuId(null)}
                                        className="w-full text-left px-4 py-2 text-base text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        Share
                                    </button>
                                    <button
                                        onClick={() => handleDelete(project.id)}
                                        className="w-full text-left px-4 py-2 text-base text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Profile Footer */}
            <div className="p-6 border-t border-white/10">
                <button className="flex items-center gap-3 text-white/80 hover:text-white transition-colors w-full">
                    <div className="w-10 h-10 rounded-full border-2 border-white/40 flex items-center justify-center">
                        <User size={20} />
                    </div>
                    <span className="text-xl font-normal">Profile</span>
                </button>
            </div>
        </div>
    );
}
