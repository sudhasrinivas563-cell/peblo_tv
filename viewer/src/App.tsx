import { useEffect, useState } from "react";
import "./App.css";

type Show = {
  id: number;
  title: string;
  description: string | null;
  language: string | null;
  genre: string | null;
  artwork_url: string | null;
  status: string;
};

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [shows, setShows] = useState<Show[]>([]);
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState("All");
  const [genre, setGenre] = useState("All");
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [catalogueVersion, setCatalogueVersion] =
    useState<number | null>(null);

  useEffect(() => {
    loadCatalogue();
  }, []);

  // =========================
  // LOAD PUBLISHED CATALOGUE
  // =========================

  const loadCatalogue = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/catalogue/shows`
      );

      if (!response.ok) {
        throw new Error(
          "Could not load published catalogue"
        );
      }

      const catalogue = await response.json();

      setCatalogueVersion(
        catalogue.version || null
      );

      setShows(
        catalogue.shows || []
      );

    } catch {
      setError(
        "No published catalogue is available. Please publish content from the CMS."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FILTER OPTIONS
  // =========================

  const languages = [
    "All",
    ...Array.from(
      new Set(
        shows
          .map((show) => show.language)
          .filter(Boolean) as string[]
      )
    ),
  ];

  const genres = [
    "All",
    ...Array.from(
      new Set(
        shows
          .map((show) => show.genre)
          .filter(Boolean) as string[]
      )
    ),
  ];

  // =========================
  // FILTER SHOWS
  // =========================

  const filteredShows = shows.filter(
    (show) => {

      const matchesSearch =
        show.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesLanguage =
        language === "All" ||
        show.language === language;

      const matchesGenre =
        genre === "All" ||
        show.genre === genre;

      return (
        matchesSearch &&
        matchesLanguage &&
        matchesGenre
      );
    }
  );

  // =========================
  // FEATURED SHOW
  // =========================

  const featuredShow = shows[0];

  // =========================
  // GROUP BY LANGUAGE
  // =========================

  const groupedByLanguage =
    filteredShows.reduce(
      (groups, show) => {

        const key =
          show.language || "Other";

        if (!groups[key]) {
          groups[key] = [];
        }

        groups[key].push(show);

        return groups;

      },
      {} as Record<string, Show[]>
    );

  return (
    <div className="viewer">

      {/* =========================
          NAVIGATION
      ========================= */}

      <header className="navbar">

        <div className="logo">
          PEBLO<span>TV</span>
        </div>

        <div className="nav-links">

          <button
            className="nav-home"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            Home
          </button>

          <span>Shows</span>

          <span>Movies</span>

        </div>

        <div className="catalogue-info">

          {catalogueVersion !== null
            ? `Catalogue v${catalogueVersion}`
            : "Peblo TV"}

        </div>

      </header>


      {/* =========================
          HERO
      ========================= */}

      {featuredShow &&
        !search &&
        language === "All" &&
        genre === "All" && (

          <section className="hero">

            {featuredShow.artwork_url && (

              <img
                className="hero-image"
                src={`${API_URL}${featuredShow.artwork_url}`}
                alt={featuredShow.title}
              />

            )}

            <div className="hero-overlay"></div>

            <div className="hero-content">

              <span className="featured-label">
                FEATURED
              </span>

              <h1>
                {featuredShow.title}
              </h1>

              <p>
                {featuredShow.description ||
                  "Watch this exciting show on Peblo TV."}
              </p>

              <div className="hero-meta">

                {featuredShow.language && (
                  <span>
                    {featuredShow.language}
                  </span>
                )}

                {featuredShow.genre && (
                  <span>
                    {featuredShow.genre}
                  </span>
                )}

              </div>

              <button
                className="watch-button"
                onClick={() =>
                  setSelectedShow(
                    featuredShow
                  )
                }
              >
                ▶ Watch Now
              </button>

            </div>

          </section>
        )}


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="content">

        <div className="page-heading">

          <div>

            <h2>
              Browse Shows
            </h2>

            <p>
              Explore the published Peblo TV catalogue.
            </p>

          </div>

        </div>


        {/* =========================
            SEARCH & FILTERS
        ========================= */}

        <div className="filters">

          <input
            type="text"
            placeholder="Search shows..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={language}
            onChange={(e) =>
              setLanguage(e.target.value)
            }
          >

            {languages.map(
              (item) => (

                <option
                  key={item}
                  value={item}
                >

                  {item === "All"
                    ? "All Languages"
                    : item}

                </option>

              )
            )}

          </select>


          <select
            value={genre}
            onChange={(e) =>
              setGenre(e.target.value)
            }
          >

            {genres.map(
              (item) => (

                <option
                  key={item}
                  value={item}
                >

                  {item === "All"
                    ? "All Genres"
                    : item}

                </option>

              )
            )}

          </select>

        </div>


        {/* =========================
            LOADING
        ========================= */}

        {loading && (

          <div className="state-message">
            Loading catalogue...
          </div>

        )}


        {/* =========================
            ERROR
        ========================= */}

        {!loading && error && (

          <div className="state-message error-state">
            {error}
          </div>

        )}


        {/* =========================
            EMPTY
        ========================= */}

        {!loading &&
          !error &&
          filteredShows.length === 0 && (

            <div className="state-message">
              No shows found.
            </div>

          )}


        {/* =========================
            LANGUAGE ROWS
        ========================= */}

        {!loading &&
          !error &&
          Object.entries(
            groupedByLanguage
          ).map(
            (
              [languageName, languageShows]
            ) => (

              <section
                className="show-row"
                key={languageName}
              >

                <div className="row-heading">

                  <h2>
                    {languageName}
                  </h2>

                  <span>
                    {languageShows.length} show
                    {languageShows.length !== 1
                      ? "s"
                      : ""}
                  </span>

                </div>


                <div className="show-grid">

                  {languageShows.map(
                    (show) => (

                      <article
                        className="show-card"
                        key={show.id}
                        onClick={() =>
                          setSelectedShow(
                            show
                          )
                        }
                      >

                        {show.artwork_url ? (

                          <img
                            src={`${API_URL}${show.artwork_url}`}
                            alt={`${show.title} artwork`}
                          />

                        ) : (

                          <div className="no-artwork">
                            No Artwork
                          </div>

                        )}


                        <div className="card-info">

                          <h3>
                            {show.title}
                          </h3>

                          <p>
                            {show.description ||
                              "No description available."}
                          </p>


                          <div className="card-meta">

                            {show.language && (
                              <span>
                                {show.language}
                              </span>
                            )}

                            {show.genre && (
                              <span>
                                {show.genre}
                              </span>
                            )}

                          </div>

                        </div>

                      </article>

                    )
                  )}

                </div>

              </section>

            )
          )}

      </main>


      {/* =========================
          SHOW DETAILS MODAL
      ========================= */}

      {selectedShow && (

        <div
          className="modal-background"
          onClick={() =>
            setSelectedShow(null)
          }
        >

          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="close-button"
              onClick={() =>
                setSelectedShow(null)
              }
            >
              ×
            </button>


            {selectedShow.artwork_url && (

              <img
                className="modal-image"
                src={`${API_URL}${selectedShow.artwork_url}`}
                alt={selectedShow.title}
              />

            )}


            <div className="modal-content">

              <h2>
                {selectedShow.title}
              </h2>


              <div className="modal-meta">

                {selectedShow.language && (
                  <span>
                    Language:{" "}
                    {selectedShow.language}
                  </span>
                )}

                {selectedShow.genre && (
                  <span>
                    Genre:{" "}
                    {selectedShow.genre}
                  </span>
                )}

              </div>


              <p>
                {selectedShow.description ||
                  "No description available."}
              </p>


              <button className="watch-button">
                ▶ Watch Now
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =========================
          FOOTER
      ========================= */}

      <footer className="footer">

        <div className="logo">
          PEBLO<span>TV</span>
        </div>

        <p>
          Published catalogue viewer
        </p>

      </footer>

    </div>
  );
}

export default App;