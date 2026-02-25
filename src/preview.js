// Preview rendering — visual (Minecraft) and JSON code views

import { currentDialog, escapeHtml } from './dialog.js';

// === MiniMessage parser ===
const COLOR_MAP = {
  black: '#000000',
  dark_blue: '#0000AA',
  dark_green: '#00AA00',
  dark_aqua: '#00AAAA',
  dark_red: '#AA0000',
  dark_purple: '#AA00AA',
  gold: '#FFAA00',
  gray: '#AAAAAA',
  dark_gray: '#555555',
  blue: '#5555FF',
  green: '#55FF55',
  aqua: '#55FFFF',
  red: '#FF5555',
  light_purple: '#FF55FF',
  yellow: '#FFFF55',
  white: '#FFFFFF',
};

export function parseMinimessage(text) {
  if (!text) return '';
  text = text.replace(/<b>(.*?)<\/b>/gs, '<strong>$1</strong>');
  text = text.replace(/<i>(.*?)<\/i>/gs, '<em>$1</em>');
  text = text.replace(/<u>(.*?)<\/u>/gs, '<u>$1</u>');
  text = text.replace(/<color:(\w+)>(.*?)<\/color>/gs, (_, colorName, content) => {
    const hex = COLOR_MAP[colorName.toLowerCase()] || colorName;
    return `<span style="color:${hex}">${content}</span>`;
  });
  text = text.replace(/<color:(#[0-9a-fA-F]{6})>(.*?)<\/color>/gs, '<span style="color:$1">$2</span>');
  text = text.replace(
    /<gradient:(#[0-9a-fA-F]{6}):.*?>(.*?)<\/gradient>/gs,
    '<span style="color:$1">$2</span>'
  );
  text = text.replace(
    /<rainbow>(.*?)<\/rainbow>/gs,
    '<span style="background:linear-gradient(to right,red,orange,yellow,green,blue,violet);-webkit-background-clip:text;-webkit-text-fill-color:transparent">$1</span>'
  );
  return text;
}

export function stripMinimessage(text) {
  if (!text) return '';
  return text
    .replace(/<\/?b>/g, '')
    .replace(/<\/?i>/g, '')
    .replace(/<\/?u>/g, '')
    .replace(/<color:[^>]+>/g, '')
    .replace(/<\/color>/g, '')
    .replace(/<gradient:[^>]+>/g, '')
    .replace(/<\/gradient>/g, '')
    .replace(/<\/?rainbow>/g, '')
    .replace(/<click:[^>]+>/g, '')
    .replace(/<\/click>/g, '');
}

// === Main preview entry point ===
export function updatePreview() {
  // Sync form → state
  const idEl = document.getElementById('dialog-id');
  const titleEl = document.getElementById('dialog-title');
  const escEl = document.getElementById('can-close-escape');

  if (idEl) currentDialog.id = idEl.value;
  if (titleEl) currentDialog.title = titleEl.value;
  if (escEl) currentDialog.canCloseWithEscape = escEl.checked;

  updateVisualPreview();
  updateJSONPreview();
}

// === Visual preview (Minecraft-styled) ===
export function updateVisualPreview() {
  const preview = document.getElementById('preview-container');
  if (!preview) return;

  const px = (n) => `calc(var(--dialog-px) * ${n})`;

  // Preserve scroll position
  const scrollContainer = preview.querySelector('.dialog-preview > div:nth-child(2)');
  const scrollPosition = scrollContainer ? scrollContainer.scrollTop : 0;

  // Title
  const titleHtml = `
    <div style="height:${px(33)};display:flex;gap:${px(10)};justify-content:center;align-items:center">
      <span class="text-component">${parseMinimessage(currentDialog.title)}</span>
      <div class="tooltip-container">
        <div class="dialog-warning-button" style="width:${px(20)};height:${px(20)};"></div>
        <div class="dialog-tooltip" style="left:${px(20)};top:${px(-10)};">
          <span class="text-component">This is a custom screen. Click here to learn more.</span>
        </div>
      </div>
    </div>`;

  // Body
  let bodyHtml = '';
  if (currentDialog.body.length > 0 && currentDialog.body.some((l) => l.text.trim())) {
    currentDialog.body.forEach((line) => {
      if (line.text.trim()) {
        bodyHtml += `<div class="dialog-body" style="max-width:${px(200)};padding:${px(4)}">
          <span class="text-component">${parseMinimessage(line.text)}</span>
        </div>`;
      }
    });
  }

  // Inputs
  let inputsHtml = '';
  const hasInputs =
    currentDialog.inputs.textFields.length > 0 ||
    currentDialog.inputs.selects.length > 0 ||
    currentDialog.inputs.checkboxes.length > 0;

  if (hasInputs) {
    let selectIndex = 0;
    [...currentDialog.inputs.textFields, ...currentDialog.inputs.selects, ...currentDialog.inputs.checkboxes]
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach((input) => {
        if (input.maxLength !== undefined) {
          // Text field
          const currentValue = input.currentValue || '';
          inputsHtml += `
            <div style="display:flex;flex-direction:column;gap:${px(4)};margin-bottom:${px(10)}">
              <span class="text-component">${parseMinimessage(input.label)}</span>
              <div class="dialog-edit-box" style="width:${px(200)};height:${px(20)};position:relative">
                <input type="text"
                  class="preview-text-input"
                  data-field-key="${input.key}"
                  value="${escapeHtml(currentValue)}"
                  placeholder="${escapeHtml(input.placeholder || '')}"
                  maxlength="${input.maxLength}"
                  style="position:absolute;top:0;left:0;width:100%;height:100%;background:transparent;border:none;outline:none;padding:${px(4)};font-family:MinecraftSeven,sans-serif;font-size:${px(8)};color:#fff">
              </div>
            </div>`;
        } else if (input.options !== undefined) {
          // Select / dropdown
          const selectedOption = input.options.find((opt) => opt.initial) || input.options[0];
          const label = selectedOption ? selectedOption.display || selectedOption.value : '';
          inputsHtml += `
            <div class="dialog-button minecraft-select-button" data-select-index="${selectIndex}"
              style="width:${px(200)};height:${px(20)};cursor:pointer;margin-bottom:${px(10)}">
              <span class="text-component">${parseMinimessage(input.label)} ${parseMinimessage(label)}</span>
            </div>`;
          selectIndex++;
        } else {
          // Checkbox
          inputsHtml += `
            <div style="display:flex;gap:${px(4)};align-items:center;justify-content:center;margin-bottom:${px(10)}">
              <div class="dialog-checkbox ${input.initial ? 'dialog-selected' : ''}"
                style="width:${px(17)};height:${px(17)};flex-shrink:0"></div>
              <span class="text-component" style="color:#e0e0e0;line-height:${px(17)}">${parseMinimessage(input.label)}</span>
            </div>`;
        }
      });
  }

  // Buttons
  let buttonsHtml = '';
  if (currentDialog.buttons.length > 0) {
    const columns = 2;
    const total = currentDialog.buttons.length;
    const gridCount = Math.floor(total / columns) * columns;

    buttonsHtml = `<div style="padding-top:${px(4)};display:grid;grid-template-columns:repeat(${columns},minmax(0,1fr));gap:${px(2)};justify-content:center">`;

    currentDialog.buttons.slice(0, gridCount).forEach((button, index) => {
      buttonsHtml += buildButtonHtml(button, index, px);
    });

    if (total > gridCount) {
      buttonsHtml += `<div style="grid-column:span ${columns};display:flex;gap:${px(2)};justify-content:center">`;
      currentDialog.buttons.slice(gridCount).forEach((button, i) => {
        buttonsHtml += buildButtonHtml(button, gridCount + i, px);
      });
      buttonsHtml += '</div>';
    }

    buttonsHtml += '</div>';
  }

  preview.innerHTML = `
    <div class="dialog-preview" style="--dialog-px:1px;width:100%;max-width:400px;max-height:450px;display:flex;flex-direction:column;margin:0 auto">
      ${titleHtml}
      <div style="display:flex;flex-direction:column;gap:${px(10)};align-items:center;overflow-y:auto;flex:1;padding:${px(10)} 0">
        ${bodyHtml}
        ${inputsHtml}
      </div>
      <div style="padding-top:${px(10)};flex-shrink:0;display:flex;justify-content:center">
        ${buttonsHtml}
      </div>
    </div>`;

  // Responsive scaling
  const dialogPreview = preview.querySelector('.dialog-preview');
  if (dialogPreview) {
    const resize = () => {
      const w = Math.floor(preview.clientWidth);
      dialogPreview.style.setProperty('--dialog-px', `${w / 400}px`);
    };
    resize();
    // Remove old listener (stored on element) and add fresh one
    if (preview._resizeHandler) window.removeEventListener('resize', preview._resizeHandler);
    preview._resizeHandler = resize;
    window.addEventListener('resize', resize);
  }

  // Restore scroll
  const newScrollContainer = preview.querySelector('.dialog-preview > div:nth-child(2)');
  if (newScrollContainer && scrollPosition > 0) {
    newScrollContainer.scrollTop = scrollPosition;
  }

  // Wire up interactive elements
  preview.querySelectorAll('.minecraft-select-button').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      cycleSelectOption(parseInt(e.currentTarget.dataset.selectIndex));
    });
  });

  preview.querySelectorAll('.preview-button-click').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      showButtonActions(parseInt(e.currentTarget.dataset.buttonIndex));
    });
  });

  preview.querySelectorAll('.preview-text-input').forEach((input) => {
    input.addEventListener('input', (e) => {
      const field = currentDialog.inputs.textFields.find((f) => f.key === e.target.dataset.fieldKey);
      if (field) field.currentValue = e.target.value;
    });
  });
}

