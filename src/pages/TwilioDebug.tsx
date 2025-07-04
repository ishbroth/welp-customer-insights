
import TwilioAccountInfo from "@/components/debug/TwilioAccountInfo";
import TwilioSMSTest from "@/components/debug/TwilioSMSTest";

const TwilioDebug = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Twilio Debug</h1>
      <div className="space-y-6">
        <TwilioAccountInfo />
        <TwilioSMSTest />
      </div>
    </div>
  );
};

export default TwilioDebug;
