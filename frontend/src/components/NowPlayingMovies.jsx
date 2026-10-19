
import MovieRow from "./MovieRow";

function NowPlayingMovies(props) {
  return <MovieRow title="Now Playing in Cinemas" endpoint="/now-playing" {...props} />;
}

export default NowPlayingMovies;
