import { NavLink } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';

const Navigation = ({ onNavigate }) => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'BarChart3' },
    { path: '/tasks', label: 'Tasks', icon: 'CheckSquare' },
    { path: '/projects', label: 'Projects', icon: 'Folder' }
  ];

  return (
    <nav className="space-y-1 lg:space-y-0 lg:flex lg:space-x-8">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          onClick={onNavigate}
          className={({ isActive }) => `
            flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
            ${isActive 
              ? 'bg-primary text-white shadow-sm' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }
          `}
        >
          <ApperIcon name={item.icon} size={18} className="mr-2" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navigation;