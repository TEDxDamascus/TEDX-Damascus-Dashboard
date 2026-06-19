// yes_no is a frontend helper only — it maps to single_choice with pre-filled options.
export const QUESTION_TYPES = [
  { type: 'short_text', label: 'Short Text', description: 'Single-line text' },
  { type: 'long_text', label: 'Long Text', description: 'Multi-line text area' },
  { type: 'number', label: 'Number', description: 'Numeric input' },
  { type: 'email', label: 'Email', description: 'Email address' },
  { type: 'phone_number', label: 'Phone', description: 'Phone number' },
  { type: 'url', label: 'URL', description: 'URL with validation' },
  { type: 'single_choice', label: 'Single Choice', description: 'Pick one option' },
  { type: 'checkbox_group', label: 'Multiple Choice', description: 'Pick multiple options' },
  { type: 'rating', label: 'Rating', description: 'Star / scale rating' },
  { type: 'date', label: 'Date', description: 'Date picker' },
  { type: 'date_range', label: 'Date Range', description: 'Start & end date' },
  { type: 'file_upload', label: 'File Upload', description: 'Upload files' },
  { type: 'yes_no', label: 'Yes / No', description: 'Two-option choice' },
  { type: 'section', label: 'Section', description: 'Visual divider' },
];

const CHOICE_TYPES = ['single_choice', 'checkbox_group'];

export function hasOptions(type) {
  return CHOICE_TYPES.includes(type);
}

export function isSection(type) {
  return type === 'section';
}

export function getTypeLabel(type) {
  return QUESTION_TYPES.find((t) => t.type === type)?.label ?? type;
}

function getDefaultConfig(type) {
  if (type === 'short_text') return { min_length: '', max_length: '' };
  if (type === 'long_text') return { min_length: '', max_length: '' };
  if (type === 'number') return { min: '', max: '' };
  if (type === 'rating') return { min: 1, max: 5 };
  if (type === 'date') return { min_date: '', max_date: '' };
  if (type === 'date_range') return { min_date: '', max_date: '' };
  if (type === 'checkbox_group') return { min_selected: '', max_selected: '' };
  if (type === 'file_upload') {
    return { allowed_types: ['pdf', 'jpg', 'png'], max_size_mb: 10, max_files: 1 };
  }
  return {};
}

export function createQuestion(type, orderIndex = 0, parentId = null) {
  // yes_no → single_choice with pre-filled Yes / No options
  if (type === 'yes_no') {
    return {
      orderIndex,
      type: 'single_choice',
      parentId,
      title: { en: '', ar: '' },
      helpText: { en: '', ar: '' },
      isRequired: false,
      config: {},
      options: [
        { orderIndex: 0, label: { en: 'Yes', ar: 'نعم' } },
        { orderIndex: 1, label: { en: 'No', ar: 'لا' } },
      ],
    };
  }

  return {
    orderIndex,
    type,
    parentId,
    title: { en: '', ar: '' },
    helpText: { en: '', ar: '' },
    isRequired: false,
    config: getDefaultConfig(type),
    options: hasOptions(type)
      ? [
          { orderIndex: 0, label: { en: 'Option 1', ar: 'الخيار 1' } },
          { orderIndex: 1, label: { en: 'Option 2', ar: 'الخيار 2' } },
        ]
      : [],
  };
}

export const TARGET_ROLES = ['Speaker', 'Attender', 'Volunteer', 'Sponsor', 'Partner'];
