# The Metropolitan Museum of Art

## Overview

This repository is a training project developed during a program in SAUDIA. The purpose of the application is to display a list of artworks from the Metropolitan Museum of Art. The project aims to provide users with an interactive and visually engaging experience to browse and explore artworks from the museum. You can access the live project [here](https://indigodavid.github.io/metropolitan-museum-of-art/).

---

## Features

### Primary Features
1. **Header Display**: 
   - A header prominently displays the name of the museum.

2. **Art List**:
   - Each artwork displayed in the list includes:
     - **Picture**: A visual representation of the artwork.
     - **Title**: The artwork's title.
     - **Artist Name**: Name of the artist who created the artwork.
     - **Number of Likes**: Displays the total likes for the artwork.
     - **Like Button**: Enables users to like the artwork.
     - **Comment Button**: Opens the comment section for the artwork.

3. **Art Pop-Up**:
   - Upon interacting with an artwork, a detailed pop-up provides:
     - **Art Picture**: A larger view of the artwork.
     - **Title**: Title of the artwork.
     - **Artist Name**: Name of the artist.
     - **Art Dimensions**: Dimensions of the artwork.
     - **Art Date**: The date the artwork was created.
     - **Total Number of Comments**: Total count of comments for the artwork.
     - **List of Comments**: Includes:
       - Comment date.
       - Comment owner name.
       - The actual comment.
     - **Add Comment Section**: Users can add their own comments.

### Additional Functionalities
Beyond the specified requirements, the project includes:
- **Responsive Design**:
  - The application is optimized for various devices using SCSS.
  
- **Dynamic Data Handling**:
  - Integrates with the **Metropolitan Museum of Art Collection API** to fetch real-time data about artworks.

- **Likes Persistence**:
  - User likes are stored and updated dynamically using the API.

- **Comment Management**:
  - Comments are fetched and posted using the API, ensuring real-time updates.

- **Error Handling**:
  - Graceful handling of API errors and user input validation.

- **Pagination for Art List**:
  - Allows users to navigate through multiple pages of artworks seamlessly.

- **Search Functionality**:
  - Users can search for specific artworks based on titles or artist names.

---

## Tabs/Pages in the Application

### **Home Tab**
The Home Tab serves as the default landing page of the application. It displays:
- A list of artworks fetched dynamically from the API.
- Each artwork includes a picture, title, artist name, number of likes, and options to like or comment.
- This tab provides users with an overview of all available artworks.

### **Art Details Tab**
When users interact with an artwork, they are navigated to the Art Details Tab. This page showcases:
- A larger view of the selected artwork.
- Detailed information about the artwork, such as dimensions, creation date, and artist name.
- A comments section where users can view existing comments and add their own.

### **Search Tab**
The Search Tab allows users to search for specific artworks based on:
- Artwork titles.
- Artist names.
Users can enter their query, and the application will dynamically fetch and display matching results.

### **Department Tab**
The Department Tab categorizes artworks by their respective departments within the museum. Users can:
- Browse departments (e.g., Modern Art, Ancient Art, European Paintings).
- View a curated list of artworks specific to each department.
This tab adds structure to the browsing experience, enabling users to explore artworks within their preferred categories.

---

## Technology Stack

This project utilizes the following technologies:
- **TypeScript**: For robust and type-safe development.
- **SCSS**: For styling and responsive design.
- **HTML**: Markup for page structure.
- **JavaScript**: For additional interactivity.
- **Ruby**: Used for specific backend API integration.
- **Java**: For additional backend functionalities.
- **Ionic Framework**: Used to build the cross-platform, mobile-friendly user interface.
- **Capacitor**: Enables native functionality and deployment on mobile devices.

---

## API Integration

The project integrates the **Metropolitan Museum of Art Collection API** to fetch data related to artworks. Specifically, the following endpoints are used:
- **Art Data Fetching**: Retrieves artwork details such as title, artist name, dimensions, and date.
- **Likes Management**: Allows updating and fetching the number of likes for each artwork.
- **Comments Management**: Handles fetching and posting comments for individual artworks.
- **Department Data Fetching**: Fetches information about museum departments and their associated artworks.

---

## Installation and Usage

### Requirements
To run the project locally:
1. Clone the repository:
   ```bash
   git clone https://github.com/ManarCSAlharbi/The-Metropolitan-Museum-of-Art.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open the application in your browser:
   ```bash
   http://localhost:3000
   ```

---

## Contribution

Contributions are welcome! Feel free to open issues or submit pull requests for enhancements or bug fixes.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Special thanks to the Metropolitan Museum of Art for providing the API that made this project possible.
