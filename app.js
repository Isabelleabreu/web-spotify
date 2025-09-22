const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

async function getToken() {
  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
    },
    body: 'grant_type=client_credentials'
  });
  const data = await result.json();
  return data.access_token;
}

async function searchArtist(token, query) {
  const result = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=artist`, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await result.json();
  return data.artists.items[0];
}

async function getArtistTopTracks(token, artistId) {
  const result = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=BR`, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await result.json();
  return data.tracks;
}

document.getElementById('searchInput').addEventListener('keypress', async (event) => {
  if (event.key === 'Enter') {
    const query = event.target.value;
    const token = await getToken();
    const artist = await searchArtist(token, query);

    if (artist) {
      document.getElementById('tracksContainer').innerHTML = '';
      document.getElementById('artistName').innerText = `Músicas de ${artist.name}`;
      
      const artistBio = document.getElementById('artistBio');
      artistBio.innerHTML = '';
      const bioText = document.createElement('p');
      bioText.innerText = `Saiba mais sobre ${artist.name}!`;

      if (artist.external_urls && artist.external_urls.spotify) {
        const spotifyLink = document.createElement('a');
        spotifyLink.href = artist.external_urls.spotify;
        spotifyLink.innerText = 'Ver no Spotify';
        spotifyLink.target = '_blank';
        artistBio.appendChild(spotifyLink);
      }
      
      artistBio.appendChild(bioText);

      const tracks = await getArtistTopTracks(token, artist.id);

      tracks.forEach(track => {
        const trackCard = document.createElement('div');
        trackCard.classList.add('track-card');
        
        // Armazena o link do Spotify em vez da prévia
        trackCard.dataset.spotifyUrl = track.external_urls.spotify;
        
        const trackImage = document.createElement('img');
        trackImage.src = track.album.images[0].url;
        trackImage.alt = `Capa do álbum ${track.album.name}`;
        trackImage.classList.add('track-image');
        
        const trackTitle = document.createElement('p');
        trackTitle.innerText = track.name;
        
        trackCard.appendChild(trackImage);
        trackCard.appendChild(trackTitle);
        document.getElementById('tracksContainer').appendChild(trackCard);
      });

      // Lógica para redirecionar para o Spotify
      document.querySelectorAll('.track-card').forEach(card => {
        card.addEventListener('click', (e) => {
          const spotifyUrl = e.currentTarget.dataset.spotifyUrl;
          if (spotifyUrl) {
            window.open(spotifyUrl, '_blank');
          }
        });
      });

    } else {
      document.getElementById('artistName').innerText = 'Artista não encontrado.';
      document.getElementById('tracksContainer').innerHTML = '';
      document.getElementById('artistBio').innerHTML = '';
    }
  }
});