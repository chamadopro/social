import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Chat } from '@/components/Chat';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  contratoId: string;
  contratoTitulo?: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  contratoId,
  contratoTitulo,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contratoTitulo ? `Chat - ${contratoTitulo}` : 'Chat do Contrato'}
      size="lg"
      className="max-w-4xl h-[600px]"
    >
      <div className="h-[500px]">
        <Chat contratoId={contratoId} onClose={onClose} />
      </div>
    </Modal>
  );
};

