# Peblo TV Mini

A full-stack mini OTT/content management platform built as part of the Peblo AI Engineer internship challenge.

The project provides an internal CMS for managing shows, seasons, episodes and artwork, along with a viewer application that displays only published catalogue content.

---

## 🚀 Features

### Backend
- FastAPI REST API
- PostgreSQL database
- Shows → Seasons → Episodes hierarchy
- CRUD operations for shows, seasons and episodes
- Artwork upload and server-side validation
- Image format and dimension validation
- Content validation before publishing
- Admin / Editor / Viewer role enforcement
- Catalogue publishing
- Catalogue versioning
- Publish history
- Server-side search and filtering
- Health-check endpoint

### CMS
- Create and manage shows
- Create seasons and episodes
- Upload artwork
- View validation errors
- Validate shows before publishing
- Publish catalogue
- View publishing history
- Admin-protected content management actions
- Loading and error states

### Viewer
- Netflix-style dark UI
- Featured show section
- Published catalogue display
- Search shows
- Filter by language
- Filter by genre
- Language-based content grouping
- Show details modal
- Responsive layout

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      PostgreSQL     │
                    │      Database       │
                    └──────────▲──────────┘
                               │
                               │
                    ┌──────────┴──────────┐
                    │      FastAPI        │
                    │       Backend       │
                    ├─────────────────────┤
                    │ Shows               │
                    │ Seasons             │
                    │ Episodes            │
                    │ Artwork             │
                    │ Validation          │
                    │ Catalogue           │
                    └───────▲───────┬─────┘
                            │       │
                    ┌───────┘       └────────┐
                    │                         │
             ┌──────┴──────┐           ┌─────┴──────┐
             │     CMS     │           │   Viewer   │
             │ React + TS │           │ React + TS │
             └─────────────┘           └────────────┘