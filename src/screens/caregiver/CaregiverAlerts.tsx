import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/api';
import { Alert } from '../../types/medicine';
import { AlertCircle, Trash2, ImageOff } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const CaregiverAlerts: React.FC<Props> = ({ onBack }) => {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchAlerts = async () => {
    const data = await api.getAlerts();
    setAlerts(data);
  };

  useEffect(() => {
    fetchAlerts();
    const unsubscribe = api.subscribe((e: any) => {
      if (e.data.type === 'NEW_ALERT' || e.data.type === 'STATUS_UPDATED') {
        fetchAlerts();
      }
    });

    return unsubscribe;
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string | undefined) => {
    e.stopPropagation();
    if (!id) return;
    if (confirm("Are you sure you want to delete this alert?")) {
      await api.deleteAlert(id);
      fetchAlerts();
    }
  };

  const handleRemovePhoto = async (e: React.MouseEvent, id: string | undefined) => {
    e.stopPropagation();
    if (!id) return;
    if (confirm("Remove the photo from this alert?")) {
      await api.removeAlertPhoto(id);
      fetchAlerts();
    }
  };

  return (
    <ScreenWrapper className="bg-orange-50">
      <Header title={t('alerts')} onBack={onBack} />
      
      <div className="flex flex-col gap-4 mt-8">
        {alerts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border-2 border-gray-200 shadow-sm mt-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-500">No alerts found!</h2>
          </div>
        ) : (
          alerts.map((alert, i) => (
            <div 
              key={i} 
              onClick={() => alert.photo && setSelectedPhoto(alert.photo)}
              className={`p-6 rounded-3xl border-2 shadow-sm flex flex-col gap-2 transition-all hover:scale-[1.01] cursor-pointer relative group
              ${alert.type === 'emergency' ? 'bg-red-50 border-red-300 animate-pulse' : 
                alert.type === 'missed' ? 'bg-white border-orange-200' : 'bg-white border-gray-200'}
            `}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <span className={`font-black uppercase text-sm px-3 py-1 rounded-full self-start
                  ${alert.type === 'emergency' ? 'bg-red-200 text-red-800' : 
                    alert.type === 'missed' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}
                `}>{alert.type || 'info'}</span>
                
                <div className="flex items-center gap-2 text-gray-500 font-semibold text-sm">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  <button 
                    onClick={(e) => handleDelete(e, alert.id)}
                    className="p-2 ml-2 bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                    title="Delete Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className={`text-2xl font-bold mt-2 ${alert.type === 'emergency' ? 'text-red-900' : 'text-gray-800'}`}>
                {alert.message}
              </p>
              {alert.photo && (
                <div className="mt-4 relative rounded-xl overflow-hidden border-4 border-red-500 shadow-lg inline-block">
                  <div className="bg-red-500 text-white font-bold text-center py-2 text-sm uppercase tracking-widest">
                    Tap to Enlarge
                  </div>
                  <img src={alert.photo} alt="SOS Snapshot" className="w-full h-auto object-cover max-h-48" />
                  
                  {/* Remove Photo Button */}
                  <button 
                    onClick={(e) => handleRemovePhoto(e, alert.id)}
                    className="absolute top-10 right-2 p-2 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors backdrop-blur-sm"
                    title="Remove Photo"
                  >
                    <ImageOff className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Full Screen Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex flex-col items-center justify-center p-6"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-4 bg-red-600 text-white font-black text-center text-xl">
              EMERGENCY SNAPSHOT
            </div>
            <img src={selectedPhoto} alt="Full Alert" className="w-full display-block" />
            <button 
              className="w-full p-6 bg-gray-100 text-gray-800 font-bold text-2xl hover:bg-gray-200"
              onClick={() => setSelectedPhoto(null)}
            >
              Close
            </button>
          </div>
          <p className="text-white mt-4 font-bold">Tap anywhere to close</p>
        </div>
      )}
    </ScreenWrapper>
  );
};

export default CaregiverAlerts;
