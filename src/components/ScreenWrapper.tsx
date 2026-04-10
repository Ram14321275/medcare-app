import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ScreenWrapperProps {
  children: ReactNode;
  className?: string;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen bg-transparent p-6 md:p-8 flex flex-col w-full mx-auto relative ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default ScreenWrapper;
