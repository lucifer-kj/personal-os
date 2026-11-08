"use client";

import * as React from "react";
import {
  Sliders,
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  Archive,
  Plus,
  RotateCcw,
  Check,
  Sparkles,
  Layers,
  Wand2,
} from "lucide-react";
import {
  WorkbenchConfig,
  WorkbenchTool,
  saveWorkbenchConfig,
  resetWorkbenchConfig,
} from "@/lib/sidebar-workbench";
import { getSidebarIcon } from "./sidebar-icons";

interface SidebarCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: WorkbenchConfig;
  onSave: (config: WorkbenchConfig) => void;
}

export function SidebarCustomizerModal({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}: SidebarCustomizerModalProps) {
  const [config, setConfig] = React.useState<WorkbenchConfig>(currentConfig);
  const [activeTab, setActiveTab] = React.useState<"core" | "more">("core");
  const [editingId, setEditingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setConfig(currentConfig);
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const currentSlots = activeTab === "core" ? config.core : config.more;

  // Reorder Item within current tab
  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSlots.length) return;

    const updated = [...currentSlots];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    setConfig((prev) => ({
      ...prev,
      [activeTab]: updated,
    }));
  };

  // Move between Core and More
  const handleSwitchTab = (toolId: string) => {
    const fromTab = activeTab;
    const toTab = activeTab === "core" ? "more" : "core";

    const item = config[fromTab].find((t) => t.id === toolId);
    if (!item) return;

    setConfig((prev) => ({
      ...prev,
      [fromTab]: prev[fromTab].filter((t) => t.id !== toolId),
      [toTab]: [...prev[toTab], item],
    }));
  };

  // Move item to Tool Vault
  const handleMoveToVault = (toolId: string) => {
    const item = config[activeTab].find((t) => t.id === toolId);
    if (!item) return;

    setConfig((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((t) => t.id !== toolId),
      vault: [...prev.vault, item],
    }));
  };

  // Restore item from Tool Vault to active tab
  const handleRestoreFromVault = (toolId: string, targetTab: "core" | "more") => {
    const item = config.vault.find((t) => t.id === toolId);
    if (!item) return;

    setConfig((prev) => ({
      ...prev,
      vault: prev.vault.filter((t) => t.id !== toolId),
      [targetTab]: [...prev[targetTab], item],
    }));
  };

  // Rename Title
  const handleRename = (toolId: string, newTitle: string) => {
    const tab = config.core.some((t) => t.id === toolId) ? "core" : "more";
    setConfig((prev) => ({
      ...prev,
      [tab]: prev[tab].map((t) => (t.id === toolId ? { ...t, title: newTitle } : t)),
    }));
  };

  // Apply Quick Presets
  const applyPreset = (preset: "founder" | "intel" | "focus") => {
    const allTools = [...config.core, ...config.more, ...config.vault];
    const findTool = (id: string) => allTools.find((t) => t.id === id);

    if (preset === "founder") {
      const coreIds = ["projects", "tasks", "dashboard", "focus"];
      const moreIds = ["studio", "radar", "notes", "calendar", "habits", "journal", "settings", "inbox"];
      const core = coreIds.map(findTool).filter(Boolean) as WorkbenchTool[];
      const more = moreIds.map(findTool).filter(Boolean) as WorkbenchTool[];
      const usedIds = new Set([...coreIds, ...moreIds]);
      const vault = allTools.filter((t) => !usedIds.has(t.id));
      setConfig({ core, more, vault });
    } else if (preset === "intel") {
      const coreIds = ["radar", "notes", "inbox", "dashboard"];
      const moreIds = ["tasks", "projects", "journal", "studio", "calendar", "focus", "habits", "settings"];
      const core = coreIds.map(findTool).filter(Boolean) as WorkbenchTool[];
      const more = moreIds.map(findTool).filter(Boolean) as WorkbenchTool[];
      const usedIds = new Set([...coreIds, ...moreIds]);
      const vault = allTools.filter((t) => !usedIds.has(t.id));
      setConfig({ core, more, vault });
    } else if (preset === "focus") {
      const coreIds = ["focus", "tasks", "notes", "habits"];
      const moreIds = ["dashboard", "projects", "journal", "inbox", "calendar", "radar", "studio", "settings"];
      const core = coreIds.map(findTool).filter(Boolean) as WorkbenchTool[];
      const more = moreIds.map(findTool).filter(Boolean) as WorkbenchTool[];
      const usedIds = new Set([...coreIds, ...moreIds]);
      const vault = allTools.filter((t) => !usedIds.has(t.id));
      setConfig({ core, more, vault });
    }
  };

  const handleSaveAndClose = () => {
    saveWorkbenchConfig(config);
    onSave(config);
    onClose();
  };

  const handleResetDefaults = () => {
    const defaults = resetWorkbenchConfig();
    setConfig(defaults);
    onSave(defaults);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl border border-white/10 bg-[#161311] shadow-2xl flex flex-col overflow-hidden text-[#EDE7DE]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#E05B27]/15 border border-[#E05B27]/30 flex items-center justify-center text-[#E05B27]">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight flex items-center gap-2">
                Workstation Customizer
                <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-[#E05B27]/20 text-[#E05B27] border border-[#E05B27]/30">
                  Live HUD
                </span>
              </h2>
              <p className="text-xs text-[#A69E94]">
                Rearrange tool positions, rename labels to match your workflow, or vault unused modules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#A69E94] hover:text-white rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Defaults
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#A69E94] hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Two-Panel Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/10">
          {/* Left Panel: Active Slots (7 cols) */}
          <div className="md:col-span-7 flex flex-col overflow-hidden bg-black/20">
            {/* Page Tab Selector */}
            <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab("core")}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    activeTab === "core"
                      ? "bg-[#E05B27] text-white shadow-xs font-semibold"
                      : "text-[#A69E94] hover:text-white"
                  }`}
                >
                  Core Page ({config.core.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("more")}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    activeTab === "more"
                      ? "bg-[#E05B27] text-white shadow-xs font-semibold"
                      : "text-[#A69E94] hover:text-white"
                  }`}
                >
                  More Page ({config.more.length})
                </button>
              </div>

              <span className="text-[11px] font-mono text-[#A69E94]">
                {activeTab === "core" ? "Primary Workstation" : "Extended Library"}
              </span>
            </div>

            {/* Reorderable Tool List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {currentSlots.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#A69E94] border border-dashed border-white/10 rounded-2xl">
                  No tools active in this page. Add some from the Tool Vault on the right.
                </div>
              ) : (
                currentSlots.map((tool, idx) => {
                  const Icon = getSidebarIcon(tool.iconName);
                  const isEditing = editingId === tool.id;

                  return (
                    <div
                      key={tool.id}
                      className="group flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                        {/* Tool Icon */}
                        <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#E05B27] shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>

                        {/* Title or Editable Input */}
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                autoFocus
                                value={tool.title}
                                onChange={(e) => handleRename(tool.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === "Escape") {
                                    setEditingId(null);
                                  }
                                }}
                                className="w-full text-xs px-2 py-1 rounded bg-black/60 border border-[#E05B27] text-white focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="p-1 rounded bg-[#E05B27] text-white hover:opacity-90"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => setEditingId(tool.id)}
                              className="cursor-pointer group-hover:text-white"
                              title="Click to rename"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-white truncate">
                                  {tool.title}
                                </span>
                                {tool.title !== tool.defaultTitle && (
                                  <span className="text-[10px] font-mono text-[#A69E94]">
                                    ({tool.defaultTitle})
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-[#A69E94] truncate block">
                                {tool.href}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tool Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, "up")}
                          className="p-1 rounded text-[#A69E94] hover:text-white disabled:opacity-30 disabled:hover:text-[#A69E94] transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={idx === currentSlots.length - 1}
                          onClick={() => handleMove(idx, "down")}
                          className="p-1 rounded text-[#A69E94] hover:text-white disabled:opacity-30 disabled:hover:text-[#A69E94] transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>

                        {/* Transfer to Other Page */}
                        <button
                          type="button"
                          onClick={() => handleSwitchTab(tool.id)}
                          className="p-1 rounded text-[#A69E94] hover:text-indigo-400 transition-colors"
                          title={activeTab === "core" ? "Move to More page" : "Move to Core page"}
                        >
                          <ArrowLeftRight className="h-3.5 w-3.5" />
                        </button>

                        {/* Vault (Remove from active) */}
                        <button
                          type="button"
                          onClick={() => handleMoveToVault(tool.id)}
                          className="p-1 rounded text-[#A69E94] hover:text-rose-400 transition-colors"
                          title="Vault this tool"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Tool Vault & Quick Archetypes (5 cols) */}
          <div className="md:col-span-5 flex flex-col overflow-hidden bg-black/40">
            <div className="p-3 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#E05B27]" />
                Tool Vault ({config.vault.length})
              </span>
              <span className="text-[10px] font-mono text-[#A69E94]">Inactive Modules</span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Vault Items */}
              {config.vault.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#A69E94] border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                  All workstation modules are currently active in Core or More pages.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {config.vault.map((tool) => {
                    const Icon = getSidebarIcon(tool.iconName);
                    return (
                      <div
                        key={tool.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-white/10 bg-white/[0.02]"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                          <div className="h-7 w-7 rounded bg-white/5 flex items-center justify-center text-[#A69E94]">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs text-white truncate">{tool.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleRestoreFromVault(tool.id, "core")}
                            className="px-2 py-0.5 text-[10px] font-medium rounded bg-white/10 hover:bg-[#E05B27] text-white transition-colors"
                          >
                            + Core
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRestoreFromVault(tool.id, "more")}
                            className="px-2 py-0.5 text-[10px] font-medium rounded bg-white/10 hover:bg-[#E05B27] text-white transition-colors"
                          >
                            + More
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick Preset Layouts */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#A69E94] font-semibold flex items-center gap-1">
                  <Wand2 className="h-3 w-3 text-indigo-400" />
                  Quick Workstation Presets
                </span>

                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPreset("founder")}
                    className="text-left p-2 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="text-xs font-medium text-white">Founder &amp; Builder</div>
                    <div className="text-[10px] text-[#A69E94]">
                      Prioritizes Projects (NBD, ACoV, Fossil, Friday), Tasks &amp; Focus Mode
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset("intel")}
                    className="text-left p-2 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="text-xs font-medium text-white">Curator &amp; Intel</div>
                    <div className="text-[10px] text-[#A69E94]">
                      Puts The Radar, Notes &amp; Inbox into primary Core focus
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset("focus")}
                    className="text-left p-2 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="text-xs font-medium text-white">Deep Work &amp; Flow</div>
                    <div className="text-[10px] text-[#A69E94]">
                      Minimalist setup centered on Focus Timer, Tasks &amp; Habits
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#A69E94]">
            <Sparkles className="h-3.5 w-3.5 text-[#E05B27]" />
            <span>Click any item name to rename it inline.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-[#A69E94] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-xl bg-[#E05B27] hover:bg-[#C94D1D] text-white shadow-md transition-all active:scale-95"
            >
              <Check className="h-3.5 w-3.5" />
              Save &amp; Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
