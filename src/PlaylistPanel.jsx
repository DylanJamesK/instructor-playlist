import { useEffect, useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { Play, Pause, Volume2 } from "lucide-react";

export default function PlaylistPanel({ selectedTracks, setSelectedTracks}) {
  // State management
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs
  const scrollRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  
  // Fetch user's playlists on component mount
  useEffect(() => {
    const fetchPlaylists = async () => {
      const token = localStorage.getItem('access_token');
      try {
        setIsLoading(true);
        const res = await axios.get('https://api.spotify.com/v1/me/playlists', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlaylists(res.data.items);
      } catch (error) {
        console.error('Failed to fetch playlists:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlaylists();
  }, []);

  // Fetch tracks when selected playlists change
  useEffect(() => {
    const fetchTracksFromPlaylists = async () => {
      if (selectedPlaylistIds.length === 0) {
        setTracks([]);
        return;
      }
      
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      
      try {
        const allTracks = [];
        
        // Fetch tracks from each selected playlist
        for (const id of selectedPlaylistIds) {
          let offset = 0;
          let hasMore = true;
          
          while (hasMore) {
            const res = await axios.get(`https://api.spotify.com/v1/playlists/${id}/tracks`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { limit: 100, offset },
            });
            
            // Filter out null tracks (sometimes Spotify API returns null items)
            const validTracks = res.data.items.filter(item => item && item.track);
            allTracks.push(...validTracks);
            
            offset += 100;
            hasMore = res.data.next !== null;
          }
        }
        
        setTracks(allTracks);
      } catch (error) {
        console.error('Failed to fetch tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTracksFromPlaylists();
  }, [selectedPlaylistIds]);

  // Handle playlist selection
  const togglePlaylist = useCallback((id) => {
    setSelectedPlaylistIds(prev => 
      prev.includes(id) 
        ? prev.filter(playlistId => playlistId !== id) 
        : [...prev, id]
    );
  }, []);

  // Handle track selection for new playlist
  const toggleTrackSelection = useCallback((track) => {
    setSelectedTracks(prev => {
      const trackId = track.track.id;
      if (prev.some(t => t.track.id === trackId)) {
        return prev.filter(t => t.track.id !== trackId);
      } else {
        return [...prev, track];
      }
    });
  }, []);

  // Create a new playlist with selected tracks
  const createNewPlaylist = async () => {
    if (selectedTracks.length === 0) {
      alert('Please select at least one track');
      return;
    }
    
    const token = localStorage.getItem('access_token');
    
    try {
      // First get the user's ID
      const userResponse = await axios.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userId = userResponse.data.id;
      
      // Create an empty playlist
      const date = new Date().toLocaleDateString();
      const playlistResponse = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          name: `Instructor Playlist (${date})`,
          description: 'Created with Instructor Playlist App',
          public: false
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const playlistId = playlistResponse.data.id;
      
      // Add tracks to the playlist
      const trackUris = selectedTracks.map(item => item.track.uri);
      
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        { uris: trackUris },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      alert('Playlist created successfully!');
      // Optionally refresh playlists
      setSelectedTracks([]);
      
    } catch (error) {
      console.error('Failed to create playlist:', error);
      alert('Failed to create playlist. Please try again.');
    }
  };

  // Handle scrolling for playlist horizontal scroll
  const startScroll = useCallback((direction) => {
    if (scrollIntervalRef.current) return;
    
    scrollIntervalRef.current = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft += direction * 10;
      }
    }, 10);
  }, []);

  const stopScroll = useCallback(() => {
    clearInterval(scrollIntervalRef.current);
    scrollIntervalRef.current = null;
  }, []);

  // Handle track playback
  const handlePlayTrack = useCallback(async (track) => {
    const player = window.spotifyPlayer;
    const deviceId = window.spotifyDeviceId;
    const token = localStorage.getItem('access_token');

    if (!player || !deviceId || !token) {
      alert('Spotify Player is not available. Please check console for errors.');
      console.warn('Spotify Player or device ID not available');
      return;
    }

    const trackUri = track.track.uri;

    // If clicking the same track that's already playing, toggle pause
    if (currentTrack?.track.id === track.track.id) {
      if (isPlaying) {
        await player.pause();
        setIsPlaying(false);
      } else {
        await player.resume();
        setIsPlaying(true);
      }
      return;
    }

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          uris: [trackUri],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to play track:', error);
      alert('Failed to start playback. Check console for details.');
    }
  }, [currentTrack, isPlaying]);


  // Toggle play/pause
  const handlePlayPause = useCallback(() => {
    if (!window.spotifyPlayer) return;
    
    window.spotifyPlayer.togglePlay().then(() => {
      setIsPlaying(prev => !prev);
    }).catch(error => {
      console.error("Error toggling play:", error);
    });
  }, []);

  // Handle volume change
  const handleVolumeChange = useCallback((event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    
    if (window.spotifyPlayer) {
      window.spotifyPlayer.setVolume(newVolume);
    }
  }, []);

  // Format track duration
  const formatDuration = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-end md:w-1/2 sm:w-full pt-6 max-h-250 md:max-h-290">
      <div className="flex flex-col flex-1 h-100% bg-white/30 shadow-lg backdrop-blur-md rounded-2xl p-6 relative overflow-hidden">
        {/* Playlist selection section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Your Playlists</h2>
          
          {/* Scroll buttons */}
          <div className="flex justify-between mb-2">
            <button 
              onClick={() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollLeft -= 200;
                }
              }}
              className="bg-gray-200 hover:bg-gray-300 px-6 py-1 rounded-md"
            >
              ◀
            </button>
            <button 
              onClick={() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollLeft += 200;
                }
              }}
              className="bg-gray-200 hover:bg-gray-300 px-6 py-1 rounded-md"
            >
              ▶
            </button>
          </div>
          
          {/* Playlist scroll container */}
          <div
            ref={scrollRef}
            onMouseEnter={stopScroll} // Stop auto-scroll when user interacts
            className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {isLoading && playlists.length === 0 ? (
              <div className="text-center py-4 w-full">Loading playlists...</div>
            ) : playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => togglePlaylist(playlist.id)}
                className={`
                  w-44 flex-shrink-0 rounded-lg p-3 cursor-pointer transition-all
                  ${selectedPlaylistIds.includes(playlist.id) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white hover:bg-gray-200'}
                `}
              >
                {playlist.images?.[0]?.url ? (
                  <img
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    className="w-full h-36 object-cover rounded-md mb-2"
                  />
                ) : (
                  <div className="w-full h-36 bg-gray-300 rounded-md mb-2 flex items-center justify-center">
                    No Image
                  </div>
                )}
                <p className="text-sm font-medium truncate">{playlist.name}</p>
                <p className="text-xs opacity-75 truncate">{playlist.tracks.total} tracks</p>
              </div>
            ))}
          </div>
          
          {/* Hide scrollbar */}
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>

        {/* Track listing section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">
              {tracks.length > 0 ? `Combined Tracks (${tracks.length})` : ''}
            </h2>
            
            {/* Create playlist button */}
            <div className="flex gap-2 items-center">
              <span className="text-sm">{selectedTracks.length} selected</span>
              <button
                onClick={createNewPlaylist}
                disabled={selectedTracks.length === 0}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium
                  ${selectedTracks.length > 0 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-300 cursor-not-allowed'}
                `}
              >
                Create Playlist
              </button>
            </div>
          </div>
          
          {/* Track list */}
          <div className="bg-white rounded-xl overflow-hidden flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {isLoading && selectedPlaylistIds.length > 0 ? (
                <div className="text-center py-4">Loading tracks...</div>
              ) : tracks.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Track</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tracks.map((track) => (
                      <tr
                        key={track.track.id}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-4 py-2">
                          <button 
                            onClick={() => handlePlayTrack(track)}
                            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-200"
                          >
                            {currentTrack?.track.id === track.track.id && isPlaying ? (
                              <Pause size={16} />
                            ) : (
                              <Play size={16} />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-2 text-sm" onClick={() => handlePlayTrack(track)}>
                          {track.track.name}
                        </td>
                        <td className="px-4 py-2 text-sm" onClick={() => handlePlayTrack(track)}>
                          {track.track.artists.map(a => a.name).join(', ')}
                        </td>
                        <td className="px-4 py-2 text-sm" onClick={() => handlePlayTrack(track)}>
                          {formatDuration(track.track.duration_ms)}
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={selectedTracks.some(t => t.track.id === track.track.id)}
                            onChange={() => toggleTrackSelection(track)}
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : selectedPlaylistIds.length > 0 ? (
                <div className="text-center py-4">No tracks found</div>
              ) : (
                <div className="text-center py-4">Select playlists to see tracks</div>
              )}
            </div>
            
            {/* Playback controls */}
            {currentTrack && (
              <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePlayPause}
                    className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <div>
                    <div className="font-medium text-sm">{currentTrack.track.name}</div>
                    <div className="text-xs text-gray-300">
                      {currentTrack.track.artists.map(a => a.name).join(', ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 size={16} />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}