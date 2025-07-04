
import TwilioAccountInfo from "@/components/debug/TwilioAccountInfo";

const TwilioDebug = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Twilio Debug</h1>
      <TwilioAccountInfo />
    </div>
  );
};

export default TwilioDebug;
