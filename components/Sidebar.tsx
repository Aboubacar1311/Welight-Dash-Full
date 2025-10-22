
import React from 'react';
import { Page } from '../types';
import { LayoutDashboardIcon, ZapIcon, ShoppingCartIcon, UsersIcon, BarChart3Icon } from './icons';

interface SidebarProps {
    activePage: Page;
    setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{ page: Page; label: string; icon: React.ReactNode; activePage: Page; onClick: () => void; }> = ({ page, label, icon, activePage, onClick }) => {
    const isActive = activePage === page;
    return (
        <button
            onClick={onClick}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg ${isActive ? 'bg-brand-yellow text-gray-900' : 'text-gray-200 hover:bg-gray-700 hover:text-white'}`}
        >
            {icon}
            <span className="ml-4">{label}</span>
        </button>
    );
};

const logoUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAACFCAAAAAD2cUbWAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAE4SURBVHhe7dDBAYAwDMCw/9/kMAiNYrMAtb177s0eEMA5AQgQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUAIECFAhAAQgUCB14zF/k8pQIEQIECEDiBq+Z/y3qAAAEIECBCBwAgQIQAECEDgBAgQgAAEIHECBAgQAAGEDAqEAABCECgQAgQgAAEIEDiBAgQIAAChA0KhAAAIQCAECBCBwAgQIQAACECgAAhA4AQIEIAABCBsUCAUAgAAEIBCBAgQgAAEIECBA4gQIEIAABCBsUCAUAAACEIBA+QGYVRDEz/j/3gAAAABJRU5ErkJggg==";

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
    
    const navItems = [
        { page: 'ExecutiveSummary' as Page, label: 'Executive Summary', icon: <LayoutDashboardIcon /> },
        { page: 'Consumption' as Page, label: 'Consumption', icon: <ZapIcon /> },
        { page: 'Commercial' as Page, label: 'Commercial Data', icon: <ShoppingCartIcon /> },
        { page: 'Clients' as Page, label: 'Clients', icon: <UsersIcon /> },
        { page: 'AdvancedAnalysis' as Page, label: 'Advanced Analysis', icon: <BarChart3Icon /> },
    ];

    return (
        <aside className="w-64 flex-shrink-0 bg-brand-blue-dark flex flex-col">
            <div className="h-20 flex items-center justify-center px-4">
                 <img src={logoUrl} alt="Welight Logo" className="h-16" />
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map(item => (
                    <NavItem 
                        key={item.page}
                        page={item.page}
                        label={item.label}
                        icon={item.icon}
                        activePage={activePage}
                        onClick={() => setActivePage(item.page)}
                    />
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;