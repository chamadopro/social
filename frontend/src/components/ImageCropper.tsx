'use client';

import React, { useCallback, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';

interface ImageCropperProps {
  imageSrc: string;
  aspect?: number; // default 16/9
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, aspect = 16 / 9, onCancel, onConfirm }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedFile = async (): Promise<File> => {
    if (!croppedAreaPixels) throw new Error('Crop inválido');
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas não suportado');

    const { x, y, width, height } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob as BlobPart], 'cover.jpg', { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleConfirm = async () => {
    const file = await getCroppedFile();
    onConfirm(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl shadow-xl overflow-hidden">
        <div className="relative w-full h-[60vh] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="cover"
          />
        </div>
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
            <span className="text-sm text-gray-600">Zoom</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100">Cancelar</button>
            <button onClick={handleConfirm} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Usar como capa</button>
          </div>
        </div>
      </div>
    </div>
  );
};









