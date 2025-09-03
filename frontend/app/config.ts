export const config = {
  // Email configuration
  email: {
    user: process.env.NEXT_PUBLIC_EMAIL_USER || 'navindyadenipitiya@gmail.com',
    pass: process.env.NEXT_PUBLIC_EMAIL_PASS || 'mhki flpu ltqi mkjy',
    host: process.env.NEXT_PUBLIC_EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.NEXT_PUBLIC_EMAIL_PORT || '587'),
    secure: process.env.NEXT_PUBLIC_EMAIL_SECURE === 'true',
  },
  
  // CV file path
  cvFilePath: process.env.CV_FILE_PATH || './Navindya.pdf',
  
  // API endpoints
  api: {
    chat: '/api/chat',
    email: '/api/email',
    loadCV: '/api/load-cv',
  },
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
}
