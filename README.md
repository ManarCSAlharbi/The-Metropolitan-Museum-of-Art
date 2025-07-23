# The Metropolitan Museum of Art - Mobile App

## Overview

This is a cross-platform mobile application built with **Angular 18** and **Ionic Framework** that showcases artworks from The Metropolitan Museum of Art. Developed as a comprehensive training project, the app provides an immersive, mobile-first experience for browsing and interacting with the museum's extensive collection through their public API.

**Live Demo**: ---------------

---

## 🚀 Features

### Core Functionality
- **Artwork Gallery**: Browse thousands of artworks with infinite scroll loading
- **Search & Discovery**: Real-time search functionality with debounced input
- **Department Navigation**: Explore artworks by museum departments (Modern Art, European Paintings, etc.)
- **Interactive Engagement**: Like artworks and add comments with real-time updates
- **Favorites Collection**: Personal collection of liked artworks with local storage persistence

### User Experience
- **Responsive Design**: Optimized for mobile devices with touch-friendly interactions
- **Offline-Ready**: Progressive Web App (PWA) capabilities with service worker
- **Native Features**: Splash screen with startup audio using Capacitor plugins
- **Smooth Navigation**: Tab-based navigation with lazy loading
- **Error Handling**: Graceful fallbacks and retry mechanisms for API failures

### Technical Highlights
- **Modern Architecture**: Angular 18 standalone components for optimal tree-shaking
- **State Management**: RxJS-powered reactive state with BehaviorSubjects
- **Performance**: Lazy loading, OnPush change detection, and optimized images
- **Type Safety**: Full TypeScript implementation with strict mode
- **Testing**: Comprehensive test suite with Jasmine and Karma

---

## 📱 App Structure

### **Home Tab**
- Displays curated artworks with infinite scroll pagination
- Each artwork card shows image, title, artist, and interaction buttons
- Skeleton loading states for smooth user experience
- Error handling with retry functionality

### **Search Tab**
- Real-time search with 300ms debounce for optimal performance
- Search by artwork title, artist name, or keywords
- Dynamic results with loading indicators
- Empty state handling for no results

### **Departments Tab**
- Browse artworks by museum departments
- Grid layout showcasing department categories
- Navigation to department-specific artwork collections
- Filtered results with up to 15 artworks per department

### **Favorites Tab**
- Personal collection of liked artworks
- Local storage persistence across sessions
- Remove functionality with confirmation
- Empty state with call-to-action

### **Artwork Details Modal**
- Full-screen artwork viewing experience
- Comprehensive artwork metadata (dimensions, date, medium)
- Comments system with real-time updates
- Like functionality with optimistic UI updates
- High-resolution image viewing with zoom capabilities

---

## 🛠 Technology Stack

### Frontend
- **Angular 18**: Latest Angular with standalone components and signal-based reactivity
- **Ionic 8**: Cross-platform UI components with native mobile experience
- **TypeScript 5**: Type-safe development with strict configuration
- **RxJS 7**: Reactive programming for state management and HTTP operations
- **SCSS**: Advanced styling with CSS custom properties and responsive design

### Mobile & PWA
- **Capacitor 6**: Native functionality and app deployment
- **PWA Features**: Service worker, offline capabilities, and app-like experience
- **Native Plugins**: Audio playback, splash screen, and device APIs

### Development Tools
- **Angular CLI**: Project scaffolding and build optimization
- **ESLint & Prettier**: Code quality and formatting standards
- **Jasmine & Karma**: Unit testing framework
- **Chrome DevTools**: Mobile debugging and performance profiling

### API Integration
- **Metropolitan Museum API**: RESTful API for artwork data
- **Custom Backend**: Node.js/Express API for likes and comments management
- **HTTP Interceptors**: Error handling and request/response transformation

---

## 🏗 Architecture
### Component Structure
src/app/ ├── components/ # Reusable UI components │ ├── card/ # Artwork display component │ └── like/ # Like button component ├── pages/ # Route-level page components │ ├── home/ # Main artwork gallery │ ├── search/ # Search functionality │ ├── departments/ # Department browsing │ └── liked-artworks/ # User favorites ├── services/ # Business logic and API communication │ ├── api/ # HTTP service for Met Museum API │ ├── liked-artworks/ # Local storage management │ └── like-count/ # Global like state management └── shared/ # Shared utilities and interfaces


### State Management
- **Reactive Services**: BehaviorSubjects for global state
- **Local Storage**: Persistent user preferences and favorites
- **HTTP Caching**: Optimized API calls with result caching
- **Error Recovery**: Automatic retry logic with exponential backoff

---

## 🚦 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Ionic CLI**: `npm install -g @ionic/cli`
- **Angular CLI**: `npm install -g @angular/cli`

### Installation
```bash
# Clone the repository
git clone https://github.com/ManarCSAlharbi/The-Metropolitan-Museum-of-Art.git
cd The-Metropolitan-Museum-of-Art

# Install dependencies
npm install

# Start development server
ionic serve

# Build for production
ionic build --prod
# Add mobile platforms
ionic capacitor add ios
ionic capacitor add android

# Build and sync
ionic capacitor build
ionic capacitor sync

# Open in native IDEs
ionic capacitor open ios
ionic capacitor open android


## Mobile Development

## Testing

## 📊 Performance Features

- **Bundle Size Optimization:** Tree-shaking with standalone components
- **Lazy Loading:** Route-based code splitting
- **Image Optimization:** NgOptimizedImage for responsive images
- **Virtual Scrolling:** Efficient rendering of large artwork lists
- **PWA Optimization:** Service worker caching strategies

---

## 🔧 Configuration

- **Environment Variables**
- **Build Configuration**
  - `angular.json`: Optimized build configurations
  - `capacitor.config.ts`: Native app settings
  - `ionic.config.json`: Ionic CLI configuration

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch:  
   `git checkout -b feature/new-feature`
3. Commit changes:  
   `git commit -m 'Add new feature'`
4. Push to branch:  
   `git push origin feature/new-feature`
5. Submit a pull request

**Development Guidelines:**
- Follow Angular style guide and best practices
- Write unit tests for new features
- Use conventional commit messages
- Ensure mobile responsiveness

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- The Metropolitan Museum of Art for providing the comprehensive public API
- Angular Team for the robust framework and excellent documentation
- Ionic Team for the cross-platform mobile development framework
