# The Metropolitan Museum of Art - Mobile App

## Overview

This project is a cross-platform mobile application, built with **Angular 18** and **Ionic Framework**, developed during a training program at SAUDIA. The app provides users with an interactive and visually engaging experience for browsing and exploring artworks from The Metropolitan Museum of Art using their public API. [indigodavid.github.io/metropolitan-museum-of-art/](https://indigodavid.github.io/metropolitan-museum-of-art/)

**Live Demo:** 

---

## 🚀 Features

### Primary Features

- **Header Display:** Prominently displays the name of the museum.
- **Art List:** Each artwork card shows:
  - Picture
  - Title
  - Artist Name
  - Number of Likes
  - Like Button (users can like artworks)
  - Comment Button (opens the comment section)
- **Art Pop-Up:** On interaction, a detailed modal displays:
  - Large artwork image
  - Title, artist, dimensions, date
  - Total number of comments
  - List of comments (showing date, owner, and text)
  - Add Comment section
- **Responsive Design:** Optimized for all devices (using SCSS).
- **Dynamic Data Handling:** Integrates with the Metropolitan Museum of Art Collection API for real-time data.
- **Likes Persistence:** Likes are stored and updated dynamically via API.
- **Comment Management:** Comments are fetched and posted through the API, updating in real-time.
- **Error Handling:** Graceful handling of API errors and user validation.
- **Pagination:** Seamless navigation through multiple pages of artworks.
- **Search:** Search for artworks by title or artist name.

---

## 🗂 Tabs/Pages in the Application

- **Home Tab:**  
  Displays a dynamic list of artworks from the API. Each card provides quick access to like or comment, with a picture, title, artist, and likes count.
- **Art Details Tab:**  
  Shows a larger view and detailed info for the selected artwork, including a real-time comments section.
- **Search Tab:**  
  Allows users to search by artwork title or artist, with instant results and performance-optimized input.
- **Department Tab:**  
  Browse artworks by museum departments (e.g. Modern Art, Ancient Art, European Paintings), view curated lists per department.

---

## 🛠 Technology Stack

- **Angular 18**: Modern framework with standalone components.
- **Ionic 8**: Mobile-first UI library.
- **TypeScript 5**: Type-safe development.
- **RxJS 7**: Reactive state management.
- **SCSS**: Advanced styling for responsive design.
- **HTML & JavaScript**: Core markup and logic.
- **Ruby & Java**: Auxiliary backend integrations (if applicable).
- **Capacitor**: Native functionality and mobile deployment.

---

## 🌐 API Integration

- **Metropolitan Museum of Art Collection API:**  
  Fetches artwork details, likes, comments, and department info.
- **Likes & Comments:**  
  Likes and comments are persisted via API endpoints for real-time updates.
- **Department Data:**  
  Dynamic department/category browsing powered by API.

---

## ⚡ Installation and Usage

### Requirements

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ManarCSAlharbi/The-Metropolitan-Museum-of-Art.git
   cd The-Metropolitan-Museum-of-Art
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   ionic serve
   ```
4. **(Optional) Add mobile platforms:**
   ```bash
   ionic capacitor add ios
   ionic capacitor add android
   ```
5. **(Optional) Build and sync for native platforms:**
   ```bash
   ionic build
   ionic capacitor sync
   ```
6. **Access the app locally:**  
   Open [http://localhost:8100](http://localhost:8100) in your browser.

---


## 🙏 Acknowledgments

- Metropolitan Museum of Art for their public API
- Angular Team for the robust framework
- Ionic Team for cross-platform mobile components


---

