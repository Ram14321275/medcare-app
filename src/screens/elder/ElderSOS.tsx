import React, { useEffect, useState, useRef } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Phone, XCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/api';
import { speak } from '../../utils/speech';

interface Props {
  onBack: () => void;
}

const ElderSOS: React.FC<Props> = ({ onBack }) => {
  const { t, language } = useLanguage();
  const [countdown, setCountdown] = useState(5);
  const [called, setCalled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Attempt to open the camera automatically when SOS page mounts
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.warn("Camera API not available (requires HTTPS or localhost)");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Ensure it starts playing to have dimensions
          videoRef.current.play().catch(e => console.error("Play failed", e));
        }
      } catch (err) {
        console.error("Camera access denied or unavailable", err);
      }
    };
    startCamera();

    setTimeout(() => {
        speak(t('emergencyAlert'), language);
    }, 500);

    return () => {
      // Cleanup stream when navigating away
      if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [t, language]);

  useEffect(() => {
    if (countdown > 0 && !called) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
        speak(countdown.toString(), language); // Speak the countdown
      }, 1500); // 1.5s delay to let speech complete normally
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !called) {
      setCalled(true);
      let capturedPhoto: string | undefined = undefined;

      // Automatically capture the photo from the webcam
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          // Downscale to save memory and ensure localStorage/BroadcastChannel don't choke
          const targetWidth = 400;
          const scale = targetWidth / video.videoWidth;
          canvas.width = targetWidth;
          canvas.height = video.videoHeight * scale;
          const context = canvas.getContext('2d');
          if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            capturedPhoto = canvas.toDataURL('image/jpeg', 0.6); // Compress
          }
        } else {
            console.warn("Video dimensions were 0 when attempting to capture");
        }
      }

      // CLOSE CAMERA ACCESS IMMEDIATELY AFTER CAPTURING
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }

      api.postAlert(undefined, capturedPhoto).then(() => {
        speak(t('callingCaregiver'), language);
      });
    }
  }, [countdown, called, t, language]);

  return (
    <ScreenWrapper className="bg-red-600 !p-0 max-w-none justify-center">
      <div className="flex flex-col items-center justify-center h-full gap-12 w-full flex-1">
        
        {/* Hidden elements strictly for capturing webcam logic */}
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Giant Pulse Circle */}
        <div className="relative flex items-center justify-center">
            {/* Ping animation rings */}
            <div className="absolute w-[300px] h-[300px] bg-red-500 rounded-full animate-ping opacity-75"></div>
            <div className="absolute w-[400px] h-[400px] bg-red-400 rounded-full animate-ping opacity-50 animation-delay-500"></div>
            <div className="absolute w-[500px] h-[500px] bg-red-300 rounded-full animate-ping opacity-25 animation-delay-1000"></div>
            
            <div className="w-[300px] h-[300px] bg-white rounded-full flex items-center justify-center relative z-10 shadow-2xl">
                {called ? (
                    <Phone className="w-40 h-40 text-red-600 animate-pulse" />
                ) : (
                    <span className="text-[150px] font-black text-red-600 leading-none -mt-4">{countdown}</span>
                )}
            </div>
        </div>

        <h1 className="text-6xl font-black text-white px-8 text-center z-10 leading-tight">
          {called ? t('callingCaregiver') : t('emergency')}
        </h1>

      </div>

      <div className="w-full p-8 bg-red-700 bg-opacity-50">
        <button 
          onClick={onBack}
          className="w-full h-32 bg-white rounded-[3rem] flex items-center justify-center gap-6 active:scale-95 transition-transform"
        >
          <XCircle className="w-16 h-16 text-red-600" strokeWidth={3} />
          <span className="text-5xl font-black text-red-600">{t('cancel')}</span>
        </button>
      </div>
    </ScreenWrapper>
  );
};

export default ElderSOS;
