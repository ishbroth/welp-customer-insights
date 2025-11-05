const NewReviewBackground = () => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {/* Image 1: Happy business team celebrating success - smiling people */}
      <div
        className="absolute top-0 left-0 w-full h-[50%] bg-cover bg-center opacity-35"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop')"
        }}
      />

      {/* Image 2: Formal business meeting - tense boardroom discussion */}
      <div
        className="absolute top-[50%] left-0 w-full h-[50%] bg-cover bg-center opacity-35"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2000&auto=format&fit=crop')"
        }}
      />
    </div>
  );
};

export default NewReviewBackground;
