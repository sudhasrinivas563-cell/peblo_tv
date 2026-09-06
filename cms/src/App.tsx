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

type Season = {
  id: number;
  show_id: number;
  season_number: number;
  title: string | null;
};

type Episode = {
  id: number;
  season_id: number;
  episode_number: number;
  title: string;
  description: string | null;
  duration_seconds: number | null;
  video_url: string | null;
  thumbnail_url: string | null;
};

type ValidationResult = {
  valid: boolean;
  errors: string[];
};

type CatalogueHistory = {
  catalogue_id: number;
  version: number;
  published_at: string;
  show_count: number;
  show_ids: number[];
};

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [shows, setShows] = useState<Show[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [validationResults, setValidationResults] = useState<
    Record<number, ValidationResult>
  >({});

  const [validatingShowId, setValidatingShowId] =
    useState<number | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [currentVersion, setCurrentVersion] =
    useState<number | null>(null);

  const [publishHistory, setPublishHistory] =
    useState<CatalogueHistory[]>([]);

  const [historyLoading, setHistoryLoading] = useState(false);

  // SHOW
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [genre, setGenre] = useState("");

  // SEASON
  const [selectedShowId, setSelectedShowId] = useState("");
  const [seasonNumber, setSeasonNumber] = useState("");
  const [seasonTitle, setSeasonTitle] = useState("");

  // EPISODE
  const [selectedSeasonId, setSelectedSeasonId] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [episodeDescription, setEpisodeDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  // ARTWORK
  const [artworkShowId, setArtworkShowId] = useState("");
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkUploading, setArtworkUploading] = useState(false);

  // --------------------------------
  // LOAD SHOWS
  // --------------------------------

  const loadShows = async () => {
    try {
      const response = await fetch(`${API_URL}/shows/`);

      if (!response.ok) {
        throw new Error("Failed to load shows");
      }

      const data = await response.json();
      setShows(data);
    } catch (err) {
      console.error(err);
      setError("Could not load shows.");
    }
  };

  // --------------------------------
  // LOAD SEASONS
  // --------------------------------

  const loadSeasons = async () => {
    try {
      const response = await fetch(`${API_URL}/seasons/`);

      if (!response.ok) {
        throw new Error("Failed to load seasons");
      }

      const data = await response.json();
      setSeasons(data);
    } catch (err) {
      console.error(err);
      setError("Could not load seasons.");
    }
  };

  // --------------------------------
  // LOAD EPISODES
  // --------------------------------

  const loadEpisodes = async () => {
    try {
      const response = await fetch(`${API_URL}/episodes/`);

      if (!response.ok) {
        throw new Error("Failed to load episodes");
      }

      const data = await response.json();
      setEpisodes(data);
    } catch (err) {
      console.error(err);
      setError("Could not load episodes.");
    }
  };

  // --------------------------------
  // LOAD CURRENT CATALOGUE
  // --------------------------------

  const loadCurrentCatalogue = async () => {
    try {
      const response = await fetch(`${API_URL}/catalogue/`);

      if (!response.ok) {
        throw new Error("Failed to load catalogue");
      }

      const data = await response.json();

      if (data.version !== undefined) {
        setCurrentVersion(data.version);
      }
    } catch (err) {
      console.log("No catalogue yet.");
    }
  };

  // --------------------------------
  // LOAD PUBLISH HISTORY
  // --------------------------------

  const loadPublishHistory = async () => {
    setHistoryLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/catalogue/history`
      );

      if (!response.ok) {
        throw new Error("Failed to load publish history");
      }

      const data = await response.json();

      setPublishHistory(data.history || []);
    } catch (err) {
      console.error(err);
      setError("Could not load publish history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  // --------------------------------
  // INITIAL LOAD
  // --------------------------------

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        loadShows(),
        loadSeasons(),
        loadEpisodes(),
        loadCurrentCatalogue(),
        loadPublishHistory(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // --------------------------------
  // CREATE SHOW
  // --------------------------------

  const createShow = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!title.trim()) {
      setError("Please enter a show title.");
      return;
    }

    if (!language.trim()) {
      setError("Please enter a language.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/shows/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Role": "admin",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          language: language.trim(),
          genre: genre.trim() || null,
          artwork_url: null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Failed to create show"
        );
      }

      setMessage("Show created successfully!");

      setTitle("");
      setDescription("");
      setLanguage("");
      setGenre("");

      await loadShows();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not create show."
      );
    }
  };

  // --------------------------------
  // CREATE SEASON
  // --------------------------------

  const createSeason = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!selectedShowId) {
      setError("Please select a show.");
      return;
    }

    if (!seasonNumber) {
      setError("Please enter a season number.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/seasons/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Role": "admin",
        },
        body: JSON.stringify({
          show_id: Number(selectedShowId),
          season_number: Number(seasonNumber),
          title: seasonTitle.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Failed to create season"
        );
      }

      setMessage("Season created successfully!");

      setSelectedShowId("");
      setSeasonNumber("");
      setSeasonTitle("");

      await loadSeasons();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not create season."
      );
    }
  };

  // --------------------------------
  // CREATE EPISODE
  // --------------------------------

  const createEpisode = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!selectedSeasonId) {
      setError("Please select a season.");
      return;
    }

    if (!episodeNumber) {
      setError("Please enter an episode number.");
      return;
    }

    if (!episodeTitle.trim()) {
      setError("Please enter an episode title.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/episodes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Role": "admin",
        },
        body: JSON.stringify({
          season_id: Number(selectedSeasonId),
          episode_number: Number(episodeNumber),
          title: episodeTitle.trim(),
          description:
            episodeDescription.trim() || null,
          duration_seconds: duration
            ? Number(duration)
            : null,
          video_url: videoUrl.trim() || null,
          thumbnail_url: null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Failed to create episode"
        );
      }

      setMessage("Episode created successfully!");

      setSelectedSeasonId("");
      setEpisodeNumber("");
      setEpisodeTitle("");
      setEpisodeDescription("");
      setDuration("");
      setVideoUrl("");

      await loadEpisodes();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not create episode."
      );
    }
  };

  // --------------------------------
  // UPLOAD ARTWORK
  // --------------------------------

  const uploadArtwork = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!artworkShowId) {
      setError("Please select a show.");
      return;
    }

    if (!artworkFile) {
      setError("Please select an artwork image.");
      return;
    }

    if (artworkFile.size > 5 * 1024 * 1024) {
      setError("Artwork must be less than 5 MB.");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(artworkFile.type)) {
      setError(
        "Only JPG, PNG and WEBP images are allowed."
      );
      return;
    }

    const selectedShow = shows.find(
      (show) => show.id === Number(artworkShowId)
    );

    if (!selectedShow) {
      setError("Selected show was not found.");
      return;
    }

    const formData = new FormData();
    formData.append("file", artworkFile);

    setArtworkUploading(true);

    try {
      const uploadResponse = await fetch(
        `${API_URL}/artwork/upload`,
        {
          method: "POST",
          headers: {
            "X-Role": "admin",
          },
          body: formData,
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(
          typeof uploadData.detail === "string"
            ? uploadData.detail
            : "Artwork upload failed."
        );
      }

      const artworkPath = uploadData.url;

      const updateResponse = await fetch(
        `${API_URL}/shows/${selectedShow.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Role": "admin",
          },
          body: JSON.stringify({
            title: selectedShow.title,
            description: selectedShow.description,
            language: selectedShow.language,
            genre: selectedShow.genre,
            artwork_url: artworkPath,
          }),
        }
      );

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(
          typeof updateData.detail === "string"
            ? updateData.detail
            : "Could not attach artwork to show."
        );
      }

      setMessage(
        `Artwork uploaded and attached to "${selectedShow.title}" successfully!`
      );

      setArtworkFile(null);
      setArtworkShowId("");

      const fileInput = document.getElementById(
        "artwork-input"
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      await loadShows();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Artwork upload failed."
      );
    } finally {
      setArtworkUploading(false);
    }
  };

  // --------------------------------
  // VALIDATE SHOW
  // --------------------------------

  const validateShow = async (showId: number) => {
    setMessage("");
    setError("");
    setValidatingShowId(showId);

    try {
      const response = await fetch(
        `${API_URL}/validation/show/${showId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Validation request failed."
        );
      }

      const result: ValidationResult = {
        valid: data.valid,
        errors: data.errors || [],
      };

      setValidationResults((previous) => ({
        ...previous,
        [showId]: result,
      }));

      if (result.valid) {
        setMessage(
          "Show validation passed successfully!"
        );
      } else {
        setMessage(
          `Validation found ${result.errors.length} issue(s).`
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not validate show."
      );
    } finally {
      setValidatingShowId(null);
    }
  };

  // --------------------------------
  // PUBLISH CATALOGUE
  // --------------------------------

  const publishCatalogue = async () => {
    setMessage("");
    setError("");
    setPublishing(true);

    try {
      const response = await fetch(
        `${API_URL}/catalogue/publish`,
        {
          method: "POST",
          headers: {
            "X-Role": "admin",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          data.detail &&
          typeof data.detail === "object"
        ) {
          const validationMessages = Object.entries(
            data.detail.errors || {}
          )
            .map(([showId, errors]) => {
              const errorList = Array.isArray(errors)
                ? errors.join(", ")
                : String(errors);

              return `Show ${showId}: ${errorList}`;
            })
            .join(" | ");

          throw new Error(
            validationMessages ||
              data.detail.message ||
              "Publishing failed."
          );
        }

        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Publishing failed."
        );
      }

      setMessage(
        `Catalogue version ${data.version} published successfully!`
      );

      setCurrentVersion(data.version);

      await loadShows();
      await loadCurrentCatalogue();
      await loadPublishHistory();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not publish catalogue."
      );
    } finally {
      setPublishing(false);
    }
  };

  // --------------------------------
  // HELPERS
  // --------------------------------

  const getShowName = (showId: number) => {
    const show = shows.find(
      (item) => item.id === showId
    );

    return show ? show.title : "Unknown Show";
  };

  const getSeasonName = (seasonId: number) => {
    const season = seasons.find(
      (item) => item.id === seasonId
    );

    if (!season) {
      return "Unknown Season";
    }

    return `${getShowName(season.show_id)} - ${
      season.title ||
      `Season ${season.season_number}`
    }`;
  };

  // --------------------------------
  // PAGE
  // --------------------------------

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">
        <div>
          <h1>Peblo TV CMS</h1>

          <span className="header-subtitle">
            Content Management System
          </span>
        </div>

        <div className="header-right">
          <span className="role">
            Admin
          </span>
        </div>
      </header>

      <main className="dashboard">

        {/* MESSAGES */}

        {message && (
          <p className="success">
            {message}
          </p>
        )}

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        {/* PUBLISH PANEL */}

        <section className="publish-panel">
          <div>
            <h2>Catalogue Publishing</h2>

            <p>
              Validate your content and publish a new
              catalogue version.
            </p>

            <div className="catalogue-status">
              <span>Current version:</span>

              <strong>
                {currentVersion !== null
                  ? `Version ${currentVersion}`
                  : "Not published"}
              </strong>
            </div>
          </div>

          <button
            className="publish-button"
            type="button"
            onClick={publishCatalogue}
            disabled={publishing}
          >
            {publishing
              ? "Publishing..."
              : "Publish Catalogue"}
          </button>
        </section>

        {/* CREATE SHOW */}

        <section className="create-section">
          <h2>Create New Show</h2>

          <p>
            Add a new TV show to the CMS.
          </p>

          <form onSubmit={createShow}>
            <input
              type="text"
              placeholder="Show title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              required
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Language"
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value)
              }
              required
            />

            <input
              type="text"
              placeholder="Genre"
              value={genre}
              onChange={(e) =>
                setGenre(e.target.value)
              }
            />

            <button type="submit">
              Create Show
            </button>
          </form>
        </section>

        {/* CREATE SEASON */}

        <section className="create-section">
          <h2>Create New Season</h2>

          <p>
            Select a show and add a season.
          </p>

          <form onSubmit={createSeason}>
            <select
              value={selectedShowId}
              onChange={(e) =>
                setSelectedShowId(e.target.value)
              }
              required
            >
              <option value="">
                Select Show
              </option>

              {shows.map((show) => (
                <option
                  key={show.id}
                  value={show.id}
                >
                  {show.title}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              placeholder="Season number"
              value={seasonNumber}
              onChange={(e) =>
                setSeasonNumber(e.target.value)
              }
              required
            />

            <input
              type="text"
              placeholder="Season title"
              value={seasonTitle}
              onChange={(e) =>
                setSeasonTitle(e.target.value)
              }
            />

            <button type="submit">
              Create Season
            </button>
          </form>
        </section>

        {/* CREATE EPISODE */}

        <section className="create-section">
          <h2>Create New Episode</h2>

          <p>
            Add an episode to an existing season.
          </p>

          <form onSubmit={createEpisode}>
            <select
              value={selectedSeasonId}
              onChange={(e) =>
                setSelectedSeasonId(e.target.value)
              }
              required
            >
              <option value="">
                Select Season
              </option>

              {seasons.map((season) => (
                <option
                  key={season.id}
                  value={season.id}
                >
                  {getSeasonName(season.id)}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              placeholder="Episode number"
              value={episodeNumber}
              onChange={(e) =>
                setEpisodeNumber(e.target.value)
              }
              required
            />

            <input
              type="text"
              placeholder="Episode title"
              value={episodeTitle}
              onChange={(e) =>
                setEpisodeTitle(e.target.value)
              }
              required
            />

            <textarea
              placeholder="Episode description"
              value={episodeDescription}
              onChange={(e) =>
                setEpisodeDescription(e.target.value)
              }
            />

            <input
              type="number"
              min="1"
              placeholder="Duration in seconds"
              value={duration}
              onChange={(e) =>
                setDuration(e.target.value)
              }
            />

            <input
              type="url"
              placeholder="Video URL"
              value={videoUrl}
              onChange={(e) =>
                setVideoUrl(e.target.value)
              }
            />

            <button type="submit">
              Create Episode
            </button>
          </form>
        </section>

        {/* ARTWORK */}

        <section className="create-section">
          <h2>Artwork Upload</h2>

          <p>
            Upload artwork and attach it to a show.
          </p>

          <form onSubmit={uploadArtwork}>
            <select
              value={artworkShowId}
              onChange={(e) =>
                setArtworkShowId(e.target.value)
              }
              required
            >
              <option value="">
                Select Show
              </option>

              {shows.map((show) => (
                <option
                  key={show.id}
                  value={show.id}
                >
                  {show.title}
                </option>
              ))}
            </select>

            <input
              id="artwork-input"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => {
                const file =
                  e.target.files?.[0] || null;

                setArtworkFile(file);
              }}
            />

            {artworkFile && (
              <div className="file-info">
                <strong>
                  Selected file:
                </strong>{" "}
                {artworkFile.name}
              </div>
            )}

            <div className="artwork-info">
              <p>
                <strong>
                  Supported formats:
                </strong>{" "}
                JPG, JPEG, PNG, WEBP
              </p>

              <p>
                <strong>
                  Maximum size:
                </strong>{" "}
                5 MB
              </p>

              <p>
                <strong>
                  Required dimensions:
                </strong>{" "}
                1280 × 720
              </p>
            </div>

            <button
              type="submit"
              disabled={artworkUploading}
            >
              {artworkUploading
                ? "Uploading..."
                : "Upload Artwork"}
            </button>
          </form>
        </section>

        {/* SHOWS */}

        <section>
          <h2>Shows</h2>

          {loading && (
            <p>Loading shows...</p>
          )}

          {!loading &&
            shows.length === 0 && (
              <p>No shows found.</p>
            )}

          {!loading &&
            shows.length > 0 && (
              <div className="show-list">
                {shows.map((show) => {
                  const validation =
                    validationResults[show.id];

                  const isValidating =
                    validatingShowId === show.id;

                  return (
                    <div
                      className="show-card"
                      key={show.id}
                    >
                      {show.artwork_url && (
                        <img
                          className="show-artwork"
                          src={`${API_URL}${show.artwork_url}`}
                          alt={`${show.title} artwork`}
                        />
                      )}

                      <div className="show-card-content">
                        <div className="show-title-row">
                          <h3>
                            {show.title}
                          </h3>

                          <span
                            className={
                              show.status ===
                              "published"
                                ? "status published"
                                : "status draft"
                            }
                          >
                            {show.status}
                          </span>
                        </div>

                        <p>
                          {show.description ||
                            "No description"}
                        </p>

                        <p>
                          <strong>
                            Language:
                          </strong>{" "}
                          {show.language ||
                            "Not specified"}
                        </p>

                        <p>
                          <strong>
                            Genre:
                          </strong>{" "}
                          {show.genre ||
                            "Not specified"}
                        </p>

                        <p>
                          <strong>
                            Artwork:
                          </strong>{" "}
                          {show.artwork_url
                            ? "Uploaded"
                            : "Not uploaded"}
                        </p>

                        {/* VALIDATION */}

                        <div className="validation-box">
                          <h4>
                            Content Validation
                          </h4>

                          <button
                            type="button"
                            onClick={() =>
                              validateShow(
                                show.id
                              )
                            }
                            disabled={
                              isValidating
                            }
                          >
                            {isValidating
                              ? "Validating..."
                              : "Validate Show"}
                          </button>

                          {validation && (
                            <div className="validation-result">
                              {validation.valid ? (
                                <div className="validation-success">
                                  ✓ Show is valid and
                                  ready for publishing.
                                </div>
                              ) : (
                                <div className="validation-errors">
                                  <strong>
                                    Validation Errors:
                                  </strong>

                                  <ul>
                                    {validation.errors.map(
                                      (
                                        validationError,
                                        index
                                      ) => (
                                        <li
                                          key={index}
                                        >
                                          {
                                            validationError
                                          }
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </section>

        {/* SEASONS */}

        <section className="season-section">
          <h2>Seasons</h2>

          {seasons.length === 0 ? (
            <p>
              No seasons found.
            </p>
          ) : (
            <div className="season-list">
              {seasons.map((season) => (
                <div
                  className="season-card"
                  key={season.id}
                >
                  <h3>
                    {season.title ||
                      `Season ${season.season_number}`}
                  </h3>

                  <p>
                    <strong>
                      Show:
                    </strong>{" "}
                    {getShowName(
                      season.show_id
                    )}
                  </p>

                  <p>
                    <strong>
                      Season Number:
                    </strong>{" "}
                    {season.season_number}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* EPISODES */}

        <section className="season-section">
          <h2>Episodes</h2>

          {episodes.length === 0 ? (
            <p>
              No episodes found.
            </p>
          ) : (
            <div className="season-list">
              {episodes.map((episode) => (
                <div
                  className="season-card"
                  key={episode.id}
                >
                  <h3>
                    Episode{" "}
                    {episode.episode_number}:{" "}
                    {episode.title}
                  </h3>

                  <p>
                    <strong>
                      Season:
                    </strong>{" "}
                    {getSeasonName(
                      episode.season_id
                    )}
                  </p>

                  <p>
                    {episode.description ||
                      "No description"}
                  </p>

                  <p>
                    <strong>
                      Duration:
                    </strong>{" "}
                    {episode.duration_seconds
                      ? `${episode.duration_seconds} seconds`
                      : "Not specified"}
                  </p>

                  <p>
                    <strong>
                      Video:
                    </strong>{" "}
                    {episode.video_url ||
                      "Not provided"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* PUBLISH HISTORY */}

        <section className="history-section">
          <div className="history-header">
            <div>
              <h2>
                Publish History
              </h2>

              <p>
                Previous catalogue versions.
              </p>
            </div>

            <button
              type="button"
              onClick={loadPublishHistory}
              disabled={historyLoading}
            >
              {historyLoading
                ? "Loading..."
                : "Refresh History"}
            </button>
          </div>

          {historyLoading ? (
            <p>
              Loading publish history...
            </p>
          ) : publishHistory.length === 0 ? (
            <div className="empty-history">
              <p>
                No catalogue versions have
                been published yet.
              </p>
            </div>
          ) : (
            <div className="history-list">
              {publishHistory.map((item) => (
                <div
                  className="history-card"
                  key={item.catalogue_id}
                >
                  <div className="history-version">
                    <span>
                      Version
                    </span>

                    <strong>
                      {item.version}
                    </strong>
                  </div>

                  <div className="history-details">
                    <p>
                      <strong>
                        Catalogue ID:
                      </strong>{" "}
                      {item.catalogue_id}
                    </p>

                    <p>
                      <strong>
                        Published:
                      </strong>{" "}
                      {new Date(
                        item.published_at
                      ).toLocaleString()}
                    </p>

                    <p>
                      <strong>
                        Shows:
                      </strong>{" "}
                      {item.show_count}
                    </p>
                  </div>

                  {item.version ===
                    currentVersion && (
                    <span className="current-badge">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;