// Interview Feedback PDF Generator - FIXED VERSION
// Save as: js/utils/pdf-generator.js

class InterviewPDFGenerator {
    constructor() {
        // PDF settings
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.lineHeight = 6;
        this.currentY = this.margin;
        
        // Colors
        this.colors = {
            primary: [102, 126, 234],    // #667eea
            secondary: [118, 75, 162],   // #764ba2
            success: [72, 187, 120],     // #48bb78
            warning: [251, 191, 36],     // #fbbf24
            danger: [239, 68, 68],       // #ef4444
            gray: [107, 114, 128],       // #6b7280
            lightGray: [243, 244, 246]   // #f3f4f6
        };
    }

    /**
     * Generate complete interview feedback PDF - UPDATED
     */
    async generateInterviewPDF(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        this.doc = doc;
        this.currentY = this.margin;
        
        try {
            // 1. Header Section (UPDATED - removed rating, added role)
            this.addHeader(data);
            
            // 2. Executive Summary - REMOVED
            // this.addExecutiveSummary(data);
            
            // 3. Skills Assessment (if available)
            if (data.skillsAssessment) {
                this.addSkillsAssessment(data);
            }
            
            // 4. Detailed Feedback (UPDATED - better formatting)
            this.addDetailedFeedback(data);
            
            // 5. Interview Template Responses
            this.addInterviewResponses(data);
            
            // 6. Footer (UPDATED - changed text)
            this.addFooter(data);
            
            // Generate filename
            const timestamp = new Date().toISOString().split('T')[0];
            const candidateName = data.candidate.name?.replace(/\s+/g, '_') || 'Candidate';
            const filename = `${candidateName}_Interview_${timestamp}.pdf`;
            
            return {
                pdfData: doc.output('datauristring'), // Base64 data
                filename: filename,
                blob: doc.output('blob')
            };
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error('Failed to generate PDF report');
        }
    }

    /**
     * Add header section - UPDATED VERSION
     * - Removed overall rating
     * - Added role interviewed for
     */
    addHeader(data) {
        const { candidate, interview, feedback } = data;
        
        // Title
        this.doc.setFontSize(24);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.setFont("helvetica", "bold");
        this.doc.text("INTERVIEW FEEDBACK REPORT", this.margin, this.currentY);
        
        this.currentY += 20;
        
        // Candidate info box
        this.doc.setFillColor(...this.colors.lightGray);
        this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 52, 3, 3, 'F');
        
        this.currentY += 10;
        
        // All info displayed vertically with better spacing
        this.doc.setFontSize(12);
        this.doc.setTextColor(0, 0, 0);
        
        // Candidate Name
        this.doc.setFont("helvetica", "bold");
        this.doc.text("Candidate:", this.margin + 5, this.currentY);
        this.doc.setFont("helvetica", "normal");
        this.doc.text(candidate.name || 'N/A', this.margin + 35, this.currentY);
        
        this.currentY += 8;
        
        // Role Interviewed For - NEW (from interview template or project)
        this.doc.setFont("helvetica", "bold");
        this.doc.text("Role:", this.margin + 5, this.currentY);
        this.doc.setFont("helvetica", "normal");
        const role = interview?.template_name || interview?.project_name || candidate.job_title || 'N/A';
        this.doc.text(role, this.margin + 35, this.currentY);
        
        this.currentY += 8;
        
        // Company
        this.doc.setFont("helvetica", "bold");
        this.doc.text("Company:", this.margin + 5, this.currentY);
        this.doc.setFont("helvetica", "normal");
        this.doc.text(candidate.company || 'N/A', this.margin + 35, this.currentY);
        
        this.currentY += 8;
        
        // Interview Date
        this.doc.setFont("helvetica", "bold");
        this.doc.text("Interview Date:", this.margin + 5, this.currentY);
        this.doc.setFont("helvetica", "normal");
        const interviewDate = interview?.interview_date ? 
            new Date(interview.interview_date).toLocaleDateString() : 
            (interview?.scheduled_date ? new Date(interview.scheduled_date).toLocaleDateString() : 'N/A');
        this.doc.text(interviewDate, this.margin + 35, this.currentY);
        
