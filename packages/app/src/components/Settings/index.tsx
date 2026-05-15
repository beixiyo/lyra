import { cn } from 'utils'
import { memo } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { useTranslation } from 'react-i18next'
import { useLatestCallback } from 'hooks'
import { FolderPlus, X } from 'lucide-react'
import { musicDirs, pickAndAddDirs, removeMusicDir } from '@/stores/library'
import { supportedLanguages } from '@/locales'
import { THEMES, THEME_IDS, currentTheme, dynamicAccent, applyTheme } from '@/stores/theme'
import { DEFAULT_BINDINGS, ACTION_LABELS, codeToLabel } from '@/stores/keybindings'
import type { ThemeId } from '@/stores/theme'

export const Settings = memo<SettingsProps>(({ style, className }) => {
  useSignals()
  const { t, i18n } = useTranslation()

  const handleLanguage = useLatestCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value)
  })

  const handleTheme = useLatestCallback((id: ThemeId) => {
    applyTheme(id)
  })

  const handleDynamicAccent = useLatestCallback(() => {
    dynamicAccent.value = !dynamicAccent.value
  })

  return (
    <div
      className={cn('flex flex-col max-w-lg pb-12', className)}
      style={style}
    >
      <h1 className="text-[28px] font-bold tracking-tight mb-8">
        {t('settings.title')}
      </h1>

      <div className="space-y-8">

        {/* Language */}
        <SettingSection label={t('settings.language')}>
          <select
            value={i18n.language}
            onChange={handleLanguage}
            className={cn(
              'px-3 py-1.5 text-[13px] rounded-lg',
              'bg-overlay/[0.06] text-primary border border-line/[0.06]',
              'outline-none focus:border-line/[0.1] cursor-pointer',
            )}
          >
            {supportedLanguages.map(lang => (
              <option key={lang.code} value={lang.code} className="bg-surface">
                {lang.label}
              </option>
            ))}
          </select>
        </SettingSection>

        {/* Theme */}
        <SettingSection label={t('settings.theme')}>
          <div className="flex flex-col gap-3">

            {/* Theme presets */}
            <div className="flex gap-2 flex-wrap">
              {THEME_IDS.map(id => (
                <button
                  key={id}
                  onClick={() => handleTheme(id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition-colors border',
                    currentTheme.value === id
                      ? 'border-accent text-accent bg-accent/[0.08]'
                      : 'border-line/[0.06] text-secondary hover:text-primary hover:bg-overlay/[0.04]',
                  )}
                >
                  <ThemeDot themeId={id} />
                  {THEMES[id].name}
                </button>
              ))}
            </div>

            {/* Dynamic accent toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <button
                role="switch"
                aria-checked={dynamicAccent.value}
                onClick={handleDynamicAccent}
                className={cn(
                  'w-9 h-5 rounded-full transition-colors relative shrink-0',
                  dynamicAccent.value ? 'bg-accent' : 'bg-overlay/[0.15]',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-primary shadow-sm transition-all',
                    dynamicAccent.value ? 'left-[18px]' : 'left-0.5',
                  )}
                />
              </button>
              <span className="text-[13px] text-secondary group-hover:text-primary transition-colors">
                {t('settings.dynamicAccent')}
              </span>
            </label>
          </div>
        </SettingSection>

        {/* Music directories */}
        <SettingSection label={t('settings.musicDirs')}>
          <div className="flex flex-col gap-1.5 w-full">
            {musicDirs.value.map(dir => (
              <div
                key={dir}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-overlay/[0.04] text-[13px] text-primary"
              >
                <span className="flex-1 truncate text-secondary" title={dir}>{dir}</span>
                <button
                  onClick={() => removeMusicDir(dir)}
                  className="opacity-0 group-hover:opacity-100 text-muted hover:text-primary transition-opacity shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {musicDirs.value.length === 0 && (
              <p className="text-[13px] text-muted">{t('settings.noDirectories')}</p>
            )}

            <button
              onClick={pickAndAddDirs}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-[13px]',
                'text-secondary hover:text-primary hover:bg-overlay/[0.04] transition-colors',
              )}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              {t('settings.addDirectory')}
            </button>
          </div>
        </SettingSection>

        {/* Keyboard shortcuts */}
        <SettingSection label={t('settings.keybindings')}>
          <div className="flex flex-col gap-1">
            {(Object.entries(DEFAULT_BINDINGS) as [keyof typeof DEFAULT_BINDINGS, string][]).map(([action, code]) => (
              <div
                key={action}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-overlay/[0.04] transition-colors"
              >
                <span className="text-[13px] text-secondary">
                  {t(ACTION_LABELS[action])}
                </span>
                <kbd className="text-[12px] text-muted bg-overlay/[0.06] border border-line/[0.06] px-2 py-0.5 rounded font-mono">
                  {codeToLabel(code)}
                </kbd>
              </div>
            ))}
          </div>
        </SettingSection>

        {/* Version */}
        <SettingSection label={t('settings.version')}>
          <span className="text-[13px] text-muted">0.1.0</span>
        </SettingSection>

      </div>
    </div>
  )
})

Settings.displayName = 'Settings'

// ─── Theme accent dot ─────────────────────────────────────────────────────────

const ThemeDot = memo<{ themeId: ThemeId }>(({ themeId }) => (
  <span
    className="w-3 h-3 rounded-full shrink-0"
    style={{ backgroundColor: THEMES[themeId]['--color-accent'] }}
  />
))

ThemeDot.displayName = 'ThemeDot'

// ─── Setting section wrapper ──────────────────────────────────────────────────

const SettingSection = memo<SettingSectionProps>(({ label, children }) => (
  <div className="flex flex-col gap-3">
    <label className="text-[13px] font-medium text-secondary">
      {label}
    </label>
    {children}
  </div>
))

SettingSection.displayName = 'SettingSection'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SettingsProps = {} & React.HTMLAttributes<HTMLElement>

type SettingSectionProps = {
  label: string
} & React.PropsWithChildren
