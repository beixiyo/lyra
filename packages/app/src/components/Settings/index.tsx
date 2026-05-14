import { cn } from 'utils'
import { memo } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { useTranslation } from 'react-i18next'
import { useLatestCallback } from 'hooks'
import { FolderPlus, X } from 'lucide-react'
import { musicDirs, pickAndAddDirs, removeMusicDir } from '@/stores/library'
import { supportedLanguages } from '@/locales'

export const Settings = memo<SettingsProps>(({ style, className }) => {
  useSignals()
  const { t, i18n } = useTranslation()

  const handleLanguage = useLatestCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value)
  })

  return (
    <div
      className={cn('flex flex-col max-w-lg', className)}
      style={style}
    >
      <h1 className="text-[28px] font-bold tracking-tight mb-8">
        {t('settings.title')}
      </h1>

      <div className="space-y-6">
        <SettingRow label={t('settings.language')}>
          <select
            value={i18n.language}
            onChange={handleLanguage}
            className={cn(
              'px-3 py-1.5 text-[13px] rounded-lg',
              'bg-white/[0.06] text-neutral-200 border border-white/[0.06]',
              'outline-none focus:border-white/[0.1] cursor-pointer',
            )}
          >
            {supportedLanguages.map(lang => (
              <option key={lang.code} value={lang.code} className="bg-neutral-900">
                {lang.label}
              </option>
            ))}
          </select>
        </SettingRow>

        <SettingRow label={t('settings.musicDirs')}>
          <div className="flex flex-col gap-1.5 w-full">
            {musicDirs.value.map(dir => (
              <div
                key={dir}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] text-[13px] text-neutral-300"
              >
                <span className="flex-1 truncate" title={dir}>{dir}</span>
                <button
                  onClick={() => removeMusicDir(dir)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-neutral-200 transition-opacity shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {musicDirs.value.length === 0 && (
              <p className="text-[13px] text-neutral-600">{t('settings.noDirectories')}</p>
            )}

            <button
              onClick={pickAndAddDirs}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px]',
                'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04] transition-colors',
              )}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              {t('settings.addDirectory')}
            </button>
          </div>
        </SettingRow>

        <SettingRow label={t('settings.version')}>
          <span className="text-[13px] text-neutral-500">0.1.0</span>
        </SettingRow>
      </div>
    </div>
  )
})

Settings.displayName = 'Settings'

const SettingRow = memo<SettingRowProps>(({ label, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[13px] font-medium text-neutral-400">
      {label}
    </label>
    {children}
  </div>
))

SettingRow.displayName = 'SettingRow'

export type SettingsProps = {} & React.HTMLAttributes<HTMLElement>

type SettingRowProps = {
  label: string
} & React.PropsWithChildren
