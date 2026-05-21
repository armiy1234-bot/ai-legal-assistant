export interface ParsedLegalResponse {
  summary: string;
  legalAnalysis: string;
  actionPlan: string;
  importantDetails: string;
}

export function parseLegalResponse(text: string): ParsedLegalResponse {
  const result: ParsedLegalResponse = {
    summary: '',
    legalAnalysis: '',
    actionPlan: '',
    importantDetails: '',
  };

  if (!text) return result;

  // Split by main sections (### 1., ### 2., etc.)
  const sections = text.split(/###\s*\d+\./);
  
  // Extract section titles to map them correctly
  const sectionMatches = text.match(/###\s*\d+\.\s*([^\n]+)/g) || [];
  
  sectionMatches.forEach((match, index) => {
    const sectionContent = sections[index + 1] || '';
    const cleanContent = sectionContent.split('###')[0].trim();
    
    const lowerMatch = match.toLowerCase();
    
    if (lowerMatch.includes('краткий') || lowerMatch.includes('вывод')) {
      result.summary = cleanContent;
    } else if (lowerMatch.includes('правовой') || lowerMatch.includes('анализ')) {
      result.legalAnalysis = cleanContent;
    } else if (lowerMatch.includes('план') || lowerMatch.includes('действий')) {
      result.actionPlan = cleanContent;
    } else if (lowerMatch.includes('нюанс') || lowerMatch.includes('важные')) {
      result.importantDetails = cleanContent;
    }
  });

  // Fallback: if no sections found, try to split by headers
  if (!result.summary && !result.legalAnalysis && !result.actionPlan) {
    const lines = text.split('\n');
    let currentSection = '';
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('краткий вывод') || lowerLine.includes('суть ситуации')) {
        currentSection = 'summary';
      } else if (lowerLine.includes('правовой анализ') || lowerLine.includes('применимые нормы')) {
        currentSection = 'legalAnalysis';
      } else if (lowerLine.includes('план действий') || lowerLine.includes('пошаговый')) {
        currentSection = 'actionPlan';
      } else if (lowerLine.includes('важные нюансы') || lowerLine.includes('риски')) {
        currentSection = 'importantDetails';
      } else if (currentSection && line.trim()) {
        result[currentSection as keyof ParsedLegalResponse] += line + '\n';
      }
    });
  }

  return result;
}

export function hasLegalResponse(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return lowerText.includes('краткий вывод') || 
         lowerText.includes('правовой анализ') || 
         lowerText.includes('план действий') ||
         lowerText.includes('### 1.');
}
