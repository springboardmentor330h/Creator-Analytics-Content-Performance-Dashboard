-- CreatorIQ Multi-Platform Analytics Seed Data (PostgreSQL)
-- Extensive Dataset for YouTube, Instagram, TikTok, LinkedIn, X, and Facebook

INSERT INTO users (id, full_name, email, role) VALUES
(1, 'Monika Chowdary', 'monika@example.com', 'Creator')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 60+ High-Fidelity Content Records across 6 Platforms
INSERT INTO contents (creator_id, platform, external_content_id, content_title, views, likes, comments, shares, saves, watch_time, reach, published_date) VALUES
-- =================== YOUTUBE ===================
(1, 'YouTube', 'yt_001', 'Full Stack React 19 & Node Tutorial 2026', 45200, 3800, 420, 310, 950, 184000, 52000, '2026-08-10'),
(1, 'YouTube', 'yt_002', 'Top 10 Developer Productivity Hacks', 28400, 2150, 290, 180, 620, 98000, 34000, '2026-08-18'),
(1, 'YouTube', 'yt_003', 'Building Production Microservices with Node.js', 62100, 5400, 610, 490, 1420, 245000, 71000, '2026-08-25'),
(1, 'YouTube', 'yt_004', 'System Design Deep Dive: Scaling to 1M Users', 84000, 7800, 890, 710, 2300, 312000, 95000, '2026-08-29'),
(1, 'YouTube', 'yt_005', 'Complete PostgreSQL Architecture & Query Optimization', 39500, 3100, 340, 220, 880, 156000, 44000, '2026-09-01'),
(1, 'YouTube', 'yt_006', 'Docker & Kubernetes for Frontend Engineers', 51200, 4300, 480, 350, 1150, 192000, 58000, '2026-09-02'),
(1, 'YouTube', 'yt_007', 'How to Build an AI Agent in 20 Minutes', 98500, 9200, 1150, 840, 2900, 368000, 112000, '2026-09-03'),

-- =================== INSTAGRAM ===================
(1, 'Instagram', 'ig_001', 'Minimalist Desk Setup Tour & Ergonomics Guide', 38500, 4900, 540, 620, 1100, 42000, 48000, '2026-08-22'),
(1, 'Instagram', 'ig_002', '5 Modern CSS Tricks You Need in 2026', 52000, 6300, 680, 890, 1850, 61000, 64000, '2026-08-26'),
(1, 'Instagram', 'ig_003', 'Day in the Life of a Senior Software Architect', 44100, 5800, 610, 740, 1490, 51000, 56000, '2026-08-28'),
(1, 'Instagram', 'ig_004', 'Dark Mode UI Glassmorphism Tutorial Reel', 68200, 8400, 920, 1120, 2400, 78000, 82000, '2026-08-31'),
(1, 'Instagram', 'ig_005', 'Clean Code vs Spaghetti Code Comparison', 31500, 3900, 410, 480, 920, 36000, 39000, '2026-09-01'),
(1, 'Instagram', 'ig_006', 'My Ultimate Developer Morning Routine ☕💻', 49800, 6100, 590, 780, 1340, 55000, 61000, '2026-09-01'),
(1, 'Instagram', 'ig_007', 'Top 5 VS Code Extensions That Save 10 Hours/Week', 74500, 9300, 1040, 1350, 3100, 85000, 89000, '2026-09-02'),
(1, 'Instagram', 'ig_008', 'Interactive Carousel: JavaScript Event Loop Explained Simply', 58000, 7200, 780, 920, 2600, 66000, 71000, '2026-09-02'),
(1, 'Instagram', 'ig_009', 'Why I Switched from Mac to Custom Linux Rig', 63200, 7900, 890, 950, 1820, 72000, 77000, '2026-09-03'),
(1, 'Instagram', 'ig_010', 'Tailwind v4 Cheat Sheet (Save This Post!)', 82000, 10500, 1200, 1680, 4200, 92000, 99000, '2026-09-03'),

