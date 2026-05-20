import StampDutyCalculator from '@/components/calculator/StampDutyCalculator';

export const metadata = {
  title: 'Stamp Duty & Registration Calculator',
  description: 'Calculate precise stamp duty and registration charges for property in Mumbai. Latest government rates for male and female buyers.',
};

export default function StampDutyPage() {
  return (
    <div className="bg-white min-h-screen">
      <StampDutyCalculator />
    </div>
  );
}
