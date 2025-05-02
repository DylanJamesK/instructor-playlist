// src/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PlaylistPanel from './PlaylistPanel';
import SpotifyDebugPanel from './SpotifyDebugPanel';
import SpotifyLogoWhite from './SpotifyLogoWhite';
import FloatingCirclesBackground from './FloatingCirclesBackground';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spotifyPremium, setSpotifyPremium] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState([]);


  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }

    // Get user profile
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        
        // Check if user has Spotify Premium (required for Web Playback SDK)
        setSpotifyPremium(response.data.product === 'premium');
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user profile", error);
        if (error.response?.status === 401) {
          // Token expired, redirect to login
          localStorage.removeItem('access_token');
          navigate('/');
        }
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('verifier');
    localStorage.removeItem('spotify_device_id');
    navigate('/');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <FloatingCirclesBackground/>
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-black text-white p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-default md:text-xl font-bold">🏃🏽‍♂️ Instructor Playlist</h1>
            {user && (
              <div className="flex items-center space-x-2">
                {user.images?.[0]?.url && (
                  <img 
                    src={user.images[0].url} 
                    alt={user.display_name} 
                    className="md:w-8 w-4 h-4 md:h-8 rounded-full"
                  />
                )}
                <span className="text-xs md:text-sm">{user.display_name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {!spotifyPremium && (
              <div className="text-yellow-300 text-sm bg-yellow-900 px-3 py-1 rounded-full">
                Premium Required for Playback
              </div>
            )}
                <SpotifyLogoWhite/>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
          <div className="bg-white/30 backdrop-blur-md shadow-lg rounded-xl p-4 mt-6">
  <h3 className="text-2xl font-semibold mb-2">Selected Tracks</h3>
  <ul className="space-y-1 text-sm max-h-48 overflow-y-auto">
    {selectedTracks.map((item, index) => (
      <li key={index} className="flex justify-between">
        <span>{item.track.name}</span>
        <span>{Math.floor(item.track.duration_ms / 60000)}:{String(Math.floor((item.track.duration_ms % 60000) / 1000)).padStart(2, '0')}</span>
      </li>
    ))}
  </ul>

  <div className="mt-2 font-semibold">
    Total Duration: {
      (() => {
        const totalMs = selectedTracks.reduce((sum, item) => sum + item.track.duration_ms, 0);
        const minutes = Math.floor(totalMs / 60000);
        const seconds = Math.floor((totalMs % 60000) / 1000);
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
      })()
    }
  </div>
</div>
          </div>
          
          <PlaylistPanel 
            selectedTracks={selectedTracks}
            setSelectedTracks={setSelectedTracks}/>
        </div>
      </main>
      
      {/* Debug panel */}
      <SpotifyDebugPanel />
    </div>
    </>
  );
}

export default Dashboard;