-- =================== TIKTOK ===================
(1, 'TikTok', 'tk_001', 'Fast vs Slow Coding Habits POV', 64000, 8200, 730, 940, 2100, 55000, 78000, '2026-08-29'),
(1, 'TikTok', 'tk_002', 'When the Code Works on First Try 😂', 95400, 14200, 1250, 1890, 3400, 84000, 115000, '2026-08-30'),
(1, 'TikTok', 'tk_003', 'Junior vs Senior Dev Debugging Approach', 81200, 11800, 980, 1420, 2950, 72000, 98000, '2026-08-31'),
(1, 'TikTok', 'tk_004', '3 AI Tools Every Programmer Must Use', 112000, 16900, 1540, 2410, 4800, 98000, 134000, '2026-09-01'),
(1, 'TikTok', 'tk_005', 'Why Nobody Talks About Memory Leaks', 73400, 9800, 810, 1120, 2200, 64000, 89000, '2026-09-01'),
(1, 'TikTok', 'tk_006', 'CSS Flexbox in 15 Seconds Flat', 128000, 19400, 1680, 2950, 5600, 110000, 152000, '2026-09-02'),
(1, 'TikTok', 'tk_007', 'Things Clients Say That Keep Me Up at Night', 89000, 13100, 1120, 1640, 2700, 77000, 107000, '2026-09-02'),
(1, 'TikTok', 'tk_008', 'How APIs Actually Talk to Databases (Visualized)', 142000, 21500, 1950, 3400, 6800, 125000, 168000, '2026-09-03'),
(1, 'TikTok', 'tk_009', 'The Dark Secret of Git Merge vs Rebase', 105000, 15600, 1340, 2180, 4100, 91000, 124000, '2026-09-03'),

-- =================== LINKEDIN ===================
(1, 'LinkedIn', 'li_001', 'How I Built and Scaled My Tech Channel to 250K Subscribers', 18200, 1450, 210, 340, 390, 21000, 24000, '2026-08-28'),
(1, 'LinkedIn', 'li_002', 'The Shift from Monolith to Event-Driven Architecture', 24500, 2100, 310, 490, 680, 29000, 31000, '2026-08-30'),
(1, 'LinkedIn', 'li_003', 'Why Technical Documentation Is Your Greatest Career Asset', 15800, 1290, 180, 270, 410, 18000, 21000, '2026-09-01'),
(1, 'LinkedIn', 'li_004', 'Lessons Learned Hiring 50+ Engineers for High-Growth Startups', 29800, 2850, 420, 610, 940, 38000, 38000, '2026-09-01'),
(1, 'LinkedIn', 'li_005', 'Why Senior Developers Write Less Code Than Juniors', 34200, 3200, 480, 710, 1150, 42000, 44000, '2026-09-02'),
(1, 'LinkedIn', 'li_006', 'Engineering Leadership: Balancing Tech Debt and Feature Velocity', 22400, 1980, 260, 380, 590, 27000, 29000, '2026-09-02'),
(1, 'LinkedIn', 'li_007', 'How We Cut Cloud Infrastructure Costs by 42% in Q3', 41500, 4100, 580, 890, 1680, 52000, 55000, '2026-09-03'),
(1, 'LinkedIn', 'li_008', 'Framework Fatigue: Why Foundational Computer Science Always Wins', 31200, 2900, 390, 540, 980, 39000, 41000, '2026-09-03'),

-- =================== X (TWITTER) ===================
(1, 'X', 'x_001', 'Thread: Web Development Trends in 2026 & Beyond 🧵', 14500, 980, 140, 260, 310, 12000, 19500, '2026-08-30'),
(1, 'X', 'x_002', 'Stop using useEffect for data fetching in React 19. Here is why:', 38200, 3150, 490, 840, 1420, 28000, 48000, '2026-08-31'),
(1, 'X', 'x_003', 'TypeScript 5.8 features you will actually use every day:', 22100, 1840, 280, 410, 890, 19000, 29000, '2026-09-01'),
(1, 'X', 'x_004', 'Hot take: 90% of apps do not need microservices. A modular monolith is fine.', 54200, 4900, 820, 1250, 1980, 41000, 68000, '2026-09-02'),
(1, 'X', 'x_005', 'The cleanest SQL query pattern for hierarchical data:', 29400, 2400, 310, 580, 1120, 23000, 37000, '2026-09-02'),
(1, 'X', 'x_006', 'Thread: 10 Linux CLI commands that feel like superpowers 🐧', 48900, 4200, 560, 1140, 2250, 39000, 62000, '2026-09-03'),
(1, 'X', 'x_007', 'If you want to master Node.js, build a custom HTTP server from scratch with net module.', 31500, 2750, 340, 620, 1340, 26000, 42000, '2026-09-03'),

