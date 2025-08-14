const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server ready');
  }
});

// Generate AI recommendations using Claude
async function generateAIRecommendations(profile, consultationData) {
  try {
    const prompt = `You are an expert perfumer and fragrance consultant. Based on the following user profile and consultation responses, provide 6 personalized fragrance recommendations.

SCENT PROFILE:
- Energy Level: ${profile.energy}/10 (1=calming, 10=energizing)
- Complexity: ${profile.complexity}/10 (1=simple, 10=layered)
- Warmth: ${profile.warmth}/10 (1=cool/fresh, 10=warm/cozy)
- Boldness: ${profile.boldness}/10 (1=subtle, 10=statement-making)
- Time Preference: ${profile.timePreference}/10 (1=day, 10=evening)
- Nature Connection: ${profile.natureConnection}/10 (1=urban, 10=natural)

CONSULTATION RESPONSES:
${Object.entries(consultationData).map(([key, value]) => 
  `${key.replace(/_/g, ' ')}: ${value}`
).join('\n')}

Please provide exactly 6 fragrance recommendations in this JSON format:
{
  "recommendations": [
    {
      "name": "Fragrance Name",
      "brand": "Brand Name",
      "description": "2-3 sentence description explaining why this fragrance matches their personality",
      "notes": ["top note", "heart note", "base note"],
      "priceRange": "$XX-XX",
      "scenario": "When to wear this fragrance",
      "reasoning": "Why this matches their specific profile and memories"
    }
  ],
  "summary": "A 2-3 sentence summary of their overall scent personality",
  "shoppingTips": "3-4 specific tips for testing and buying fragrances"
}

Only recommend real, currently available fragrances from reputable brands. Focus on matching their emotional memories and scent profile dimensions.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.content[0].text;
    
    // Extract JSON from Claude's response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);
      console.log('✅ Claude AI recommendations generated successfully');
      return recommendations;
    }
    
    throw new Error('Could not parse Claude response');
  } catch (error) {
    console.error('❌ Error generating AI recommendations:', error);
    throw error;
  }
}

// Generate beautiful HTML email template
function generateEmailHTML(recommendations, profile, userEmail) {
  const recList = recommendations.recommendations.map((rec, index) => `
    <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 20px 0; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
          <span style="color: white; font-weight: bold; font-size: 14px;">${index + 1}</span>
        </div>
        <h3 style="color: #1f2937; margin: 0; font-size: 20px; font-weight: 600;">${rec.name}</h3>
      </div>
      <p style="color: #6b7280; margin: 0 0 12px 0; font-style: italic; font-size: 16px;">${rec.brand} | ${rec.priceRange}</p>
      <p style="color: #374151; margin: 0 0 15px 0; line-height: 1.6; font-size: 15px;">${rec.description}</p>
      <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #374151;">Notes:</strong> ${rec.notes.join(', ')}</p>
        <p style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #374151;">Perfect for:</strong> ${rec.scenario}</p>
      </div>
      <p style="color: #4f46e5; margin: 0; font-size: 14px; font-weight: 500;"><strong>Why it's perfect for you:</strong> ${rec.reasoning}</p>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Scent Story</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; border-radius: 20px 20px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0 0 10px 0; font-size: 32px; font-weight: 700;">✨ Your Scent Story ✨</h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0;">Crafted by AI, perfected for you</p>
      </div>

      <div style="background: white; padding: 30px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 25px; border-radius: 15px; margin-bottom: 30px; border-left: 5px solid #667eea;">
          <h2 style="color: #374151; margin-top: 0; font-size: 24px;">Your Scent Personality</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.7; margin-bottom: 20px;">${recommendations.summary}</p>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px;">
            <div style="text-align: center; padding: 15px; background: white; border-radius: 10px; border: 1px solid #e5e7eb;">
              <div style="font-size: 24px; font-weight: bold; color: #667eea;">${profile.energy}/10</div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Energy</div>
            </div>
            <div style="text-align: center; padding: 15px; background: white; border-radius: 10px; border: 1px solid #e5e7eb;">
              <div style="font-size: 24px; font-weight: bold; color: #667eea;">${profile.complexity}/10</div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Complexity</div>
            </div>
            <div style="text-align: center; padding: 15px; background: white; border-radius: 10px; border: 1px solid #e5e7eb;">
              <div style="font-size: 24px; font-weight: bold; color: #667eea;">${profile.warmth}/10</div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Warmth</div>
            </div>
            <div style="text-align: center; padding: 15px; background: white; border-radius: 10px; border: 1px solid #e5e7eb;">
              <div style="font-size: 24px; font-weight: bold; color: #667eea;">${profile.boldness}/10</div>
              <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Boldness</div>
            </div>
          </div>
        </div>

        <h2 style="color: #374151; font-size: 28px; margin-bottom: 25px; text-align: center;">Your Personalized Recommendations</h2>
        ${recList}

        <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 25px; border-radius: 15px; margin-top: 30px; border: 1px solid #93c5fd;">
          <h3 style="color: #1e40af; margin-top: 0; font-size: 20px;">💡 Expert Shopping Tips</h3>
          <p style="color: #1e3a8a; margin-bottom: 0; font-size: 15px; line-height: 1.6;">${recommendations.shoppingTips}</p>
        </div>

        <div style="text-align: center; margin-top: 40px; padding: 30px; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 15px;">
          <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 22px;">🌸 Your Scent Journey Begins</h3>
          <p style="color: #6b7280; margin: 0 0 20px 0; font-size: 16px;">Ready to discover your signature scent? Start with samples and let your story unfold.</p>
          <div style="font-size: 14px; color: #9ca3af; border-top: 1px solid #d1d5db; padding-top: 20px; margin-top: 20px;">
            <p style="margin: 0;">Questions about your recommendations? Simply reply to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    claudeApiConfigured: !!process.env.CLAUDE_API_KEY,
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD)
  });
});

