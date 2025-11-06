import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/types';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { formatDate, formatCategory, formatUrgencia, formatDisponibilidade, formatUserType } from '@/utils/format';
import { MapPin, Heart, Send, UserPlus, Clock, Tag, AlertCircle, CheckCircle, Info, Award, LucideIcon } from 'lucide-react';
import { useCurtidas, setGlobalAlertCallback } from '@/hooks/useCurtidas';

// Configurar alerta global para curtidas
setGlobalAlertCallback((message: string) => {
  // Isso será sobrescrito no componente
});

interface PostCardProps {
  post: Post;
}

// Helper para formatar localização
const formatLocation = (localizacao: any): string => {
  const bairro = localizacao?.bairro;
  const cidade = localizacao?.cidade || localizacao?.municipio;
  const parts = [cidade, bairro].filter(Boolean);
  return parts.length ? parts.join(' - ') : 'Não informado';
};

// Componente de botão de ação reutilizável
const ActionButton: React.FC<{
  label: string;
  icon: LucideIcon;
  className: string;
  onClick: () => void;
}> = ({ label, icon: Icon, className, onClick }) => (
  <Button
    size="sm"
    className={`${className} text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-center gap-1 sm:gap-1.5 min-h-[32px] sm:min-h-[36px] w-full sm:w-auto touch-manipulation font-medium`}
    onClick={onClick}
    type="button"
  >
    <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
    <span className="whitespace-nowrap">{label}</span>
  </Button>
);

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const router = useRouter();
  const [descricaoExpandida, setDescricaoExpandida] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const isVitrine = useMemo(() => 
    post.tipo === 'VITRINE_CLIENTE' || post.tipo === 'VITRINE_PRESTADOR',
    [post.tipo]
  );
  
  const { total: curtidasTotal, usuarioCurtiu, toggle: toggleCurtida } = useCurtidas(post.id);

  // Configurar callback global para alertas de curtidas
  React.useEffect(() => {
    setGlobalAlertCallback((message: string) => {
      setAlertMessage(message);
      setShowAlert(true);
    });
  }, []);

  const displayTitle = useMemo(() => {
    const base = (post.titulo || '').trim();
    if (base) return base;
    return post.tipo === 'VITRINE_PRESTADOR' ? 'Vitrine do Prestador' 
      : post.tipo === 'VITRINE_CLIENTE' ? 'Vitrine do Cliente' : '';
  }, [post.titulo, post.tipo]);

  const displayDescription = useMemo(() => {
    const base = (post.descricao || '').trim();
    if (base) return base;
    if (isVitrine) return 'Apresentação, portfólio e informações de contato.';
    return '';
  }, [post.descricao, isVitrine]);

  const formattedLocation = useMemo(() => formatLocation(post.localizacao), [post.localizacao]);

  const handleContatar = useCallback(() => {
    router.push(`/solicitar-servico?post=${post.id}`);
  }, [router, post.id]);

  const handleEnviarOrcamento = useCallback(() => {
    router.push(`/enviar-orcamento?post=${post.id}`);
  }, [router, post.id]);

  const handleQuemFez = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if ((post as any).prestador_recomendado_id) {
      router.push(`/enviar-orcamento?prestador=${(post as any).prestador_recomendado_id}&origem=quem-fez&post=${post.id}`);
      return;
    }
    setAlertMessage('Este post ainda não possui prestador associado.');
    setShowAlert(true);
  }, [router, post]);

  const handleCloseAlert = useCallback(() => {
    setShowAlert(false);
    setAlertMessage('');
  }, []);

  // Determinar botão de ação baseado no tipo de post
  const actionButton = useMemo(() => {
    if (post.tipo === 'OFERTA' || post.tipo === 'VITRINE_PRESTADOR') {
      return (
        <ActionButton
          label="Contatar"
          icon={UserPlus}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleContatar}
        />
      );
    }
    if (post.tipo === 'SOLICITACAO') {
      return (
        <ActionButton
          label="Enviar Orçamento"
          icon={Send}
          className="bg-orange-600 hover:bg-orange-700 text-white"
          onClick={handleEnviarOrcamento}
        />
      );
    }
    if (post.tipo === 'VITRINE_CLIENTE') {
      return (
        <ActionButton
          label="Quem fez?"
          icon={Award}
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={handleQuemFez}
        />
      );
    }
    return null;
  }, [post.tipo, handleContatar, handleEnviarOrcamento, handleQuemFez]);

  return (
    <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-2 sm:p-3 rounded-2xl min-h-[500px] sm:min-h-[588px] flex flex-col">
      <div className="space-y-2 flex-1 flex flex-col">
        {/* Header - Layout Otimizado */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className={`rounded-full flex-shrink-0 shadow-md border-[3px] ${
              post.tipo === 'OFERTA' ? 'border-orange-500' : 'border-blue-600'
            }`}>
              <Avatar
                src={post.usuario?.foto_perfil}
                name={post.usuario?.nome}
                size="md"
              />
            </div>
            <span className="text-xs text-gray-600 font-medium">
              {formatUserType(post.usuario?.tipo || '')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            {/* Linha 1: Nome */}
            <div className="mb-1">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{post.usuario?.nome}</h3>
            </div>
            
            {/* Linha 2: Badges principais */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
              <Badge variant="secondary" size="sm" className="bg-blue-100 text-blue-800 flex items-center gap-1 text-[10px] sm:text-xs">
                <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="whitespace-nowrap">{isVitrine ? 'Vitrine' : post.tipo === 'OFERTA' ? 'Oferece:' : 'Precisa:'}</span>
                <span>{formatCategory(post.categoria)}</span>
              </Badge>
              {post.tipo === 'OFERTA' && post.disponibilidade && (
                <Badge variant="secondary" size="sm" className="bg-orange-100 text-orange-800 flex items-center gap-1 text-[10px] sm:text-xs">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  {formatDisponibilidade(post.disponibilidade)}
                </Badge>
              )}
              {post.tipo === 'SOLICITACAO' && (
                <Badge 
                  variant="secondary" 
                  size="sm" 
                  className={`flex items-center gap-1 text-[10px] sm:text-xs ${
                    post.urgencia === 'ALTA' ? 'bg-red-100 text-red-800' :
                    post.urgencia === 'MEDIA' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}
                >
                  {post.urgencia === 'ALTA' && <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                  {post.urgencia === 'MEDIA' && <Info className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                  {post.urgencia === 'BAIXA' && <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                  {formatUrgencia(post.urgencia)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-1 line-clamp-1">
            {displayTitle.length > 35 ? `${displayTitle.substring(0, 35)}...` : displayTitle}
          </h2>
          <div className="text-gray-600 text-xs sm:text-sm">
            {descricaoExpandida ? (
              <p>{displayDescription}</p>
            ) : (
              <p className="line-clamp-2 sm:line-clamp-3">{displayDescription}</p>
            )}
            {displayDescription && displayDescription.length > 150 && (
              <button
                onClick={() => setDescricaoExpandida(!descricaoExpandida)}
                className="text-blue-600 hover:text-blue-700 font-medium mt-1 text-[10px] sm:text-xs touch-manipulation"
                type="button"
              >
                {descricaoExpandida ? 'Ver menos' : 'Ver mais...'}
              </button>
            )}
          </div>
        </div>

        {/* Photo */}
        {post.fotos && post.fotos.length > 0 && (
          <div className="w-full h-48 sm:h-64 md:h-80 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={post.fotos[0]}
              alt={post.titulo || 'Imagem do post'}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Actions */}
        <div className="pt-3 sm:pt-4 border-t border-gray-200 mt-auto">
          {/* Layout melhorado: Informações e botão na mesma linha em desktop */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
            {/* Lado esquerdo: Data, Localização e Curtidas */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
              <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap flex-shrink-0">{formatDate(post.data_criacao, 'dd/MM/yy')}</span>
              <span className="text-gray-400 text-xs">•</span>
              <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 min-w-0 flex-shrink">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{formattedLocation}</span>
              </span>
              <span className="text-gray-400 text-xs">•</span>
              {/* Curtir (aparência de ícone sem fundo) */}
              <Button
                size="sm"
                variant="ghost"
                className={`flex items-center gap-1 px-1.5 py-1 bg-transparent hover:bg-transparent focus:ring-0 border-0 shadow-none min-h-0 touch-manipulation cursor-pointer flex-shrink-0 ${usuarioCurtiu ? 'text-pink-600' : 'text-gray-600'}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleCurtida();
                }}
                aria-label="Curtir"
                title="Curtir"
                type="button"
              >
                <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 ${usuarioCurtiu ? 'fill-pink-600' : ''}`} />
                <span className="text-[10px] sm:text-xs leading-none">{curtidasTotal}</span>
              </Button>
            </div>
            
            {/* Lado direito: Botão de ação */}
            <div className="flex-shrink-0">
              {actionButton}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={showAlert}
        onClose={handleCloseAlert}
        title="Informação"
        message={alertMessage}
        type="info"
      />
    </Card>
  );
};
