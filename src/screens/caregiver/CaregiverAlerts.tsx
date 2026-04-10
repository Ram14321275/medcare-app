import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api/api';
import { Alert } from '../../types/medicine';
import { AlertCircle } from 'lucide-react';

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

    // Subscribe to real-time events, if another tab creates an alert
    const unsubscribe = api.subscribe((e) => {
      if (e.data.type === 'NEW_ALERT' || e.data.type === 'STATUS_UPDATED') {
        fetchAlerts();
        
        // Let the caregiver know if SOS triggered!
        if (e.data.alert?.type === 'emergency') {
           // We could play a loud noise or use Notification API here
           alert("🚨 EMERGENCY SOS TRIGGERED BY ELDER! 🚨");
        }
      }
    });

    return unsubscribe;
  }, []);

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
              className={`p-6 rounded-3xl border-2 shadow-sm flex flex-col gap-2 transition-all hover:scale-[1.01] cursor-pointer
              ${alert.type === 'emergency' ? 'bg-red-50 border-red-300 animate-pulse' : 
                alert.type === 'missed' ? 'bg-white border-orange-200' : 'bg-white border-gray-200'}
            `}>
              <div className="flex justify-between items-center">
                <span className={`font-black uppercase text-sm px-3 py-1 rounded-full
                  ${alert.type === 'emergency' ? 'bg-red-200 text-red-800' : 
                    alert.type === 'missed' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}
                `}>{alert.type || 'info'}</span>
                <span className="text-gray-500 font-semibold text-sm">
                  {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className={`text-2xl font-bold mt-2 ${alert.type === 'emergency' ? 'text-red-900' : 'text-gray-800'}`}>
                {alert.message}
              </p>
              {alert.photo && (
                <div className="mt-4 rounded-xl overflow-hidden border-4 border-red-500 shadow-lg">
                  <div className="bg-red-500 text-white font-bold text-center py-2 text-sm uppercase tracking-widest">Tap to Enlarge</div>
                  <img src={alert.photo} alt="SOS Snapshot" className="w-full h-auto object-cover max-h-48" />
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
