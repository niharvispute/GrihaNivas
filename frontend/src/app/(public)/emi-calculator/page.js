import EMICalculator from '@/components/calculator/EMICalculator';

export const metadata = {
  title: 'EMI Calculator',
  description: 'Calculate your monthly home loan EMI instantly with our high-end financial tool. Plan your property investment in Mumbai with precision.',
};

export default function EMICalculatorPage() {
  return (
    <div className="bg-white min-h-screen">
      <EMICalculator />
    </div>
  );
}
