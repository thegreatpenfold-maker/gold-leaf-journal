import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 ml-[240px] max-md:ml-16 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-6 max-md:p-4"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
