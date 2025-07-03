import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "@/App";
import ApperIcon from "@/components/ApperIcon";
import Navigation from "@/components/organisms/Navigation";
import Button from "@/components/atoms/Button";

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="text-gray-600 hover:text-gray-900"
    >
      <ApperIcon name="LogOut" size={16} className="mr-2 hidden sm:inline" />
      <span className="hidden sm:inline">Logout</span>
      <ApperIcon name="LogOut" size={16} className="sm:hidden" />
    </Button>
  );
};

const Header = ({ onCreateTask }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/tasks':
        return 'Tasks';
      case '/projects':
        return 'Projects';
      default:
        return 'TaskFlow';
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              >
                <ApperIcon name="Menu" size={24} />
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg">
                  <ApperIcon name="CheckSquare" size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
                  <p className="text-sm text-gray-500 hidden sm:block">{getPageTitle()}</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <Navigation />
            </div>

{/* Actions */}
            <div className="flex items-center space-x-3">
              <Button
                variant="primary"
                size="sm"
                onClick={onCreateTask}
                className="hidden sm:inline-flex"
              >
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Add Task
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onCreateTask}
                className="sm:hidden"
              >
                <ApperIcon name="Plus" size={16} />
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu} />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg">
                  <ApperIcon name="CheckSquare" size={20} className="text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">TaskFlow</h2>
              </div>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            <div className="p-4">
              <Navigation onNavigate={toggleMobileMenu} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default Header;