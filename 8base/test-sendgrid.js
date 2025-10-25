/**
 * Test SendGrid Integration
 * Run this to test if SendGrid is working properly
 */

const sgMail = require('@sendgrid/mail');

// Test configuration
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'your-api-key-here';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com';
const TO_EMAIL = 'test@example.com'; // Replace with your test email

async function testSendGrid() {
  try {
    console.log('🧪 Testing SendGrid integration...');
    
    if (!SENDGRID_API_KEY || SENDGRID_API_KEY === 'your-api-key-here') {
      console.error('❌ Please set SENDGRID_API_KEY environment variable');
      return;
    }

    sgMail.setApiKey(SENDGRID_API_KEY);

    const msg = {
      to: TO_EMAIL,
      from: FROM_EMAIL,
      subject: '🧪 SendGrid Test Email',
      html: `
        <h1>SendGrid Test</h1>
        <p>If you receive this email, SendGrid is working correctly!</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
    };

    console.log('📧 Sending test email...');
    const result = await sgMail.send(msg);
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Result:', result);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testSendGrid();
