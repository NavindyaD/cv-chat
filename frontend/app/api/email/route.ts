import { NextRequest, NextResponse } from 'next/server'
import * as nodemailer from 'nodemailer'
import { config } from '../../config'

export async function POST(request: NextRequest) {
  try {
    // Debug: Log all environment variables
    console.log('All environment variables:', {
      NODE_ENV: process.env.NODE_ENV,
      EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
      EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'NOT SET',
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_PORT: process.env.EMAIL_PORT,
      EMAIL_SECURE: process.env.EMAIL_SECURE
    })
    
    const { recipient, subject, body } = await request.json()

    if (!recipient || !subject || !body) {
      return NextResponse.json(
        { error: 'Recipient, subject, and body are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipient)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      )
    }

    // Check for email configuration
    const emailUser = config.email.user
    const emailPass = config.email.pass

    // Debug logging
    console.log('Email config check:', {
      hasUser: !!emailUser,
      hasPass: !!emailPass,
      user: emailUser ? `${emailUser.substring(0, 3)}...` : 'undefined',
      host: config.email.host,
      port: config.email.port
    })

    if (!emailUser || !emailPass) {
      return NextResponse.json(
        { error: 'Email configuration not found. Please set EMAIL_USER and EMAIL_PASS environment variables.' },
        { status: 500 }
      )
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    })

    // Verify connection
    await transporter.verify()

    // Send email
    const info = await transporter.sendMail({
      from: emailUser,
      to: recipient,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
    })

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: `Email sent successfully to ${recipient}!`
    })
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: `Failed to send email: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
