const NewReviewBackground = () => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {/* Image 1: Multiple people thinking/contemplating */}
      <div
        className="absolute top-0 left-0 w-full h-[50%] bg-cover bg-center opacity-35"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2000&auto=format&fit=crop')"
        }}
      />

      {/* Image 2: Multiple people typing/working */}
      <div
        className="absolute top-[50%] left-0 w-full h-[50%] bg-cover bg-center opacity-35"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop')"
        }}
      />
    </div>
  );
};

export default NewReviewBackground;
