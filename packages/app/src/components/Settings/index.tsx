import { cn } from 'utils'
import { memo } from 'react'
import { motion } from 'motion/react'
import { useSignals } from '@preact/signals-react/runtime'
import { useSignal } from '@preact/signals-react'
import { useTranslation } from 'react-i18next'
import { useLatestCallback } from 'hooks'
import { FolderPlus, X, RotateCcw } from 'lucide-react'
import { Select, Switch, Tooltip } from 'comps'
import { musicDirs, pickAndAddDirs, removeMusicDir } from '@/stores/library'
import { supportedLanguages } from '@/locales'
import { THEMES, THEME_IDS, currentTheme, dynamicAccent, applyTheme } from '@/stores/theme'
import {
  DEFAULT_BINDINGS, ACTION_LABELS, codeToLabel,
  customBindings, resetBinding, removeBinding,
  globalShortcutActions, toggleActionGlobal,
} from '@/stores/keybindings'
import { useBindingCapture } from './useBindingCapture'
import type { ThemeId } from '@/stores/theme'
import type { ActionId } from '@/stores/keybindings'

export const Settings = memo<SettingsProps>(({ style, className }) => {
  useSignals()
  const { t, i18n } = useTranslation()
  const listening = useSignal<ActionId | null>(null)

  useBindingCapture(listening.value, () => { listening.value = null })

  const handleLanguage = useLatestCallback((value: string) => {
    i18n.changeLanguage(value)
  })

  const handleTheme = useLatestCallback((id: ThemeId) => {
    applyTheme(id)
  })

  const handleDynamicAccent = useLatestCallback((checked: boolean) => {
    dynamicAccent.value = checked
  })

  const handleStartListening = useLatestCallback((action: ActionId) => {
    listening.value = action
  })

  const handleReset = useLatestCallback((action: ActionId) => {
    resetBinding(action)
  })

  const handleRemove = useLatestCallback((action: ActionId) => {
    removeBinding(action)
  })

  const handleToggleGlobal = useLatestCallback((action: ActionId) => {
    toggleActionGlobal(action)
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('flex flex-col max-w-lg pb-12', className)}
      style={style}
    >
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="text-[28px] font-bold tracking-tight mb-8"
      >
        {t('settings.title')}
      </motion.h1>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
        }}
        className="space-y-8"
      >

        {/* Language */}
        <SettingSection label={t('settings.language')}>
          <Select
            value={i18n.language}
            onChange={handleLanguage}
            options={supportedLanguages.map(lang => ({
              value: lang.code,
              label: lang.label,
            }))}
          />
        </SettingSection>

        {/* Theme */}
        <SettingSection label={t('settings.theme')}>
          <div className="flex flex-col gap-3">

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

            <label className="flex items-center gap-3 cursor-pointer group">
              <Switch
                checked={dynamicAccent.value}
                onChange={handleDynamicAccent}
              />
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
          <div className="flex flex-col gap-0.5">
            {(Object.keys(DEFAULT_BINDINGS) as ActionId[]).map(action => {
              const custom = customBindings.value[action]
              const effectiveCode = custom ?? DEFAULT_BINDINGS[action]
              const isUnbound = effectiveCode === ''

              return (
                <KeybindingRow
                  key={action}
                  label={t(ACTION_LABELS[action])}
                  code={effectiveCode}
                  isCustom={custom !== undefined}
                  isUnbound={isUnbound}
                  isListening={listening.value === action}
                  isGlobal={!!globalShortcutActions.value[action]}
                  globalTip={t('keybindings.globalShortcutTip')}
                  onStartListening={() => handleStartListening(action)}
                  onReset={() => handleReset(action)}
                  onRemove={() => handleRemove(action)}
                  onToggleGlobal={() => handleToggleGlobal(action)}
                />
              )
            })}
          </div>
        </SettingSection>

        {/* Version */}
        <SettingSection label={t('settings.version')}>
          <span className="text-[13px] text-muted">0.1.0</span>
        </SettingSection>

      </motion.div>
    </motion.div>
  )
})

Settings.displayName = 'Settings'

// ─── Keybinding row ───────────────────────────────────────────────────────────

const KeybindingRow = memo<KeybindingRowProps>(({
  label,
  code,
  isCustom,
  isUnbound,
  isListening,
  isGlobal,
  globalTip,
  onStartListening,
  onReset,
  onRemove,
  onToggleGlobal,
}) => {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        'flex items-center w-full px-3 py-2 rounded-lg transition-colors',
        isListening
          ? 'bg-accent/[0.08] ring-1 ring-inset ring-accent/[0.25]'
          : 'hover:bg-overlay/[0.04]',
      )}
    >
      {/* Left: label + key badge — clickable for capture */}
      <button
        onClick={onStartListening}
        className="flex-1 flex items-center justify-between text-left min-w-0 mr-3"
      >
        <span className="text-[13px] text-secondary truncate">{label}</span>

        {isListening
          ? (
            <span className="text-[12px] text-accent italic shrink-0 ml-2">
              {t('keybindings.pressAnyKey')}
            </span>
          )
          : isUnbound
            ? (
              <span className="text-[12px] text-muted italic shrink-0 ml-2">
                {t('keybindings.unbound')}
              </span>
            )
            : (
              <kbd className={cn(
                'text-[12px] px-2 py-0.5 rounded font-mono border shrink-0 ml-2',
                isCustom
                  ? 'text-accent bg-accent/[0.08] border-accent/[0.25]'
                  : 'text-muted bg-overlay/[0.06] border-line/[0.06]',
              )}>
                {codeToLabel(code)}
              </kbd>
            )
        }
      </button>

      {/* Right: controls */}
      {!isListening && (
        <div className="flex items-center gap-1.5 shrink-0">

          <Tooltip content={globalTip} placement="top">
            <Switch
              size="sm"
              checked={isGlobal}
              onChange={onToggleGlobal}
              disabled={isUnbound}
            />
          </Tooltip>

          {!isUnbound && (
            <button
              onClick={onRemove}
              className="p-0.5 text-muted hover:text-primary transition-colors"
              title={t('keybindings.removeBinding')}
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {isCustom && (
            <button
              onClick={onReset}
              className="p-0.5 text-muted hover:text-primary transition-colors"
              title={t('keybindings.resetToDefault')}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  )
})

KeybindingRow.displayName = 'KeybindingRow'

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
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 12 },
      visible: { opacity: 1, y: 0 },
    }}
    transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    className="flex flex-col gap-3"
  >
    <label className="text-[13px] font-medium text-secondary">
      {label}
    </label>
    {children}
  </motion.div>
))

SettingSection.displayName = 'SettingSection'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SettingsProps = {} & React.HTMLAttributes<HTMLElement>

type SettingSectionProps = {
  label: string
} & React.PropsWithChildren

type KeybindingRowProps = {
  label: string
  code: string
  isCustom: boolean
  isUnbound: boolean
  isListening: boolean
  isGlobal: boolean
  globalTip: string
  onStartListening: () => void
  onReset: () => void
  onRemove: () => void
  onToggleGlobal: () => void
}
