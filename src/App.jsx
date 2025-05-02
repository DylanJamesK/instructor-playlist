// src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Callback from './Callback';
import Dashboard from './Dashboard';

function App() {
  const [playerConnected, setPlayerConnected] = useState(false);
  const [playerError, setPlayerError] = useState(null);

  useEffect(() => {
    const scriptTagId = 'spotify-player-sdk';

    // Define the function BEFORE loading the script
    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('Spotify Web Playback SDK Ready');
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        console.error('No access token found in localStorage');
        setPlayerError('No access token found');
        return;
      }

      const player = new window.Spotify.Player({
        name: 'Instructor Playlist App',
        getOAuthToken: cb => { 
          console.log('Getting OAuth token');
          cb(token);
        },
        volume: 0.8,
      });

      window.spotifyPlayer = player;

      player.connect().then(success => {
        if (success) {
          console.log('Successfully connected to Spotify');
          setPlayerConnected(true);
        } else {
          console.error('Failed to connect to Spotify');
          setPlayerError('Failed to connect to Spotify');
        }
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Spotify Player is ready with device ID:', device_id);
        window.spotifyDeviceId = device_id;
        localStorage.setItem('spotify_device_id', device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID is not ready:', device_id);
      });

      player.addListener('initialization_error', ({ message }) => {
        console.error('Initialization error:', message);
        setPlayerError(`Initialization error: ${message}`);
      });

      player.addListener('authentication_error', ({ message }) => {
        console.error('Authentication error:', message);
        setPlayerError(`Authentication error: ${message}`);
      });

      player.addListener('account_error', ({ message }) => {
        console.error('Account error:', message);
        setPlayerError(`Account error: ${message}`);
      });

      player.addListener('playback_error', ({ message }) => {
        console.error('Playback error:', message);
        setPlayerError(`Playback error: ${message}`);
      });
      
      // Add listener for player state changes to help debug
      player.addListener('player_state_changed', state => {
        if (!state) {
          console.log('No playback state available');
          return;
        }
        
        console.log('Current track:', state.track_window.current_track);
        console.log('Playback state:', state.paused ? 'Paused' : 'Playing');
      });
    };

    // Load the SDK script
    if (!document.getElementById(scriptTagId)) {
      const script = document.createElement('script');
      script.id = scriptTagId;
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // Cleanup function
    return () => {
      if (window.spotifyPlayer) {
        window.spotifyPlayer.disconnect();
      }
      window.onSpotifyWebPlaybackSDKReady = undefined;
    };
  }, []);

  // Display connection status for debugging
  const renderDebugInfo = () => {
    if (window.location.pathname !== '/dashboard') return null;
    
    return (
      <div style={{
        position: 'fixed',
        bottom: 10,
        left: 10,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        Player Status: {playerConnected ? '✅ Connected' : '❌ Disconnected'}
        {playerError && <div>Error: {playerError}</div>}
      </div>
    );
  };

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
      {renderDebugInfo()}
    </>
  );
}

export default App;