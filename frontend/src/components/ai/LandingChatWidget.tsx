/**
 * LandingChatWidget Component
 *
 * Floating chat bubble for landing pages
 * - Anonymous conversations (no login required)
 * - Sales agent mode by default
 * - Lead capture during conversation
 * - Mobile responsive
 * - Persistent across page navigation (via session storage)
 */

import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatWindow } from './ChatWindow';
import { cn } from '@/lib/utils';

export function LandingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Generate or retrieve session ID on mount
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('bzr-chat-session-id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('bzr-chat-session-id', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  // Restore chat state from session storage
  useEffect(() => {
    const storedChatState = sessionStorage.getItem('bzr-chat-state');
    if (storedChatState) {
      try {
        const state = JSON.parse(storedChatState);
        setIsOpen(state.isOpen || false);
        setIsMinimized(state.isMinimized || false);
      } catch (error) {
        console.error('Failed to restore chat state:', error);
      }
    }
  }, []);

  // Save chat state to session storage
  useEffect(() => {
    if (sessionId) {
      sessionStorage.setItem(
        'bzr-chat-state',
        JSON.stringify({ isOpen, isMinimized })
      );
    }
  }, [isOpen, isMinimized, sessionId]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasUnreadMessages(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
    setHasUnreadMessages(false);
  };

  // Show notification dot when minimized and new message arrives
  // (This would be triggered by a message event from the chat window)
  const handleNewMessage = () => {
    if (isMinimized || !isOpen) {
      setHasUnreadMessages(true);
    }
  };

  return (
    <>
      {/* Floating chat button (hidden when chat is open and not minimized) */}
      {(!isOpen || isMinimized) && (
        <Button
          onClick={handleOpen}
          className={cn(
            'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl',
            'hover:scale-110 transition-all duration-200',
            'md:h-16 md:w-16',
            hasUnreadMessages && 'animate-bounce'
          )}
          aria-label="Отворите чат"
        >
          <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />

          {/* Unread indicator */}
          {hasUnreadMessages && (
            <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
          )}
        </Button>
      )}

      {/* Chat window (positioned above the button) */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-50',
            // Desktop: bottom-right corner
            'bottom-6 right-6',
            // Mobile: full screen overlay
            'sm:w-[400px] sm:max-h-[600px]',
            'max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:rounded-none',
            // Minimized state
            isMinimized && 'sm:max-h-14'
          )}
        >
          <ChatWindow
            isOpen={isOpen}
            isMinimized={isMinimized}
            onClose={handleClose}
            onMinimize={handleMinimize}
            onMaximize={handleMaximize}
            sessionId={sessionId}
            mode="sales"
            className={cn(
              'w-full h-full',
              // Mobile full screen
              'max-sm:rounded-none max-sm:h-screen'
            )}
          />
        </div>
      )}

      {/* Backdrop for mobile (only when chat is open) */}
      {isOpen && !isMinimized && (
        <div
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={handleClose}
        />
      )}
    </>
  );
}

/**
 * Hook to programmatically open chat widget
 * Usage: const { openChat } = useChatWidget();
 */
export function useChatWidget() {
  const openChat = () => {
    // Dispatch custom event that the widget listens to
    window.dispatchEvent(new CustomEvent('bzr-open-chat'));
  };

  return { openChat };
}