// Generate recommendations endpoint
app.post('/api/generate-recommendations', async (req, res) => {
  try {
    const { profile, consultationData } = req.body;
    
    if (!profile || !consultationData) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    console.log('🤖 Generating AI recommendations...');
    
    // Generate recommendations using Claude
    const recommendations = await generateAIRecommendations(profile, consultationData);
    
    // Send email with recommendations
    if (process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD) {
      try {
        const userEmail = consultationData.email || req.body.email;
        
        if (userEmail) {
          console.log('📧 Sending email to:', userEmail);
          
          const emailHTML = generateEmailHTML(recommendations, profile, userEmail);
          
          const mailOptions = {
            from: `"Scent Story" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: '✨ Your Personalized Scent Story is Ready!',
            html: emailHTML
          };

          await transporter.sendMail(mailOptions);
          console.log('✅ Email sent successfully to:', userEmail);
        }
      } catch (emailError) {
        console.error('❌ Error sending email:', emailError);
        // Don't fail the whole request if email fails
      }
    }
    
    res.json({
      success: true,
      message: 'Recommendations generated and email sent',
      recommendations: recommendations
    });

  } catch (error) {
    console.error('❌ Error in recommendations endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      message: error.message 
    });
  }
});

// Test email endpoint - GET version for browser testing
app.get('/api/test-email', async (req, res) => {
  try {
    const testEmail = 'lwelsch1@gmail.com'; // Use your Gmail for testing
    
    const testMailOptions = {
      from: `"Scent Story" <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: 'Test Email from Scent Story',
      html: `
        <h2>✅ Email Configuration Working!</h2>
        <p>Your email setup is working correctly.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `
    };

    await transporter.sendMail(testMailOptions);
    res.json({ success: true, message: 'Test email sent successfully to ' + testEmail });
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({ error: 'Failed to send test email', details: error.message });
  }
});

// Test email endpoint - POST version
app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    const testMailOptions = {
      from: `"Scent Story" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Test Email from Scent Story',
      html: `
        <h2>✅ Email Configuration Working!</h2>
        <p>Your email setup is working correctly.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `
    };

    await transporter.sendMail(testMailOptions);
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({ error: 'Failed to send test email', details: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🤖 Claude API configured: ${!!process.env.CLAUDE_API_KEY}`);
  console.log(`📧 Email configured: ${!!(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD)}`);
  console.log(`📊 Node.js version: ${process.version}`);
});