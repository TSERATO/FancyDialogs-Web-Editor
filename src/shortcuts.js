// Keyboard shortcuts and help panel

import { downloadJSON, copyJSON } from './storage.js';
import { performUndo, performRedo } from './history.js';
import { closeActionModal, closeOptionModal, closePresetsModal } from './modals.js';
import { showToast } from './toast.js';

// ── Keyboard Shortcuts ───────────────────────────────────────────────────────

export function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const mod = isMac ? e.metaKey : e.ctrlKey;

    // Don't fire when user is typing inside a text field / textarea
    const tag = document.activeElement?.tagName;
    const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' ||
      document.activeElement?.closest('md-outlined-text-field') ||
      document.activeElement?.closest('md-outlined-select');

    // Ctrl/Cmd + S — Save (download)
    if (mod && e.key === 's') {
      e.preventDefault();
      downloadJSON();
    }

    // Ctrl/Cmd + K — Copy JSON
    if (mod && e.key === 'k') {
      e.preventDefault();
      copyJSON();
    }

    // Ctrl/Cmd + O — Open import
    if (mod && e.key === 'o') {
      e.preventDefault();
      document.getElementById('file-input')?.click();
    }

    // Ctrl/Cmd + Z — Undo
    if (mod && e.key === 'z' && !e.shiftKey) {
      if (!isTyping) {
        e.preventDefault();
        performUndo();
      }
    }

    // Ctrl/Cmd + Shift + Z — Redo
    if (mod && e.shiftKey && e.key === 'z') {
      if (!isTyping) {
        e.preventDefault();
        performRedo();
      }
    }

    // Ctrl/Cmd + 1-4 — Switch editor tabs
    if (mod && ['1', '2', '3', '4'].includes(e.key)) {
      e.preventDefault();
      const tabIndex = parseInt(e.key) - 1;
      const editorTabs = document.getElementById('editor-tabs');
      if (editorTabs) {
        const tabs = editorTabs.querySelectorAll('md-primary-tab');
        if (tabs[tabIndex]) tabs[tabIndex].click();
      }
    }

    // Ctrl/Cmd + / — Toggle help panel
    if (mod && e.key === '/') {
      e.preventDefault();
      toggleHelpPanel();
    }

    // Escape — Close any open modal
    if (e.key === 'Escape') {
      closeActionModal();
      closeOptionModal();
      closePresetsModal();
    }
  });
}

// ── Help Panel ───────────────────────────────────────────────────────────────

export function createHelpPanel() {
  const panel = document.createElement('div');
  panel.id = 'help-panel';
  panel.className = 'help-panel collapsed';
  panel.innerHTML = `
    <button class="help-toggle" id="help-toggle-btn" aria-label="Toggle help">
      <span class="material-symbols-outlined">help</span>
    </button>

    <div class="help-content">
      <div class="help-header">
        <h3>Quick Help</h3>
        <button id="help-close-btn" aria-label="Close help">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="help-sections">
        <div class="help-section">
          <h4>Keyboard Shortcuts</h4>
          <ul>
            <li><kbd>Ctrl</kbd> + <kbd>S</kbd> — Save dialog</li>
            <li><kbd>Ctrl</kbd> + <kbd>K</kbd> — Copy JSON</li>
            <li><kbd>Ctrl</kbd> + <kbd>O</kbd> — Import file</li>
            <li><kbd>Ctrl</kbd> + <kbd>Z</kbd> — Undo</li>
            <li><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> — Redo</li>
            <li><kbd>Ctrl</kbd> + <kbd>1–4</kbd> — Switch tabs</li>
            <li><kbd>Ctrl</kbd> + <kbd>/</kbd> — Toggle help</li>
          </ul>
        </div>

        <div class="help-section">
          <h4>MiniMessage Examples</h4>
          <ul>
            <li><code>&lt;b&gt;Bold&lt;/b&gt;</code></li>
            <li><code>&lt;i&gt;Italic&lt;/i&gt;</code></li>
            <li><code>&lt;u&gt;Underline&lt;/u&gt;</code></li>
            <li><code>&lt;color:red&gt;Red&lt;/color&gt;</code></li>
            <li><code>&lt;color:#ff0000&gt;Hex&lt;/color&gt;</code></li>
            <li><code>&lt;gradient:red:blue&gt;Text&lt;/gradient&gt;</code></li>
          </ul>
        </div>

        <div class="help-section">
          <h4>Quick Tips</h4>
          <ul>
            <li>Use {key} to reference input values</li>
            <li>Use %placeholder% for PlaceholderAPI</li>
            <li>Dialogs need at least one button</li>
            <li>Drag and drop JSON files to import</li>
            <li>Changes are auto-saved every 30s</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  panel.querySelector('#help-toggle-btn').addEventListener('click', toggleHelpPanel);
  panel.querySelector('#help-close-btn').addEventListener('click', toggleHelpPanel);
}

export function toggleHelpPanel() {
  document.getElementById('help-panel')?.classList.toggle('collapsed');
}

// ── Tooltip system ────────────────────────────────────────────────────────────

let _currentTooltipTarget = null;

export function initTooltips() {
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target && target !== _currentTooltipTarget) {
      _currentTooltipTarget = target;
      showTooltip(target, target.getAttribute('data-tooltip'));
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (target && target === _currentTooltipTarget) {
      const rel = e.relatedTarget;
      if (!rel || !target.contains(rel)) {
        hideTooltip();
        _currentTooltipTarget = null;
      }
    }
  });

  document.addEventListener('scroll', hideTooltip, true);
  document.addEventListener('click', hideTooltip);
}

function showTooltip(element, text) {
  hideTooltip();

  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.id = 'active-tooltip';
  tooltip.textContent = text;
  document.body.appendChild(tooltip);

  const rect = element.getBoundingClientRect();
  const h = tooltip.offsetHeight;
  const w = tooltip.offsetWidth;
  const pad = 10;

  let top = rect.bottom + 8;
  let left = rect.left + rect.width / 2 - w / 2;

  if (left < pad) left = pad;
  else if (left + w > window.innerWidth - pad) left = window.innerWidth - w - pad;

  if (top + h > window.innerHeight - pad) {
    top = rect.top - h - 8;
    tooltip.classList.add('tooltip-top');
  }

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
  requestAnimationFrame(() => tooltip.classList.add('visible'));
}

function hideTooltip() {
  const tip = document.getElementById('active-tooltip');
  if (tip) {
    tip.classList.remove('visible');
    setTimeout(() => tip.parentNode && tip.remove(), 200);
  }
}
