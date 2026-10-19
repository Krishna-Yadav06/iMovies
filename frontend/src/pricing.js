
export function getMoviePrice(movie) {
  const rating = Number(movie.vote_average) || 0;
  const popularity = Number(movie.popularity) || 0;

  let price = 150;

  if (rating >= 8) {
    price = 180;
  } else if (rating >= 7) {
    price = 165;
  }

  if (popularity >= 100) {
    price += 20;
  } else if (popularity >= 50) {
    price += 10;
  }

  return price;
}
