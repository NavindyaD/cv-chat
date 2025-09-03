# CV Chat MCP Server

A Model Context Protocol (MCP) server that can chat about your CV/resume and send email notifications, with an optional Next.js frontend playground.

## Features

- **CV/Resume Parsing**: Parse PDF, DOCX, TXT, and HTML resume files
- **Intelligent CV Chat**: Ask questions about your resume content (e.g., "What role did I have at my last position?")
- **Email Notifications**: Send emails through SMTP (Gmail supported)
- **Modern Web Interface**: Beautiful Next.js frontend for easy interaction
- **MCP Protocol**: Standard Model Context Protocol implementation

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Gmail account (for email functionality)

### 1. Clone and Install

```bash
git clone <repository-url>
cd cv-chat
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2. Environment Setup

Create a `.env` file in the backend directory:

```bash
# Email Configuration (required for email functionality)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# CV file path
CV_FILE_PATH=./Navindya.pdf

# Debug mode (optional)
DEBUG=false
```

**Note**: For Gmail, you'll need to use an App Password, not your regular password. [Learn how to create one](https://support.google.com/accounts/answer/185833).

### 3. Build and Run

#### Backend (MCP Server)

```bash
cd backend
npm run build
npm start
```

The MCP server will run on stdio and can be used with any MCP-compatible client.

#### Frontend (Web Interface)

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Usage

#### Web Interface

1. **Chat Tab**: Ask questions about your CV
   - "What role did I have at my last position?"
   - "What's my work experience?"
   - "What skills do I have?"

2. **Email Tab**: Send email notifications
   - Fill in recipient, subject, and body
   - Click "Send Email"

#### MCP Protocol

The server implements the following tools:

- `ask_cv_question`: Ask questions about your CV
- `send_email`: Send email notifications  
- `load_cv`: Load and parse a CV/resume file

## Architecture

```
├── backend/                 # MCP Server
│   ├── src/
│   │   ├── handlers/       # CV chat and email handlers
│   │   ├── config.ts       # Configuration management
│   │   └── index.ts        # MCP server implementation
│   └── dist/               # Compiled JavaScript
├── frontend/               # Next.js Web Interface
│   ├── app/
│   │   ├── api/           # API routes for CV chat and email
│   │   ├── page.tsx       # Main chat interface
│   │   └── config.ts      # Frontend configuration
│   └── public/
└── Navindya.pdf           # Sample CV file
```

## API Endpoints

### `/api/chat`
- **POST**: Ask questions about your CV
- **Body**: `{ "question": "What's my last position?" }`

### `/api/email`
- **POST**: Send email notifications
- **Body**: `{ "recipient": "email@example.com", "subject": "Subject", "body": "Message" }`

### `/api/load-cv`
- **POST**: Load and parse CV file
- **Body**: `{ "filePath": "path/to/resume.pdf" }`

## CV Analysis Capabilities

The system can answer questions about:

- **Work Experience**: Job titles, companies, dates
- **Education**: Degrees, universities, graduation dates
- **Skills**: Technical skills, programming languages, tools
- **Contact Information**: Email, phone, LinkedIn
- **General Information**: Any text-based queries

## Supported File Formats

- **PDF**: Using `pdf-parse`
- **DOCX**: Using `mammoth`
- **TXT/MD**: Plain text files
- **HTML**: Using `cheerio`

## Development

### Backend Development

```bash
cd backend
npm run dev  # Uses tsx for hot reloading
```

### Frontend Development

```bash
cd frontend
npm run dev  # Next.js development server
```

### Building for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
npm start
```

## Troubleshooting

### Email Issues

1. **Authentication Failed**: Check your Gmail App Password
2. **SMTP Connection**: Verify host/port settings
3. **Security**: Ensure 2FA is enabled on Gmail

### CV Parsing Issues

1. **File Not Found**: Check file path in configuration
2. **Unsupported Format**: Convert to PDF or supported format
3. **Encoding Issues**: Ensure proper text encoding

### MCP Server Issues

1. **Build Errors**: Run `npm run build` in backend directory
2. **Runtime Errors**: Check console output for error messages
3. **Protocol Issues**: Verify MCP client compatibility

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review existing GitHub issues
3. Create a new issue with detailed information
