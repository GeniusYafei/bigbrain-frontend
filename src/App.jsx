// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RegisterPage from './pages/Register.jsx';
import GameEdit from './pages/GameEdit.jsx';
import QuestionEdit from './pages/QuestionEdit.jsx';
import SessionPage from './pages/SessionPage.jsx';
import PlayJoinPage from './pages/PlayJoinPage.jsx';
import PlayGamePage from './pages/PlayGamePage.jsx';
import LobbyPage from './pages/LobbyPage.jsx';
import PlayerResult from './pages/PlayerResult.jsx';

// all router import in App.jsx
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/game/:gameId" element={<GameEdit />} />
        <Route path="/game/:gameId/question/:questionId" element={<QuestionEdit />} />
        <Route path="/session/:sessionId" element={<SessionPage />} />
        <Route path="/play/join" element={<PlayJoinPage />} />
        <Route path="/play/join/:sessionId" element={<PlayJoinPage />} />
        <Route path="/play/*" element={<Navigate to="/play/join" replace />} />
        <Route path="/play/lobby/:playerId" element={<LobbyPage />} />
        <Route path="/play/game/:playerId" element={<PlayGamePage />} />
        <Route path="/play/:playerId/result" element={<PlayerResult />} />
      </Routes>
    </Router>
  );
}


