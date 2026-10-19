
import MovieRow from "./MovieRow";

function TopRatedMovies(props) {
  return <MovieRow title="Top Rated Movies" endpoint="/top-rated" {...props} />;
}

export default TopRatedMovies;
