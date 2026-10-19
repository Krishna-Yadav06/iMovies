
import MovieRow from "./MovieRow";

function TrendingMovies(props) {
  return <MovieRow title="Trending This Week" endpoint="/trending" {...props} />;
}

export default TrendingMovies;
