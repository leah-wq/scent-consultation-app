import React, { useState } from 'react';
import './App.css';

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({
    energy: 5,
    complexity: 5,
    warmth: 5,
    boldness: 5,
    timePreference: 5,
    natureConnection: 5
  });
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showFullConsultation, setShowFullConsultation] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showAIResults, setShowAIResults] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [consultationResponses, setConsultationResponses] = useState({});
  const [currentConsultationQuestion, setCurrentConsultationQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const questions = [
    {
      question: "Your ideal weekend morning starts with:",
      options: [
        { text: "Strong coffee and exploring a bustling market", scores: { energy: 8, boldness: 6 } },
        { text: "Yoga and meditation in a quiet garden", scores: { energy: 3, natureConnection: 8 } },
        { text: "Reading in bed with soft music playing", scores: { energy: 2, warmth: 7 } },
        { text: "Planning an adventure in a new city", scores: { energy: 9, boldness: 7 } }
      ]
    },
    {
      question: "When you want to feel confident, you:",
      options: [
        { text: "Wear something that makes a statement", scores: { boldness: 9, complexity: 7 } },
        { text: "Choose something classic and timeless", scores: { boldness: 4, complexity: 4 } },
        { text: "Go with what feels authentic to you", scores: { boldness: 6, natureConnection: 7 } },
        { text: "Layer interesting pieces together", scores: { complexity: 8, boldness: 7 } }
      ]
    },
    {
      question: "Your perfect evening involves:",
      options: [
        { text: "Intimate dinner by candlelight", scores: { boldness: 3, warmth: 8, timePreference: 8 } },
        { text: "Rooftop cocktails with city views", scores: { boldness: 7, energy: 7, timePreference: 9 } },
        { text: "Cozy fire and good conversation", scores: { warmth: 9, boldness: 2, timePreference: 7 } },
        { text: "Gallery opening or cultural event", scores: { complexity: 8, boldness: 6, timePreference: 8 } }
      ]
    },
    {
      question: "The place that makes you feel most yourself:",
      options: [
        { text: "A hidden beach at sunrise", scores: { natureConnection: 9, energy: 6, boldness: 3 } },
        { text: "A bustling café in the heart of the city", scores: { energy: 8, boldness: 6, natureConnection: 2 } },
        { text: "Your favorite bookstore or library", scores: { complexity: 7, boldness: 2, warmth: 6 } },
        { text: "A mountain cabin in winter", scores: { natureConnection: 8, warmth: 9, boldness: 2 } }
      ]
    },
    {
      question: "When choosing a vacation, you're drawn to:",
      options: [
        { text: "Luxury spa retreat in nature", scores: { warmth: 7, natureConnection: 8, energy: 3 } },
        { text: "Vibrant city with amazing food scene", scores: { energy: 8, boldness: 7, complexity: 7 } },
        { text: "Remote adventure in untouched wilderness", scores: { natureConnection: 9, boldness: 8, energy: 7 } },
        { text: "Cultural immersion in historic places", scores: { complexity: 9, warmth: 6, boldness: 5 } }
      ]
    },
    {
      question: "Your ideal workspace looks like:",
      options: [
        { text: "Minimalist desk with natural light", scores: { complexity: 2, natureConnection: 6, energy: 6 } },
        { text: "Creative chaos with inspiring objects", scores: { complexity: 9, boldness: 7, energy: 7 } },
        { text: "Warm, comfortable space with personal touches", scores: { warmth: 8, complexity: 6, boldness: 4 } },
        { text: "Sleek, modern setup with latest technology", scores: { complexity: 5, boldness: 6, energy: 7 } }
      ]
    }
  ];

  const consultationQuestions = [
    {
      id: "childhood_memory",
      question: "Describe a cherished childhood memory where you felt completely safe and happy. What scents surrounded you in that moment?",
      type: "textarea",
      placeholder: "Take your time... perhaps the smell of your grandmother's kitchen, fresh laundry, or a garden in bloom..."
    },
    {
      id: "comfort_place",
      question: "Picture a place that instantly brings you peace and comfort. Describe this sanctuary and the fragrances that make it feel like home.",
      type: "textarea",
      placeholder: "This could be anywhere - a cozy café, your bedroom, a forest path, or even an imagined space..."
    },
    {
      id: "confident_memory",
      question: "Think of a moment when you felt incredibly confident and radiant. Paint the scene for me - where were you and what scents enhanced that feeling?",
      type: "textarea",
      placeholder: "What were you wearing? What was the environment? Any particular fragrances you remember..."
    },
    {
      id: "morning_ritual",
      question: "Describe your perfect morning routine - one that would set your entire day up for magic. What scents would make this morning absolutely perfect?",
      type: "textarea",
      placeholder: "From the moment you wake... coffee brewing, fresh flowers, ocean air, clean linens..."
    },
    {
      id: "romantic_ideal",
      question: "Create a picture of your most romantic, dreamy evening. What fragrances would complete this perfect scene?",
      type: "textarea",
      placeholder: "The setting, the mood, the atmosphere... what scents would make your heart flutter..."
    },
    {
      id: "signature_essence",
      question: "If you could capture the very essence of who you are in a bottle, what would that fragrance tell the world about you?",
      type: "textarea",
      placeholder: "Think about your personality, your dreams, what makes you uniquely you..."
    },
    {
      id: "scent_budget",
      question: "What feels comfortable for investing in your signature fragrance?",
      type: "select",
      options: [
        "Under $50 - I prefer accessible luxury",
        "$50-100 - Quality with good value", 
        "$100-200 - Investment in something special",
        "$200+ - I appreciate the finest things",
        "Budget isn't a concern - I want the perfect match"
      ]
    }
  ];

  // Function to submit data to Google Forms
  const submitToGoogleForms = async (data) => {
    try {
      const formData = new FormData();
      
      formData.append('entry.273930105', data.email);
      formData.append('entry.1518374634', new Date().toISOString());
      formData.append('entry.663822922', data.source);
      
      if (data.teaserScores) {
        formData.append('entry.743987168', JSON.stringify(data.teaserScores));
      }
      
      if (data.consultationData) {
        formData.append('entry.660617473', JSON.stringify(data.consultationData));
      }

      await fetch('https://docs.google.com/forms/d/e/1FAIpQLSf1ZtGigxzS4ZOn3BSDqjhvq6XhPzcmXe6XiFmCTkFGptmHFg/formResponse', {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      });

      console.log('✅ Data submitted to Google Sheets successfully');
      return true;
    } catch (error) {
      console.error('❌ Error submitting to Google Forms:', error);
      return false;
    }
  };

  // ✅ FIXED: Updated Claude AI Integration - using Railway backend with proper email handling
  const generateAIRecommendations = async (profile, consultationData) => {
    setIsGeneratingAI(true);
    
    try {
      console.log('🤖 Calling Railway backend for AI recommendations...');
      console.log('Consultation data being sent:', consultationData);
      
      const response = await fetch('https://scent-quiz-backend-production.up.railway.app/api/generate-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: profile,
          consultationData: consultationData
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error response:', errorText);
        throw new Error(`Backend API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.success && data.recommendations) {
        console.log('✅ Claude AI recommendations generated successfully');
        return data.recommendations;
      } else {
        throw new Error('Invalid response from backend');
      }
      
    } catch (error) {
      console.error('❌ Error generating AI recommendations:', error);
      alert(`Error generating AI recommendations: ${error.message}\n\nPlease check your internet connection and try again.`);
      return null;
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAnswer = (option) => {
    const newScores = { ...scores };
    Object.keys(option.scores).forEach(dimension => {
      newScores[dimension] = Math.max(1, Math.min(10, 
        newScores[dimension] + (option.scores[dimension] - 5) * 0.5
      ));
    });
    setScores(newScores);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowEmailCapture(true);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (userEmail.trim()) {
      setIsSubmitting(true);
      
      // Submit teaser quiz data to Google Sheets
      await submitToGoogleForms({
        email: userEmail,
        source: 'teaser_quiz',
        teaserScores: scores
      });

      // Store locally as backup
      const emails = JSON.parse(localStorage.getItem('scentEmails') || '[]');
      emails.push({
        email: userEmail,
        date: new Date().toISOString(),
        type: 'teaser_quiz',
        scores: scores
      });
      localStorage.setItem('scentEmails', JSON.stringify(emails));

      setIsSubmitting(false);
      setShowEmailCapture(false);
      setShowResult(true);
    }
  };

  const handleConsultationInputChange = (questionId, value) => {
    setConsultationResponses({
      ...consultationResponses,
      [questionId]: value
    });
  };

  // ✅ FIXED: Updated consultation completion with proper email handling
  const handleConsultationNext = async () => {
    if (currentConsultationQuestion < consultationQuestions.length - 1) {
      setCurrentConsultationQuestion(currentConsultationQuestion + 1);
    } else {
      setIsSubmitting(true);
      
      // ✅ CRITICAL FIX: Add email to consultation data for backend
      const consultationWithEmail = {
        ...consultationResponses,
        email: userEmail
      };
      
      // Submit full consultation data to Google Sheets
      await submitToGoogleForms({
        email: userEmail,
        source: 'full_consultation',
        teaserScores: scores,
        consultationData: consultationWithEmail  // ✅ FIXED: Include email
      });

      // Store locally as backup
      const consultations = JSON.parse(localStorage.getItem('fullConsultations') || '[]');
      consultations.push({
        email: userEmail,
        responses: consultationWithEmail,  // ✅ FIXED: Include email
        teaserScores: scores,
        date: new Date().toISOString()
      });
      localStorage.setItem('fullConsultations', JSON.stringify(consultations));

      setIsSubmitting(false);
      setShowFullConsultation(false);
      setShowThankYou(true);

      // ✅ FIXED: Generate AI recommendations with email included
      const profile = generatePersonalizedResult().profile;
      const recommendations = await generateAIRecommendations(profile, consultationWithEmail);
      
      if (recommendations) {
        setAiRecommendations(recommendations);
        // Show AI results after thank you
        setTimeout(() => {
          setShowThankYou(false);
          setShowAIResults(true);
        }, 3000);
      } else {
        // Reset after 5 seconds if no AI
        setTimeout(() => {
          restart();
        }, 5000);
      }
    }
  };

  const generatePersonalizedResult = () => {
    const profile = {
      energy: Math.round(scores.energy),
      complexity: Math.round(scores.complexity),
      warmth: Math.round(scores.warmth),
      boldness: Math.round(scores.boldness),
      timePreference: Math.round(scores.timePreference),
      natureConnection: Math.round(scores.natureConnection)
    };

    // Enhanced personalized descriptions
    let description = "Your unique scent profile reveals someone who gravitates toward ";
    
    if (profile.energy > 7) description += "vibrant, energizing fragrances that capture life's bright moments ";
    else if (profile.energy < 4) description += "serene, calming scents that ground and center you ";
    else description += "beautifully balanced fragrances that adapt to your mood ";

    if (profile.complexity > 7) description += "with intricate, layered compositions that unfold throughout the day ";
    else if (profile.complexity < 4) description += "with clean, pure essences that speak with quiet confidence ";
    else description += "with thoughtful complexity that never overwhelms ";

    description += "and a ";
    
    if (profile.warmth > 7) description += "warm, enveloping character that feels like a gentle embrace";
    else if (profile.warmth < 4) description += "fresh, crisp essence that invigorates and awakens";
    else description += "perfectly balanced temperature that feels just right";

    if (profile.boldness > 7) description += ", creating a memorable signature that announces your presence";
    else if (profile.boldness < 4) description += ", creating an intimate aura that draws people closer";
    else description += ", striking the perfect balance between presence and subtlety";

    // Enhanced recommendation logic
    const recommendations = [];
    
    if (profile.energy > 6 && profile.natureConnection > 6) {
      recommendations.push("Hermès Un Jardin Sur Le Toit - A rooftop garden in Paris, fresh and green with sparkling energy");
    }
    if (profile.warmth > 7 && profile.complexity > 6) {
      recommendations.push("Tom Ford Tobacco Vanille - Rich vanilla and spices that wrap you in luxurious warmth");
    }
    if (profile.boldness < 5 && profile.warmth < 5) {
      recommendations.push("Le Labo Thé Matcha 26 - Clean matcha tea with subtle sophistication");
    }
    if (profile.natureConnection > 7) {
      recommendations.push("Diptyque Philosykos - The scent of fig trees in Mediterranean sunshine");
    }
    if (profile.boldness > 7 && profile.complexity > 6) {
      recommendations.push("Maison Francis Kurkdjian Baccarat Rouge 540 - Mysterious and unforgettable");
    }
    if (profile.warmth > 6 && profile.energy < 5) {
      recommendations.push("Byredo Gypsy Water - Vanilla and sandalwood for cozy sophistication");
    }

    // Always ensure we have at least 3 recommendations
    while (recommendations.length < 3) {
      recommendations.push("🤖 AI-powered personalized recommendations available in your full consultation");
    }

    return { profile, description, recommendations };
  };

  const restart = () => {
    setCurrentQuestion(0);
    setScores({
      energy: 5,
      complexity: 5,
      warmth: 5,
      boldness: 5,
      timePreference: 5,
      natureConnection: 5
    });
    setShowEmailCapture(false);
    setShowResult(false);
    setShowFullConsultation(false);
    setShowThankYou(false);
    setShowAIResults(false);
    setUserEmail('');
    setConsultationResponses({});
    setCurrentConsultationQuestion(0);
    setAiRecommendations(null);
  };

  // ✅ Enhanced AI Results screen
  if (showAIResults && aiRecommendations) {
    return (
      <div className="App">
        <div className="result-container">
          <h1>🤖 Your AI-Powered Scent Recommendations</h1>
          <p className="description">{aiRecommendations.summary}</p>

          <div className="ai-recommendations">
            <h2>Personalized for You</h2>
            {aiRecommendations.recommendations.map((rec, index) => (
              <div key={index} className="ai-rec-item">
                <h3>{rec.name}</h3>
                <p className="brand">{rec.brand} | {rec.priceRange}</p>
                <p className="description">{rec.description}</p>
                <p className="notes"><strong>Notes:</strong> {rec.notes.join(', ')}</p>
                <p className="scenario"><strong>Perfect for:</strong> {rec.scenario}</p>
                <p className="reasoning"><strong>Why it's perfect for you:</strong> {rec.reasoning}</p>
              </div>
            ))}
          </div>

          <div className="shopping-tips">
            <h3>💡 Shopping Tips</h3>
            <p>{aiRecommendations.shoppingTips}</p>
          </div>

          <div className="cta-section">
            <h3>📧 Check Your Email!</h3>
            <p>Your personalized recommendations have been sent to: <strong>{userEmail}</strong></p>
            <p>You'll receive a beautiful email with all your recommendations and shopping tips!</p>
            <button onClick={restart} className="restart-btn">
              Take Quiz Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Enhanced Thank you screen
  if (showThankYou) {
    return (
      <div className="App">
        <div className="thank-you-container">
          <div className="thank-you-content">
            <h1>✨ Generating Your AI Recommendations ✨</h1>
            <p>Your consultation has been submitted successfully!</p>
            {isGeneratingAI && (
              <div className="ai-loading">
                <p>🤖 Claude AI is analyzing your responses...</p>
                <div className="loading-spinner"></div>
              </div>
            )}
            <div className="thank-you-details">
              <p><strong>What's happening:</strong></p>
              <ul>
                <li>✅ Your data is saved in Google Sheets</li>
                <li>🤖 AI is creating personalized recommendations</li>
                <li>📧 Beautiful email being prepared for: {userEmail}</li>
                <li>🚀 Using Railway backend for processing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full consultation screen
  if (showFullConsultation) {
    const currentQ = consultationQuestions[currentConsultationQuestion];
    
    return (
      <div className="App">
        <div className="quiz-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentConsultationQuestion + 1) / consultationQuestions.length) * 100}%` }}
            ></div>
          </div>
          
          <div className="question-number">
            Question {currentConsultationQuestion + 1} of {consultationQuestions.length}
          </div>

          <h2 className="question">{currentQ.question}</h2>

          <div className="consultation-input">
            {currentQ.type === 'textarea' ? (
              <textarea
                value={consultationResponses[currentQ.id] || ''}
                onChange={(e) => handleConsultationInputChange(currentQ.id, e.target.value)}
                placeholder={currentQ.placeholder}
                className="consultation-textarea"
                rows={6}
                disabled={isSubmitting}
              />
            ) : (
              <select
                value={consultationResponses[currentQ.id] || ''}
                onChange={(e) => handleConsultationInputChange(currentQ.id, e.target.value)}
                className="consultation-select"
                disabled={isSubmitting}
              >
                <option value="">Select an option...</option>
                {currentQ.options.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            )}
          </div>

          <div className="consultation-buttons">
            <button 
              onClick={() => setShowFullConsultation(false)} 
              className="back-btn"
              disabled={isSubmitting}
            >
              ← Back to Results
            </button>
            
            <button 
              onClick={handleConsultationNext}
              className="consultation-next-btn"
              disabled={!consultationResponses[currentQ.id]?.trim() || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 
               currentConsultationQuestion === consultationQuestions.length - 1 ? '🤖 Get AI Recommendations' : 'Next Question'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Email capture screen
  if (showEmailCapture) {
    return (
      <div className="App">
        <div className="quiz-container">
          <div className="email-capture">
            <h1>Get Your Personalized Scent Profile</h1>
            <p className="email-description">
              Enter your email to receive your detailed scent analysis and AI-powered fragrance recommendations.
            </p>
            
            <form onSubmit={handleEmailSubmit} className="email-form">
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email address"
                className="email-input"
                required
                disabled={isSubmitting}
              />
              <button 
                type="submit" 
                className="email-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Get My Scent Profile'}
              </button>
            </form>
            
            <p className="privacy-note">
              We'll email you the results and occasionally share scent tips. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResult) {
    const result = generatePersonalizedResult();
    
    return (
      <div className="App">
        <div className="result-container">
          <h1>Your Personalized Scent Profile</h1>
          <p className="description">{result.description}</p>

          <div className="scent-dimensions">
            <h2>Your Scent Dimensions</h2>
            <div className="dimensions-grid">
              {Object.entries(result.profile).map(([key, value]) => (
                <div key={key} className="dimension-item">
                  <div className="dimension-header">
                    <span className="dimension-label">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="dimension-value">{value}/10</span>
                  </div>
                  <div className="dimension-bar">
                    <div 
                      className="dimension-fill" 
                      style={{ width: `${value * 10}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="recommendations">
            <h2>Sample Recommendations</h2>
            <ul>
              {result.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>

          <div className="cta-section">
            <h3>Want AI-Powered Scent Recommendations?</h3>
            <p>Get 6 detailed, personalized recommendations from Claude AI based on your memories and preferences.</p>
            <button 
              className="cta-button"
              onClick={() => setShowFullConsultation(true)}
            >
              🤖 Get AI Consultation - Free
            </button>
            <p className="delivery-note">AI recommendations generated instantly + emailed to you!</p>
            <button onClick={restart} className="restart-btn">
              Take Quiz Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz screen
  return (
    <div className="App">
      <div className="quiz-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        
        <div className="question-number">
          Question {currentQuestion + 1} of {questions.length}
        </div>

        <h2 className="question">{questions[currentQuestion].question}</h2>

        <div className="options">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              className="option-btn"
              onClick={() => handleAnswer(option)}
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;