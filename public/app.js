const CLIENT_ID = "ee1db331a75445d18b7b415b04f4d00c";
const CLIENT_SECRET = "c8d0680fe1e141e19f29da7502cf21d0";

//função para gerar token
async function getSpotifyToken() {
  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET)
    },
    body: "grant_type=client_credentials"
  });
  const data = await result.json();
  return data.access_token;
}

//ação ao botão enter
document.getElementById('searchInput').addEventListener('keydown', async (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    const query = event.target.value.trim();
    if (!query) return;

    try {
      const token = await getSpotifyToken();

      //buscar artista
      const artistResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const artistData = await artistResponse.json();
      const artist = artistData.artists.items[0];

      const tracksContainer = document.getElementById('tracksContainer');
      const artistNameElement = document.getElementById('artistName');
      const artistBioElement = document.getElementById('artistBio');

      tracksContainer.innerHTML = '';
      artistBioElement.innerHTML = '';

      if (artist) {
        artistNameElement.innerText = `Músicas Populares de ${artist.name}`;

        if (artist.external_urls?.spotify) {
          const spotifyLink = document.createElement('a');
          spotifyLink.href = artist.external_urls.spotify;
          spotifyLink.innerText = `Abrir página de ${artist.name} no Spotify`;
          spotifyLink.target = '_blank';
          spotifyLink.classList.add('spotify-link');
          artistBioElement.appendChild(spotifyLink);
        }

        //buscar top tracks do artista
        const tracksResponse = await fetch(
          `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=BR`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const tracksData = await tracksResponse.json();

        tracksData.tracks.forEach(track => {
          const card = document.createElement('div');
          card.classList.add('track-card');
          card.dataset.spotifyUrl = track.external_urls.spotify;

          const img = document.createElement('img');
          img.src = track.album.images[0]?.url || './img/placeholder.jpg';
          img.alt = `Capa do álbum ${track.album.name}`;
          img.classList.add('track-image');

          const title = document.createElement('p');
          title.innerText = track.name;

          card.appendChild(img);
          card.appendChild(title);
          tracksContainer.appendChild(card);
        });

        //clique para abrir no Spotify
        document.querySelectorAll('.track-card').forEach(card => {
          card.addEventListener('click', (e) => {
            const url = e.currentTarget.dataset.spotifyUrl;
            if (url) window.open(url, '_blank');
          });
        });
      } else {
        artistNameElement.innerText = 'Artista não encontrado.';
      }

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      document.getElementById('artistName').innerText = 'Erro na comunicação com o Spotify.';
      document.getElementById('tracksContainer').innerHTML = '';
    }
  }
});
