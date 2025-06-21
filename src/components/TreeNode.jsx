import { useState, useRef, useEffect } from 'react';

/* eslint-disable react/prop-types */
const TreeNode = ({
  node,
  level = 0,
  onEdit,
  onAddChild,
  onRemove,
  editingNode,
  setEditingNode,
}) => {
  const [expanded, setExpanded] = useState(level < 2); // Auto-expand first 2 levels
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const nodeRef = useRef(null);

  // eslint-disable-next-line react/prop-types
  const hasChildren = node.children?.length > 0;
  const hasValue = node.value !== undefined;
  const isEditing = editingNode === node.id;

  // Check if device is mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getNodeColor = (level) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-green-500 to-green-600',
      'from-orange-500 to-orange-600',
      'from-red-500 to-red-600',
    ];
    return colors[level % colors.length];
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (!isMobile) {
      setShowContextMenu(true);
    }
  };

  const handleClickOutside = () => {
    setShowContextMenu(false);
    setShowMobileActions(false);
  };

  const handleEdit = () => {
    setEditingNode(node.id);
    setEditName(node.name);
    setShowContextMenu(false);
    setShowMobileActions(false);
  };

  const handleSaveEdit = () => {
    if (editName.trim() && editName !== node.name) {
      onEdit(node.id, editName.trim());
    }
    setEditingNode(null);
  };

  const handleCancelEdit = () => {
    setEditName(node.name);
    setEditingNode(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const toggleMobileActions = () => {
    setShowMobileActions(!showMobileActions);
  };

  return (
    <div className={`${level > 0 ? 'ml-6 mt-3' : ''}`}>
      <div className="relative">
        {/* Connection line */}
        {level > 0 && (
          <div className="absolute -left-6 top-4 h-0.5 w-6 bg-gradient-to-r from-gray-300 to-transparent"></div>
        )}

        {/* Node content */}
        <div className="group relative" ref={nodeRef}>
          <div
            className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 border-transparent p-3 transition-all duration-200 hover:border-blue-300 hover:shadow-md ${
              hasValue
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100'
                : 'bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100'
            }`}
            onClick={() => hasChildren && setExpanded(!expanded)}
            onContextMenu={handleContextMenu}
          >
            {/* Expand/collapse icon */}
            {hasChildren && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                <span className="text-sm transition-transform duration-200 group-hover:scale-110">
                  {expanded ? '🔽' : '▶️'}
                </span>
              </div>
            )}

            {/* Node name */}
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleSaveEdit}
                  className="w-full rounded border border-blue-300 px-2 py-1 text-base font-semibold text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <div
                  className={`font-semibold text-gray-800 ${hasChildren ? 'text-lg' : 'text-base'}`}
                >
                  {node.name}
                </div>
              )}
              {hasValue && (
                <div className="mt-1 text-sm font-medium text-emerald-600">
                  Value: {node.value}
                </div>
              )}
            </div>

            {/* Visual indicator for nodes with children */}
            {hasChildren && (
              <div
                className={`rounded-full bg-gradient-to-r px-2 py-1 text-xs font-medium text-white ${getNodeColor(level)}`}
              >
                {node.children.length}
              </div>
            )}

            {/* Mobile Actions Toggle Button */}
            {isMobile && !isEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMobileActions();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Actions"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            )}

            {/* Edit indicator */}
            {isEditing && (
              <div className="flex gap-1">
                <button
                  onClick={handleSaveEdit}
                  className="rounded bg-green-500 p-1 text-white hover:bg-green-600"
                  title="Save"
                >
                  ✓
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="rounded bg-red-500 p-1 text-white hover:bg-red-600"
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Mobile Actions Menu */}
          {isMobile && showMobileActions && (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg bg-white p-2 shadow-xl ring-1 ring-black ring-opacity-5">
              <button
                onClick={handleEdit}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                تعديل
              </button>
              <button
                onClick={() => {
                  onAddChild(node);
                  setShowMobileActions(false);
                }}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                إضافة أبناء
              </button>
              <button
                onClick={() => {
                  onRemove(node.id);
                  setShowMobileActions(false);
                }}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                حذف
              </button>
            </div>
          )}

          {/* Desktop Context Menu */}
          {!isMobile && showContextMenu && (
            <div className="absolute right-0 top-full z-50 mt-1 rounded-lg bg-white p-2 shadow-xl ring-1 ring-black ring-opacity-5">
              <button
                onClick={handleEdit}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                تعديل
              </button>
              <button
                onClick={() => {
                  onAddChild(node);
                  setShowContextMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                إضافة أبناء
              </button>
              <button
                onClick={() => {
                  onRemove(node.id);
                  setShowContextMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                حذف
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="mt-2 border-l-2 border-dashed border-gray-200 pl-4">
          {node.children.map((child, idx) => (
            <TreeNode
              key={child.id || idx}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onAddChild={onAddChild}
              onRemove={onRemove}
              editingNode={editingNode}
              setEditingNode={setEditingNode}
            />
          ))}
        </div>
      )}

      {/* Click outside to close menus */}
      {(showContextMenu || showMobileActions) && (
        <div className="fixed inset-0 z-40" onClick={handleClickOutside} />
      )}
    </div>
  );
};

export default TreeNode;
