
import { featuredMovie, imageUrl } from "../data";

function Hero({ onExplore }) {
  return (
    <section
      className="hero"
      style={{
        "--hero-backdrop": `url("${imageUrl(
          featuredMovie.backdrop,
          "original"
        )}")`,
      }}
    >
      <div className="hero-copy">
        <span className="eyebrow">YOUR NEXT MOVIE NIGHT</span>

        <h1>
          Good movies.
          <br />
          <span>Great nights.</span>
        </h1>

        <p>
          Find your next favourite film, explore what's playing,
          and plan your next trip to the cinema.
        </p>

        <div className="hero-actions">
          <button className="primary-btn" onClick={onExplore}>
            Explore movies <span>→</span>
          </button>

          <a href="#genres" className="outline-btn">
            Browse genres
          </a>
        </div>

      
      </div>

      <div className="featured-movie">
        <img
          className="featured-image"
          src={imageUrl(featuredMovie.image, "w780")}
          alt={`${featuredMovie.title} featured film`}
        />

        <div className="featured-overlay">
          <span className="featured-tag">FEATURED FILM</span>
          <h2>{featuredMovie.title}</h2>

          <p>
            {featuredMovie.genres[0]} <span>•</span>{" "}
            {featuredMovie.genres[1]} <span>•</span>
            <strong>★ {featuredMovie.rating}</strong>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
