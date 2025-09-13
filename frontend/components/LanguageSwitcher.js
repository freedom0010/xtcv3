import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

const LanguageSwitcher = () => {
  const router = useRouter()
  const { i18n } = useTranslation()

  const handleLanguageChange = (locale) => {
    router.push(router.pathname, router.asPath, { locale })
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          i18n.language === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('zh')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          i18n.language === 'zh'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        中文
      </button>
    </div>
  )
}

export default LanguageSwitcher