        this.currentY += 8;
        
        // Interviewer
        this.doc.setFont("helvetica", "bold");
        this.doc.text("Interviewer:", this.margin + 5, this.currentY);
        this.doc.setFont("helvetica", "normal");
        const interviewer = interview?.interviewer || feedback?.interviewer || 'N/A';
        this.doc.text(interviewer, this.margin + 35, this.currentY);
        
        this.currentY += 20; // Extra space after header section
    }

    /**
     * Add detailed feedback section - IMPROVED FORMATTING
     * Now properly handles bullet points and lists
     */
    addDetailedFeedback(data) {
        const { feedback } = data;
        
        this.addSectionHeader("Detailed Feedback");
        
        // Helper function to clean and format HTML content
        const cleanAndFormatHtmlContent = (content) => {
            if (!content) return '';
            
            // First, handle list items by adding bullet points
            content = content.replace(/<li[^>]*>/gi, '• ');
            content = content.replace(/<\/li>/gi, '\n');
            
            // Handle unordered lists
            content = content.replace(/<ul[^>]*>/gi, '\n');
            content = content.replace(/<\/ul>/gi, '\n');
            
            // Handle ordered lists (convert to numbered bullets)
            let olCounter = 1;
            content = content.replace(/<ol[^>]*>/gi, () => {
                olCounter = 1;
                return '\n';
            });
            content = content.replace(/<\/ol>/gi, '\n');
            
            // Handle other block elements
            content = content
                .replace(/<\/?(div|p|br)[^>]*>/gi, '\n')
                .replace(/<[^>]+>/g, '') // Remove all remaining HTML tags
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/\n\s*\n\s*\n/g, '\n\n') // Max two newlines
                .replace(/^\s+|\s+$/g, '') // Trim
                .trim();
            
            return content;
        };
        
        // Notes
        if (feedback.notes) {
            this.addSubSection("Interview Notes", cleanAndFormatHtmlContent(feedback.notes));
        }
        
        // Strengths
        if (feedback.strengths) {
            this.addSubSection("Key Strengths", cleanAndFormatHtmlContent(feedback.strengths));
        }
        
        // Concerns
        if (feedback.concerns) {
            this.addSubSection("Areas of Concern", cleanAndFormatHtmlContent(feedback.concerns));
        }
    }

    /**
     * Add interview responses section - IMPROVED FORMATTING
     */
    addInterviewResponses(data) {
        const { template, feedback } = data;
        
        if (!template || !template.questions || template.questions.length === 0) {
            return;
        }
        
        this.addSectionHeader("Interview Responses");
        
        template.questions.forEach((question, index) => {
            // Question
            this.doc.setFontSize(10);
            this.doc.setFont("helvetica", "bold");
            this.doc.setTextColor(...this.colors.primary);
            const questionLines = this.doc.splitTextToSize(`Q${index + 1}: ${question}`, this.pageWidth - 2 * this.margin - 5);
            this.doc.text(questionLines, this.margin + 5, this.currentY);
            this.currentY += questionLines.length * 4 + 4;
            
            // Answer
            this.doc.setFont("helvetica", "normal");
            this.doc.setTextColor(0, 0, 0);
            
            const response = feedback.question_responses?.[index];
            const answer = response?.response || 'No response recorded';
            
            // Clean HTML from answer with improved formatting
            let cleanAnswer = answer
                .replace(/<li[^>]*>/gi, '• ')
                .replace(/<\/li>/gi, '\n')
                .replace(/<ul[^>]*>/gi, '\n')
                .replace(/<\/ul>/gi, '\n')
                .replace(/<\/?(div|p|br)[^>]*>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/\n\s*\n\s*\n/g, '\n\n')
                .replace(/^\s+|\s+$/g, '')
                .trim();
            
            const answerLines = this.doc.splitTextToSize(`A: ${cleanAnswer}`, this.pageWidth - 2 * this.margin - 5);
            this.doc.text(answerLines, this.margin + 5, this.currentY);
            this.currentY += answerLines.length * 4 + 8;
            
            // Check for page break
            if (this.currentY > this.pageHeight - 40) {
                this.doc.addPage();
                this.currentY = this.margin;
            }
        });
    }

    /**
     * Helper methods
     */
    addSectionHeader(title) {
        this.currentY += 5;
        this.doc.setFontSize(14);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(title, this.margin, this.currentY);
        
        // Underline
        this.doc.setDrawColor(...this.colors.primary);
        this.doc.line(this.margin, this.currentY + 2, this.margin + 40, this.currentY + 2);
        
        this.currentY += 10;
        this.doc.setTextColor(0, 0, 0);
    }

    addSubSection(title, content) {
        this.doc.setFontSize(11);
        this.doc.setFont("helvetica", "bold");
        this.doc.text(title + ":", this.margin, this.currentY);
        this.currentY += 6;
        
        this.doc.setFontSize(10);
        this.doc.setFont("helvetica", "normal");
        
        // Split content by double newlines (paragraphs) and single newlines (lines/bullets)
        const paragraphs = content.split('\n\n').filter(p => p.trim());
        
        if (paragraphs.length === 0 && content.trim()) {
            paragraphs.push(content);
        }
        
        paragraphs.forEach((paragraph, pIndex) => {
            const lines = paragraph.split('\n').filter(l => l.trim());
            
            lines.forEach((line) => {
                const wrappedLines = this.doc.splitTextToSize(line.trim(), this.pageWidth - 2 * this.margin - 5);
                this.doc.text(wrappedLines, this.margin + 5, this.currentY);
                this.currentY += wrappedLines.length * 4;
            });
            
            // Add spacing between paragraphs
            if (pIndex < paragraphs.length - 1) {
                this.currentY += 3;
            }
        });
        
        this.currentY += 8;
        
        // Check for page break
        if (this.currentY > this.pageHeight - 40) {
            this.doc.addPage();
            this.currentY = this.margin;
        }
    }

    /**
     * Add footer - UPDATED TEXT
     */
    addFooter(data) {
        const pageCount = this.doc.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);
            
            // Footer line
            this.doc.setDrawColor(200, 200, 200);
            this.doc.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15);
            
            // Footer text - UPDATED
            this.doc.setFontSize(8);
            this.doc.setTextColor(...this.colors.gray);
            this.doc.text("Confidential Interview Report", this.margin, this.pageHeight - 10);
            this.doc.text(`Generated: ${new Date().toLocaleString()}`, this.pageWidth - 60, this.pageHeight - 10);
            this.doc.text(`Page ${i} of ${pageCount}`, this.pageWidth - this.margin - 20, this.pageHeight - 5);
        }
    }

    /**
     * Add skills assessment section (if available)
     */
    addSkillsAssessment(data) {
        const { skillsAssessment } = data;
        
        if (!skillsAssessment || !skillsAssessment.skills || skillsAssessment.skills.length === 0) {
            return;
        }
        
        this.addSectionHeader("Skills Assessment");
        
        skillsAssessment.skills.forEach(skill => {
            this.doc.setFontSize(10);
            this.doc.setFont("helvetica", "bold");
            this.doc.text(`${skill.name}:`, this.margin + 5, this.currentY);
            
            // Rating bar
            const barWidth = 50;
            const barHeight = 4;
            const rating = skill.rating || 0;
            const maxRating = skill.maxRating || 5;
            const percentage = rating / maxRating;
            
            // Background bar
            this.doc.setFillColor(230, 230, 230);
            this.doc.roundedRect(this.margin + 60, this.currentY - 3, barWidth, barHeight, 1, 1, 'F');
            
            // Rating bar
            const ratingColor = percentage >= 0.8 ? this.colors.success :
                              percentage >= 0.6 ? this.colors.warning :
                              this.colors.danger;
            this.doc.setFillColor(...ratingColor);
            this.doc.roundedRect(this.margin + 60, this.currentY - 3, barWidth * percentage, barHeight, 1, 1, 'F');
            
            // Rating text
            this.doc.setFont("helvetica", "normal");
            this.doc.text(`${rating}/${maxRating}`, this.margin + 115, this.currentY);
            
            this.currentY += 8;
        });
        
        this.currentY += 10;
    }
}

// Export to window for global access
window.InterviewPDFGenerator = InterviewPDFGenerator;