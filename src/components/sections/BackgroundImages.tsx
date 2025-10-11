const BackgroundImages = () => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {/* Image 1: Positive personal service interaction - handshake/friendly conversation */}
      <div
        className="absolute top-0 left-0 w-full h-[50%] bg-cover bg-center opacity-35"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2000&auto=format&fit=crop')"
        }}
      />

      {/* Image 2: Tense/angry personal interaction - conflict/disagreement */}
      <div
        className="absolute top-[50%] left-0 w-full h-[50%] bg-cover bg-center opacity-35"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2000&auto=format&fit=crop')"
        }}
      />
    </div>
  );
};

export default BackgroundImages;
