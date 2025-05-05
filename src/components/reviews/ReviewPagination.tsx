
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ReviewPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ReviewPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: ReviewPaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        
        {[...Array(totalPages)].map((_, i) => (
          <PaginationItem key={i}>
            <PaginationLink 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onPageChange(i + 1);
              }}
              isActive={currentPage === i + 1}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ReviewPagination;
