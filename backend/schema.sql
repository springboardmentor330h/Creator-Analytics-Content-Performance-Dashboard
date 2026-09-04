-- CreatorIQ Multi-Platform Analytics Database Schema (PostgreSQL)

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS sponsorships CASCADE;
DROP TABLE IF EXISTS revenues CASCADE;
DROP TABLE IF EXISTS growths CASCADE;
DROP TABLE IF EXISTS audiences CASCADE;
DROP TABLE IF EXISTS contents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'Creator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contents Table (Multi-Platform Content Records)
CREATE TABLE contents (
    id SERIAL PRIMARY KEY,
    creator_id INT REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- YouTube, Instagram, TikTok, Facebook, LinkedIn, X
    external_content_id VARCHAR(100),
    content_title VARCHAR(255) NOT NULL,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    comments INT DEFAULT 0,
    shares INT DEFAULT 0,
    saves INT DEFAULT 0,
    watch_time INT DEFAULT 0, -- Seconds or Minutes
    reach INT DEFAULT 0,
    published_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audiences Table (Demographics & Regional Reach per Platform)
CREATE TABLE audiences (
    id SERIAL PRIMARY KEY,
    creator_id INT REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    followers INT DEFAULT 0,
    reach INT DEFAULT 0,
    impressions INT DEFAULT 0,
    gender VARCHAR(20) DEFAULT 'Mixed',
    age_group VARCHAR(20) DEFAULT '18-34',
    country VARCHAR(50) DEFAULT 'Global',
    city VARCHAR(50) DEFAULT 'Global',
    device_type VARCHAR(30) DEFAULT 'Mobile',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Growth Velocity Table
CREATE TABLE growths (
    id SERIAL PRIMARY KEY,
    creator_id INT REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) DEFAULT 'All',
    date DATE NOT NULL,
    followers INT DEFAULT 0,
    reach INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Monetization & Revenue Transactions Table
CREATE TABLE revenues (
    id SERIAL PRIMARY KEY,
    creator_id INT REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) DEFAULT 'Multi-Platform',
    amount DECIMAL(12, 2) NOT NULL,
    revenue_date DATE NOT NULL,
    source VARCHAR(100) NOT NULL, -- AdSense, Brand Sponsorship, Course Sales, Affiliate, Merchandise
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sponsorship Deals Table
CREATE TABLE sponsorships (
    id SERIAL PRIMARY KEY,
    creator_id INT REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    brand_name VARCHAR(100) NOT NULL,
    campaign VARCHAR(150) NOT NULL,
    contract_value DECIMAL(12, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'Active', -- Active, Completed, Pending
    payment_status VARCHAR(30) DEFAULT 'Pending', -- Paid, Pending, Overdue
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications & Alerts Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    creator_id INT REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL, -- performance, engagement, growth, revenue, custom
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast multi-platform querying
CREATE INDEX idx_contents_platform ON contents(platform);
CREATE INDEX idx_audiences_platform ON audiences(platform);
CREATE INDEX idx_growths_date ON growths(date);
CREATE INDEX idx_revenues_date ON revenues(revenue_date);
