import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Simple CV analysis based on the actual CV content
    const lowerQuestion = question.toLowerCase()
    let answer = ''

    if (lowerQuestion.includes('last position') || lowerQuestion.includes('current role') || lowerQuestion.includes('most recent job')) {
      answer = 'Based on your CV, your current position is Software Engineer at Aeosys Corp (2025 - Present). Your most recent previous role was Software Engineer/Intern at Hologo World, Maldives (Sep, 2023 - Sep, 2024).'
    } else if (lowerQuestion.includes('experience') || lowerQuestion.includes('work history')) {
      answer = 'Your work experience includes:\n- Software Engineer at Aeosys Corp (2025 - Present)\n- Software Engineer/Intern at Hologo World, Maldives (Sep, 2023 - Sep, 2024)'
    } else if (lowerQuestion.includes('education') || lowerQuestion.includes('degree') || lowerQuestion.includes('university')) {
      answer = 'Your education includes:\n- BEng (Hons) Software Engineering from Informatics Institute of Technology, University of Westminster (2022-2025)\n- Foundation Certificate in Higher Education from IIT, Sri Lanka (2021-2022)\n- CMJD course from IJSE Institute, Sri Lanka (2023-2024)\n- Various online courses including mobile app development, DevOps, and full-stack development'
    } else if (lowerQuestion.includes('skill') || lowerQuestion.includes('technology')) {
      answer = 'Your technical skills include:\n- Frontend: HTML, CSS, PHP, React.js, JavaScript\n- Backend: Python, Java, Node.js, .NET, Go\n- Database: MongoDB, MySQL\n- Version Control: Git\n- Machine Learning: R\n- UI/UX: Figma\n- Frameworks: Spring Boot, Laravel\n- Business Intelligence: Power BI\n- CMS: WordPress'
    } else if (lowerQuestion.includes('contact') || lowerQuestion.includes('email') || lowerQuestion.includes('phone')) {
      answer = 'Your contact information:\n- Email: navindyadenipitiya@gmail.com\n- Phone: +94 714528805\n- Address: 434/B, Galpotta road, Kiriberiya, Panadura, Sri Lanka\n- LinkedIn: Available (LinkedIn Link)\n- Portfolio: https://navindyad.github.io\n- GitHub: Available (GitHub Link)'
    } else if (lowerQuestion.includes('project') || lowerQuestion.includes('portfolio')) {
      answer = 'Your projects include:\n- Emotion-driven music playlist generator (2024-2025)\n- Portfolio Website using HTML, CSS, JavaScript\n- Web-based jumping game\n- Registration form with CRUD operations (PHP/MySQL and React/Laravel)\n- Doctor Consultation Scheduler (Java)\n- Real Time MicroFinance Platform (PHP/MySQL/JavaScript)\n- Job bank system (PHP)\n- Fuel queue management system (Java)\n- Various Python projects including Hangman game and grade display program\n- Group projects: Skooler application, Crowd counting using M-CNN, Sports website'
    } else if (lowerQuestion.includes('soft skill') || lowerQuestion.includes('communication') || lowerQuestion.includes('team')) {
      answer = 'Your soft skills include:\n- Communication\n- Team work\n- Problem Solving\n- Creativity\n- Drawing and hand paintings'
    } else if (lowerQuestion.includes('language') || lowerQuestion.includes('speak')) {
      answer = 'You speak:\n- English\n- Sinhala'
    } else if (lowerQuestion.includes('clubs') || lowerQuestion.includes('societies') || lowerQuestion.includes('leo')) {
      answer = 'You are a member of Leo Club.'
    } else if (lowerQuestion.includes('referee') || lowerQuestion.includes('reference')) {
      answer = 'Your referees are:\n- Mr. Havindra Gunawardena (Lecturer at Informatics Institute of Technology)\n  Phone: 0761490865, Email: havindra.g@iit.ac.lk\n- Mr. Saman Buddika (English teacher)\n  Phone: 0775184304, Email: saman.b@cmg.lk'
    } else {
      answer = `You asked: "${question}". I can help you with information about your work experience, education, technical skills, projects, contact details, and more. Try asking about your last position, work experience, education, skills, projects, or contact information.`
    }

    return NextResponse.json({ answer })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
