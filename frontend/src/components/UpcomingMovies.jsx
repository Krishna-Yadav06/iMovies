
import MovieRow from "./MovieRow";

function UpcomingMovies(props) {
  return <MovieRow title="Coming Soon" endpoint="/upcoming" {...props} />;
}

export default UpcomingMovies;
