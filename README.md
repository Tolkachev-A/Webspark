# Webspark

A modern, responsive web application built with **Vite** and **SCSS**. The project features a clean blog-style interface with image posts, engagement metrics, and date-based filtering.

## Features

- **Responsive image gallery** with lazy loading and WebP/JPEG support (1x and 2x)
- **Engagement metrics** — likes, comments, shares, and views for each post
- **Date filtering** powered by [Flatpickr](https://flatpickr.js.org/) calendar widget
- **Modern UI** built with modular SCSS architecture (BEM methodology)
- **Optimized fonts** — Roboto and Montserrat with preloading
- **GitHub Pages deployment** via GitHub Actions

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Vite](https://vitejs.dev/) | Build tool and dev server |
| [SCSS](https://sass-lang.com/) | Styling with modular architecture |
| [Flatpickr](https://flatpickr.js.org/) | Date picker for filtering |
| [GitHub Actions](https://github.com/features/actions) | CI/CD for automated deployment |

## Project Structure

```
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js
│   ├── config/
│   │   └── posts.json
│   ├── assets/
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── images/
│   └── styles/
│       ├── index.scss
│       ├── colors.scss
│       ├── typography.scss
│       └── reset.scss
└── scripts/
    └── copy-assets.js
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Live Demo

The site is available at:  
**https://tolkachev-a.github.io/Webspark/**