-- =================== FACEBOOK ===================
(1, 'Facebook', 'fb_001', 'Community Q&A: Software Engineering Career Roadmap', 21400, 1680, 240, 190, 320, 25000, 28000, '2026-08-24'),
(1, 'Facebook', 'fb_002', 'Live Stream Replay: Building a Modern SaaS Application', 34200, 2950, 390, 310, 580, 48000, 42000, '2026-08-27'),
(1, 'Facebook', 'fb_003', 'Behind the Scenes: My Studio Recording Equipment', 19800, 1490, 190, 150, 270, 21000, 25000, '2026-09-01'),
(1, 'Facebook', 'fb_004', 'Full Video: Best Practices for API Security in Enterprise Apps', 38900, 3400, 420, 380, 690, 52000, 49000, '2026-09-02'),
(1, 'Facebook', 'fb_005', 'Announcement: CreatorIQ Developer Meetup in Bengaluru this Saturday!', 26500, 2300, 310, 240, 410, 31000, 33000, '2026-09-03');

-- Multi-Platform Audience Demographics
INSERT INTO audiences (creator_id, platform, followers, reach, impressions, gender, age_group, country, city, device_type) VALUES
-- YouTube
(1, 'YouTube', 89900, 120000, 200000, 'Male 62% / Female 38%', '25-34', 'India', 'Bengaluru', 'Desktop'),
(1, 'YouTube', 34200, 48000, 78000, 'Male 58% / Female 42%', '18-24', 'United States', 'San Francisco', 'Desktop'),
(1, 'YouTube', 21500, 29000, 46000, 'Male 65% / Female 35%', '35-44', 'Germany', 'Berlin', 'Desktop'),

-- Instagram
(1, 'Instagram', 80300, 112000, 170000, 'Female 54% / Male 46%', '18-24', 'United States', 'New York', 'Mobile'),
(1, 'Instagram', 62400, 89000, 134000, 'Female 52% / Male 48%', '25-34', 'India', 'Mumbai', 'Mobile'),
(1, 'Instagram', 28900, 41000, 62000, 'Female 58% / Male 42%', '18-24', 'United Kingdom', 'London', 'Mobile'),

-- TikTok
(1, 'TikTok', 78500, 142000, 210000, 'Female 58% / Male 42%', '18-24', 'United States', 'Los Angeles', 'Mobile'),
(1, 'TikTok', 54200, 98000, 148000, 'Female 61% / Male 39%', '18-24', 'Canada', 'Toronto', 'Mobile'),
(1, 'TikTok', 36800, 64000, 98000, 'Male 50% / Female 50%', '25-34', 'Australia', 'Sydney', 'Mobile'),

-- LinkedIn
(1, 'LinkedIn', 38200, 58000, 89000, 'Male 68% / Female 32%', '25-34', 'India', 'Hyderabad', 'Desktop'),
(1, 'LinkedIn', 24600, 39000, 59000, 'Male 64% / Female 36%', '35-44', 'United States', 'Austin', 'Desktop'),
(1, 'LinkedIn', 15800, 25000, 38000, 'Male 70% / Female 30%', '25-34', 'Singapore', 'Singapore', 'Desktop'),

-- X (Twitter)
(1, 'X', 29400, 56000, 84000, 'Male 75% / Female 25%', '25-34', 'United States', 'San Francisco', 'Mobile'),
(1, 'X', 18500, 35000, 53000, 'Male 72% / Female 28%', '18-24', 'India', 'Pune', 'Mobile'),
(1, 'X', 11200, 22000, 34000, 'Male 78% / Female 22%', '25-34', 'United Kingdom', 'Manchester', 'Mobile'),

-- Facebook
(1, 'Facebook', 32400, 48000, 72000, 'Male 52% / Female 48%', '35-44', 'India', 'Chennai', 'Mobile'),
(1, 'Facebook', 21800, 32000, 48000, 'Female 51% / Male 49%', '25-34', 'United States', 'Chicago', 'Mobile'),
(1, 'Facebook', 14500, 21000, 31000, 'Male 55% / Female 45%', '45-54', 'Philippines', 'Manila', 'Mobile');

