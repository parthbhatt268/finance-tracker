import { ToastProvider } from './components/ToastContext';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}

export default App;
