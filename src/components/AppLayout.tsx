import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex-1 ml-[220px] max-md:ml-[60px] overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="p-8 max-md:p-4 max-w-[1400px]"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
