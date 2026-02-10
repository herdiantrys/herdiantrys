import 'server-only'
import type { Locale } from './i18n-config'

const dictionaries = {
    en: () => import('./dictionaries/en').then((module) => module.default),
    id: () => import('./dictionaries/id').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => {
    const dict = await (dictionaries[locale]?.() ?? dictionaries.en())
    try {
        return dict;
    } catch (e) {
        console.error("JSON Parse Error in get-dictionary:", e);
        return dict;
    }
}
