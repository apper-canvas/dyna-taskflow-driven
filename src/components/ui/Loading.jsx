import { motion } from 'framer-motion';

const Loading = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded shimmer w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded shimmer w-12"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full shimmer"></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Task List Skeleton */}
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded-lg shimmer"></div>
        <div className="flex space-x-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-8 bg-gray-200 rounded-md shimmer w-20"></div>
          ))}
        </div>
      </div>

      {/* Task Cards Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-start space-x-4">
              <div className="w-6 h-6 bg-gray-200 rounded-full shimmer"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded shimmer w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded shimmer w-full mb-3"></div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <div className="h-6 bg-gray-200 rounded-full shimmer w-16"></div>
                    <div className="h-6 bg-gray-200 rounded-md shimmer w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded shimmer w-24"></div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Loading;