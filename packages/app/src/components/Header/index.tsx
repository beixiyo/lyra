import { cn } from 'utils'
import { memo } from 'react'
import { useSignals } from '@preact/signals-react/runtime'
import { useLatestCallback } from 'hooks'
import { TitleBarButtons } from 'comps'
import { rpc } from '@/ipc'
import { titlebarPosition, visibleButtons } from '@/stores/titlebar'

export const Header = memo<HeaderProps>(({ style, className, children }) => {
  useSignals()

  const pos = titlebarPosition.value
  const buttons = visibleButtons.value
  const order = buttons.map(b => b.id)

  const handleClose = useLatestCallback(() => {
    rpc.request.windowClose({})
  })

  const handleMinimize = useLatestCallback(() => {
    rpc.request.windowMinimize({})
  })

  const handleMaximize = useLatestCallback(() => {
    rpc.request.windowMaximize({})
  })

  return (
    <header
      className={cn(
        'h-11 shrink-0 flex items-center gap-3 px-4',
        pos === 'right' ? 'flex-row' : 'flex-row-reverse',
        'electrobun-webkit-app-region-drag cursor-grab active:cursor-grabbing',
        className,
      )}
      style={style}
    >
      <div className={cn(
        'flex-1 flex items-center',
        pos === 'right' ? 'justify-start' : 'justify-end',
      )}>
        {children}
      </div>

      {order.length > 0 && (
        <div className="electrobun-webkit-app-region-no-drag">
          <TitleBarButtons
            order={order}
            onClose={handleClose}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
          />
        </div>
      )}
    </header>
  )
})

Header.displayName = 'Header'

export type HeaderProps = {} & React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
