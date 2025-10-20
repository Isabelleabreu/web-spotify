const client_id = 'ee1db331a75445d18b7b415b04f4d00c';
const client_secret = '5cdd7d76858f43a5beb7457a98ca2f7e';

// URL para obter o token (Substituído para a URL correta do Spotify)
const tokenUrl = 'https://accounts.spotify.com/api/token';
// URL base para busca de artista (Substituído para a URL correta do Spotify)
const searchUrl = 'https://api.spotify.com/v1/search?q=';
// URL base para top tracks (Substituído para a URL correta do Spotify)
const topTracksUrl = 'https://api.spotify.com/v1/artists/';

/**
 * Obtém o Access Token do Spotify usando Client Credentials Flow.
 */
async function getToken() {
  // Codifica Client ID e Secret em Base64 para a autorização Basic
  const authString = btoa(client_id + ':' + client_secret);

  const result = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + authString
    },
    body: 'grant_type=client_credentials'
  });
  const data = await result.json();
  return data.access_token;
}

/**
 * Busca um artista no Spotify.
 */
async function searchArtist(token, query) {
  const result = await fetch(`${searchUrl}${query}&type=artist`, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await result.json();
  // Retorna o primeiro artista encontrado
  return data.artists.items[0];
}

/**
 * Obtém as 10 faixas mais populares de um artista.
 */
async function getArtistTopTracks(token, artistId) {
  const result = await fetch(`${topTracksUrl}${artistId}/top-tracks?country=BR`, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await result.json();
  return data.tracks;
}

// LÓGICA PRINCIPAL - Ouve o evento de tecla Enter no campo de busca
document.getElementById('searchInput').addEventListener('keypress', async (event) => {
  // Verifica se a tecla pressionada foi 'Enter'
  if (event.key === 'Enter') {
    const query = event.target.value.trim();
    // Se a busca estiver vazia, não faz nada
    if (!query) return;

    // Inicia o processo de busca
    try {
      const token = await getToken();
      const artist = await searchArtist(token, query);

      const tracksContainer = document.getElementById('tracksContainer');
      const artistNameElement = document.getElementById('artistName');
      const artistBioElement = document.getElementById('artistBio');

      // Limpa containers
      tracksContainer.innerHTML = '';
      artistBioElement.innerHTML = '';

      if (artist) {
        artistNameElement.innerText = `Músicas Populares de ${artist.name}`;

        // --- 1. Exibe link para o artista (na bio) ---
        if (artist.external_urls && artist.external_urls.spotify) {
          const spotifyLink = document.createElement('a');
          spotifyLink.href = artist.external_urls.spotify;
          spotifyLink.innerText = `Abrir página de ${artist.name} no Spotify`;
          spotifyLink.target = '_blank';
          spotifyLink.classList.add('spotify-link'); // Adiciona classe para estilizar
          artistBioElement.appendChild(spotifyLink);
        }

        // --- 2. Cria os cards das músicas ---
        const tracks = await getArtistTopTracks(token, artist.id);

        tracks.forEach(track => {
          const trackCard = document.createElement('div');
          trackCard.classList.add('track-card');

          // Armazena o link do Spotify no atributo data-
          trackCard.dataset.spotifyUrl = track.external_urls.spotify;

          const trackImage = document.createElement('img');
          trackImage.src = track.album.images[0].url;
          trackImage.alt = `Capa do álbum ${track.album.name}`;
          trackImage.classList.add('track-image');

          const trackTitle = document.createElement('p');
          trackTitle.innerText = track.name;

          trackCard.appendChild(trackImage);
          trackCard.appendChild(trackTitle);
          tracksContainer.appendChild(trackCard);
        });

        // --- 3. Adiciona o Listener de CLIQUE nos CARDS ---
        document.querySelectorAll('.track-card').forEach(card => {
          card.addEventListener('click', (e) => {
            const spotifyUrl = e.currentTarget.dataset.spotifyUrl;
            if (spotifyUrl) {
              // Redireciona para o Web Player do Spotify em uma nova aba
              window.open(spotifyUrl, '_blank');
            }
          });
        });

      } else {
        artistNameElement.innerText = 'Artista de MPB não encontrado.';
      }

    } catch (error) {
      console.error('Erro ao buscar dados do Spotify:', error);
      document.getElementById('artistName').innerText = 'Erro na comunicação com a API.';
      document.getElementById('tracksContainer').innerHTML = '';
    }
  }
});