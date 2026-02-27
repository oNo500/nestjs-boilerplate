import { ProLayout, SettingDrawer } from '@ant-design/pro-components'
import { Dropdown } from 'antd'
import { User, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useNavigate, useLocation } from 'react-router'

import { env } from '@/config/env'
import { getMenuItems } from '@/config/menu'
import { useAuthStore } from '@/features/auth'
import { useThemeStore } from '@/stores/use-theme-store'

import { LanguageSwitch } from './language-switch'
import SvgAntdesign from './logo'

import type { MenuItem } from '@/config/menu'
import type { ProSettings, MenuDataItem } from '@ant-design/pro-components'
import type { MenuProps } from 'antd'
import type { NavigateFunction, Location } from 'react-router'

function convertMenuToRoute(items: MenuItem[]): MenuDataItem[] {
  const convert = (item: MenuItem): MenuDataItem => ({
    path: item.path,
    key: item.key ?? item.path,
    name: item.label,
    icon: item.icon ? <item.icon size={16} /> : undefined,
    roles: item.roles,
    ...(item.children && { children: item.children.map((child) => convert(child)) }),
  })
  return items.map((item) => convert(item))
}

export function MainLayout() {
  const navigate: NavigateFunction = useNavigate()
  const location: Location = useLocation()
  const { user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const { t: tMenu } = useTranslation('menu')
  const { t: tCommon } = useTranslation('common')

  useEffect(() => {
    if (!user) {
      void navigate('/login', { replace: true })
    }
  }, [user, navigate])

  const isDark = useThemeStore((state) => state.isDark)
  const setColorPrimary = useThemeStore((state) => state.setColorPrimary)
  const setIsDark = useThemeStore((state) => state.setIsDark)

  const [settings, setSettings] = useState<Partial<ProSettings>>({
    fixSiderbar: true,
    layout: 'side',
    navTheme: isDark ? 'realDark' : 'light',
  })

  const menuItems = getMenuItems(tMenu)

  const handleSettingChange = (newSettings: Partial<ProSettings>) => {
    setSettings(newSettings)
    if (newSettings.colorPrimary) {
      setColorPrimary(newSettings.colorPrimary)
    }
    if (newSettings.navTheme !== undefined) {
      setIsDark(newSettings.navTheme === 'realDark')
    }
  }

  const handleLogout = () => {
    logout()
    void navigate('/login', { replace: true })
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User size={14} />,
      label: tCommon('nav.personalCenter'),
      onClick: () => void navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut size={14} />,
      label: tCommon('nav.logout'),
      danger: true,
      onClick: handleLogout,
    },
  ]

  return (
    <ProLayout
      id="pro-layout-container"
      style={{ height: '100vh' }}
      title="Ant Design"
      logo={<SvgAntdesign />}
      {...settings}
      siderWidth={256}
      breakpoint="lg"
      collapsed={collapsed}
      onCollapse={setCollapsed}
      location={location}
      route={{
        path: '/',
        routes: convertMenuToRoute(menuItems),
      }}
      menuItemRender={(menuItemProperties, defaultDom) => {
        if (menuItemProperties.path) {
          return (
            <div
              onClick={() => {
                void navigate(menuItemProperties.path!)
              }}
            >
              {defaultDom}
            </div>
          )
        }
        return defaultDom
      }}
      menuDataRender={(menuData) => {
        if (!user) return []

        const hasAccess = (item: MenuDataItem): boolean => {
          const roles = (item as MenuDataItem & { roles?: string[] }).roles
          if (!roles) return true
          if (!user.role) return false
          return roles.includes(user.role)
        }

        const filterMenu = (items: MenuDataItem[]): MenuDataItem[] =>
          items
            .filter((item) => hasAccess(item))
            .map((item) =>
              item.children
                ? { ...item, children: filterMenu(item.children as unknown as MenuDataItem[]) }
                : item,
            )

        return filterMenu(menuData)
      }}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: tCommon('nav.home'),
        },
        ...routers,
      ]}
      pageTitleRender={(properties) => {
        const breadcrumbItem = properties.breadcrumb?.[properties.pathname ?? '/'] as
          | { name?: string }
          | undefined
        const pageName = breadcrumbItem?.name ?? tCommon('nav.adminTitle')
        return `${pageName} - Admin`
      }}
      avatarProps={{
        src: user?.image ?? undefined,
        title: user?.email,
        size: 'small',
        render: (_, dom) => (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            {dom}
          </Dropdown>
        ),
      }}
      actionsRender={() => [<LanguageSwitch key="lang" />]}
      menuFooterRender={(properties) => {
        if (properties?.collapsed) return
        return (
          <div
            style={{
              textAlign: 'center',
              paddingBlockStart: 12,
            }}
          >
            <div>© 2025 Admin</div>
          </div>
        )
      }}
    >
      <Outlet />
      {env.isDevelopment && (
        <SettingDrawer
          pathname={location.pathname}
          getContainer={() => document.querySelector('#pro-layout-container') ?? document.body}
          settings={settings}
          onSettingChange={handleSettingChange}
          enableDarkTheme
          hideCopyButton
          disableUrlParams={false}
        />
      )}
    </ProLayout>
  )
}
