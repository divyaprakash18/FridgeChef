import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, AlertCircle, FlipHorizontal, Sparkles } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  onFallbackToFileInput: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onFallbackToFileInput,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isStarting, setIsStarting] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  // Check available video devices
  useEffect(() => {
    if (!isOpen) return;

    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        if (videoDevices.length > 1) {
          setHasMultipleCameras(true);
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  // Start / stop camera stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera(facingMode);

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async (mode: 'environment' | 'user') => {
    stopCamera();
    setIsStarting(true);
    setCameraError(null);

    // Verify mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Live camera streaming is not supported on this browser. Use native capture instead.');
      setIsStarting(false);
      return;
    }

    try {
      // Try preferred facing mode first, fall back to any video if constraint fails
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (err) {
        // Fallback with basic video constraint
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
      setIsStarting(false);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setIsStarting(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was blocked. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is currently in use by another app or browser tab.');
      } else {
        setCameraError(err.message || 'Unable to start camera.');
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    // Trigger visual flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    // Create high-res canvas capture
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror image if using front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopCamera();
    onCapture(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col max-h-[92vh]">
        {/* Shutter Flash Animation */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-50 pointer-events-none animate-out fade-out duration-200" />
        )}

        {/* Modal Header */}
        <div className="p-4 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between text-white z-10">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-serif font-bold text-base text-white">
              Fridge Live Camera
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
            title="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative flex-1 bg-black min-h-[360px] sm:min-h-[440px] flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center max-w-md space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">Camera Unavailable</h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {cameraError}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onFallbackToFileInput();
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                >
                  Use Native File / Camera Picker
                </button>
              </div>
            </div>
          ) : (
            <>
              {isStarting && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/80 z-20 space-y-3">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-xs font-semibold text-stone-300">
                    Initializing camera stream...
                  </p>
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Viewfinder Framing Guidelines */}
              <div className="absolute inset-6 sm:inset-10 pointer-events-none border-2 border-white/30 rounded-2xl flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
                  <div className="w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[11px] text-white/90 font-medium border border-white/10">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    Aim at fridge shelves or open basket
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
                  <div className="w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Viewfinder Control Bar */}
        <div className="p-4 sm:p-5 bg-stone-900 border-t border-stone-800 flex items-center justify-between">
          {/* Flip Camera button */}
          <div className="w-12 flex justify-start">
            {hasMultipleCameras && !cameraError && (
              <button
                type="button"
                onClick={toggleCamera}
                title="Switch front/back camera"
                className="p-3 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Shutter Capture Button */}
          {!cameraError && (
            <button
              type="button"
              onClick={handleCapture}
              disabled={isStarting}
              title="Capture photo"
              className="group relative flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              <div className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 bg-white/10 group-hover:bg-white/20 transition-all shadow-xl group-active:scale-95">
                <div className="w-14 h-14 rounded-full bg-emerald-500 group-hover:bg-emerald-400 transition-colors shadow-inner flex items-center justify-center">
                  <Camera className="w-6 h-6 text-stone-950" />
                </div>
              </div>
            </button>
          )}

          {/* File Picker Fallback link */}
          <div className="w-12 flex justify-end">
            <button
              type="button"
              onClick={() => {
                onClose();
                onFallbackToFileInput();
              }}
              title="Upload file instead"
              className="text-stone-400 hover:text-white text-xs underline cursor-pointer p-1"
            >
              Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
