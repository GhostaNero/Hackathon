const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

// Simple session store (in-memory)
// This Map stores session data for each user, keyed by their session ID
const sessions = new Map();

/**
 * Gets or creates a session for a given session ID
 * Each session starts with a captchaCount of 0
 */
function getSession(sessionId) {
  // If session doesn't exist, create a new one with captchaCount initialized to 0
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { captchaCount: 0 });
  }
  // Return the session object
  return sessions.get(sessionId);
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Parse the incoming request URL to extract pathname and query parameters
  const parsedUrl = url.parse(req.url, true);
  
  // SESSION MANAGEMENT
  // Try to get existing sessionId from cookies, or generate a new random one
  // The optional chaining (?.) prevents errors if cookie header doesn't exist
  const sessionId = req.headers.cookie?.match(/sessionId=([^;]+)/)?.[1] || 
                    Math.random().toString(36).substring(7);
  
  // Set the session cookie in the response (HttpOnly makes it inaccessible to JavaScript for security)
  res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly`);
  
  // All responses will be JSON
  res.setHeader('Content-Type', 'application/json');
  
  // ROUTE: POST /verify-captcha
  // This endpoint verifies the captcha and increments the counter
  if (req.method === 'POST' && parsedUrl.pathname === '/verify-captcha') {
    let body = '';
    
    // Collect incoming data chunks (POST body comes in chunks)
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    // Once all data is received, process it
    req.on('end', async () => {
      // Get the user's session data
      const session = getSession(sessionId);
      let captchaCount = session.captchaCount || 0;
      
      // CHECK IF CAPTCHA IS STILL REQUIRED (only for first 10 submissions)
      if (captchaCount < 10) {
        // Parse the form data to extract the captcha token
        const params = querystring.parse(body);
        const token = params['h-captcha-response'];
        
        // Validate that token exists
        if (!token) {
          res.end(JSON.stringify({
            success: false,
            error: 'No captcha token provided'
          }));
          return;
        }
        
        // VERIFY CAPTCHA WITH HCAPTCHA API
        // Prepare the data to send to hCaptcha's verification endpoint
        const postData = querystring.stringify({
          secret: 'your_secret_key',    // Your hCaptcha secret key
          response: token                // The token from the user's captcha completion
        });
        
        // Configure the HTTPS request to hCaptcha's server
        const options = {
          hostname: 'hcaptcha.com',
          port: 443,                     // HTTPS port
          path: '/siteverify',           // hCaptcha verification endpoint
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
          }
        };
        
        // Make the HTTPS request to hCaptcha
        const hcaptchaReq = https.request(options, (hcaptchaRes) => {
          let responseData = '';
          
          // Collect response data from hCaptcha
          hcaptchaRes.on('data', (chunk) => {
            responseData += chunk;
          });
          
          // When hCaptcha response is complete
          hcaptchaRes.on('end', () => {
            // Parse hCaptcha's JSON response
            const jsonResponse = JSON.parse(responseData);
            
            // If captcha verification was successful
            if (jsonResponse.success) {
              // Increment the captcha counter
              captchaCount++;
              session.captchaCount = captchaCount;
              
              // Send success response to client with updated count
              res.end(JSON.stringify({
                success: true,
                captchaCount: captchaCount,
                message: `Captcha ${captchaCount}/10 completed`,
                captchaRequired: captchaCount < 10  // Will be false after 10th captcha
              }));
            } else {
              // Captcha verification failed
              res.end(JSON.stringify({
                success: false,
                error: 'Captcha verification failed'
              }));
            }
          });
        });
        
        // Handle any errors in the HTTPS request
        hcaptchaReq.on('error', (error) => {
          console.error('Error:', error);
          res.end(JSON.stringify({
            success: false,
            error: 'Verification error'
          }));
        });
        
        // Send the request data and complete the request
        hcaptchaReq.write(postData);
        hcaptchaReq.end();
      } else {
        // User has already completed 10 captchas - no verification needed
        res.end(JSON.stringify({
          success: true,
          captchaCount: captchaCount,
          message: 'Captcha verification no longer required',
          captchaRequired: false
        }));
      }
    });
  } 
  // ROUTE: GET /get-captcha-status
  // This endpoint returns the current captcha status without verification
  else if (req.method === 'GET' && parsedUrl.pathname === '/get-captcha-status') {
    // Get the user's session
    const session = getSession(sessionId);
    const captchaCount = session.captchaCount || 0;
    
    // Return current status
    res.end(JSON.stringify({
      captchaCount: captchaCount,                    // How many captchas completed
      captchaRequired: captchaCount < 10,            // Whether captcha is still needed
      remaining: Math.max(0, 10 - captchaCount)      // How many captchas left
    }));
  } 
  // ROUTE: All other routes - return 404
  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Start the server on port 3000
server.listen(3000, () => {
  console.log('Server running on port 3000');
});