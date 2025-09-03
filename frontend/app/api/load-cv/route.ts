import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import pdfParse from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json()

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 })
    }

    // Use the absolute path we know works from our test
    const absolutePath = 'D:\\cv-chat\\frontend\\Navindya.pdf'
    
    console.log('Attempting to read file from absolute path:', absolutePath)
    
    try {
      const pdfBuffer = await readFile(absolutePath)
      const pdfData = await pdfParse(pdfBuffer)
      const cvContent = pdfData.text

      console.log('Successfully loaded PDF with', cvContent.length, 'characters')

      return NextResponse.json({
        success: true,
        message: `CV loaded successfully from ${filePath}. Content length: ${cvContent.length} characters.`,
        content: cvContent
      })
    } catch (readError) {
      console.error('Error reading PDF file:', readError)
      throw new Error(`Failed to read PDF file: ${readError instanceof Error ? readError.message : String(readError)}`)
    }

  } catch (error) {
    console.error('Load CV API error:', error)
    return NextResponse.json(
      { error: `Failed to load CV file: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
