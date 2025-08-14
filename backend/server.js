const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Test data storage (in production, use a real database)
let consultations = [];
let webVitals = [];

// Generate AI recommendations using Claude
async function generateAIRecommendations(consultationData) {
  try {
    console.log('🤖 Calling Claude API...');
    console.log('🔑 API Key exists:', !!process.env.CLAUDE_API_KEY);
    console.log('🔑 API Key length:', process.env.CLAUDE_API_KEY ? process.env.CLAUDE_API_KEY.length : 0);
    
    const prompt = `Based on this fragrance consultation data, provide personalized scent recommendations:

Consultation Data:
${JSON.stringify(consultationData, null, 2)}

Please provide:
1. 3-5 specific fragrance recommendations with detailed explanations
2. Why each recommendation matches their preferences
3. Seasonal wearing suggestions
4. Layering tips if applicable

Format as detailed, helpful recommendations.`;

    console.log('📤 Sending request to Claude API...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error response:', errorText);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Claude API response received');
    console.log('📄 Response structure:', Object.keys(data));
    
    return {
      error: false,
      message: data.content[0].text,
      details: 'AI recommendations generated successfully'
    };

  } catch (error) {
    console.error('❌ Error in generateAIRecommendations:', error.message);
    console.error('❌ Full error:', error);
    return {
      error: true,
      message: error.message,
      details: 'Failed to generate AI recommendations'
    };
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Scent Consultation API is running!' });
});

// Submit consultation
app.post('/api/consultation', async (req, res) => {
  try {
    const consultation = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...req.body
    };
    
    consultations.push(consultation);
    
    res.json({ 
      success: true, 
      message: 'Consultation submitted successfully',
      consultationId: consultation.id
    });
  } catch (error) {
    console.error('Error submitting consultation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit consultation' 
    });
  }
});

