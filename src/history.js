// Undo/Redo History System

import { showToast } from './toast.js';

export class DialogHistory {
  constructor(maxSize = 50) {
    this.history = [];
    this.currentIndex = -1;
    this.maxSize = maxSize;
  }

  push(state) {
    // Remove any states after current index (branch pruning)
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new state (deep clone to avoid mutations)
    this.history.push(JSON.parse(JSON.stringify(state)));

    // Limit history size
    if (this.history.length > this.maxSize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }

    this.updateUI();
  }

  undo() {
    if (this.canUndo()) {
      this.currentIndex--;
      this.updateUI();
      return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
    }
    return null;
  }

  redo() {
    if (this.canRedo()) {
      this.currentIndex++;
      this.updateUI();
      return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
    }
    return null;
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  updateUI() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');

    if (undoBtn) undoBtn.disabled = !this.canUndo();
    if (redoBtn) redoBtn.disabled = !this.canRedo();
  }
}

// Singleton history instance
export const dialogHistory = new DialogHistory();

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// These are set by main.js after all modules are ready
let _trackChange = null;
let _loadDialogToForm = null;

export function registerHistoryCallbacks(trackFn, loadFn) {
  _trackChange = trackFn;
  _loadDialogToForm = loadFn;
}

export function performUndo() {
  const state = dialogHistory.undo();
  if (state && _loadDialogToForm) {
    _loadDialogToForm(state);
    showToast('Undo successful', 'info', 1500);
  }
}

export function performRedo() {
  const state = dialogHistory.redo();
  if (state && _loadDialogToForm) {
    _loadDialogToForm(state);
    showToast('Redo successful', 'info', 1500);
  }
}
