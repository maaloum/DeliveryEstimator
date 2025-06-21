import familyData from '../data/familyData';
import TreeNode from './TreeNode';
import { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function FamilyTree() {
  const [exportFormat, setExportFormat] = useState('json');
  const [searchTerm, setSearchTerm] = useState('');
  const [treeData, setTreeData] = useState(familyData);
  const [editingNode, setEditingNode] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  // Search function
  const searchFamilyMembers = (node, path = []) => {
    let results = [];

    if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      results.push({ node, path: [...path, node.name] });
    }

    if (node.children) {
      node.children.forEach((child) => {
        results = results.concat(
          searchFamilyMembers(child, [...path, node.name])
        );
      });
    }

    return results;
  };

  // Memoized search results
  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return searchFamilyMembers(treeData);
  }, [searchTerm, treeData]);

  // Calculate tree statistics
  const treeStats = useMemo(() => {
    const calculateStats = (node, level = 0) => {
      let stats = {
        totalMembers: 1,
        maxLevel: level,
        branches: node.children?.length || 0,
        membersWithValues: node.value !== undefined ? 1 : 0,
      };

      if (node.children) {
        node.children.forEach((child) => {
          const childStats = calculateStats(child, level + 1);
          stats.totalMembers += childStats.totalMembers;
          stats.maxLevel = Math.max(stats.maxLevel, childStats.maxLevel);
          stats.branches += childStats.branches;
          stats.membersWithValues += childStats.membersWithValues;
        });
      }

      return stats;
    };

    return calculateStats(treeData);
  }, [treeData]);

  const exportData = () => {
    const dataStr = JSON.stringify(treeData, null, 2);

    if (exportFormat === 'json') {
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'family-tree.json';
      link.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'txt') {
      const dataBlob = new Blob([dataStr], { type: 'text/plain' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'family-tree.txt';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const exportToPDF = async () => {
    const element = document.getElementById('family-tree-container');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('family-tree.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const printTree = () => {
    window.print();
  };

  // Tree editing functions
  const updateNodeInTree = (node, targetId, updates) => {
    if (node.id === targetId) {
      return { ...node, ...updates };
    }

    if (node.children) {
      return {
        ...node,
        children: node.children.map((child) =>
          updateNodeInTree(child, targetId, updates)
        ),
      };
    }

    return node;
  };

  const addChildToNode = (node, targetId, newChild) => {
    if (node.id === targetId) {
      return {
        ...node,
        children: [
          ...(node.children || []),
          { ...newChild, id: Date.now().toString() },
        ],
      };
    }

    if (node.children) {
      return {
        ...node,
        children: node.children.map((child) =>
          addChildToNode(child, targetId, newChild)
        ),
      };
    }

    return node;
  };

  const removeNodeFromTree = (node, targetId) => {
    if (node.children) {
      return {
        ...node,
        children: node.children
          .filter((child) => child.id !== targetId)
          .map((child) => removeNodeFromTree(child, targetId)),
      };
    }

    return node;
  };

  const handleEditNode = (nodeId, newName) => {
    setTreeData((prev) => updateNodeInTree(prev, nodeId, { name: newName }));
    setEditingNode(null);
  };

  const handleAddChild = (parentId, childName, childValue = '') => {
    const newChild = {
      name: childName,
      id: Date.now().toString(),
      ...(childValue && { value: parseInt(childValue) || childValue }),
    };

    setTreeData((prev) => addChildToNode(prev, parentId, newChild));
    setShowAddForm(false);
    setSelectedNode(null);
  };

  const handleRemoveNode = (nodeId) => {
    if (window.confirm('Are you sure you want to remove this family member?')) {
      setTreeData((prev) => removeNodeFromTree(prev, nodeId));
    }
  };

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('familyTreeData', JSON.stringify(treeData));
      alert('Family tree saved successfully!');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      alert('Error saving family tree. Please try again.');
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('familyTreeData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setTreeData(parsedData);
        alert('Family tree loaded successfully!');
      } else {
        alert('No saved family tree found.');
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      alert('Error loading family tree. Please try again.');
    }
  };

  const resetToOriginal = () => {
    if (
      window.confirm(
        'Are you sure you want to reset to the original family tree? All changes will be lost.'
      )
    ) {
      setTreeData(addIdsToTree({ ...familyData }));
      setEditingNode(null);
      setShowAddForm(false);
      setSelectedNode(null);
    }
  };

  // Add IDs to existing tree data if not present
  const addIdsToTree = (node) => {
    if (!node.id) {
      node.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    if (node.children) {
      node.children.forEach(addIdsToTree);
    }

    return node;
  };

  // Initialize tree with IDs
  useMemo(() => {
    if (!treeData.id) {
      setTreeData(addIdsToTree({ ...treeData }));
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          saveToLocalStorage();
        } else if (e.key === 'p') {
          e.preventDefault();
          printTree();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [treeData]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 font-sans">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-4xl font-bold text-transparent">
            شجرة عائلة أهل المعلوم
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative mx-auto max-w-md">
            <input
              type="text"
              placeholder="ابحث عن أفراد العائلة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 text-gray-700 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Search Results */}
          {searchTerm && filteredResults.length > 0 && (
            <div className="mx-auto mt-4 max-w-2xl">
              <div className="rounded-lg bg-white p-4 shadow-lg">
                <h3 className="mb-3 text-lg font-semibold text-gray-800">
                  النتائج ({filteredResults.length})
                </h3>
                <div className="space-y-2">
                  {filteredResults.slice(0, 5).map((result, index) => (
                    <div key={index} className="rounded-md bg-gray-50 p-3">
                      <div className="font-medium text-blue-600">
                        {result.node.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        Path: {result.path.join(' → ')}
                      </div>
                      {result.node.value && (
                        <div className="text-sm text-emerald-600">
                          Value: {result.node.value}
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredResults.length > 5 && (
                    <div className="text-center text-sm text-gray-500">
                      ... and {filteredResults.length - 5} more results
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {searchTerm && filteredResults.length === 0 && (
            <div className="mt-4 text-center text-gray-500">
              لا يوجد أفراد عائلة مطابقة لـ &quot;{searchTerm}&quot;
            </div>
          )}
        </div>

        {/* Export Controls */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4 rounded-lg bg-white p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <label
              htmlFor="exportFormat"
              className="text-sm font-medium text-gray-700"
            >
              تصدير التنسيق:
            </label>
            <select
              id="exportFormat"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="json">JSON</option>
              <option value="txt">Text</option>
            </select>
          </div>
          <button
            onClick={exportData}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            تصدير الشجرة العائلية
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 px-6 py-2 text-white transition-all duration-200 hover:from-red-700 hover:to-pink-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            تصدير PDF
          </button>
          <button
            onClick={printTree}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-teal-600 px-6 py-2 text-white transition-all duration-200 hover:from-green-700 hover:to-teal-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            طباعة الشجرة
          </button>
        </div>

        {/* Save/Load Controls */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4 rounded-lg bg-white p-4 shadow-lg">
          <button
            onClick={saveToLocalStorage}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-2 text-white transition-all duration-200 hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            حفظ الشجرة
          </button>
          <button
            onClick={loadFromLocalStorage}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-2 text-white transition-all duration-200 hover:from-yellow-700 hover:to-orange-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              />
            </svg>
            تحميل الشجرة
          </button>
          <button
            onClick={resetToOriginal}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-2 text-white transition-all duration-200 hover:from-gray-700 hover:to-gray-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            الإعادة إلى الأصل
          </button>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white shadow-lg">
            <div className="text-2xl font-bold">{treeStats.totalMembers}</div>
            <div className="text-sm opacity-90">إجمالي الأفراد</div>
          </div>
          <div className="rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white shadow-lg">
            <div className="text-2xl font-bold">{treeStats.maxLevel + 1}</div>
            <div className="text-sm opacity-90">مستويات الشجرة</div>
          </div>
          <div className="rounded-lg bg-gradient-to-r from-green-500 to-green-600 p-4 text-white shadow-lg">
            <div className="text-2xl font-bold">{treeStats.branches}</div>
            <div className="text-sm opacity-90">الفروع</div>
          </div>
          {/* <div className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white shadow-lg">
            <div className="text-2xl font-bold">
              {treeStats.membersWithValues}
            </div>
            <div className="text-sm opacity-90">مع القيم</div>
          </div> */}
        </div>

        {/* Add Child Form */}
        {showAddForm && selectedNode && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-gray-800">
              إضافة أبناء لـ &quot;{selectedNode.name}&quot;
            </h3>
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Child Name"
                id="childName"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Value (optional)"
                id="childValue"
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  const name = document.getElementById('childName').value;
                  const value = document.getElementById('childValue').value;
                  if (name.trim()) {
                    handleAddChild(selectedNode.id, name.trim(), value);
                  }
                }}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                إضافة أبناء
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedNode(null);
                }}
                className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Tree Container */}
        <div
          id="family-tree-container"
          className="rounded-xl bg-white p-8 shadow-xl"
        >
          <div className="flex justify-center">
            <TreeNode
              node={treeData}
              onEdit={handleEditNode}
              onAddChild={(node) => {
                setSelectedNode(node);
                setShowAddForm(true);
              }}
              onRemove={handleRemoveNode}
              editingNode={editingNode}
              setEditingNode={setEditingNode}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>انقر على أفراد العائلة لفتح أو طي الفروع.</p>
          <p className="mt-2">
            انقر بزر الماوس الأيمن على الأفراد لتعديلهم، إضافة أبناء، أو حذفهم.
          </p>
          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-left">
            <h4 className="mb-2 font-semibold text-gray-700">
              اختصارات لوحة المفاتيح:
            </h4>
            <ul className="space-y-1 text-xs">
              <li>
                <span className="rounded bg-gray-200 px-1 font-mono">
                  Enter
                </span>{' '}
                - حفظ التعديل
              </li>
              <li>
                <span className="rounded bg-gray-200 px-1 font-mono">
                  Escape
                </span>{' '}
                - إلغاء التعديل
              </li>
              <li>
                <span className="rounded bg-gray-200 px-1 font-mono">
                  Ctrl+S
                </span>{' '}
                - حفظ الشجرة
              </li>
              <li>
                <span className="rounded bg-gray-200 px-1 font-mono">
                  Ctrl+P
                </span>{' '}
                - طباعة الشجرة
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