// Generate AI recommendations endpoint
app.post('/api/generate-recommendations', async (req, res) => {
  try {
    console.log('🔍 Starting AI recommendation generation...');
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    
    const { error, message, details } = await generateAIRecommendations(req.body);
    
    if (error) {
      console.error('❌ AI recommendations error:', error);
      return res.status(500).json({ 
        error: true, 
        message: error.message,
        details: 'Check server console for more information'
      });
    }
    
    console.log('✅ AI recommendations generated successfully');
    
    // Parse the AI response into structured data
    const aiText = message;
    const recommendations = [];
    
    // Split by numbered sections (1., 2., 3., etc.) or ### headers
    let sections = aiText.split(/(?:\d+\.\s*\*\*|###\s*\d+\.)/);
    
    // If no numbered sections found, try alternative parsing
    if (sections.length < 2) {
      sections = aiText.split(/(?=\*\*[A-Z].*?\*\*.*?\$)/);
    }
    
    for (let i = 1; i < sections.length && i <= 5; i++) {
      const section = sections[i].trim();
      if (!section) continue;
      
      // Extract fragrance name (usually in first line with **)
      const nameMatch = section.match(/\*\*(.*?)\*\*/);
      let name = nameMatch ? nameMatch[1].trim() : `Recommendation ${i}`;
      
      // Extract price
      const priceMatch = section.match(/\(\$\d+[^)]*\)/);
      const price = priceMatch ? priceMatch[0] : '';
      
      // Clean name and add price
      name = name.replace(/\(\$[^)]*\)/g, '').trim();
      if (price) name += ` ${price}`;
      
      // Extract brand from common fragrance houses
      let brand = "Premium Fragrance";
      const nameLC = name.toLowerCase();
      if (nameLC.includes('byredo')) brand = "Byredo";
      else if (nameLC.includes('tom ford')) brand = "Tom Ford";
      else if (nameLC.includes('maison francis') || nameLC.includes('mfk')) brand = "Maison Francis Kurkdjian";
      else if (nameLC.includes('profumum')) brand = "Profumum Roma";
      else if (nameLC.includes('hermès') || nameLC.includes('hermes')) brand = "Hermès";
      else if (nameLC.includes('acqua di parma')) brand = "Acqua di Parma";
      else if (nameLC.includes('xerjoff')) brand = "Xerjoff";
      else if (nameLC.includes('parfums de marly')) brand = "Parfums de Marly";
      
      // Extract "Why it matches" or "Profile Match" section
      const whyMatch = section.match(/\*\*Why it matches:\*\*(.*?)(?=\*\*|$)/s);
      const profileMatch = section.match(/\*\*Profile Match:\*\*(.*?)(?=\*\*|$)/s);
      const reasoningMatch = section.match(/\*\*Why It's Perfect For You:\*\*(.*?)(?=\*\*|$)/s);
      
      let description = "";
      let reasoning = "";
      
      if (whyMatch) {
        let fullText = whyMatch[1].trim();
        // Split at sentence boundaries, not arbitrary character limits
        const sentences = fullText.split(/(?<=[.!?])\s+/);
        description = sentences.slice(0, 2).join(' ');
        reasoning = sentences.slice(2, 4).join(' ') || "Perfect for your unique fragrance preferences";
      } else if (profileMatch) {
        let fullText = profileMatch[1].trim();
        const sentences = fullText.split(/(?<=[.!?])\s+/);
        description = sentences.slice(0, 2).join(' ');
        reasoning = sentences.slice(2, 4).join(' ') || "Selected based on your consultation responses";
      } else {
        // Take meaningful paragraphs
        const lines = section.split('\n').filter(line => line.trim() && !line.includes('**'));
        const meaningfulText = lines.join(' ').trim();
        const sentences = meaningfulText.split(/(?<=[.!?])\s+/);
        description = sentences.slice(0, 2).join(' ');
        reasoning = sentences.slice(2, 4).join(' ') || "Matches your consultation preferences perfectly";
      }
      
      // Ensure proper sentence endings
      if (description && !description.match(/[.!?]$/)) {
        // Find the last complete sentence
        const lastSentence = description.lastIndexOf('.');
        if (lastSentence > 50) {
          description = description.substring(0, lastSentence + 1);
        } else {
          description += '.';
        }
      }
      
      if (reasoning && !reasoning.match(/[.!?]$/)) {
        const lastSentence = reasoning.lastIndexOf('.');
        if (lastSentence > 30) {
          reasoning = reasoning.substring(0, lastSentence + 1);
        } else {
          reasoning += '.';
        }
      }
      
      // Extract notes if mentioned
      const notes = ["AI-Selected", "Premium"];
      if (section.toLowerCase().includes('mediterranean')) notes.push("Mediterranean");
      if (section.toLowerCase().includes('woody')) notes.push("Woody");
      if (section.toLowerCase().includes('citrus')) notes.push("Citrus");
      if (section.toLowerCase().includes('spicy')) notes.push("Spicy");
      
      recommendations.push({
        name: name,
        brand: brand,
        description: description,
        notes: notes,
        scenario: "Perfect for your lifestyle and preferences",
        reasoning: reasoning
      });
    }
    
    // Fallback if no recommendations found
    if (recommendations.length === 0) {
      recommendations.push({
        name: "Your Personalized AI Recommendations",
        brand: "Claude AI",
        description: aiText.substring(0, 400) + "...",
        notes: ["Personalized", "AI-Selected"],
        scenario: "Your unique preferences",
        reasoning: "Generated specifically based on your consultation responses and fragrance profile"
      });
    }

    res.json({ 
      success: true,
      recommendations: {
        summary: "Based on your consultation responses, here are your personalized fragrance recommendations:",
        shoppingTips: "Test fragrances on your skin and let them develop for at least 30 minutes. Each fragrance interacts uniquely with your body chemistry.",
        recommendations: recommendations
      }
    });
  } catch (error) {
    console.error('❌ Error in /api/generate-recommendations:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: true, 
      message: error.message,
      details: 'Check server console for more information'
    });
  }
});

// Get all consultations
app.get('/api/consultations', (req, res) => {
  res.json(consultations);
});

// Report web vitals
app.post('/api/web-vitals', (req, res) => {
  try {
    const vital = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...req.body
    };
    
    webVitals.push(vital);
    
    res.json({ 
      success: true, 
      message: 'Web vital recorded' 
    });
  } catch (error) {
    console.error('Error recording web vital:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to record web vital' 
    });
  }
});

// Get web vitals
app.get('/api/web-vitals', (req, res) => {
  res.json(webVitals);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🤖 Claude API configured: ${!!process.env.CLAUDE_API_KEY}`);
  console.log(`📊 Node.js version: ${process.version}`);
});

module.exports = app;