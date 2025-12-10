import 'server-only'
import type { Locale } from './i18n-config'

const dictionaries = {
    en: () => import('./dictionaries/en').then((module) => module.default),
    id: () => import('./dictionaries/id').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => dictionaries[locale]?.() ?? dictionaries.en()
