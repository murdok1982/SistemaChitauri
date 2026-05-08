import * as React from 'react'
import { clsx } from 'clsx'

interface TabsContextValue {
  value: string
  setValue: (v: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (v: string) => void
  className?: string
  children: React.ReactNode
}

function Tabs({ value, defaultValue = '', onValueChange, className, children }: TabsProps) {
  const [internal, setInternal] = React.useState<string>(defaultValue)
  const current = value !== undefined ? value : internal

  const setValue = React.useCallback(
    (v: string) => {
      if (value === undefined) setInternal(v)
      onValueChange?.(v)
    },
    [value, onValueChange],
  )

  return (
    <TabsContext.Provider value={{ value: current, setValue }}>
      <div className={clsx('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

function useTabsContext(componentName: string) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error(`${componentName} must be used within <Tabs>`)
  return ctx
}

const TabsList = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    role="tablist"
    className={clsx('flex border-b border-military-border', className)}
    {...props}
  />
)

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = ({ value, className, ...props }: TabsTriggerProps) => {
  const ctx = useTabsContext('TabsTrigger')
  const active = ctx.value === value
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => ctx.setValue(value)}
      className={clsx(
        'px-3 py-1.5 text-[11px] font-mono transition-colors',
        active
          ? 'bg-military-green/20 text-military-green border-b-2 border-military-green'
          : 'text-gray-400 hover:text-gray-200',
        className,
      )}
      {...props}
    />
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = ({ value, className, ...props }: TabsContentProps) => {
  const ctx = useTabsContext('TabsContent')
  if (ctx.value !== value) return null
  return <div role="tabpanel" className={clsx('p-3', className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
