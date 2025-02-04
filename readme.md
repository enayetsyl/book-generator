# Book Generator

## Overview
The **Book Generator** is a web application that allows users to create a book by uploading cover images, page images, and text. The server processes the images, arranges text with customizable fonts and colors, and generates a PDF book.

## Features
- Upload cover images, multiple page images, and a publisher logo.
- Customize text color, font size, and left margin.
- Support for multiple languages (English, Bengali).
- Generates a formatted PDF with images and text.
- Uses Express.js for the backend and React for the frontend.

## Tech Stack
### Backend
- **Node.js** with **Express.js**
- **Multer** for handling file uploads
- **Sharp** for image processing
- **PDFKit** for PDF generation
- **fs-extra** for file system operations
- **CORS** for handling cross-origin requests

### Frontend
- **React.js** with Vite
- **TailwindCSS** for styling
- **React Router** for navigation

## Installation
### Prerequisites
Make sure you have the following installed on your system:
- **Node.js** (v18 or later)
- **npm** or **yarn**

### Backend Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/enayetsyl/book-generator.git
   cd book-generator
   ```
2. Install backend dependencies:
   ```sh
   npm install
   ```
3. Start the backend server:
   ```sh
   npm start
   ```
   The server will run on **http://localhost:3000**.

### Frontend Setup
1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install frontend dependencies:
   ```sh
   npm install
   ```
3. Start the frontend development server:
   ```sh
   npm run dev
   ```
   The frontend will run on **http://localhost:5173** (or a different port if occupied).

## API Endpoints
### **1. Check Server Status**
- **Endpoint:** `GET /`
- **Response:**
  ```json
  {
    "Message": "Book Generator server is running correctly"
  }
  ```

### **2. Create Book**
- **Endpoint:** `POST /create-book`
- **Headers:**
  - `Content-Type: multipart/form-data`
- **Request Body:**
  | Parameter       | Type      | Description |
  |---------------|----------|-------------|
  | `title`       | `string`  | Book title |
  | `texts`       | `string`  | JSON array of page texts |
  | `language`    | `string`  | `english` or `bengali` |
  | `leftMargin`  | `boolean` | `true` for left margin |
  | `textColor`   | `string`  | Color code (e.g., `#000000`) |
  | `publisherName` | `string` | Publisher name |
  | `imageTextRatio` | `string` | Ratio of image and text on pages (e.g., `80/20`) |
  | `fontSize` | `number` | Font size (default: 18) |
  | `coverImage` | `file` | Cover image (optional) |
  | `pageImages[]` | `file` | Multiple page images |
  | `publisherLogo` | `file` | Publisher logo (optional) |

- **Response:** Returns the generated PDF book as a downloadable file.

## Folder Structure
```
/book-generator
├── backend/
│   ├── server.js
│   ├── temp/
│   ├── fonts/
│   ├── package.json
│   ├── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookCreatorForm.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── index.html
│   ├── public/
├── README.md
```

## Dependencies
### Backend
```json
"dependencies": {
  "axios": "^1.7.9",
  "cors": "^2.8.5",
  "express": "^4.19.2",
  "fs-extra": "^11.2.0",
  "h3": "^1.14.0",
  "multer": "^1.4.5-lts.1",
  "pdfkit": "^0.15.2",
  "sharp": "^0.33.5"
}
```

### Frontend
```json
"dependencies": {
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.29.0",
  "tailwindcss": "^4.0.3"
}
```

## Future Enhancements
- Add user authentication.
- Store book data for future retrieval.
- Improve error handling and UI feedback.

## License
This project is licensed under the **ISC License**.

## Author
- **Your Name** (Replace with actual author)

## Contributions
Contributions are welcome! Feel free to open an issue or submit a pull request.




## 🏆 **Author:** Md Enayetur Rahman

### Contact Information
- [LinkedIn](https://www.linkedin.com/in/md-enayetur-rahman/)
- [Facebook](https://www.facebook.com/profile.php?id=100094416483981)
- [X (Twitter)](https://x.com/enayetu_syl)
- [YouTube](https://www.youtube.com/@MdEnayeturRahman)
- [GitHub](https://github.com/enayetsyl/)
- [Medium](https://medium.com/@enayetflweb)
- [dev.to](https://dev.to/md_enayeturrahman_2560e3)
- [Leetcode](https://leetcode.com/u/XTl7hvNPIc/)
- [Hackerrank](https://www.hackerrank.com/profile/enayetflweb)
- [Codeforces](https://codeforces.com/profile/enayetsyl)
- [Email](mailto:enayetflweb@gmail.com)
