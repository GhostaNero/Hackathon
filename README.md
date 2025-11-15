# Hackathon: Is It Dark Outside?

This hackathon project is a deliberately over‑engineered website that answers a single question: “Is it dark outside?”  
Instead of telling you immediately, it forces you through a gauntlet of absurd, frustrating CAPTCHAs.  

## How It Works (And Doesn’t)
- The site loads a simple interface asking if it's dark.
- Rather than using sunrise/sunset APIs or your system time like a sane app, it blocks the answer behind multiple escalating CAPTCHAs.
- Each CAPTCHA is intentionally annoying.
- Tech: Mostly HTML (structure), JavaScript (CAPTCHA logic / gating), CSS (styling the painful experience).

## Running It
Clone and open `index.html` in your browser.
```
git clone https://github.com/GhostaNero/Hackathon.git
cd Hackathon
open index.html
```
