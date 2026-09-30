# FraudLens: The 60-Second Human Pitch Script

**Instructions for Rehan:** Speak naturally, take pauses, and don't sound like you're reading a manual. This is designed to sound like a real person explaining a cool project.

***

### The Script (Read this out loud)

"Hey everyone, I'm Rehan, and this is **FraudLens**.

Right now, fake job offers look *identical* to real ones because scammers are using AI to write them perfectly. If your security tool just looks for 'spam keywords', it's going to get fooled.

So, we built FraudLens to look at something scammers *can't* fake: **The Hiring Process.** 

We engineered something called the **Fraud Funnel Compression Score**. Real companies follow a strict process: screening, interviews, background checks, *then* an offer. Scammers? They skip all those steps and rush straight to asking for a 'security deposit' or UPI transfer. FraudLens detects when that process is artificially compressed.

**Here is exactly what it does:**
1. **Any Format:** You can paste an email, drop a job-board URL, or upload a PDF offer letter. 
2. **Instant X-Ray:** Our Gemini-powered engine scans it and visually shows you exactly which hiring stages were suspiciously skipped.
3. **The Smart Assistant:** We didn't just stop at detection. We built an **AI Counter-Inquiry Generator**. If an offer looks sketchy, FraudLens automatically drafts a polite, legally safe email for you to send back—demanding corporate verification or refusing deposits. You send that, and the scammers immediately back off.

FraudLens isn't just a scanner. It's a bodyguard for vulnerable job seekers."

***

### Quick Feature Cheat Sheet (If you get asked questions)
- **Multi-Modal:** Handles text, live URLs, and Documents (PDF/Word).
- **Process over Keywords:** Uses the FFCS heuristic to track the *stages* of hiring, not just bad words.
- **AI Fallback:** If the Gemini AI API goes down or rate-limits, we built a local heuristic engine that takes over instantly. Zero downtime.
- **Smart Assistant:** Generates tactical email responses so candidates can test suspicious recruiters safely.
- **Zero-Retention Privacy:** No documents are saved to a database. Everything is scanned in memory and destroyed.