function buildButtonHtml(button, index, px) {
  const inner = `<span class="text-component">${parseMinimessage(button.label)}</span>`;
  const btnEl = `<div class="dialog-button preview-button-click" data-button-index="${index}"
    style="width:${px(150)};height:${px(20)};cursor:pointer">${inner}</div>`;

  if (button.tooltip) {
    return `<div class="tooltip-container">
      ${btnEl}
      <div class="dialog-tooltip" style="left:50%;transform:translateX(-50%);bottom:${px(25)}">
        <span class="text-component">${parseMinimessage(button.tooltip)}</span>
      </div>
    </div>`;
  }
  return btnEl;
}

function cycleSelectOption(selectIndex) {
  const select = currentDialog.inputs.selects[selectIndex];
  if (!select) return;

  const currentInitialIndex = select.options.findIndex((opt) => opt.initial);
  select.options.forEach((opt) => (opt.initial = false));
  select.options[(currentInitialIndex + 1) % select.options.length].initial = true;
  updateVisualPreview();
}

function showButtonActions(buttonIndex) {
  const button = currentDialog.buttons[buttonIndex];
  const consoleContent = document.getElementById('preview-console-content');
  if (!consoleContent) return;

  if (!button || !button.actions || button.actions.length === 0) {
    consoleContent.innerHTML = `<div style="color:var(--md-sys-color-outline);font-style:italic">
      Button "${stripMinimessage(button.label)}" has no actions</div>`;
    return;
  }

  // Collect current input values
  const inputValues = {};
  currentDialog.inputs.textFields.forEach((f) => (inputValues[f.key] = f.currentValue || ''));
  currentDialog.inputs.selects.forEach((s) => {
    const sel = s.options.find((o) => o.initial) || s.options[0];
    inputValues[s.key] = sel ? sel.value : '';
  });
  currentDialog.inputs.checkboxes.forEach((c) => (inputValues[c.key] = c.initial ? 'true' : 'false'));

  let output = '';
  button.actions.forEach((action) => {
    const type = action.name || 'unknown';
    const data = (action.data || '').replace(/\{(\w+)\}/g, (m, k) =>
      inputValues[k] !== undefined ? inputValues[k] : m
    );

    const descriptions = {
      message: `Send message: "${data}"`,
      open_dialog: `Open dialog: "${data}"`,
      open_random_dialog: `Open random dialog from: ${data}`,
      console_command: `Execute console command: /${data}`,
      player_command: `Execute as player: /${data}`,
      send_to_server: `Transfer to server: "${data}"`,
    };

    output += `<div>
      <div class="console-action-type">${type}</div>
      <div class="console-action-data">${descriptions[type] || `Data: ${data}`}</div>
    </div>`;
  });

  consoleContent.innerHTML = output;
}

// === JSON preview ===
export function updateJSONPreview() {
  const el = document.getElementById('json-preview');
  if (el) el.textContent = JSON.stringify(currentDialog, null, 2);
}
