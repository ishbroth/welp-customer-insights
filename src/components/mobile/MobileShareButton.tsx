import React, { useCallback } from 'react';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import { Share2Icon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/sonner';

interface MobileShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
  files?: string[];
  dialogTitle?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const MobileShareButton: React.FC<MobileShareButtonProps> = ({
  title = 'Check this out!',
  text = '',
  url = window.location.href,
  files,
  dialogTitle = 'Share',
  className,
  variant = 'outline',
  size = 'sm'
}) => {
  const isMobile = useIsMobile();

  const handleShare = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) {
      // Fallback to Web Share API or clipboard
      if (navigator.share) {
        try {
          await navigator.share({ title, text, url });
          toast.success('Shared successfully');
        } catch (error) {
          console.error('Web share error:', error);
          // Fallback to clipboard
          await navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard');
        }
      } else {
        // Final fallback - copy to clipboard
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
      return;
    }

    try {
      await Share.share({
        title,
        text,
        url,
        files,
        dialogTitle
      });
      toast.success('Shared successfully');
    } catch (error) {
      console.error('Native share error:', error);
      toast.error('Failed to share');
    }
  }, [title, text, url, files, dialogTitle]);

  // Only render on mobile or if Web Share API is available
  if (!isMobile && !navigator.share) {
    return null;
  }

  return (
    <Button
      onClick={handleShare}
      variant={variant}
      size={size}
      className={className}
    >
      <Share2Icon className="h-4 w-4 mr-2" />
      Share
    </Button>
  );
};

export default React.memo(MobileShareButton);