import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import { Config } from '../config.js';

export class CVChatHandler {
  private cvContent: string = '';
  private config: Config;

  constructor() {
    this.config = Config.getInstance();
  }

  async loadCV(filePath: string) {
    try {
      const fullPath = join(process.cwd(), filePath);
      const fileExtension = extname(filePath).toLowerCase();
      
      let content: string;

      switch (fileExtension) {
        case '.pdf':
          const pdfBuffer = await readFile(fullPath);
          const pdfData = await pdfParse(pdfBuffer);
          content = pdfData.text;
          break;
        
        case '.docx':
          const docxBuffer = await readFile(fullPath);
          const docxResult = await mammoth.extractRawText({ buffer: docxBuffer });
          content = docxResult.value;
          break;
        
        case '.txt':
        case '.md':
          content = await readFile(fullPath, 'utf-8');
          break;
        
        case '.html':
        case '.htm':
          const htmlContent = await readFile(fullPath, 'utf-8');
          const $ = cheerio.load(htmlContent);
          content = $.text();
          break;
        
        default:
          throw new Error(`Unsupported file format: ${fileExtension}`);
      }

      this.cvContent = content;
      
      return {
        content: [
          {
            type: 'text',
            text: `CV loaded successfully from ${filePath}. Content length: ${content.length} characters.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error loading CV: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  async askQuestion(question: string) {
    if (!this.cvContent) {
      // Try to load default CV file
      const defaultPath = this.config.getCVFilePath();
      const loadResult = await this.loadCV(defaultPath);
      if (!this.cvContent) {
        return {
          content: [
            {
              type: 'text',
              text: 'No CV content loaded. Please use the load_cv tool first to load your resume.',
            },
          ],
        };
      }
    }

    try {
      const answer = await this.analyzeCVQuestion(question, this.cvContent);
      
      return {
        content: [
          {
            type: 'text',
            text: answer,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error analyzing CV: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  }

  private async analyzeCVQuestion(question: string, cvContent: string): Promise<string> {
    // Simple keyword-based analysis for common CV questions
    const lowerQuestion = question.toLowerCase();
    const lowerContent = cvContent.toLowerCase();

    if (lowerQuestion.includes('last position') || lowerQuestion.includes('current role') || lowerQuestion.includes('most recent job')) {
      return this.extractLastPosition(cvContent);
    }

    if (lowerQuestion.includes('experience') || lowerQuestion.includes('work history')) {
      return this.extractWorkExperience(cvContent);
    }

    if (lowerQuestion.includes('education') || lowerQuestion.includes('degree') || lowerQuestion.includes('university')) {
      return this.extractEducation(cvContent);
    }

    if (lowerQuestion.includes('skill') || lowerQuestion.includes('technology')) {
      return this.extractSkills(cvContent);
    }

    if (lowerQuestion.includes('contact') || lowerQuestion.includes('email') || lowerQuestion.includes('phone')) {
      return this.extractContactInfo(cvContent);
    }

    // General analysis - look for relevant sections
    return this.generalCVAnalysis(question, cvContent);
  }

  private extractLastPosition(cvContent: string): string {
    const lines = cvContent.split('\n');
    const experienceKeywords = ['work experience', 'employment', 'career', 'professional'];
    
    let inExperienceSection = false;
    let lastPosition = '';
    let currentPosition = '';
    let foundPositions: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase().trim();
      
      // Check if we're entering work experience section
      if (experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
        inExperienceSection = true;
        continue;
      }

      if (inExperienceSection) {
        // Look for job titles (usually in caps or title case)
        if (line.trim() && this.isValidJobTitle(line)) {
          if (currentPosition) {
            lastPosition = currentPosition;
          }
          currentPosition = line.trim();
          foundPositions.push(line.trim());
        }
        
        // Look for company names or dates to end current position
        if (this.looksLikeDate(line) || this.looksLikeCompany(line)) {
          if (currentPosition) {
            lastPosition = currentPosition;
            currentPosition = '';
          }
        }
        
        // Exit experience section if we hit another major section
        if (this.isSectionHeader(line)) {
          break;
        }
      }
    }

    // Return the most recent position found
    if (foundPositions.length > 0) {
      return foundPositions[foundPositions.length - 1];
    }
    
    return lastPosition || currentPosition || 'Unable to identify the last position from the CV.';
  }

  private extractWorkExperience(cvContent: string): string {
    const lines = cvContent.split('\n');
    const experienceKeywords = ['experience', 'employment', 'work history', 'career', 'professional'];
    
    let inExperienceSection = false;
    const experiences: string[] = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();
      
      if (experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
        inExperienceSection = true;
        continue;
      }

      if (inExperienceSection && line.trim()) {
        if (this.looksLikeJobTitle(line) || line.includes('@') || this.looksLikeDate(line)) {
          experiences.push(line.trim());
        }
      }
    }

    return experiences.length > 0 
      ? `Work Experience:\n${experiences.slice(0, 5).join('\n')}`
      : 'No work experience section found in the CV.';
  }

  private extractEducation(cvContent: string): string {
    const lines = cvContent.split('\n');
    const educationKeywords = ['education', 'academic', 'degree', 'university', 'college', 'school'];
    
    let inEducationSection = false;
    const education: string[] = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();
      
      if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
        inEducationSection = true;
        continue;
      }

      if (inEducationSection && line.trim()) {
        if (line.includes('Bachelor') || line.includes('Master') || line.includes('PhD') || 
            line.includes('University') || line.includes('College') || this.looksLikeDate(line)) {
          education.push(line.trim());
        }
      }
    }

    return education.length > 0 
      ? `Education:\n${education.join('\n')}`
      : 'No education section found in the CV.';
  }

  private extractSkills(cvContent: string): string {
    const lines = cvContent.split('\n');
    const skillKeywords = ['skill', 'technology', 'programming', 'language', 'tool', 'framework'];
    
    let inSkillsSection = false;
    const skills: string[] = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();
      
      if (skillKeywords.some(keyword => lowerLine.includes(keyword))) {
        inSkillsSection = true;
        continue;
      }

      if (inSkillsSection && line.trim()) {
        // Look for comma-separated skills or bullet points
        if (line.includes(',') || line.includes('•') || line.includes('-') || line.includes('*')) {
          const lineSkills = line.split(/[,•\-*]/).map(s => s.trim()).filter(s => s.length > 0);
          skills.push(...lineSkills);
        } else if (line.trim().length > 0) {
          skills.push(line.trim());
        }
      }
    }

    return skills.length > 0 
      ? `Skills:\n${skills.slice(0, 10).join(', ')}`
      : 'No skills section found in the CV.';
  }

  private extractContactInfo(cvContent: string): string {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
    
    const emails = cvContent.match(emailRegex) || [];
    const phones = cvContent.match(phoneRegex) || [];
    
    const contactInfo: string[] = [];
    
    if (emails.length > 0) {
      contactInfo.push(`Email: ${emails[0]}`);
    }
    
    if (phones.length > 0) {
      contactInfo.push(`Phone: ${phones[0]}`);
    }
    
    return contactInfo.length > 0 
      ? `Contact Information:\n${contactInfo.join('\n')}`
      : 'No contact information found in the CV.';
  }

  private generalCVAnalysis(question: string, cvContent: string): string {
    // Simple keyword matching for general questions
    const questionWords = question.toLowerCase().split(/\s+/);
    const contentWords = cvContent.toLowerCase().split(/\s+/);
    
    const matchingWords = questionWords.filter(word => 
      word.length > 3 && contentWords.includes(word)
    );
    
    if (matchingWords.length > 0) {
      return `I found references to "${matchingWords.join(', ')}" in your CV. Here's the relevant content:\n\n${this.findRelevantContent(question, cvContent)}`;
    }
    
    return `I couldn't find specific information related to your question in the CV. Here's a summary of what I found:\n\n${this.getCVSummary(cvContent)}`;
  }

  private findRelevantContent(question: string, cvContent: string): string {
    const lines = cvContent.split('\n');
    const questionWords = question.toLowerCase().split(/\s+/);
    
    const relevantLines = lines.filter(line => {
      const lowerLine = line.toLowerCase();
      return questionWords.some(word => 
        word.length > 3 && lowerLine.includes(word)
      );
    });
    
    return relevantLines.slice(0, 5).join('\n');
  }

  private getCVSummary(cvContent: string): string {
    const lines = cvContent.split('\n').filter(line => line.trim().length > 0);
    const summary: string[] = [];
    
    // Get first few lines that look like headers
    const headers = lines.filter(line => 
      line.trim().length > 0 && 
      (line === line.toUpperCase() || line.trim().length < 50)
    ).slice(0, 5);
    
    summary.push('CV Structure:');
    summary.push(...headers);
    
    return summary.join('\n');
  }

  private looksLikeJobTitle(line: string): boolean {
    const jobTitleKeywords = ['developer', 'engineer', 'manager', 'director', 'analyst', 'consultant', 'specialist', 'coordinator'];
    const lowerLine = line.toLowerCase();
    return jobTitleKeywords.some(keyword => lowerLine.includes(keyword));
  }

  private isValidJobTitle(line: string): boolean {
    const trimmedLine = line.trim();
    
    // Skip if line is too short or too long
    if (trimmedLine.length < 3 || trimmedLine.length > 100) {
      return false;
    }
    
    // Skip if line contains only numbers or phone number patterns
    if (/^\d+$/.test(trimmedLine) || /^\d{10,}$/.test(trimmedLine.replace(/\D/g, ''))) {
      return false;
    }
    
    // Skip if line looks like contact info (email, phone, etc.)
    if (trimmedLine.includes('@') || trimmedLine.includes('http') || trimmedLine.includes('www')) {
      return false;
    }
    
    // Skip common CV section headers that are not job titles
    const sectionHeaders = ['referees', 'references', 'education', 'skills', 'experience', 'employment', 'work history', 'career', 'professional', 'summary', 'objective', 'contact', 'personal', 'languages', 'certifications', 'projects', 'achievements'];
    if (sectionHeaders.some(header => trimmedLine.toLowerCase().includes(header))) {
      return false;
    }
    
    // Must contain letters and look like a job title
    if (!/[a-zA-Z]/.test(trimmedLine)) {
      return false;
    }
    
    // Check if it looks like a job title (more specific criteria)
    return this.looksLikeJobTitle(trimmedLine) || 
           (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 5 && this.containsJobTitleWords(trimmedLine));
  }

  private containsJobTitleWords(line: string): boolean {
    const jobTitleWords = ['developer', 'engineer', 'manager', 'director', 'analyst', 'consultant', 'specialist', 'coordinator', 'assistant', 'officer', 'executive', 'supervisor', 'lead', 'architect', 'designer', 'programmer', 'administrator', 'coordinator', 'representative', 'technician'];
    const lowerLine = line.toLowerCase();
    return jobTitleWords.some(word => lowerLine.includes(word));
  }

  private looksLikeCompany(line: string): boolean {
    const companyKeywords = ['corp', 'ltd', 'inc', 'company', 'world', 'institute', 'university', 'college'];
    const lowerLine = line.toLowerCase();
    return companyKeywords.some(keyword => lowerLine.includes(keyword));
  }

  private isSectionHeader(line: string): boolean {
    const sectionHeaders = ['education', 'skills', 'languages', 'clubs', 'projects', 'referees', 'profile', 'technical', 'soft', 'other'];
    const lowerLine = line.toLowerCase();
    return sectionHeaders.some(header => lowerLine.includes(header));
  }

  private looksLikeDate(line: string): boolean {
    const datePatterns = [
      /\d{4}-\d{4}/,  // 2020-2023
      /\d{4}\s*-\s*\d{4}/,  // 2020 - 2023
      /\d{1,2}\/\d{4}/,  // 01/2020
      /\d{4}/,  // 2020
    ];
    
    return datePatterns.some(pattern => pattern.test(line));
  }
}
