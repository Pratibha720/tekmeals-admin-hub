import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  UtensilsCrossed, 
  Receipt, 
  BarChart3, 
  Settings,
  CalendarCog,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ProfileDropdown from './ProfileDropdown';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  children?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { 
    title: 'Orders', 
    href: '/orders', 
    icon: ShoppingCart,
    children: [
      { title: 'All Orders', href: '/orders' },
      { title: 'Today Orders', href: '/orders/today' },
      { title: 'Custom / Guest Orders', href: '/orders/custom' },
      { title: 'Groceries', href: '/orders/groceries' },
    ]
  },
  { title: 'Employees', href: '/employees', icon: Users },
  { title: 'Products', href: '/products', icon: UtensilsCrossed },
  { title: 'Order Settings', href: '/order-settings', icon: CalendarCog },
  { title: 'Billing', href: '/billing', icon: Receipt },
  { title: 'Reports', href: '/reports', icon: BarChart3 },
  { title: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle, isCollapsed, onCollapseToggle }: SidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Orders']);

  const toggleExpand = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const isChildActive = (item: NavItem) => {
    return item.children?.some(child => {
      if (child.href === '/orders') return location.pathname === '/orders';
      return location.pathname === child.href;
    });
  };

  // Auto-expand Orders when any child route is active
  const ordersItem = navItems.find(n => n.title === 'Orders');
  if (ordersItem && isChildActive(ordersItem) && !expandedItems.includes('Orders')) {
    setExpandedItems(prev => [...prev, 'Orders']);
  }

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          sidebarWidth,
          "flex flex-col"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
            </div>
            {!isCollapsed && <span className="text-lg font-bold text-sidebar-foreground whitespace-nowrap">TekMeals</span>}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
            onClick={onToggle}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <NavLink
                          to={item.href}
                          className={cn(
                            "flex items-center justify-center rounded-lg px-2 py-2.5 text-sm font-medium transition-colors",
                            isActive(item.href)
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                        </NavLink>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Collapsible
                      open={expandedItems.includes(item.title)}
                      onOpenChange={() => toggleExpand(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          className={cn(
                            "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            isActive(item.href)
                              ? "bg-sidebar-accent text-sidebar-primary"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </div>
                          {expandedItems.includes(item.title) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-1 ml-4 space-y-1">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.href}
                            to={child.href}
                            end={child.href === '/orders'}
                            className={({ isActive: active }) =>
                              cn(
                                "flex items-center rounded-lg px-3 py-2 text-sm transition-colors",
                                active
                                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              )
                            }
                          >
                            <span className="w-2 h-2 rounded-full bg-current opacity-50 mr-3" />
                            {child.title}
                          </NavLink>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )
                ) : (
                  isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <NavLink
                          to={item.href}
                          end={item.href === '/'}
                          className={({ isActive: active }) =>
                            cn(
                              "flex items-center justify-center rounded-lg px-2 py-2.5 text-sm font-medium transition-colors",
                              active
                                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )
                          }
                        >
                          <item.icon className="h-5 w-5" />
                        </NavLink>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <NavLink
                      to={item.href}
                      end={item.href === '/'}
                      className={({ isActive: active }) =>
                        cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  )
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Collapse Toggle (desktop only) */}
        <div className="hidden md:flex border-t border-sidebar-border p-2 justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8"
            onClick={onCollapseToggle}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Profile Dropdown */}
        {!isCollapsed && (
          <div className="border-t border-sidebar-border p-3">
            <ProfileDropdown />
          </div>
        )}
      </aside>
    </>
  );
}
