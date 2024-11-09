# fampay-assignment-frontend

A React-Vite application that fetches and displays YouTube videos with filtering and sorting capabilities. Built with React and Vite for optimal performance.

## Features

- 📺 Display YouTube videos in a clean, card-based layout
- 🔑 Add custom YouTube API keys when the current key is exhausted
- 📅 Filter videos by publication date
- ⚡ Sort videos by newest first
- 🚀 Fast performance with Vite

Access the dashboard here https://main.d3s4vg61cjppvr.amplifyapp.com/ please change to older date if the videos are not visible.

## Prerequisites

Before you begin, ensure you have installed:
- [Node.js](https://nodejs.org/) (version 14.0 or higher)
- npm (usually comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/RajendraKumarVesapogu/fampay-assignment-frontend.git
```

2. Navigate to the project directory:
```bash
cd fampay-assignment-frontend
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and visit:
```
http://localhost:5173
```

## Usage

### Adding an API Key
1. Click on the "Add API Key" button at the top of the page
2. Enter your YouTube Data API key
3. The page will refresh and start fetching videos with the new key

### Filtering Videos
- Use the date picker to filter videos by publication date
- Videos will automatically update based on the selected date range

### Sorting Videos
- Click the "Newest First" toggle to sort videos by publication date
- Toggle again to reverse the sort order

## Development

To start the development server with hot-reload:
```bash
npm run dev
```

To build for production:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

