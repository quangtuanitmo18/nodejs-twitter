# NodeJS Twitter Clone

A project that replicates some features of the social network Twitter for learning purposes.

## Description

This project is a Node.js-based Twitter clone built for educational purposes. It demonstrates how to build a robust backend system using modern technologies, including user authentication, media handling, video encoding, and cloud integrations. The project leverages Docker for containerization, Swagger for API documentation, and GitHub Actions for CI/CD to ensure quality and ease of deployment.

## Technologies Used

- **Backend Framework:** ExpressJS
- **Language:** TypeScript
- **Database:** MongoDB (with performance optimization via indexing)
- **API:** RESTful API design
- **Authentication:**
  - JWT-based authentication
  - OAuth2 integration with Google for social login
- **Media Handling:**
  - Uploading and processing media streams (images and videos)
  - Video encoding to HLS using FFmpeg
- **Cloud Services:**
  - AWS S3 for media storage
  - AWS SES for email services
- **Documentation:** Swagger for API documentation
- **Containerization:** Docker and Docker Compose
- **CI/CD:** GitHub Actions for automated testing and deployment

## Features

This project replicates key functionalities of Twitter through a comprehensive RESTful API. Key API features include:

- **User Authentication & Authorization:**

  - **User Registration & Login:** Secure user signup and login using JWT.
  - **OAuth2 Integration:** Login via Google to simplify user access.
  - **Role-Based Access Control:** Protect API endpoints and ensure that users can only access resources they’re permitted to.

- **Tweet Functionality:**

  - **Create Tweet:** Users can post new tweets with text content and attach media (images or videos).
  - **Edit & Delete Tweet:** Users have the ability to update or remove their tweets.
  - **Like Tweet:** Users can like tweets to show appreciation.
  - **Repost (Retweet):** Users can repost tweets from others, sharing them with their followers.
  - **Comment on Tweets:** Users can add comments to tweets, fostering interactions and discussions.

- **Media Handling:**

  - **Media Upload:** Support for uploading images and videos with tweets.
  - **Video Encoding:** Videos are processed and encoded to HLS format using FFmpeg for smooth streaming.

- **Social Interactions:**

  - **Follow/Unfollow (if implemented):** Manage social connections by following or unfollowing other users.
  - **Feed Generation:** Display a dynamic feed showing tweets from followed users (if implemented).

- **Performance Optimization:**

  - **MongoDB Indexing:** Optimized query performance using proper indexing strategies.

- **API Utilities:**

  - **Comprehensive API Documentation:** Automatically generated API docs available via Swagger.
  - **Robust Error Handling & Logging:** Ensures reliability and easier debugging.

- **Deployment & CI/CD:**
  - **Dockerized Setup:** The application is containerized using Docker for consistent and reliable deployments.
  - **GitHub Actions CI/CD:** Automated testing, build, and deployment workflows ensure continuous integration and delivery.
