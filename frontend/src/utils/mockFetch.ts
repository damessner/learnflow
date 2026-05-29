import { isStandalone } from './standalone';
import { GRAMMAR_TOPICS } from '../data/grammarData';

if (isStandalone()) {
  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : ('url' in input ? (input as Request).url : String(input));
    const method = (init?.method || 'GET').toUpperCase();
    
    // Intercept /api paths
    if (url.startsWith('/api') || url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url, window.location.origin);
      const pathname = urlObj.pathname;
      
      console.log(`[MockFetch Interceptor] Intercepted request: ${method} ${pathname}`);
      
      const responseInit = {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      };

      let responseData: any = {};
      
      if (pathname === '/api/auth/verify') {
        responseData = { user: { id: 'guest', name: 'Guest Student', character_emoji: '🚀', role: 'student' } };
      } else if (pathname === '/api/classes/student-status') {
        responseData = { classes: [{ id: 'standalone-class', name: '1B MORE! 1 English Academy', description: 'Standalone English Hub' }] };
      } else if (pathname === '/api/classes/student/class/standalone-class/assignments') {
        responseData = { assignments: [] };
      } else if (pathname === '/api/learning/student/gamification') {
        responseData = { streak_days: 1, points: 150 };
      } else if (pathname === '/api/english/reading/my-progress') {
        responseData = { progress: JSON.parse(localStorage.getItem('learnflow_reading_progress') || '[]') };
      } else if (pathname === '/api/english/reading/complete') {
        const body = JSON.parse(init?.body as string || '{}');
        const progress = JSON.parse(localStorage.getItem('learnflow_reading_progress') || '[]');
        progress.push({
          story_id: body.storyId,
          unit: body.unit,
          score: body.score,
          max_score: body.maxScore,
          completed: true
        });
        localStorage.setItem('learnflow_reading_progress', JSON.stringify(progress));
        responseData = { success: true };
      } else if (pathname === '/api/english/listening/my-progress') {
        responseData = { progress: JSON.parse(localStorage.getItem('learnflow_listening_progress') || '[]') };
      } else if (pathname === '/api/english/listening/complete') {
        const body = JSON.parse(init?.body as string || '{}');
        const progress = JSON.parse(localStorage.getItem('learnflow_listening_progress') || '[]');
        progress.push({
          listening_id: body.listeningId,
          unit: body.unit,
          score: body.score,
          max_score: body.maxScore,
          completed: true
        });
        localStorage.setItem('learnflow_listening_progress', JSON.stringify(progress));
        responseData = { success: true };
      } else if (pathname === '/api/grammar/topics') {
        const gProgress = JSON.parse(localStorage.getItem('learnflow_grammar_progress') || '{}');
        const topicsList = GRAMMAR_TOPICS.map((topic: any) => {
          const topicProgress = gProgress[topic.id] || {
            explorer: false,
            pioneer: false,
            master: false,
            quizGrade: null
          };
          const badges = JSON.parse(localStorage.getItem('learnflow_grammar_badges') || '[]');
          return {
            id: topic.id,
            unit: topic.unit,
            title: topic.title,
            description: topic.description,
            progress: topicProgress,
            badges: {
              explorer: badges.includes(`badge-explorer-${topic.id}`),
              pioneer: badges.includes(`badge-pioneer-${topic.id}`),
              master: badges.includes(`badge-master-${topic.id}`)
            }
          };
        });
        responseData = { matrix: [], topics: topicsList, success: true };
      } else if (pathname.includes('/grammar/topics') && pathname.endsWith('/submit-worksheet')) {
        const match = pathname.match(/\/grammar\/topics\/([^\/]+)\/submit-worksheet/);
        const topicId = match ? match[1] : '';
        const body = JSON.parse(init?.body as string || '{}');
        const level = body.level;
        const answers = body.answers || [];
        
        const topic = GRAMMAR_TOPICS.find((t: any) => t.id === topicId);
        let isCorrect = true;
        const evaluation: boolean[] = [];
        
        if (topic) {
          if (level === 'explorer') {
            const list = topic.explorer || [];
            list.forEach((q: any, idx: number) => {
              const correct = Number(answers[idx]) === q.correctIndex;
              evaluation.push(correct);
              if (!correct) isCorrect = false;
            });
          } else if (level === 'pioneer') {
            const list = topic.pioneer || [];
            list.forEach((q: any, idx: number) => {
              const correct = String(answers[idx] || '').trim().toLowerCase() === q.correctAnswer.toLowerCase();
              evaluation.push(correct);
              if (!correct) isCorrect = false;
            });
          } else if (level === 'master') {
            const list = topic.master || [];
            list.forEach((q: any, idx: number) => {
              const input = String(answers[idx] || '').trim().toLowerCase();
              const matchAns = (q.correctAnswers || []).some((ans: string) => ans.toLowerCase() === input);
              evaluation.push(matchAns);
              if (!matchAns) isCorrect = false;
            });
          }
        }
        
        const gProgress = JSON.parse(localStorage.getItem('learnflow_grammar_progress') || '{}');
        if (!gProgress[topicId]) {
          gProgress[topicId] = { explorer: false, pioneer: false, master: false, quizGrade: null };
        }
        
        let badgeAwarded = false;
        const badgeId = `badge-${level}-${topicId}`;
        if (isCorrect) {
          gProgress[topicId][level] = true;
          const badges = JSON.parse(localStorage.getItem('learnflow_grammar_badges') || '[]');
          if (!badges.includes(badgeId)) {
            badges.push(badgeId);
            localStorage.setItem('learnflow_grammar_badges', JSON.stringify(badges));
            badgeAwarded = true;
          }
        }
        localStorage.setItem('learnflow_grammar_progress', JSON.stringify(gProgress));
        
        responseData = {
          success: isCorrect,
          evaluation,
          badge_awarded: badgeAwarded,
          badge_id: badgeId,
          progress: gProgress[topicId]
        };
      } else if (pathname.includes('/grammar/topics') && pathname.includes('/quiz/generate')) {
        const match = pathname.match(/\/grammar\/topics\/([^\/]+)\/quiz\/generate/);
        const topicId = match ? match[1] : '';
        const topic = GRAMMAR_TOPICS.find((t: any) => t.id === topicId);
        
        const generatedQuestions = [
          {
            question: `Which sentence correctly applies ${topic ? topic.title : 'this grammar'}?`,
            options: ['Correct example (Right)', 'Wrong example', 'Also wrong'],
            correctIndex: 0,
            explanation: `The correct application of ${topic ? topic.title : 'this grammar'} follows the grammar rule precisely.`
          },
          {
            question: `What is the most common mistake students make here?`,
            options: ['Using wrong verb form', 'Incorrect word order (Correct perception)', 'Wrong preposition'],
            correctIndex: 1,
            explanation: 'Students often confuse the word order in this grammar area.'
          },
          {
            question: `Identify the error in this sentence:`,
            options: ['The sentence is correct', 'There is a grammar mistake (Correct)', 'The spelling is wrong'],
            correctIndex: 1,
            explanation: 'Carefully check the grammar rule you have learned.'
          },
          {
            question: `How do you form the negative of this structure?`,
            options: ['Add "not" after the verb (Correct)', 'Add "no" before the verb', 'Use "don\'t" always'],
            correctIndex: 0,
            explanation: 'Negation rules depend on the specific grammar structure.'
          },
          {
            question: `Complete this sentence: "She ___ to school every day."`,
            options: ['go', 'goes (Correct)', 'going'],
            correctIndex: 1,
            explanation: 'Third person singular requires the -s ending in Present Simple.'
          },
          {
            question: `True or False: The word order changes for questions.`,
            options: ['True (Correct)', 'False'],
            correctIndex: 0,
            explanation: 'Many grammar topics require subject-verb inversion in questions.'
          },
          {
            question: `Which time expression best matches this tense?`,
            options: ['yesterday', 'every day (Correct)', 'now'],
            correctIndex: 1,
            explanation: 'Signal words help identify the correct grammar tense.'
          },
          {
            question: `Choose the correct translation:`,
            options: ['Correct translation (Right)', 'Wrong translation', 'Partly correct'],
            correctIndex: 0,
            explanation: 'Translation accuracy depends on understanding the grammar rule.'
          },
          {
            question: `What is the correct pronoun to use?`,
            options: ['Correct pronoun (Right)', 'Wrong pronoun', 'Not a pronoun'],
            correctIndex: 0,
            explanation: 'Pronouns must agree with the subject in person and number.'
          },
          {
            question: `Which of these sentences has the correct word order?`,
            options: ['Correct order (Right)', 'Incorrect order', 'Another incorrect order'],
            correctIndex: 0,
            explanation: 'Word order follows specific patterns in English grammar.'
          }
        ];
        
        localStorage.setItem(`learnflow_quiz_${topicId}`, JSON.stringify(generatedQuestions));
        responseData = { questions: generatedQuestions };
      } else if (pathname.includes('/grammar/topics') && pathname.includes('/quiz/submit')) {
        const match = pathname.match(/\/grammar\/topics\/([^\/]+)\/quiz\/submit/);
        const topicId = match ? match[1] : '';
        const body = JSON.parse(init?.body as string || '{}');
        const answers = body.answers || [];
        
        const cachedQuiz = JSON.parse(localStorage.getItem(`learnflow_quiz_${topicId}`) || '[]');
        let correctCount = 0;
        const evaluation = cachedQuiz.map((q: any, idx: number) => {
          const correct = Number(answers[idx]) === q.correctIndex;
          if (correct) correctCount++;
          return correct;
        });
        
        const scorePct = Math.round((correctCount / cachedQuiz.length) * 100);
        let grade = 'F';
        if (scorePct >= 90) grade = 'A';
        else if (scorePct >= 80) grade = 'B';
        else if (scorePct >= 60) grade = 'C';
        else if (scorePct >= 50) grade = 'D';
        
        const gProgress = JSON.parse(localStorage.getItem('learnflow_grammar_progress') || '{}');
        if (!gProgress[topicId]) {
          gProgress[topicId] = { explorer: false, pioneer: false, master: false, quizGrade: null };
        }
        gProgress[topicId].quizGrade = grade;
        localStorage.setItem('learnflow_grammar_progress', JSON.stringify(gProgress));
        
        responseData = {
          score: correctCount,
          total: cachedQuiz.length,
          grade,
          evaluation,
          completions: gProgress[topicId]
        };
      } else if (pathname.includes('/grammar/topics') && pathname.endsWith('/reset')) {
        const match = pathname.match(/\/grammar\/topics\/([^\/]+)\/reset/);
        const topicId = match ? match[1] : '';
        
        const gProgress = JSON.parse(localStorage.getItem('learnflow_grammar_progress') || '{}');
        if (gProgress[topicId]) {
          gProgress[topicId] = { explorer: false, pioneer: false, master: false, quizGrade: null };
          localStorage.setItem('learnflow_grammar_progress', JSON.stringify(gProgress));
        }
        
        let badges = JSON.parse(localStorage.getItem('learnflow_grammar_badges') || '[]');
        badges = badges.filter((b: string) => !b.endsWith(topicId));
        localStorage.setItem('learnflow_grammar_badges', JSON.stringify(badges));
        
        responseData = { success: true };
      } else {
        responseData = { error: 'Not implemented in standalone mode' };
        responseInit.status = 501;
      }

      return new Response(JSON.stringify(responseData), responseInit);
    }
    
    return originalFetch(input, init);
  };
}
