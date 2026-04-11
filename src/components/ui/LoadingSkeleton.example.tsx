/**
 * LoadingSkeleton Component Examples
 * 
 * This file demonstrates the different variants and use cases
 * for the LoadingSkeleton component.
 */

import LoadingSkeleton from './LoadingSkeleton';

export default function LoadingSkeletonExamples() {
  return (
    <div className="min-h-screen bg-secondary p-6 space-y-12">
      {/* Cafeteria Cards Loading */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">
          Cafeteria Cards Loading (3 skeletons)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton variant="cafeteria" count={3} />
        </div>
      </section>

      {/* Menu Items Loading */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">
          Menu Items Loading (6 skeletons)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <LoadingSkeleton variant="menu" count={6} />
        </div>
      </section>

      {/* Order Cards Loading */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">
          Order Cards Loading (5 skeletons)
        </h2>
        <div className="space-y-4 max-w-2xl">
          <LoadingSkeleton variant="order" count={5} />
        </div>
      </section>

      {/* Single Skeleton Examples */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">
          Single Skeleton Examples
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm text-white/60 mb-2">Cafeteria</h3>
            <LoadingSkeleton variant="cafeteria" count={1} />
          </div>
          <div>
            <h3 className="text-sm text-white/60 mb-2">Menu Item</h3>
            <LoadingSkeleton variant="menu" count={1} />
          </div>
          <div>
            <h3 className="text-sm text-white/60 mb-2">Order</h3>
            <LoadingSkeleton variant="order" count={1} />
          </div>
        </div>
      </section>
    </div>
  );
}
