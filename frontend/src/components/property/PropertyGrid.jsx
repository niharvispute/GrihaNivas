export default function PropertyGrid({ children, columns = 3 }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid gap-4 sm:gap-6 lg:gap-8 ${gridCols[columns] || gridCols[3]}`}>
      {children}
    </div>
  );
}
