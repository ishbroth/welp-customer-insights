
interface ReviewContentProps {
  content: string;
}

const ReviewContent = ({ content }: ReviewContentProps) => {
  return (
    <div className="mt-4">
      <p className="text-gray-700 leading-relaxed">
        {content}
      </p>
    </div>
  );
};

export default ReviewContent;