-- Growth History Data
INSERT INTO growths (creator_id, platform, date, followers, reach) VALUES
(1, 'All', '2026-07-01', 142000, 185000),
(1, 'All', '2026-07-15', 165000, 210000),
(1, 'All', '2026-08-01', 185000, 240000),
(1, 'All', '2026-08-05', 198000, 264000),
(1, 'All', '2026-08-10', 212000, 289000),
(1, 'All', '2026-08-15', 228500, 315000),
(1, 'All', '2026-08-20', 246000, 342000),
(1, 'All', '2026-08-25', 268000, 378000),
(1, 'All', '2026-08-30', 294000, 420000),
(1, 'All', '2026-09-01', 315000, 465000),
(1, 'All', '2026-09-03', 348000, 520000);

-- Revenue Transactions Across Platforms
INSERT INTO revenues (creator_id, platform, amount, revenue_date, source, description) VALUES
(1, 'YouTube', 45000, '2026-08-01', 'YouTube AdSense', 'August Monthly Video Monetization Payout'),
(1, 'YouTube', 60000, '2026-08-12', 'Brand Sponsorship', 'DevTools Pro Summer Video Integration'),
(1, 'Instagram', 35000, '2026-08-15', 'Brand Sponsorship', 'ErgoChair Tech Reel & Story Feature'),
(1, 'Multi-Platform', 18500, '2026-08-18', 'Affiliate Marketing', 'Hardware & IDE Extension Commissions'),
(1, 'TikTok', 28000, '2026-08-22', 'Brand Sponsorship', 'CloudScale Hosting TikTok Showcase Series'),
(1, 'Multi-Platform', 25000, '2026-08-25', 'Course Sales', 'Full Stack Creator Bootcamp Downloads'),
(1, 'LinkedIn', 40000, '2026-09-01', 'Consulting & B2B', 'Enterprise Tech Architecture Advisory'),
(1, 'Instagram', 48000, '2026-09-01', 'Brand Sponsorship', 'AudioTech Pro Wireless Earbuds Carousel Feature'),
(1, 'TikTok', 32000, '2026-09-02', 'Creator Rewards', 'TikTok Creator Rewards Program Viral Payout'),
(1, 'X', 15000, '2026-09-02', 'Subscriptions & Tips', 'X Super Follows & Monetized Thread Sponsorship'),
(1, 'Facebook', 22000, '2026-09-03', 'Meta In-Stream Ads', 'Facebook Stars & In-Stream Video Ad Revenue');

-- Active Sponsorship Contracts
INSERT INTO sponsorships (creator_id, platform, brand_name, campaign, contract_value, start_date, end_date, status, payment_status) VALUES
(1, 'YouTube', 'DevTools Pro', 'Summer Dev Kit Launch', 60000, '2026-08-01', '2026-08-31', 'Active', 'Paid'),
(1, 'Instagram', 'ErgoChair Tech', 'Product Showcase Reel & Carousel', 35000, '2026-08-10', '2026-09-10', 'Active', 'Paid'),
(1, 'TikTok', 'CloudScale Hosting', 'Serverless Platform Awareness', 28000, '2026-08-15', '2026-09-15', 'Active', 'Pending'),
(1, 'LinkedIn', 'Enterprise SaaS Co', 'Executive B2B Tech Series', 40000, '2026-09-01', '2026-09-30', 'Active', 'Pending'),
(1, 'Instagram', 'AudioTech Pro', 'Wireless Studio Audio Equipment', 48000, '2026-09-01', '2026-09-25', 'Active', 'Paid'),
(1, 'TikTok', 'Voxel AI', 'Generative UI Code Assistant Challenge', 38000, '2026-09-02', '2026-09-28', 'Active', 'Pending'),
(1, 'X', 'SecureCode Vault', 'DevSecOps Awareness Thread Series', 18000, '2026-09-03', '2026-09-18', 'Active', 'Paid');

-- Notifications
INSERT INTO notifications (creator_id, notification_type, title, message, is_read) VALUES
(1, 'performance', 'Viral Content Alert (TikTok)', 'Content "How APIs Actually Talk to Databases" exploded to 142,000 views!', FALSE),
(1, 'growth', 'Major Multi-Platform Milestone', 'Congratulations! Combined multi-platform audience crossed 348,000 followers.', FALSE),
(1, 'revenue', 'Sponsorship Payout Confirmed', 'Brand sponsorship payment of ₹48,000 cleared from AudioTech Pro.', FALSE),
(1, 'engagement', 'Instagram Engagement Spike', 'Instagram Reels engagement reached 15.8% this week with over 10,000 saves.', TRUE),
(1, 'performance', 'High LinkedIn Reach', 'LinkedIn post "How We Cut Cloud Infrastructure Costs" reached 41,500 professionals.', TRUE);
