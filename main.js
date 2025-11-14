

const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

// Simple session store (in-memory)
const sessions = new Map();

function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { captchaCount: 0 });
  }
  return sessions.get(sessionId);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Simple session handling (use proper session middleware in production)
  const sessionId = req.headers.cookie?.match(/sessionId=([^;]+)/)?.[1] || 
                    Math.random().toString(36).substring(7);
  
  res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly`);
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'POST' && parsedUrl.pathname === '/verify-captcha') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      const session = getSession(sessionId);
      let captchaCount = session.captchaCount || 0;
      
      if (captchaCount < 10) {
        const params = querystring.parse(body);
        const token = params['h-captcha-response'];
        
        if (!token) {
          res.end(JSON.stringify({
            success: false,
            error: 'No captcha token provided'
          }));
          return;
        }
        
        // Verify with hCaptcha
        const postData = querystring.stringify({
          secret: 'your_secret_key',
          response: token
        });
        
        const options = {
          hostname: 'hcaptcha.com',
          port: 443,
          path: '/siteverify',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
          }
        };
        
        const hcaptchaReq = https.request(options, (hcaptchaRes) => {
          let responseData = '';
          
          hcaptchaRes.on('data', (chunk) => {
            responseData += chunk;
          });
          
          hcaptchaRes.on('end', () => {
            const jsonResponse = JSON.parse(responseData);
            
            if (jsonResponse.success) {
              captchaCount++;
              session.captchaCount = captchaCount;
              
              res.end(JSON.stringify({
                success: true,
                captchaCount: captchaCount,
                message: `Captcha ${captchaCount}/10 completed`,
                captchaRequired: captchaCount < 10
              }));
            } else {
              res.end(JSON.stringify({
                success: false,
                error: 'Captcha verification failed'
              }));
            }
          });
        });
        
        hcaptchaReq.on('error', (error) => {
          console.error('Error:', error);
          res.end(JSON.stringify({
            success: false,
            error: 'Verification error'
          }));
        });
        
        hcaptchaReq.write(postData);
        hcaptchaReq.end();
      } else {
        res.end(JSON.stringify({
          success: true,
          captchaCount: captchaCount,
          message: 'Captcha verification no longer required',
          captchaRequired: false
        }));
      }
    });
  } else if (req.method === 'GET' && parsedUrl.pathname === '/get-captcha-status') {
    const session = getSession(sessionId);
    const captchaCount = session.captchaCount || 0;
    
    res.end(JSON.stringify({
      captchaCount: captchaCount,
      captchaRequired: captchaCount < 10,
      remaining: Math.max(0, 10 - captchaCount)
    }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});