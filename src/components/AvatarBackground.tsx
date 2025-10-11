interface AvatarBackgroundProps {
  avatarUrl?: string | null;
}

const AvatarBackground = ({ avatarUrl }: AvatarBackgroundProps) => {
  // Only render if there's an avatar URL
  if (!avatarUrl) {
    return null;
  }

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {/* Single full-height avatar image with side fade only */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-15"
        style={{
          backgroundImage: `url('${avatarUrl}')`,
          maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)"
        }}
      />
    </div>
  );
};

export default AvatarBackground;
