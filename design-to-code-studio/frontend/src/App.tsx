import { Route, Routes } from 'react-router-dom';
import { DesignConverter } from './pages/DesignConverter';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DesignConverter />} />
    </Routes>
  );
}
