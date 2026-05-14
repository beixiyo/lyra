import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import zhCN from './zh-CN/common.json'
import enUS from './en-US/common.json'

const STORAGE_KEY = 'lyra:locale'

const resources = {
  'zh-CN': { common: zhCN },
  'en-US': { common: enUS },
}

const languageDetector = new LanguageDetector()
languageDetector.addDetector({
  name: 'systemLocale',
  lookup() {
    const nav = navigator.language || ''
    if (nav.startsWith('zh')) return 'zh-CN'
    if (nav.startsWith('en')) return 'en-US'
    return undefined
  },
})

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: {
      zh: ['zh-CN'],
      en: ['en-US'],
      default: ['zh-CN'],
    },
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'systemLocale', 'navigator'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
    resources,
  })

export default i18n
export { STORAGE_KEY }

export const supportedLanguages = [
  { code: 'zh-CN', label: '中文' },
  { code: 'en-US', label: 'English' },
] as const
