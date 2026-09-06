from app.models.show import Show
from app.models.season import Season
from app.models.episode import Episode


def validate_show(show, db):
    errors = []

    # Show validation
    if not show.title or not show.title.strip():
        errors.append("Show title is required")

    if not show.language or not show.language.strip():
        errors.append("Show language is required")

    # Season validation
    seasons = db.query(Season).filter(
        Season.show_id == show.id
    ).all()

    if not seasons:
        errors.append("Show must have at least one season")

    for season in seasons:

        episodes = db.query(Episode).filter(
            Episode.season_id == season.id
        ).all()

        if not episodes:
            errors.append(
                f"Season {season.season_number} must have at least one episode"
            )

        for episode in episodes:

            if not episode.title or not episode.title.strip():
                errors.append(
                    f"Episode {episode.episode_number} must have a title"
                )

            if not episode.video_url:
                errors.append(
                    f"Episode {episode.episode_number} must have a video URL"
                )

    return errors