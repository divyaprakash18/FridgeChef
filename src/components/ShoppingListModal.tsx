import React, { useState } from 'react';
import { X, Check, Trash2, Plus, Copy, Share2, ShoppingBag } from 'lucide-react';
import { ShoppingItem } from '../types';

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onAddItem: (name: string) => void;
  onClearCompleted: () => void;
}

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({
  isOpen,
  onClose,
  items,
  onToggleItem,
  onRemoveItem,
  onAddItem,
  onClearCompleted,
}) => {
  if (!isOpen) return null;

  const [newItemName, setNewItemName] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddItem(newItemName.trim());
    setNewItemName('');
  };

  const handleCopyList = () => {
    const text = items
      .map((item) => `${item.completed ? '[x]' : '[ ]'} ${item.name}${item.recipeTitle ? ` (for ${item.recipeTitle})` : ''}`)
      .join('\n');
    navigator.clipboard.writeText(`🛒 FridgeChef Grocery List:\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Missing Ingredients Grocery List
              </h3>
              <p className="text-xs text-stone-500">
                {items.length} items to pick up · {completedCount} checked
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add Bar */}
        <div className="p-4 border-b border-stone-100 bg-white">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add extra grocery item..."
              className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Items List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              Your grocery list is empty. Click "+ Add to Grocery List" on any recipe to add missing items!
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleItem(item.id)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  item.completed
                    ? 'bg-stone-50 border-stone-200 text-stone-400 line-through'
                    : 'bg-white border-stone-200 text-stone-800 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      item.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {item.completed && <Check className="w-3 h-3" />}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-medium">{item.name}</span>
                    {item.recipeTitle && (
                      <span className="text-[10px] text-stone-400 block truncate">
                        for {item.recipeTitle}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(item.id);
                  }}
                  className="p-1 text-stone-300 hover:text-rose-600 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
          {completedCount > 0 ? (
            <button
              onClick={onClearCompleted}
              className="text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            >
              Clear completed ({completedCount})
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyList}
              disabled={items.length === 0}
              className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
