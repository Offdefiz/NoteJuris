import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ZoomControlProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const ZoomControl: React.FC<ZoomControlProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  return (
    <aside aria-label="Controle de visualização da tela" className="fixed bottom-20 lg:bottom-5 right-4 lg:right-5 z-30 flex items-center gap-1 px-1.5 py-1 rounded-xl bg-white/95 dark:bg-[#181e2b]/95 backdrop-blur-md border border-[#dedbd3] dark:border-[#293245] shadow-lg text-[#474f60] dark:text-[#9ea8bd]">
      <button
        onClick={onZoomOut}
        className="p-1.5 rounded-lg hover:bg-[#edebe6] dark:hover:bg-[#252e40] text-[#555d6e] dark:text-[#a0abbd] hover:text-[#181d28] dark:hover:text-white transition-colors disabled:opacity-30"
        title="Diminuir zoom"
        disabled={zoom <= 60}
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <button
        onClick={onResetZoom}
        className="px-2 py-1 text-[11px] font-mono font-bold hover:bg-[#edebe6] dark:hover:bg-[#252e40] rounded-md transition-colors"
        title="Redefinir para 100%"
      >
        {zoom}%
      </button>

      <button
        onClick={onZoomIn}
        className="p-1.5 rounded-lg hover:bg-[#edebe6] dark:hover:bg-[#252e40] text-[#555d6e] dark:text-[#a0abbd] hover:text-[#181d28] dark:hover:text-white transition-colors disabled:opacity-30"
        title="Aumentar zoom"
        disabled={zoom >= 150}
      >
        <ZoomIn className="w-4 h-4" />
      </button>
    </aside>
  );
};
