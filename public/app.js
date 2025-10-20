// URL base do servidor
const API_URL = "https://web-spotify.onrender.com";

// Ouve o evento de Enter no campo de busca
document.getElementById('searchInput').addEventListener('keydown', async (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    const query = event.target.value.trim();
    if (!query) return;

    try {
      // Busca artista via servidor
      const artistResponse = await fetch(`${API_URL}/artist?q=${encodeURIComponent(query)}`);
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

        // Busca as top tracks via servidor
        const tracksResponse = await fetch(`${API_URL}/top-tracks/${artist.id}`);
        const tracksData = await tracksResponse.json();
        const tracks = tracksData.tracks;

        tracks.forEach(track => {
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

        // Clique para abrir no Spotify
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
      document.getElementById('artistName').innerText = 'Erro na comunicação com o servidor.';
      document.getElementById('tracksContainer').innerHTML = '';
    }
  }
});
