import EMICalculator from '@/components/calculator/EMICalculator';

export const metadata = {
  title: 'EMI Calculator | Mumbai Editorial Real Estate',
  description: 'Calculate your monthly home loan EMI instantly with our high-end financial tool. Plan your property investment in Mumbai with precision.',
};

export default function EMICalculatorPage() {
  return (
    <div className="bg-white min-h-screen">
      <EMICalculator />
    </div>
  );
}
