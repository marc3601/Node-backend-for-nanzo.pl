# Backend strony noanzo.pl

Backend API and CMS for [noanzo.pl](https://noanzo.pl) - a dog kennel website. This application provides content management capabilities and analytics for the Next.js frontend, featuring a simple admin interface for managing posts and monitoring visitor statistics.

[![JavaScript](https://img.shields.io/badge/JavaScript-53.7%25-yellow)](https://github.com/marc3601/Node-backend-for-nanzo.pl)
[![CSS](https://img.shields.io/badge/CSS-20.3%25-blue)](https://github.com/marc3601/Node-backend-for-nanzo.pl)
[![EJS](https://img.shields.io/badge/EJS-20.3%25-green)](https://github.com/marc3601/Node-backend-for-nanzo.pl)

## ✨ Features

- **Content Management System**: Web-based admin interface for creating, editing, and deleting website posts
- **Authentication System**: Secure login system for administrative access
- **Image Optimization**: Automatic image compression and resizing using Sharp library
- **Analytics Dashboard**: Comprehensive traffic monitoring with detailed visitor insights
- **Cloud Storage**: AWS S3 integration for efficient media file management
- **Geolocation Services**: IP-based visitor location tracking via ipinfo
- **Caching Layer**: Redis integration for improved performance

## 🛠️ Tech Stack

### Core Technologies
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **EJS** - Template engine for server-side rendering

### Databases & Storage
- **MongoDB** - NoSQL database for content storage
- **Redis** - In-memory caching layer
- **AWS S3** - Cloud object storage for media files

### External Services
- **Google Cloud** - Analytics and additional cloud services
- **ipinfo** - IP geolocation and visitor information

### Key Libraries
- **Sharp** - High-performance Node.js image processing

## 📸 Screenshots

### Content Management Interface

Intuitive admin panel for managing website content.

![CMS Main View](https://raw.githubusercontent.com/marc3601/Node-backend-for-nanzo.pl/main/github_img/noanzo_admin_main.png)

![CMS Edit Mode](https://raw.githubusercontent.com/marc3601/Node-backend-for-nanzo.pl/main/github_img/noanzo_admin_edit.png)

### Analytics Dashboard

Comprehensive visitor statistics and traffic monitoring.

![Analytics Overview](https://raw.githubusercontent.com/marc3601/Node-backend-for-nanzo.pl/main/github_img/noanzo_admin_1.png)

![Geographic Data](https://raw.githubusercontent.com/marc3601/Node-backend-for-nanzo.pl/main/github_img/noanzo_admin_2.png)

![Traffic Metrics](https://raw.githubusercontent.com/marc3601/Node-backend-for-nanzo.pl/main/github_img/noanzo_admin_3.png)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB instance (local or cloud)
- Redis server
- AWS account with S3 bucket
- Google Cloud account
- ipinfo API token

### Installation

```bash
# Clone the repository
git clone https://github.com/marc3601/Node-backend-for-nanzo.pl.git

# Navigate to project directory
cd Node-backend-for-nanzo.pl

# Install dependencies
npm install

# Configure environment variables (see Configuration section)
# Create a .env file with your credentials
```

### Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/noanzo
REDIS_URL=redis://localhost:6379

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_region
S3_BUCKET_NAME=your_bucket_name

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

# ipinfo API
IPINFO_TOKEN=your_ipinfo_token

# Authentication
SESSION_SECRET=your_session_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### Running the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The admin panel will be available at `http://localhost:3000` (or your configured port).

## 📁 Project Structure

```
Node-backend-for-nanzo.pl/
├── authentication/      # Authentication logic and session management
├── database/           # Database connection and configuration
├── functions/          # Utility functions and helpers
├── middleware/         # Express middleware (auth, validation, etc.)
├── public/            # Static files (CSS, JavaScript, images)
├── routes/            # API routes and endpoint definitions
├── services/          # External service integrations (S3, ipinfo)
├── views/             # EJS templates for admin interface
├── github_img/        # README screenshots
├── server.js          # Main application entry point
├── s3.js              # AWS S3 configuration and helpers
└── package.json       # Project dependencies and scripts
```

## 🔐 Security Features

- Secure password hashing
- Session-based authentication
- CSRF protection
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- Environment-based configuration for sensitive data

## 🖼️ Image Processing

Images uploaded through the CMS are automatically processed:

- Optimized for web performance
- Resized to standardized dimensions
- Compressed to reduce file size
- Uploaded to AWS S3 for CDN delivery
- Original aspect ratios preserved

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is available for personal and educational use.

## 🔗 Links

- **Live Website**: [noanzo.pl](https://noanzo.pl)
- **Repository**: [github.com/marc3601/Node-backend-for-nanzo.pl](https://github.com/marc3601/Node-backend-for-nanzo.pl)

## 🏷️ Topics

`nodejs` `javascript` `express` `mongodb` `redis` `aws-s3` `cms` `analytics` `dog-kennel` `backend`

## ⭐ Show Your Support

If you find this project helpful, please consider giving it a star on GitHub!

---

Built with ❤️ for [noanzo.pl](https://noanzo.pl)