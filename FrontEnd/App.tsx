import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useStore } from './src/store/useStore';
import { useEffect } from 'react';
import { panicApi } from './src/api/client';

export default function App() {
  const token = useStore(state => state.token);
  const setPanicSession = useStore(state => state.setPanicSession);
  const setUrgency = useStore(state => state.setUrgency);

  // Sync panic session state on launch if logged in
  useEffect(() => {
    if (token) {
      panicApi
        .getPanicSession()
        .then((res) => {
          if (res && res.active && res.session) {
            setPanicSession(res.session);
            setUrgency(res.session.urgencyLevel || 'low');
          } else {
            setPanicSession(null);
            setUrgency('low');
          }
        })
        .catch((err) => {
          console.warn('Panic session check failed:', err);
        });
    }
  }, [token]);

  return (
    <SafeAreaProvider>
      <RootNavigator />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
