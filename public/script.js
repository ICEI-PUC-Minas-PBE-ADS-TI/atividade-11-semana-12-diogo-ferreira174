const api_key = "f960ec4be4f8b901eb4f984d2019e453";

const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

let movies = [];

function showMessage(text) {
	const msg = document.getElementById('message');
	msg.textContent = text || '';
}

function createMovieCard(film) {
	const col = document.createElement('div');
	col.classList.add('col-md-4', 'mb-4');

	const card = document.createElement('div');
	card.classList.add('card', 'h-100');

	if (film.poster_path) {
		const img = document.createElement('img');
		img.classList.add('card-img-top');
		img.src = IMAGE_BASE + film.poster_path;
		img.alt = film.title;
		card.appendChild(img);
	}

	const body = document.createElement('div');
	body.classList.add('card-body', 'd-flex', 'flex-column');

	const title = document.createElement('h5');
	title.classList.add('card-title');
	title.textContent = film.title || 'Título indisponível';
	body.appendChild(title);

	const meta = document.createElement('p');
	meta.classList.add('text-muted', 'mb-1');
	const year = film.release_date ? new Date(film.release_date).getFullYear() : '—';
	meta.textContent = `${year} • Nota: ${film.vote_average ?? '—'}`;
	body.appendChild(meta);

	const overview = document.createElement('p');
	overview.classList.add('card-text');
	const max = 150;
	const text = film.overview || '';
	overview.textContent = text.length > max ? text.slice(0, max).trim() + '…' : text;
	body.appendChild(overview);

	const spacer = document.createElement('div');
	spacer.classList.add('mt-auto');
	body.appendChild(spacer);

	const more = document.createElement('a');
	more.classList.add('btn', 'btn-primary', 'mt-2');
	more.href = `https://www.themoviedb.org/movie/${film.id}`;
	more.target = '_blank';
	more.textContent = 'Mais Detalhes';
	body.appendChild(more);

	card.appendChild(body);
	col.appendChild(card);
	return col;
}

function renderMovies(list) {
	const container = document.getElementById('movie-list');
	container.innerHTML = '';
	if (!list || list.length === 0) {
		showMessage('Nenhum resultado encontrado.');
		return;
	}
	showMessage('');
	list.forEach(f => {
		const card = createMovieCard(f);
		container.appendChild(card);
	});
}

function applySort(list, mode) {
	const copy = [...list];
	if (mode === 'popularidade') return copy.sort((a,b) => (b.popularity || 0) - (a.popularity || 0));
	if (mode === 'ano') return copy.sort((a,b) => {
		const ay = a.release_date ? new Date(a.release_date).getFullYear() : 0;
		const by = b.release_date ? new Date(b.release_date).getFullYear() : 0;
		return by - ay;
	});
	if (mode === 'titulo') return copy.sort((a,b) => (a.title || '').localeCompare(b.title || ''));
	return copy;
}

function fetchMovies(query) {
	showMessage('Carregando...');
	const q = query && query.trim();
	const url = q
		? `https://api.themoviedb.org/3/search/movie?api_key=${api_key}&language=pt-BR&query=${encodeURIComponent(q)}`
		: `https://api.themoviedb.org/3/movie/popular?api_key=${api_key}&language=pt-BR`;

	return fetch(url)
		.then(res => res.json())
		.then(data => {
			movies = data.results || [];
			movies = applySort(movies, document.getElementById('filter').value);
			renderMovies(movies);
			if (!movies || movies.length === 0) showMessage('Nenhum resultado encontrado.');
		})
		.catch(err => {
			console.error(err);
			showMessage('Erro ao carregar filmes.');
		});
}

function init() {
	const input = document.getElementById('search');
	const select = document.getElementById('filter');
	const btn = document.getElementById('btnSearch');

	function doSearch() {
		const q = input.value.trim();
		fetchMovies(q);
	}

	btn.addEventListener('click', doSearch);
	input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
	select.addEventListener('change', () => {
		const q = input.value.trim();
		fetchMovies(q);
	});

	// carga inicial
	fetchMovies();
}

document.addEventListener('DOMContentLoaded', init);


