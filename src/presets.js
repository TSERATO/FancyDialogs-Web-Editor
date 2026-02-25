// Preset dialog definitions

export const PRESETS = {
  welcome: {
    id: 'welcome_dialog',
    title: '<u><b><color:#ffd000>Welcome to the Server!</color></b></u>',
    canCloseWithEscape: true,
    body: [
      { text: '<color:#ffd199>Hello and welcome!</color>' },
      { text: '' },
      { text: "We're glad to have you here." },
      { text: 'Please take a moment to read the rules.' },
    ],
    inputs: { textFields: [], selects: [], checkboxes: [] },
    buttons: [
      { label: '<color:#10b981>Continue</color>', tooltip: 'Proceed', actions: [] },
      {
        label: '<color:#94a3b8>Read Rules</color>',
        tooltip: 'View rules',
        actions: [{ name: 'open_dialog', data: 'rules_dialog' }],
      },
    ],
  },

  confirm: {
    id: 'confirm_dialog',
    title: '<b><color:#ea580c>Confirm Action</color></b>',
    canCloseWithEscape: true,
    body: [
      { text: '<color:#fbbf24>Are you sure?</color>' },
      { text: '' },
      { text: 'This action cannot be undone.' },
    ],
    inputs: { textFields: [], selects: [], checkboxes: [] },
    buttons: [
      { label: '<color:#ef4444>Cancel</color>', tooltip: 'Cancel action', actions: [] },
      {
        label: '<color:#10b981>Confirm</color>',
        tooltip: 'Confirm action',
        actions: [{ name: 'console_command', data: 'say Action confirmed!' }],
      },
    ],
  },

  survey: {
    id: 'survey_dialog',
    title: '<b><color:#3b82f6>Player Survey</color></b>',
    canCloseWithEscape: false,
    body: [
      { text: '<color:#ffd199>Help us improve!</color>' },
      { text: '' },
      { text: 'Please answer a few questions:' },
    ],
    inputs: {
      textFields: [
        {
          placeholder: 'Your feedback here...',
          maxLength: 200,
          maxLines: 3,
          key: 'feedback',
          label: '<color:#fbbf24>What do you think?</color>',
          order: 1,
        },
      ],
      selects: [
        {
          options: [
            { value: '5', display: '<color:#10b981>⭐⭐⭐⭐⭐ Excellent</color>', initial: true },
            { value: '4', display: '<color:#3b82f6>⭐⭐⭐⭐ Good</color>', initial: false },
            { value: '3', display: '<color:#fbbf24>⭐⭐⭐ Average</color>', initial: false },
            { value: '2', display: '<color:#ea580c>⭐⭐ Poor</color>', initial: false },
            { value: '1', display: '<color:#ef4444>⭐ Bad</color>', initial: false },
          ],
          key: 'rating',
          label: '<color:#fbbf24>Rate your experience:</color>',
          order: 2,
        },
      ],
      checkboxes: [
        {
          initial: false,
          key: 'recommend',
          label: '<color:#fbbf24>Would you recommend us?</color>',
          order: 3,
        },
      ],
    },
    buttons: [
      {
        label: '<color:#10b981>Submit</color>',
        tooltip: 'Submit survey',
        actions: [{ name: 'message', data: 'Thank you for your feedback!' }],
      },
    ],
  },

  settings: {
    id: 'settings_dialog',
    title: '<b><color:#d97706>⚙️ Settings</color></b>',
    canCloseWithEscape: true,
    body: [{ text: '<color:#ffd199>Configure your preferences</color>' }],
    inputs: {
      textFields: [],
      selects: [
        {
          options: [
            { value: 'low', display: 'Low', initial: false },
            { value: 'medium', display: 'Medium', initial: true },
            { value: 'high', display: 'High', initial: false },
          ],
          key: 'quality',
          label: '<color:#fbbf24>Graphics Quality:</color>',
          order: 1,
        },
      ],
      checkboxes: [
        { initial: true, key: 'sounds', label: '<color:#fbbf24>Enable Sounds</color>', order: 2 },
        { initial: false, key: 'notifications', label: '<color:#fbbf24>Show Notifications</color>', order: 3 },
      ],
    },
    buttons: [
      { label: '<color:#ef4444>Cancel</color>', tooltip: 'Discard changes', actions: [] },
      {
        label: '<color:#10b981>Save</color>',
        tooltip: 'Save settings',
        actions: [{ name: 'message', data: 'Settings saved!' }],
      },
    ],
  },

  warning: {
    id: 'warning_dialog',
    title: '<b><color:#ef4444>⚠️ Warning</color></b>',
    canCloseWithEscape: false,
    body: [
      { text: '<color:#ef4444><b>ATTENTION!</b></color>' },
      { text: '' },
      { text: 'You are entering a dangerous area.' },
      { text: 'Proceed with caution!' },
    ],
    inputs: { textFields: [], selects: [], checkboxes: [] },
    buttons: [
      { label: '<color:#94a3b8>Go Back</color>', tooltip: 'Return to safety', actions: [] },
      {
        label: '<color:#fbbf24>I Understand</color>',
        tooltip: 'Accept risk',
        actions: [{ name: 'message', data: 'Be careful!' }],
      },
    ],
  },
};

export function loadPreset(presetType) {
  return PRESETS[presetType] || null;
}
