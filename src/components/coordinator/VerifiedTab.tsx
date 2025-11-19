import PaystackVerifiedColumn from './PaystackVerifiedColumn';
import ManualVerificationForm from './ManualVerificationForm';

const VerifiedTab = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <PaystackVerifiedColumn />
      <ManualVerificationForm />
    </div>
  );
};

export default VerifiedTab;
