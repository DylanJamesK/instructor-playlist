import { useState, useEffect } from 'react';

export default function SpotifyDebugPanel() {
  const [showDebug, setShowDebug] = useState(false);
  const [playerState, setPlayerState] = useState({
    connected: false,
    deviceId: null,
    currentTrack: null,
    isPlaying: false,
    errors: []
  });
  
  useEffect(() => {
    // Check Spotify connection
    const checkSpotify = () => {
      const connection = {
        connected: !!window.spotifyPlayer,
        deviceId: window.spotifyDeviceId || localStorage.getItem('spotify_device_id'),
        token: !!localStorage.getItem('access_token'),
        errors: []
      };
      
      if (!connection.token) {
        connection.errors.push('No access token found');
      }
      
      if (!connection.deviceId) {
        connection.errors.push('No device ID available');
      }
      
      // Check if player has a getCurrentState method
      if (window.spotifyPlayer && typeof window.spotifyPlayer.getCurrentState === 'function') {
        window.spotifyPlayer.getCurrentState().then(state => {
          if (!state) {
            connection.errors.push('No playback state available');
          } else {
            connection.currentTrack = state.track_window.current_track;
            connection.isPlaying = !state.paused;
          }
          setPlayerState(connection);
        });
      } else {
        setPlayerState(connection);
      }
    };
    
    checkSpotify();
    
    // Check periodically
    const interval = setInterval(checkSpotify, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Attempt to fix common issues
  const attemptFix = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('No access token found. Please log in again.');
      return;
    }
    
    // Try to get available devices from Spotify API
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      console.log('Available devices:', data);
      
      if (data.devices && data.devices.length > 0) {
        // Found devices - show them to user
        const deviceList = data.devices.map(d => `${d.name} (${d.type})`).join('\n');
        alert(`Found ${data.devices.length} active Spotify devices:\n${deviceList}\n\nTry playing from one of these devices.`);
      } else {
        alert('No active Spotify devices found. Make sure Spotify is open on another device or try refreshing the page.');
      }
    } catch (error) {
      console.error('Error checking devices:', error);
      alert('Error checking Spotify devices. You may need to log in again.');
    }
  };
  
  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-70 hover:opacity-100"
      >
        Show Spotify Debug
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-0 right-0 bg-gray-900 text-white p-4 rounded-tl-lg shadow-lg z-50 max-w-md text-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Spotify Debug Panel</h3>
        <button 
          onClick={() => setShowDebug(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <span className="font-medium">Player:</span> 
          <span className={playerState.connected ? "text-green-500" : "text-red-500"}>
            {playerState.connected ? '✓ Available' : '✗ Not Connected'}
          </span>
        </div>
        
        <div>
          <span className="font-medium">Device ID:</span> 
          <span className={playerState.deviceId ? "text-green-500" : "text-red-500"}>
            {playerState.deviceId ? '✓ Available' : '✗ Missing'}
          </span>
        </div>
        
        <div>
          <span className="font-medium">Access Token:</span> 
          <span className={playerState.token ? "text-green-500" : "text-red-500"}>
            {playerState.token ? '✓ Present' : '✗ Missing'}
          </span>
        </div>
        
        {playerState.currentTrack && (
          <div>
            <span className="font-medium">Current Track:</span> {playerState.currentTrack.name} by {playerState.currentTrack.artists[0].name}
          </div>
        )}
        
        {playerState.errors.length > 0 && (
          <div>
            <span className="font-medium text-red-400">Errors:</span>
            <ul className="list-disc pl-5 text-red-300">
              {playerState.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="pt-2">
          <button
            onClick={attemptFix}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
          >
            Diagnose Issues
          </button>
        </div>
        
        <div className="text-xs text-gray-400 mt-2">
          <p><strong>Common Solutions:</strong></p>
          <ul className="list-disc pl-5">
            <li>Make sure you have a Spotify Premium account</li>
            <li>Try refreshing the page</li>
            <li>Check if Spotify is playing on another device</li>
            <li>Open spotify.com in another tab to verify your login status</li>
          </ul>
        </div>
      </div>
    </div>
  );
}