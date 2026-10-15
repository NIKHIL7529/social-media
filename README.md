# SocialSphere

A social media application for sharing photo posts, finding people, and messaging.

The frontend is deployed on Vercel and the API on Render, with MongoDB for data and Cloudinary for images. Docker and Kubernetes are not required for this deployment.

## Features

- Account registration, login, profile editing, and password changes.
- A paginated feed, likes, saved posts, comments, sharing, and post deletion.
- User search, public profiles, and follower/following lists.
- Direct and group messaging with presence, typing indicators, and unread counts.
- Responsive layouts and system, light, and dark appearance settings.

## Documentation

Each README owns the details for its directory:

| Location                               | Contents                                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| [Frontend](apps/web/README.md)         | Web setup, Vercel configuration, rendering, and UI conventions                           |
| [API](apps/api/README.md)              | Backend setup, Render configuration, database indexes, seed accounts, and authentication |
| [Kubernetes](k8s/README.md)            | Optional cluster manifests and deployment limitations                                    |
| [Gatekeeper](opa/README.md)            | Optional cluster admission policies                                                      |
| [OPA practice](opa-practice/README.md) | Standalone local policy exercises                                                        |

For local development, follow the API setup first, then the frontend setup. Application source lives in `apps/api` and `apps/web`; the remaining infrastructure files are separate deployment examples.

Developed by [Nikhil Gupta](https://github.com/Nikhil7529).
