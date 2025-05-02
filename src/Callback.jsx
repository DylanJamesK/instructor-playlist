// src/Callback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri ="https://instructorplaylist.netlify.app/callback";

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get('code');
        const verifier = localStorage.getItem('verifier');

        if (!code || !verifier) {
          console.error("Missing code or verifier");
          return;
        }

        const params = new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          code_verifier: verifier,
        });

        const response = await axios.post(
          'https://accounts.spotify.com/api/token',
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        localStorage.setItem('access_token', response.data.access_token);
        navigate('/dashboard');
      } catch (err) {
        console.error("Token exchange failed", err.response?.data || err.message);
      }
    };

    fetchAccessToken();
  }, [navigate]);

  return <div>Logging in...</div>;
}

export default Callback;
