/**
 * Read-aloud labels per locale so TTS speaks fully in the selected language.
 */
const LABELS = {
  en: { practice: 'Practice.', assessment: 'Assessment.', question: 'Question', options: 'Options' },
  hi: { practice: 'Abhyas.', assessment: 'Mulyankan.', question: 'Prashn', options: 'Vikalp' },
  mr: { practice: 'Abhyas.', assessment: 'Mulyankan.', question: 'Prashn', options: 'Vikalp' },
  ta: { practice: 'Sadhana.', assessment: 'Mulyankan.', question: 'Kelvi', options: 'Vikalp' },
  te: { practice: 'Abhyasam.', assessment: 'Mulyankan.', question: 'Prashna', options: 'Vikalpalu' },
  bn: { practice: 'Abhyas.', assessment: 'Mulyankan.', question: 'Prashn', options: 'Vikalp' },
  gu: { practice: 'Abhyas.', assessment: 'Mulyankan.', question: 'Prashn', options: 'Vikalp' },
  kn: { practice: 'Abhyas.', assessment: 'Mulyankan.', question: 'Prashne', options: 'Vikalp' },
  ml: { practice: 'Abhyasam.', assessment: 'Mulyankan.', question: 'Chodyam', options: 'Vikalp' },
  as: { practice: 'Abhyas.', assessment: 'Mulyankan.', question: 'Prashn', options: 'Vikalp' },
  or: { practice: 'Abhyas.', assessment: 'Mulyankan.', question: 'Prashn', options: 'Vikalp' },
  pa: { practice: 'Abhyas.', assessment: 'Mulyankan.', question: 'Prashn', options: 'Vikalp' },
  ur: { practice: 'Mashq.', assessment: 'Mulyankan.', question: 'Sawal', options: 'Vikalp' },
}

export function getReadAloudLabels(locale) {
  return LABELS[locale] || LABELS.en
}
