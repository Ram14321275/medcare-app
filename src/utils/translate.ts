import { Language } from '../i18n/translations';

const shortLangMap: Record<Language, string> = {
  en: 'en',
  te: 'te',
  hi: 'hi',
  ta: 'ta'
};

export const translateText = async (text: string, targetLang: Language): Promise<string> => {
  if (targetLang === 'en' || !text.trim()) return text;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${shortLangMap[targetLang]}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0][0][0] || text;
  } catch (error) {
    console.error("Translation API failed:", error);
    return text;
  }
};
