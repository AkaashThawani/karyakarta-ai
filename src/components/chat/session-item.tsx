'use client';

/**
 * Session Item Component
 * 
 * Displays a single session item in the session list with delete protection.
 */

import { useState } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Session } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function SessionItem({ session, isActive, onSelect, onDelete }: SessionItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Prevent deleting current active session
    if (isActive) {
      return;
    }
    
    // Show confirmation dialog for other sessions
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteDialog(false);
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <div
        onClick={onSelect}
        className={cn(
          'group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        )}
      >
        <MessageSquare className="w-4 h-4 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {session.title || 'New Chat'}
          </p>
          <p className="text-xs text-muted-foreground">
            {session.message_count} msg{session.message_count !== 1 ? 's' : ''} • {formatDate(session.updated_at)}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0',
            isDeleting && 'opacity-50',
            isActive && 'cursor-not-allowed opacity-30'
          )}
          onClick={handleDeleteClick}
          disabled={isDeleting || isActive}
          title={isActive ? 'Cannot delete current session' : 'Delete session'}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat Session?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{session.title || 'New Chat'}&quot;? 
              This will permanently remove all {session.message_count} message{session.message_count !== 1 ? 's' : ''} 
              from this conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
