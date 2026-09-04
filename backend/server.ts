import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

function generateJWT(payload: Record<string, any>, secret: string = 'supersecretjwtkey_creatoriq_2026'): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodeBase64Url = (obj: Record<string, any> | string) => {
    const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
    return Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const encodedHeader = encodeBase64Url(header);
  const encodedPayload = encodeBase64Url(payload);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// In-Memory Database Models & State
// ==========================================

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
}

interface ContentItem {
  id: number;
  creator_id: number;
  platform: string;
  external_content_id?: string;
  content_title: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  watch_time: number;
  reach: number;
  published_date: string;
}

interface AudienceItem {
  id: number;
  creator_id: number;
  platform: string;
  followers: number;
  reach: number;
  impressions: number;
  gender: string;
  age_group: string;
  country: string;
  city: string;
  device_type: string;
}

interface GrowthItem {
  id: number;
  creator_id: number;
  date: string;
  followers: number;
  reach: number;
}

interface RevenueItem {
  id: number;
  creator_id: number;
  amount: number;
  revenue_date: string;
  source: string;
  description: string;
}

interface SponsorshipItem {
  id: number;
  creator_id: number;
  brand_name: string;
  campaign: string;
  contract_value: number;
  start_date: string;
  end_date: string;
  status: string;
  payment_status: string;
}

interface NotificationItem {
  id: number;
  creator_id: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Initial Datasets
let users: User[] = [
  {
    id: 1,
    full_name: 'Monika Chowdary',
    email: 'monika@example.com',
    role: 'Creator',
  },
];

let contents: ContentItem[] = [
  // =================== YOUTUBE ===================
  {
    id: 1,
    creator_id: 1,
    platform: 'YouTube',
    external_content_id: 'yt_001',
    content_title: 'Full Stack React 19 & Node Tutorial 2026',
    views: 45200,
    likes: 3800,
    comments: 420,
    shares: 310,
    saves: 950,
    watch_time: 184000,
    reach: 52000,
    published_date: '2026-08-10',
  },
  {
    id: 2,
    creator_id: 1,
    platform: 'YouTube',
    external_content_id: 'yt_002',
    content_title: 'Top 10 Developer Productivity Hacks',
    views: 28400,
    likes: 2150,
    comments: 290,
    shares: 180,
    saves: 620,
    watch_time: 98000,
    reach: 34000,
    published_date: '2026-08-18',
  },
  {
    id: 3,
    creator_id: 1,
    platform: 'YouTube',
    external_content_id: 'yt_003',
    content_title: 'Building Production Microservices with Node.js',
    views: 62100,
    likes: 5400,
    comments: 610,
    shares: 490,
    saves: 1420,
    watch_time: 245000,
    reach: 71000,
    published_date: '2026-08-25',
  },
  {
    id: 4,
    creator_id: 1,
    platform: 'YouTube',
    external_content_id: 'yt_004',
    content_title: 'System Design Deep Dive: Scaling to 1M Users',
    views: 84000,
    likes: 7800,
    comments: 890,
    shares: 710,
    saves: 2300,
    watch_time: 312000,
    reach: 95000,
    published_date: '2026-08-29',
  },
  {
    id: 5,
    creator_id: 1,
    platform: 'YouTube',
    external_content_id: 'yt_005',
    content_title: 'Complete PostgreSQL Architecture & Query Optimization',
    views: 39500,
    likes: 3100,
    comments: 340,
    shares: 220,
    saves: 880,
    watch_time: 156000,
    reach: 44000,
    published_date: '2026-09-01',
  },
  {
    id: 6,
    creator_id: 1,
    platform: 'YouTube',
    external_content_id: 'yt_006',
    content_title: 'Docker & Kubernetes for Frontend Engineers',
    views: 51200,
    likes: 4300,
    comments: 480,
    shares: 350,
    saves: 1150,
    watch_time: 192000,
    reach: 58000,
    published_date: '2026-09-02',
  },
  {
    id: 7,
    creator_id: 1,
    platform: 'YouTube',
    external_content_id: 'yt_007',
    content_title: 'How to Build an AI Agent in 20 Minutes',
    views: 98500,
    likes: 9200,
    comments: 1150,
    shares: 840,
    saves: 2900,
    watch_time: 368000,
    reach: 112000,
    published_date: '2026-09-03',
  },

  // =================== INSTAGRAM ===================
  {
    id: 8,
    creator_id: 1,
    platform: 'Instagram',
    external_content_id: 'ig_001',
    content_title: 'Minimalist Desk Setup Tour & Ergonomics Guide',
    views: 38500,
    likes: 4900,
    comments: 540,
    shares: 620,
    saves: 1100,
    watch_time: 42000,
    reach: 48000,
    published_date: '2026-08-22',
  },
  {
    id: 9,
    creator_id: 1,
    platform: 'Instagram',
    external_content_id: 'ig_002',
    content_title: '5 Modern CSS Tricks You Need in 2026',
    views: 52000,
    likes: 6300,
    comments: 680,
    shares: 890,
    saves: 1850,
    watch_time: 61000,
    reach: 64000,
    published_date: '2026-08-26',
  },
  {
    id: 10,
    creator_id: 1,
    platform: 'Instagram',
    external_content_id: 'ig_003',
    content_title: 'Day in the Life of a Senior Software Architect',
    views: 44100,
    likes: 5800,
    comments: 610,
    shares: 740,
    saves: 1490,
    watch_time: 51000,
    reach: 56000,
    published_date: '2026-08-28',
  },
  {
    id: 11,
    creator_id: 1,
    platform: 'Instagram',
    external_content_id: 'ig_004',
    content_title: 'Dark Mode UI Glassmorphism Tutorial Reel',
    views: 68200,
    likes: 8400,
    comments: 920,
    shares: 1120,
    saves: 2400,
    watch_time: 78000,
    reach: 82000,
    published_date: '2026-08-31',
  },
  {
    id: 12,
    creator_id: 1,
    platform: 'Instagram',
    external_content_id: 'ig_005',
    content_title: 'Clean Code vs Spaghetti Code Comparison',
    views: 31500,
    likes: 3900,
    comments: 410,
    shares: 480,
    saves: 920,
    watch_time: 36000,
    reach: 39000,
    published_date: '2026-09-01',
  },
  {
    id: 13,
    creator_id: 1,
    platform: 'Instagram',
    external_content_id: 'ig_006',
    content_title: 'My Ultimate Developer Morning Routine ☕💻',
    views: 49800,
    likes: 6100,
    comments: 590,
    shares: 780,
    saves: 1340,
    watch_time: 55000,
    reach: 61000,
    published_date: '2026-09-01',
  },
  {
    id: 14,
    creator_id: 1,
    platform: 'Instagram',
    external_content_id: 'ig_007',
    content_title: 'Top 5 VS Code Extensions That Save 10 Hours/Week',
    views: 74500,
    likes: 9300,
    comments: 1040,
    shares: 1350,
    saves: 3100,
    watch_time: 85000,
    reach: 89000,
    published_date: '2026-09-02',
  },
  {
    id: 15,
    creator_id: 1,
    platform: 'Instagram',
    external_content_id: 'ig_008',
    content_title: 'Interactive Carousel: JavaScript Event Loop Explained Simply',
    views: 58000,
    likes: 7200,
    comments: 780,
    shares: 920,
    saves: 2600,
    watch_time: 66000,
    reach: 71000,
    published_date: '2026-09-02',
  },
  {
    id: 16,
    creator_id: 1,
    platform: 'Instagram',
    external_content_id: 'ig_009',
    content_title: 'Why I Switched from Mac to Custom Linux Rig',
    views: 63200,
    likes: 7900,
    comments: 890,
    shares: 950,
    saves: 1820,
    watch_time: 72000,
    reach: 77000,
    published_date: '2026-09-03',
  },
  {
    id: 17,
    creator_id: 1,
    platform: 'Instagram',
    external_content_id: 'ig_010',
    content_title: 'Tailwind v4 Cheat Sheet (Save This Post!)',
    views: 82000,
    likes: 10500,
    comments: 1200,
    shares: 1680,
    saves: 4200,
    watch_time: 92000,
    reach: 99000,
    published_date: '2026-09-03',
  },

  // =================== TIKTOK ===================
  {
    id: 18,
    creator_id: 1,
    platform: 'TikTok',
    external_content_id: 'tk_001',
    content_title: 'Fast vs Slow Coding Habits POV',
    views: 64000,
    likes: 8200,
    comments: 730,
    shares: 940,
    saves: 2100,
    watch_time: 55000,
    reach: 78000,
    published_date: '2026-08-29',
  },
  {
    id: 19,
    creator_id: 1,
    platform: 'TikTok',
    external_content_id: 'tk_002',
    content_title: 'When the Code Works on First Try 😂',
    views: 95400,
    likes: 14200,
    comments: 1250,
    shares: 1890,
    saves: 3400,
    watch_time: 84000,
    reach: 115000,
    published_date: '2026-08-30',
  },
  {
    id: 20,
    creator_id: 1,
    platform: 'TikTok',
    external_content_id: 'tk_003',
    content_title: 'Junior vs Senior Dev Debugging Approach',
    views: 81200,
    likes: 11800,
    comments: 980,
    shares: 1420,
    saves: 2950,
    watch_time: 72000,
    reach: 98000,
    published_date: '2026-08-31',
  },
  {
    id: 21,
    creator_id: 1,
    platform: 'TikTok',
    external_content_id: 'tk_004',
    content_title: '3 AI Tools Every Programmer Must Use',
    views: 112000,
    likes: 16900,
    comments: 1540,
    shares: 2410,
    saves: 4800,
    watch_time: 98000,
    reach: 134000,
    published_date: '2026-09-01',
  },
  {
    id: 22,
    creator_id: 1,
    platform: 'TikTok',
    external_content_id: 'tk_005',
    content_title: 'Why Nobody Talks About Memory Leaks',
    views: 73400,
    likes: 9800,
    comments: 810,
    shares: 1120,
    saves: 2200,
    watch_time: 64000,
    reach: 89000,
    published_date: '2026-09-01',
  },
  {
    id: 23,
    creator_id: 1,
    platform: 'TikTok',
    external_content_id: 'tk_006',
    content_title: 'CSS Flexbox in 15 Seconds Flat',
    views: 128000,
    likes: 19400,
    comments: 1680,
    shares: 2950,
    saves: 5600,
    watch_time: 110000,
    reach: 152000,
    published_date: '2026-09-02',
  },
  {
    id: 24,
    creator_id: 1,
    platform: 'TikTok',
    external_content_id: 'tk_007',
    content_title: 'Things Clients Say That Keep Me Up at Night',
    views: 89000,
    likes: 13100,
    comments: 1120,
    shares: 1640,
    saves: 2700,
    watch_time: 77000,
    reach: 107000,
    published_date: '2026-09-02',
  },
  {
    id: 25,
    creator_id: 1,
    platform: 'TikTok',
    external_content_id: 'tk_008',
    content_title: 'How APIs Actually Talk to Databases (Visualized)',
    views: 142000,
    likes: 21500,
    comments: 1950,
    shares: 3400,
    saves: 6800,
    watch_time: 125000,
    reach: 168000,
    published_date: '2026-09-03',
  },
  {
    id: 26,
    creator_id: 1,
    platform: 'TikTok',
    external_content_id: 'tk_009',
    content_title: 'The Dark Secret of Git Merge vs Rebase',
    views: 105000,
    likes: 15600,
    comments: 1340,
    shares: 2180,
    saves: 4100,
    watch_time: 91000,
    reach: 124000,
    published_date: '2026-09-03',
  },

  // =================== LINKEDIN ===================
  {
    id: 27,
    creator_id: 1,
    platform: 'LinkedIn',
    external_content_id: 'li_001',
    content_title: 'How I Built and Scaled My Tech Channel to 250K Subscribers',
    views: 18200,
    likes: 1450,
    comments: 210,
    shares: 340,
    saves: 390,
    watch_time: 21000,
    reach: 24000,
    published_date: '2026-08-28',
  },
  {
    id: 28,
    creator_id: 1,
    platform: 'LinkedIn',
    external_content_id: 'li_002',
    content_title: 'The Shift from Monolith to Event-Driven Architecture',
    views: 24500,
    likes: 2100,
    comments: 310,
    shares: 490,
    saves: 680,
    watch_time: 29000,
    reach: 31000,
    published_date: '2026-08-30',
  },
  {
    id: 29,
    creator_id: 1,
    platform: 'LinkedIn',
    external_content_id: 'li_003',
    content_title: 'Why Technical Documentation Is Your Greatest Career Asset',
    views: 15800,
    likes: 1290,
    comments: 180,
    shares: 270,
    saves: 410,
    watch_time: 18000,
    reach: 21000,
    published_date: '2026-09-01',
  },
  {
    id: 30,
    creator_id: 1,
    platform: 'LinkedIn',
    external_content_id: 'li_004',
    content_title: 'Lessons Learned Hiring 50+ Engineers for High-Growth Startups',
    views: 29800,
    likes: 2850,
    comments: 420,
    shares: 610,
    saves: 940,
    watch_time: 38000,
    reach: 38000,
    published_date: '2026-09-01',
  },
  {
    id: 31,
    creator_id: 1,
    platform: 'LinkedIn',
    external_content_id: 'li_005',
    content_title: 'Why Senior Developers Write Less Code Than Juniors',
    views: 34200,
    likes: 3200,
    comments: 480,
    shares: 710,
    saves: 1150,
    watch_time: 42000,
    reach: 44000,
    published_date: '2026-09-02',
  },
  {
    id: 32,
    creator_id: 1,
    platform: 'LinkedIn',
    external_content_id: 'li_006',
    content_title: 'Engineering Leadership: Balancing Tech Debt and Feature Velocity',
    views: 22400,
    likes: 1980,
    comments: 260,
    shares: 380,
    saves: 590,
    watch_time: 27000,
    reach: 29000,
    published_date: '2026-09-02',
  },
  {
    id: 33,
    creator_id: 1,
    platform: 'LinkedIn',
    external_content_id: 'li_007',
    content_title: 'How We Cut Cloud Infrastructure Costs by 42% in Q3',
    views: 41500,
    likes: 4100,
    comments: 580,
    shares: 890,
    saves: 1680,
    watch_time: 52000,
    reach: 55000,
    published_date: '2026-09-03',
  },
  {
    id: 34,
    creator_id: 1,
    platform: 'LinkedIn',
    external_content_id: 'li_008',
    content_title: 'Framework Fatigue: Why Foundational Computer Science Always Wins',
    views: 31200,
    likes: 2900,
    comments: 390,
    shares: 540,
    saves: 980,
    watch_time: 39000,
    reach: 41000,
    published_date: '2026-09-03',
  },

  // =================== X (TWITTER) ===================
  {
    id: 35,
    creator_id: 1,
    platform: 'X',
    external_content_id: 'x_001',
    content_title: 'Thread: Web Development Trends in 2026 & Beyond 🧵',
    views: 14500,
    likes: 980,
    comments: 140,
    shares: 260,
    saves: 310,
    watch_time: 12000,
    reach: 19500,
    published_date: '2026-08-30',
  },
  {
    id: 36,
    creator_id: 1,
    platform: 'X',
    external_content_id: 'x_002',
    content_title: 'Stop using useEffect for data fetching in React 19. Here is why:',
    views: 38200,
    likes: 3150,
    comments: 490,
    shares: 840,
    saves: 1420,
    watch_time: 28000,
    reach: 48000,
    published_date: '2026-08-31',
  },
  {
    id: 37,
    creator_id: 1,
    platform: 'X',
    external_content_id: 'x_003',
    content_title: 'TypeScript 5.8 features you will actually use every day:',
    views: 22100,
    likes: 1840,
    comments: 280,
    shares: 410,
    saves: 890,
    watch_time: 19000,
    reach: 29000,
    published_date: '2026-09-01',
  },
  {
    id: 38,
    creator_id: 1,
    platform: 'X',
    external_content_id: 'x_004',
    content_title: 'Hot take: 90% of apps do not need microservices. A modular monolith is fine.',
    views: 54200,
    likes: 4900,
    comments: 820,
    shares: 1250,
    saves: 1980,
    watch_time: 41000,
    reach: 68000,
    published_date: '2026-09-02',
  },
  {
    id: 39,
    creator_id: 1,
    platform: 'X',
    external_content_id: 'x_005',
    content_title: 'The cleanest SQL query pattern for hierarchical data:',
    views: 29400,
    likes: 2400,
    comments: 310,
    shares: 580,
    saves: 1120,
    watch_time: 23000,
    reach: 37000,
    published_date: '2026-09-02',
  },
  {
    id: 40,
    creator_id: 1,
    platform: 'X',
    external_content_id: 'x_006',
    content_title: 'Thread: 10 Linux CLI commands that feel like superpowers 🐧',
    views: 48900,
    likes: 4200,
    comments: 560,
    shares: 1140,
    saves: 2250,
    watch_time: 39000,
    reach: 62000,
    published_date: '2026-09-03',
  },
  {
    id: 41,
    creator_id: 1,
    platform: 'X',
    external_content_id: 'x_007',
    content_title: 'If you want to master Node.js, build a custom HTTP server from scratch with net module.',
    views: 31500,
    likes: 2750,
    comments: 340,
    shares: 620,
    saves: 1340,
    watch_time: 26000,
    reach: 42000,
    published_date: '2026-09-03',
  },

  // =================== FACEBOOK ===================
  {
    id: 42,
    creator_id: 1,
    platform: 'Facebook',
    external_content_id: 'fb_001',
    content_title: 'Community Q&A: Software Engineering Career Roadmap',
    views: 21400,
    likes: 1680,
    comments: 240,
    shares: 190,
    saves: 320,
    watch_time: 25000,
    reach: 28000,
    published_date: '2026-08-24',
  },
  {
    id: 43,
    creator_id: 1,
    platform: 'Facebook',
    external_content_id: 'fb_002',
    content_title: 'Live Stream Replay: Building a Modern SaaS Application',
    views: 34200,
    likes: 2950,
    comments: 390,
    shares: 310,
    saves: 580,
    watch_time: 48000,
    reach: 42000,
    published_date: '2026-08-27',
  },
  {
    id: 44,
    creator_id: 1,
    platform: 'Facebook',
    external_content_id: 'fb_003',
    content_title: 'Behind the Scenes: My Studio Recording Equipment',
    views: 19800,
    likes: 1490,
    comments: 190,
    shares: 150,
    saves: 270,
    watch_time: 21000,
    reach: 25000,
    published_date: '2026-09-01',
  },
  {
    id: 45,
    creator_id: 1,
    platform: 'Facebook',
    external_content_id: 'fb_004',
    content_title: 'Full Video: Best Practices for API Security in Enterprise Apps',
    views: 38900,
    likes: 3400,
    comments: 420,
    shares: 380,
    saves: 690,
    watch_time: 52000,
    reach: 49000,
    published_date: '2026-09-02',
  },
  {
    id: 46,
    creator_id: 1,
    platform: 'Facebook',
    external_content_id: 'fb_005',
    content_title: 'Announcement: CreatorIQ Developer Meetup in Bengaluru this Saturday!',
    views: 26500,
    likes: 2300,
    comments: 310,
    shares: 240,
    saves: 410,
    watch_time: 31000,
    reach: 33000,
    published_date: '2026-09-03',
  },
];

let audiences: AudienceItem[] = [
  // YouTube
  {
    id: 1,
    creator_id: 1,
    platform: 'YouTube',
    followers: 89900,
    reach: 120000,
    impressions: 200000,
    gender: 'Male 62% / Female 38%',
    age_group: '25-34',
    country: 'India',
    city: 'Bengaluru',
    device_type: 'Desktop',
  },
  {
    id: 2,
    creator_id: 1,
    platform: 'YouTube',
    followers: 34200,
    reach: 48000,
    impressions: 78000,
    gender: 'Male 58% / Female 42%',
    age_group: '18-24',
    country: 'United States',
    city: 'San Francisco',
    device_type: 'Desktop',
  },
  {
    id: 3,
    creator_id: 1,
    platform: 'YouTube',
    followers: 21500,
    reach: 29000,
    impressions: 46000,
    gender: 'Male 65% / Female 35%',
    age_group: '35-44',
    country: 'Germany',
    city: 'Berlin',
    device_type: 'Desktop',
  },

  // Instagram
  {
    id: 4,
    creator_id: 1,
    platform: 'Instagram',
    followers: 80300,
    reach: 112000,
    impressions: 170000,
    gender: 'Female 54% / Male 46%',
    age_group: '18-24',
    country: 'United States',
    city: 'New York',
    device_type: 'Mobile',
  },
  {
    id: 5,
    creator_id: 1,
    platform: 'Instagram',
    followers: 62400,
    reach: 89000,
    impressions: 134000,
    gender: 'Female 52% / Male 48%',
    age_group: '25-34',
    country: 'India',
    city: 'Mumbai',
    device_type: 'Mobile',
  },
  {
    id: 6,
    creator_id: 1,
    platform: 'Instagram',
    followers: 28900,
    reach: 41000,
    impressions: 62000,
    gender: 'Female 58% / Male 42%',
    age_group: '18-24',
    country: 'United Kingdom',
    city: 'London',
    device_type: 'Mobile',
  },

  // TikTok
  {
    id: 7,
    creator_id: 1,
    platform: 'TikTok',
    followers: 78500,
    reach: 142000,
    impressions: 210000,
    gender: 'Female 58% / Male 42%',
    age_group: '18-24',
    country: 'United States',
    city: 'Los Angeles',
    device_type: 'Mobile',
  },
  {
    id: 8,
    creator_id: 1,
    platform: 'TikTok',
    followers: 54200,
    reach: 98000,
    impressions: 148000,
    gender: 'Female 61% / Male 39%',
    age_group: '18-24',
    country: 'Canada',
    city: 'Toronto',
    device_type: 'Mobile',
  },
  {
    id: 9,
    creator_id: 1,
    platform: 'TikTok',
    followers: 36800,
    reach: 64000,
    impressions: 98000,
    gender: 'Male 50% / Female 50%',
    age_group: '25-34',
    country: 'Australia',
    city: 'Sydney',
    device_type: 'Mobile',
  },

  // LinkedIn
  {
    id: 10,
    creator_id: 1,
    platform: 'LinkedIn',
    followers: 38200,
    reach: 58000,
    impressions: 89000,
    gender: 'Male 68% / Female 32%',
    age_group: '25-34',
    country: 'India',
    city: 'Hyderabad',
    device_type: 'Desktop',
  },
  {
    id: 11,
    creator_id: 1,
    platform: 'LinkedIn',
    followers: 24600,
    reach: 39000,
    impressions: 59000,
    gender: 'Male 64% / Female 36%',
    age_group: '35-44',
    country: 'United States',
    city: 'Austin',
    device_type: 'Desktop',
  },
  {
    id: 12,
    creator_id: 1,
    platform: 'LinkedIn',
    followers: 15800,
    reach: 25000,
    impressions: 38000,
    gender: 'Male 70% / Female 30%',
    age_group: '25-34',
    country: 'Singapore',
    city: 'Singapore',
    device_type: 'Desktop',
  },

  // X (Twitter)
  {
    id: 13,
    creator_id: 1,
    platform: 'X',
    followers: 29400,
    reach: 56000,
    impressions: 84000,
    gender: 'Male 75% / Female 25%',
    age_group: '25-34',
    country: 'United States',
    city: 'San Francisco',
    device_type: 'Mobile',
  },
  {
    id: 14,
    creator_id: 1,
    platform: 'X',
    followers: 18500,
    reach: 35000,
    impressions: 53000,
    gender: 'Male 72% / Female 28%',
    age_group: '18-24',
    country: 'India',
    city: 'Pune',
    device_type: 'Mobile',
  },
  {
    id: 15,
    creator_id: 1,
    platform: 'X',
    followers: 11200,
    reach: 22000,
    impressions: 34000,
    gender: 'Male 78% / Female 22%',
    age_group: '25-34',
    country: 'United Kingdom',
    city: 'Manchester',
    device_type: 'Mobile',
  },

  // Facebook
  {
    id: 16,
    creator_id: 1,
    platform: 'Facebook',
    followers: 32400,
    reach: 48000,
    impressions: 72000,
    gender: 'Male 52% / Female 48%',
    age_group: '35-44',
    country: 'India',
    city: 'Chennai',
    device_type: 'Mobile',
  },
  {
    id: 17,
    creator_id: 1,
    platform: 'Facebook',
    followers: 21800,
    reach: 32000,
    impressions: 48000,
    gender: 'Female 51% / Male 49%',
    age_group: '25-34',
    country: 'United States',
    city: 'Chicago',
    device_type: 'Mobile',
  },
  {
    id: 18,
    creator_id: 1,
    platform: 'Facebook',
    followers: 14500,
    reach: 21000,
    impressions: 31000,
    gender: 'Male 55% / Female 45%',
    age_group: '45-54',
    country: 'Philippines',
    city: 'Manila',
    device_type: 'Mobile',
  },
];

let growths: GrowthItem[] = [
  { id: 1, creator_id: 1, date: '2026-07-01', followers: 142000, reach: 185000 },
  { id: 2, creator_id: 1, date: '2026-07-15', followers: 165000, reach: 210000 },
  { id: 3, creator_id: 1, date: '2026-08-01', followers: 185000, reach: 240000 },
  { id: 4, creator_id: 1, date: '2026-08-05', followers: 198000, reach: 264000 },
  { id: 5, creator_id: 1, date: '2026-08-10', followers: 212000, reach: 289000 },
  { id: 6, creator_id: 1, date: '2026-08-15', followers: 228500, reach: 315000 },
  { id: 7, creator_id: 1, date: '2026-08-20', followers: 246000, reach: 342000 },
  { id: 8, creator_id: 1, date: '2026-08-25', followers: 268000, reach: 378000 },
  { id: 9, creator_id: 1, date: '2026-08-30', followers: 294000, reach: 420000 },
  { id: 10, creator_id: 1, date: '2026-09-01', followers: 315000, reach: 465000 },
  { id: 11, creator_id: 1, date: '2026-09-03', followers: 348000, reach: 520000 },
];

let revenues: RevenueItem[] = [
  {
    id: 1,
    creator_id: 1,
    platform: 'YouTube',
    amount: 45000,
    revenue_date: '2026-08-01',
    source: 'YouTube AdSense',
    description: 'August Monthly Video Monetization Payout',
  },
  {
    id: 2,
    creator_id: 1,
    platform: 'YouTube',
    amount: 60000,
    revenue_date: '2026-08-12',
    source: 'Brand Sponsorship',
    description: 'DevTools Pro Summer Video Integration',
  },
  {
    id: 3,
    creator_id: 1,
    platform: 'Instagram',
    amount: 35000,
    revenue_date: '2026-08-15',
    source: 'Brand Sponsorship',
    description: 'ErgoChair Tech Reel & Story Feature',
  },
  {
    id: 4,
    creator_id: 1,
    platform: 'Multi-Platform',
    amount: 18500,
    revenue_date: '2026-08-18',
    source: 'Affiliate Marketing',
    description: 'Hardware & IDE Extension Commissions',
  },
  {
    id: 5,
    creator_id: 1,
    platform: 'TikTok',
    amount: 28000,
    revenue_date: '2026-08-22',
    source: 'Brand Sponsorship',
    description: 'CloudScale Hosting TikTok Showcase Series',
  },
  {
    id: 6,
    creator_id: 1,
    platform: 'Multi-Platform',
    amount: 25000,
    revenue_date: '2026-08-25',
    source: 'Course Sales',
    description: 'Full Stack Creator Bootcamp Downloads',
  },
  {
    id: 7,
    creator_id: 1,
    platform: 'LinkedIn',
    amount: 40000,
    revenue_date: '2026-09-01',
    source: 'Consulting & B2B',
    description: 'Enterprise Tech Architecture Advisory',
  },
  {
    id: 8,
    creator_id: 1,
    platform: 'Instagram',
    amount: 48000,
    revenue_date: '2026-09-01',
    source: 'Brand Sponsorship',
    description: 'AudioTech Pro Wireless Studio Feature',
  },
  {
    id: 9,
    creator_id: 1,
    platform: 'TikTok',
    amount: 32000,
    revenue_date: '2026-09-02',
    source: 'Creator Rewards',
    description: 'TikTok Creator Rewards Program Viral Payout',
  },
  {
    id: 10,
    creator_id: 1,
    platform: 'X',
    amount: 15000,
    revenue_date: '2026-09-02',
    source: 'Subscriptions & Tips',
    description: 'X Super Follows & Monetized Thread Series',
  },
  {
    id: 11,
    creator_id: 1,
    platform: 'Facebook',
    amount: 22000,
    revenue_date: '2026-09-03',
    source: 'Meta In-Stream Ads',
    description: 'Facebook Stars & In-Stream Video Ad Revenue',
  },
];

let sponsorships: SponsorshipItem[] = [
  {
    id: 1,
    creator_id: 1,
    platform: 'YouTube',
    brand_name: 'DevTools Pro',
    campaign: 'Summer Dev Kit Launch',
    contract_value: 60000,
    start_date: '2026-08-01',
    end_date: '2026-08-31',
    status: 'Active',
    payment_status: 'Paid',
  },
  {
    id: 2,
    creator_id: 1,
    platform: 'Instagram',
    brand_name: 'ErgoChair Tech',
    campaign: 'Product Showcase Reel & Carousel',
    contract_value: 35000,
    start_date: '2026-08-10',
    end_date: '2026-09-10',
    status: 'Active',
    payment_status: 'Paid',
  },
  {
    id: 3,
    creator_id: 1,
    platform: 'TikTok',
    brand_name: 'CloudScale Hosting',
    campaign: 'Serverless Platform Awareness',
    contract_value: 28000,
    start_date: '2026-08-15',
    end_date: '2026-09-15',
    status: 'Active',
    payment_status: 'Pending',
  },
  {
    id: 4,
    creator_id: 1,
    platform: 'LinkedIn',
    brand_name: 'Enterprise SaaS Co',
    campaign: 'Executive B2B Tech Series',
    contract_value: 40000,
    start_date: '2026-09-01',
    end_date: '2026-09-30',
    status: 'Active',
    payment_status: 'Pending',
  },
  {
    id: 5,
    creator_id: 1,
    platform: 'Instagram',
    brand_name: 'AudioTech Pro',
    campaign: 'Wireless Studio Audio Equipment',
    contract_value: 48000,
    start_date: '2026-09-01',
    end_date: '2026-09-25',
    status: 'Active',
    payment_status: 'Paid',
  },
  {
    id: 6,
    creator_id: 1,
    platform: 'TikTok',
    brand_name: 'Voxel AI',
    campaign: 'Generative UI Code Assistant Challenge',
    contract_value: 38000,
    start_date: '2026-09-02',
    end_date: '2026-09-28',
    status: 'Active',
    payment_status: 'Pending',
  },
  {
    id: 7,
    creator_id: 1,
    platform: 'X',
    brand_name: 'SecureCode Vault',
    campaign: 'DevSecOps Awareness Thread Series',
    contract_value: 18000,
    start_date: '2026-09-03',
    end_date: '2026-09-18',
    status: 'Active',
    payment_status: 'Paid',
  },
];

let notifications: NotificationItem[] = [
  {
    id: 1,
    creator_id: 1,
    notification_type: 'performance',
    title: 'Viral Content Alert (TikTok)',
    message: "Content 'How APIs Actually Talk to Databases' exploded to 142,000 views and 21,500 likes!",
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    creator_id: 1,
    notification_type: 'growth',
    title: 'Major Multi-Platform Milestone',
    message: 'Congratulations! Your combined multi-platform audience crossed 348,000 followers.',
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    creator_id: 1,
    notification_type: 'revenue',
    title: 'Sponsorship Payout Confirmed',
    message: 'Brand sponsorship payment of ₹48,000 cleared from AudioTech Pro.',
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    creator_id: 1,
    notification_type: 'engagement',
    title: 'Instagram Engagement Spike',
    message: 'Instagram Reels engagement reached 15.8% this week with over 10,000 saves across carousels.',
    is_read: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    creator_id: 1,
    notification_type: 'performance',
    title: 'High LinkedIn Reach',
    message: 'LinkedIn post "How We Cut Cloud Infrastructure Costs" reached 41,500 professionals.',
    is_read: true,
    created_at: new Date().toISOString(),
  },
];

const connectedPlatforms: Record<string, { account_name: string }> = {
  YouTube: { account_name: '@monikacreator' },
  Instagram: { account_name: '@monika_dev' },
  TikTok: { account_name: '@monikacodes' },
  LinkedIn: { account_name: 'Monika Chowdary' },
  X: { account_name: '@monika_tweets' },
  Facebook: { account_name: 'Monika Tech Community' },
};

// ==========================================
// Helper Calculation Functions
// ==========================================

function computeContentReport(creatorId: number = 1, platformFilter?: string) {
  let userContent = contents.filter((c) => c.creator_id === creatorId);
  if (platformFilter && platformFilter !== 'All' && platformFilter !== 'All Platforms') {
    const target = platformFilter.toLowerCase();
    userContent = userContent.filter((c) => (c.platform || '').toLowerCase() === target);
  }

  const total_views = userContent.reduce((sum, c) => sum + (c.views || 0), 0);
  const total_likes = userContent.reduce((sum, c) => sum + (c.likes || 0), 0);
  const total_comments = userContent.reduce((sum, c) => sum + (c.comments || 0), 0);
  const total_shares = userContent.reduce((sum, c) => sum + (c.shares || 0), 0);
  const total_reach = userContent.reduce((sum, c) => sum + (c.reach || 0), 0);

  return {
    total_content: userContent.length,
    total_views,
    total_likes,
    total_comments,
    total_shares,
    total_reach,
    content: userContent.map((c) => ({
      id: c.id,
      title: c.content_title,
      platform: c.platform,
      views: c.views,
      likes: c.likes,
      comments: c.comments,
      shares: c.shares,
      saves: c.saves,
      reach: c.reach,
      published_date: c.published_date,
    })),
  };
}

function computePlatformComparison(creatorId: number = 1) {
  const userContent = contents.filter((c) => c.creator_id === creatorId);
  const map: Record<string, any> = {};

  for (const c of userContent) {
    const pKey = c.platform || 'Unknown';
    if (!map[pKey]) {
      map[pKey] = {
        platform: pKey,
        content_count: 0,
        total_views: 0,
        total_likes: 0,
        total_comments: 0,
        total_shares: 0,
        total_reach: 0,
        total_engagement: 0,
      };
    }
    map[pKey].content_count += 1;
    map[pKey].total_views += c.views || 0;
    map[pKey].total_likes += c.likes || 0;
    map[pKey].total_comments += c.comments || 0;
    map[pKey].total_shares += c.shares || 0;
    map[pKey].total_reach += c.reach || 0;
    map[pKey].total_engagement += (c.likes || 0) + (c.comments || 0) + (c.shares || 0) + (c.saves || 0);
  }

  const results = Object.values(map).map((p: any) => {
    const engagement_rate = p.total_reach > 0 ? Number(((p.total_engagement / p.total_reach) * 100).toFixed(2)) : 0;
    return {
      ...p,
      engagement_rate,
    };
  });

  return results.sort((a, b) => b.engagement_rate - a.engagement_rate);
}

function computeCreatorReport(creatorId: number = 1, platformFilter?: string) {
  let userAudience = audiences.filter((a) => a.creator_id === creatorId);
  let userRevenue = revenues.filter((r) => r.creator_id === creatorId);
  let userGrowth = growths.filter((g) => g.creator_id === creatorId);
  let userSponsorships = sponsorships.filter((s) => s.creator_id === creatorId);

  if (platformFilter && platformFilter !== 'All' && platformFilter !== 'All Platforms') {
    const pf = platformFilter.toLowerCase();
    userAudience = userAudience.filter((a) => (a.platform || '').toLowerCase() === pf);
    userRevenue = userRevenue.filter((r) => (r.platform || '').toLowerCase() === pf || r.platform === 'Multi-Platform');
    userSponsorships = userSponsorships.filter((s) => (s.platform || '').toLowerCase() === pf);
  }

  const total_revenue = userRevenue.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const total_contract_value = userSponsorships.reduce((sum, s) => sum + (Number(s.contract_value) || 0), 0);

  return {
    creator_id: creatorId,
    platform_filter: platformFilter || 'All',
    content_performance: computeContentReport(creatorId, platformFilter),
    audience_analytics: {
      total_records: userAudience.length,
      data: userAudience,
    },
    revenue_analytics: {
      total_revenue,
      total_records: userRevenue.length,
      data: userRevenue,
    },
    growth_trends: {
      total_records: userGrowth.length,
      data: userGrowth,
    },
    platform_comparison: computePlatformComparison(creatorId),
    sponsorships: {
      total_sponsorships: userSponsorships.length,
      total_contract_value,
      data: userSponsorships,
    },
  };
}

// ==========================================
// OpenAPI 3.1 Specification Definition
// ==========================================

const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "CreatorIQ API",
    version: "0.1.0",
    description: "Enterprise Multi-Channel Analytics, Demographics, Monetization, Sponsorship Pipeline, and Notifications Engine.",
  },
  servers: [
    {
      url: "/",
      description: "Default API Server",
    },
  ],
  paths: {
    "/users": {
      get: {
        tags: ["default"],
        summary: "Get Users",
        operationId: "get_users_users_get",
        responses: { 200: { description: "Successful Response" } },
      },
      post: {
        tags: ["default"],
        summary: "Create User",
        operationId: "create_user_users_post",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/users/search": {
      get: {
        tags: ["default"],
        summary: "Search Users",
        operationId: "search_users_users_search_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/users/{user_id}": {
      get: {
        tags: ["default"],
        summary: "Get User",
        operationId: "get_user_users__user_id__get",
        responses: { 200: { description: "Successful Response" } },
      },
      put: {
        tags: ["default"],
        summary: "Update User",
        operationId: "update_user_users__user_id__put",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/auth/register": {
      post: {
        tags: ["default"],
        summary: "Register",
        operationId: "register_auth_register_post",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserCreate",
              },
            },
          },
        },
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/auth/login": {
      post: {
        tags: ["default"],
        summary: "Login",
        operationId: "login_auth_login_post",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UserLogin",
              },
            },
            "application/x-www-form-urlencoded": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string", example: "monika@example.com" },
                  password: { type: "string", example: "password123" },
                },
                required: ["username", "password"],
              },
            },
          },
        },
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/auth/me": {
      get: {
        tags: ["default"],
        summary: "Get Me",
        operationId: "get_me_auth_me_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/": {
      get: {
        tags: ["default"],
        summary: "Home",
        operationId: "home__get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/content": {
      get: {
        tags: ["Content"],
        summary: "Get All Content",
        operationId: "get_all_content_content_get",
        responses: { 200: { description: "Successful Response" } },
      },
      post: {
        tags: ["Content"],
        summary: "Create Content",
        operationId: "create_content_content_post",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/content/{content_id}": {
      get: {
        tags: ["Content"],
        summary: "Get Content",
        operationId: "get_content_content__content_id__get",
        responses: { 200: { description: "Successful Response" } },
      },
      put: {
        tags: ["Content"],
        summary: "Update Content",
        operationId: "update_content_content__content_id__put",
        responses: { 200: { description: "Successful Response" } },
      },
      delete: {
        tags: ["Content"],
        summary: "Delete Content",
        operationId: "delete_content_content__content_id__delete",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/analytics/content/{content_id}/engagement": {
      get: {
        tags: ["Analytics"],
        summary: "Content Engagement",
        operationId: "content_engagement_analytics_content__content_id__engagement_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/analytics/top-content": {
      get: {
        tags: ["Analytics"],
        summary: "Top Content",
        operationId: "top_content_analytics_top_content_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/analytics/platform-performance": {
      get: {
        tags: ["Analytics"],
        summary: "Platform Performance",
        operationId: "platform_performance_analytics_platform_performance_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/analytics/platform-comparison": {
      get: {
        tags: ["Analytics"],
        summary: "Platform Comparison",
        operationId: "platform_comparison_analytics_platform_comparison_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/analytics/summary": {
      get: {
        tags: ["Analytics"],
        summary: "Dashboard Summary",
        operationId: "dashboard_summary_analytics_summary_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/analytics/chart/engagement": {
      get: {
        tags: ["Analytics"],
        summary: "Engagement Chart",
        operationId: "engagement_chart_analytics_chart_engagement_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/analytics/chart/followers": {
      get: {
        tags: ["Analytics"],
        summary: "Follower Growth Chart",
        operationId: "follower_growth_chart_analytics_chart_followers_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/analytics/audience": {
      get: {
        tags: ["Analytics"],
        summary: "Audience Analytics",
        operationId: "audience_analytics_analytics_audience_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/analytics/growth": {
      get: {
        tags: ["Analytics"],
        summary: "Growth Analytics",
        operationId: "growth_analytics_analytics_growth_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/analytics/audience-trends": {
      get: {
        tags: ["Analytics"],
        summary: "Audience Trends",
        operationId: "audience_trends_analytics_audience_trends_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/audience": {
      get: {
        tags: ["Audience"],
        summary: "Get All Audience",
        operationId: "get_all_audience_audience_get",
        responses: { 200: { description: "Successful Response" } },
      },
      post: {
        tags: ["Audience"],
        summary: "Create Audience",
        operationId: "create_audience_audience_post",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/audience/{id}": {
      get: {
        tags: ["Audience"],
        summary: "Get Audience By Id",
        operationId: "get_audience_by_id_audience__id__get",
        responses: { 200: { description: "Successful Response" } },
      },
      put: {
        tags: ["Audience"],
        summary: "Update Audience",
        operationId: "update_audience_audience__id__put",
        responses: { 200: { description: "Successful Response" } },
      },
      delete: {
        tags: ["Audience"],
        summary: "Delete Audience",
        operationId: "delete_audience_audience__id__delete",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/growth": {
      get: {
        tags: ["Audience"],
        summary: "Get All Growth",
        operationId: "get_all_growth_growth_get",
        responses: { 200: { description: "Successful Response" } },
      },
      post: {
        tags: ["Audience"],
        summary: "Create Growth",
        operationId: "create_growth_growth_post",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/social/connect": {
      post: {
        tags: ["Social Media"],
        summary: "Connect Platform",
        operationId: "connect_platform_social_connect_post",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/social/platforms": {
      get: {
        tags: ["Social Media"],
        summary: "Get Connected Platforms",
        operationId: "get_connected_platforms_social_platforms_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/social/sync": {
      post: {
        tags: ["Social Media"],
        summary: "Synchronize Platform",
        operationId: "synchronize_platform_social_sync_post",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/social/youtube/sync": {
      post: {
        tags: ["Social Media"],
        summary: "Synchronize Youtube",
        operationId: "synchronize_youtube_social_youtube_sync_post",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/revenue": {
      get: {
        tags: ["Revenue"],
        summary: "Get Revenue Api",
        operationId: "get_revenue_api_revenue_get",
        responses: { 200: { description: "Successful Response" } },
      },
      post: {
        tags: ["Revenue"],
        summary: "Create Revenue Api",
        operationId: "create_revenue_api_revenue_post",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/revenue/analytics/summary": {
      get: {
        tags: ["Revenue"],
        summary: "Revenue Summary Api",
        operationId: "revenue_summary_api_revenue_analytics_summary_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/revenue/analytics/by-source": {
      get: {
        tags: ["Revenue"],
        summary: "Revenue By Source Api",
        operationId: "revenue_by_source_api_revenue_analytics_by_source_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/revenue/analytics/monthly": {
      get: {
        tags: ["Revenue"],
        summary: "Monthly Revenue Api",
        operationId: "monthly_revenue_api_revenue_analytics_monthly_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/sponsorships": {
      post: {
        tags: ["Sponsorships"],
        summary: "Create Sponsorship Api",
        operationId: "create_sponsorship_api_sponsorships_post",
        responses: { 200: { description: "Successful Response" } },
      },
      get: {
        tags: ["Sponsorships"],
        summary: "Get Sponsorships Api",
        operationId: "get_sponsorships_api_sponsorships_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/sponsorships/{sponsorship_id}": {
      get: {
        tags: ["Sponsorships"],
        summary: "Get Sponsorship By Id Api",
        operationId: "get_sponsorship_by_id_api_sponsorships__sponsorship_id__get",
        responses: { 200: { description: "Successful Response" } },
      },
      put: {
        tags: ["Sponsorships"],
        summary: "Update Sponsorship Api",
        operationId: "update_sponsorship_api_sponsorships__sponsorship_id__put",
        responses: { 200: { description: "Successful Response" } },
      },
      delete: {
        tags: ["Sponsorships"],
        summary: "Delete Sponsorship Api",
        operationId: "delete_sponsorship_api_sponsorships__sponsorship_id__delete",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Get Notifications Api",
        operationId: "get_notifications_api_notifications_get",
        responses: { 200: { description: "Successful Response" } },
      },
      post: {
        tags: ["Notifications"],
        summary: "Create Notification Api",
        operationId: "create_notification_api_notifications_post",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/notifications/unread-count": {
      get: {
        tags: ["Notifications"],
        summary: "Get Unread Count Api",
        operationId: "get_unread_count_api_notifications_unread_count_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/notifications/mark-all-read": {
      put: {
        tags: ["Notifications"],
        summary: "Mark All Read Api",
        operationId: "mark_all_read_api_notifications_mark_all_read_put",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/notifications/alerts/performance/{content_id}": {
      post: {
        tags: ["Notifications"],
        summary: "Performance Alert Api",
        operationId: "performance_alert_api_notifications_alerts_performance__content_id__post",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/notifications/alerts/engagement/{content_id}": {
      post: {
        tags: ["Notifications"],
        summary: "Engagement Alert Api",
        operationId: "engagement_alert_api_notifications_alerts_engagement__content_id__post",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/notifications/alerts/revenue": {
      post: {
        tags: ["Notifications"],
        summary: "Revenue Alert Api",
        operationId: "revenue_alert_api_notifications_alerts_revenue_post",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/notifications/{notification_id}": {
      get: {
        tags: ["Notifications"],
        summary: "Get Notification Api",
        operationId: "get_notification_api_notifications__notification_id__get",
        responses: { 200: { description: "Successful Response" } },
      },
      put: {
        tags: ["Notifications"],
        summary: "Update Notification Api",
        operationId: "update_notification_api_notifications__notification_id__put",
        responses: { 200: { description: "Successful Response" } },
      },
      delete: {
        tags: ["Notifications"],
        summary: "Delete Notification Api",
        operationId: "delete_notification_api_notifications__notification_id__delete",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/reports": {
      get: {
        tags: ["Reports"],
        summary: "Get Creator Report",
        operationId: "get_creator_report_reports_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/reports/content": {
      get: {
        tags: ["Reports"],
        summary: "Get Content Report",
        operationId: "get_content_report_reports_content_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/reports/audience": {
      get: {
        tags: ["Reports"],
        summary: "Get Audience Analytics Report",
        operationId: "get_audience_analytics_report_reports_audience_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/reports/revenue": {
      get: {
        tags: ["Reports"],
        summary: "Get Revenue Analytics Report",
        operationId: "get_revenue_analytics_report_reports_revenue_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/reports/growth": {
      get: {
        tags: ["Reports"],
        summary: "Get Growth Trends Report",
        operationId: "get_growth_trends_report_reports_growth_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/reports/platforms": {
      get: {
        tags: ["Reports"],
        summary: "Get Platform Comparison Report",
        operationId: "get_platform_comparison_report_reports_platforms_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/reports/export/pdf": {
      get: {
        tags: ["Reports"],
        summary: "Export Pdf Report",
        operationId: "export_pdf_report_reports_export_pdf_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
    "/reports/export/excel": {
      get: {
        tags: ["Reports"],
        summary: "Export Excel Report",
        operationId: "export_excel_report_reports_export_excel_get",
        responses: { 200: { description: "Successful Response" } },
      },
    },
  },
  components: {
    schemas: {
      AudienceCreate: {
        type: "object",
        properties: {
          platform: { type: "string" },
          followers: { type: "number" },
          reach: { type: "number" },
          impressions: { type: "number" },
          gender: { type: "string" },
          age_group: { type: "string" },
          country: { type: "string" },
        },
      },
      AudienceUpdate: {
        type: "object",
        properties: {
          platform: { type: "string" },
          followers: { type: "number" },
          reach: { type: "number" },
          impressions: { type: "number" },
          gender: { type: "string" },
          age_group: { type: "string" },
          country: { type: "string" },
        },
      },
      ContentCreate: {
        type: "object",
        properties: {
          platform: { type: "string" },
          content_title: { type: "string" },
          views: { type: "number" },
          likes: { type: "number" },
          comments: { type: "number" },
          shares: { type: "number" },
          saves: { type: "number" },
          reach: { type: "number" },
          published_date: { type: "string" },
        },
      },
      ContentUpdate: {
        type: "object",
        properties: {
          platform: { type: "string" },
          content_title: { type: "string" },
          views: { type: "number" },
          likes: { type: "number" },
          comments: { type: "number" },
          shares: { type: "number" },
          saves: { type: "number" },
          reach: { type: "number" },
          published_date: { type: "string" },
        },
      },
      GrowthCreate: {
        type: "object",
        properties: {
          date: { type: "string" },
          followers: { type: "number" },
          reach: { type: "number" },
        },
      },
      HTTPValidationError: {
        type: "object",
        properties: {
          detail: {
            type: "array",
            items: { $ref: "#/components/schemas/ValidationError" },
          },
        },
      },
      NotificationCreate: {
        type: "object",
        properties: {
          title: { type: "string" },
          message: { type: "string" },
          notification_type: { type: "string" },
        },
      },
      NotificationUpdate: {
        type: "object",
        properties: {
          title: { type: "string" },
          message: { type: "string" },
          notification_type: { type: "string" },
          is_read: { type: "boolean" },
        },
      },
      RevenueCreate: {
        type: "object",
        properties: {
          amount: { type: "number" },
          source: { type: "string" },
          description: { type: "string" },
          revenue_date: { type: "string" },
        },
      },
      RevenueUpdate: {
        type: "object",
        properties: {
          amount: { type: "number" },
          source: { type: "string" },
          description: { type: "string" },
          revenue_date: { type: "string" },
        },
      },
      SponsorshipCreate: {
        type: "object",
        properties: {
          brand_name: { type: "string" },
          campaign: { type: "string" },
          contract_value: { type: "number" },
          start_date: { type: "string" },
          end_date: { type: "string" },
          status: { type: "string" },
          payment_status: { type: "string" },
        },
      },
      SponsorshipUpdate: {
        type: "object",
        properties: {
          brand_name: { type: "string" },
          campaign: { type: "string" },
          contract_value: { type: "number" },
          start_date: { type: "string" },
          end_date: { type: "string" },
          status: { type: "string" },
          payment_status: { type: "string" },
        },
      },
      UserCreate: {
        type: "object",
        properties: {
          full_name: { type: "string" },
          email: { type: "string" },
          role: { type: "string" },
        },
      },
      UserLogin: {
        type: "object",
        properties: {
          email: { type: "string" },
          password: { type: "string" },
        },
      },
      UserUpdate: {
        type: "object",
        properties: {
          full_name: { type: "string" },
          email: { type: "string" },
          role: { type: "string" },
        },
      },
      ValidationError: {
        type: "object",
        properties: {
          loc: { type: "array", items: { type: "string" } },
          msg: { type: "string" },
          type: { type: "string" },
        },
      },
    },
    securitySchemes: {
      HTTPBearer: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      OAuth2PasswordBearer: {
        type: "oauth2",
        flows: {
          password: {
            tokenUrl: "/auth/login",
            scopes: {},
          },
        },
      },
    },
  },
  security: [
    {
      HTTPBearer: [],
    },
  ],
};

// ==========================================
// Swagger UI HTML Handlers
// ==========================================

app.get('/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

app.get(['/docs', '/docs/', '/api/docs'], (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>CreatorIQ API - Swagger UI</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; font-family: sans-serif; }
    .topbar { display: none !important; }
    .swagger-ui .info .title { font-family: system-ui, sans-serif; color: #1e293b; }
    .swagger-ui .scheme-container { background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/openapi.json',
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        deepLinking: true,
        showExtensions: true,
        showCommonExtensions: true
      });
    };
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// ==========================================
// API Routes (Dual prefix support / and /api)
// ==========================================

const registerRoutes = (prefix = '') => {
  // Reports
  app.get(`${prefix}/reports`, (req: Request, res: Response) => {
    const platform = req.query.platform as string | undefined;
    res.json(computeCreatorReport(1, platform));
  });

  app.get(`${prefix}/reports/content`, (req: Request, res: Response) => {
    const platform = req.query.platform as string | undefined;
    res.json(computeContentReport(1, platform));
  });

  app.get(`${prefix}/reports/audience`, (req: Request, res: Response) => {
    const platform = req.query.platform as string | undefined;
    let userAudience = audiences.filter((a) => a.creator_id === 1);
    if (platform && platform !== 'All' && platform !== 'All Platforms') {
      userAudience = userAudience.filter((a) => (a.platform || '').toLowerCase() === platform.toLowerCase());
    }
    const total_followers = userAudience.reduce((sum, a) => sum + (Number(a.followers) || 0), 0);
    const total_reach = userAudience.reduce((sum, a) => sum + (Number(a.reach) || 0), 0);
    const total_impressions = userAudience.reduce((sum, a) => sum + (Number(a.impressions) || 0), 0);
    res.json({
      total_records: userAudience.length,
      total_followers,
      total_reach,
      total_impressions,
      data: userAudience,
    });
  });

  app.get(`${prefix}/reports/revenue`, (req: Request, res: Response) => {
    const platform = req.query.platform as string | undefined;
    let userRevenue = revenues.filter((r) => r.creator_id === 1);
    if (platform && platform !== 'All' && platform !== 'All Platforms') {
      userRevenue = userRevenue.filter(
        (r) => r.platform.toLowerCase() === platform.toLowerCase() || r.platform === 'Multi-Platform'
      );
    }
    const total_revenue = userRevenue.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    res.json({
      total_revenue,
      total_records: userRevenue.length,
      data: userRevenue,
    });
  });

  app.get(`${prefix}/reports/growth`, (req: Request, res: Response) => {
    const platform = req.query.platform as string | undefined;
    let userGrowth = growths.filter((g) => g.creator_id === 1);
    if (platform && platform !== 'All' && platform !== 'All Platforms') {
      userGrowth = userGrowth.filter(
        (g) => g.platform.toLowerCase() === platform.toLowerCase() || g.platform === 'All'
      );
    }
    res.json({
      total_records: userGrowth.length,
      data: userGrowth,
    });
  });

  app.get(`${prefix}/reports/platforms`, (req: Request, res: Response) => {
    res.json({
      data: computePlatformComparison(1),
    });
  });

  app.get(`${prefix}/reports/export/pdf`, (req: Request, res: Response) => {
    try {
      const report = computeCreatorReport(1);
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.text('CreatorIQ Analytics Report', 14, 22);

      doc.setFontSize(11);
      doc.text(`Generated: ${new Date().toLocaleDateString()} | Creator ID: ${report.creator_id}`, 14, 30);

      doc.setFontSize(14);
      doc.text('Content Performance Summary', 14, 42);

      doc.setFontSize(10);
      const content = report.content_performance;
      doc.text(`Total Content: ${content.total_content}`, 14, 50);
      doc.text(`Total Views: ${content.total_views.toLocaleString()}`, 14, 56);
      doc.text(`Total Likes: ${content.total_likes.toLocaleString()}`, 14, 62);
      doc.text(`Total Comments: ${content.total_comments.toLocaleString()}`, 14, 68);
      doc.text(`Total Reach: ${content.total_reach.toLocaleString()}`, 14, 74);

      doc.setFontSize(14);
      doc.text('Revenue Analytics', 14, 88);

      doc.setFontSize(10);
      doc.text(`Total Revenue: INR ${report.revenue_analytics.total_revenue.toLocaleString()}`, 14, 96);
      doc.text(`Total Transactions: ${report.revenue_analytics.total_records}`, 14, 102);

      doc.setFontSize(14);
      doc.text('Platform Comparison', 14, 116);

      let y = 124;
      doc.setFontSize(10);
      doc.text('Platform | Content | Views | Reach | Engagement Rate', 14, y);
      y += 6;

      for (const p of report.platform_comparison) {
        doc.text(`${p.platform} | ${p.content_count} posts | ${p.total_views.toLocaleString()} views | ${p.total_reach.toLocaleString()} reach | ${p.engagement_rate}%`, 14, y);
        y += 6;
      }

      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=creator_report.pdf');
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('PDF export error:', error);
      res.status(500).json({ error: 'Failed to generate PDF report' });
    }
  });

  app.get(`${prefix}/reports/export/excel`, (req: Request, res: Response) => {
    try {
      const report = computeCreatorReport(1);
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ['CreatorIQ Analytics Export'],
        ['Creator ID', report.creator_id],
        ['Export Date', new Date().toISOString()],
        [],
        ['KPI', 'Value'],
        ['Total Content', report.content_performance.total_content],
        ['Total Views', report.content_performance.total_views],
        ['Total Likes', report.content_performance.total_likes],
        ['Total Comments', report.content_performance.total_comments],
        ['Total Shares', report.content_performance.total_shares],
        ['Total Reach', report.content_performance.total_reach],
        ['Total Revenue', report.revenue_analytics.total_revenue],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      const wsContent = XLSX.utils.json_to_sheet(report.content_performance.content);
      XLSX.utils.book_append_sheet(wb, wsContent, 'Content Performance');

      const wsRevenue = XLSX.utils.json_to_sheet(report.revenue_analytics.data);
      XLSX.utils.book_append_sheet(wb, wsRevenue, 'Revenue');

      const wsPlatforms = XLSX.utils.json_to_sheet(report.platform_comparison);
      XLSX.utils.book_append_sheet(wb, wsPlatforms, 'Platforms');

      const wsSponsorships = XLSX.utils.json_to_sheet(report.sponsorships.data);
      XLSX.utils.book_append_sheet(wb, wsSponsorships, 'Sponsorships');

      const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=creator_report.xlsx');
      res.send(excelBuffer);
    } catch (error: any) {
      console.error('Excel export error:', error);
      res.status(500).json({ error: 'Failed to generate Excel report' });
    }
  });

  // Users & Auth
  app.get(`${prefix}/users`, (req: Request, res: Response) => {
    res.json(users);
  });

  app.post(`${prefix}/users`, (req: Request, res: Response) => {
    const { full_name, email, role } = req.body;
    const newUser: User = {
      id: users.length + 1,
      full_name: full_name || 'New Creator',
      email: email || 'user@example.com',
      role: role || 'Creator',
    };
    users.push(newUser);
    res.status(201).json(newUser);
  });

  app.get(`${prefix}/users/search`, (req: Request, res: Response) => {
    const q = ((req.query.q || req.query.email || req.query.full_name || '') as string).toLowerCase();
    const matches = users.filter(
      (u) => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
    );
    res.json(matches);
  });

  app.get(`${prefix}/users/me`, (req: Request, res: Response) => {
    res.json(users[0]);
  });

  app.get(`${prefix}/users/:user_id`, (req: Request, res: Response) => {
    const user = users.find((u) => u.id === Number(req.params.user_id));
    if (!user) return res.status(404).json({ detail: 'User not found' });
    res.json(user);
  });

  app.put(`${prefix}/users/:user_id`, (req: Request, res: Response) => {
    const id = Number(req.params.user_id);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return res.status(404).json({ detail: 'User not found' });
    users[idx] = { ...users[idx], ...req.body };
    res.json(users[idx]);
  });

  app.get(`${prefix}/auth/me`, (req: Request, res: Response) => {
    res.json(users[0]);
  });

  app.post(`${prefix}/auth/login`, (req: Request, res: Response) => {
    const email = req.body?.email || req.body?.username || 'monika@example.com';
    const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || users[0];
    const now = Math.floor(Date.now() / 1000);
    const token = generateJWT({
      sub: user.email,
      id: user.id,
      name: user.full_name,
      role: user.role,
      iat: now,
      exp: now + 86400 * 30, // 30 days
    });

    res.json({
      access_token: token,
      token_type: 'bearer',
      user: user,
    });
  });

  app.post(`${prefix}/auth/register`, (req: Request, res: Response) => {
    const { full_name, email, role } = req.body;
    const newUser: User = {
      id: users.length + 1,
      full_name: full_name || 'New Creator',
      email: email || 'user@example.com',
      role: role || 'Creator',
    };
    users.push(newUser);
    res.status(201).json({
      message: 'User registered successfully',
      data: newUser,
    });
  });

  // Notifications
  app.get(`${prefix}/notifications`, (req: Request, res: Response) => {
    res.json(notifications);
  });

  app.get(`${prefix}/notifications/unread-count`, (req: Request, res: Response) => {
    const unread = notifications.filter((n) => !n.is_read).length;
    res.json({ unread_count: unread });
  });

  app.put(`${prefix}/notifications/mark-all-read`, (req: Request, res: Response) => {
    notifications = notifications.map((n) => ({ ...n, is_read: true }));
    res.json({
      message: 'All notifications marked as read',
      updated_count: notifications.length,
    });
  });

  app.post(`${prefix}/notifications/check-alerts`, (req: Request, res: Response) => {
    const newAlert: NotificationItem = {
      id: notifications.length + 1,
      creator_id: 1,
      notification_type: 'performance',
      title: 'Live Alert Sync Triggered',
      message: `System updated live metrics across ${contents.length} published pieces of creator content.`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    notifications.unshift(newAlert);

    res.json({
      message: 'Alert check completed. 1 new alert generated.',
      new_count: 1,
      total: notifications.length,
      data: notifications,
    });
  });

  app.post(`${prefix}/notifications`, (req: Request, res: Response) => {
    const { title, message, notification_type } = req.body;
    const newNotif: NotificationItem = {
      id: notifications.length + 1,
      creator_id: 1,
      notification_type: notification_type || 'custom',
      title: title || 'New Alert',
      message: message || 'System generated notification',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    notifications.unshift(newNotif);
    res.status(201).json(newNotif);
  });

  app.get(`${prefix}/notifications/:id`, (req: Request, res: Response) => {
    const item = notifications.find((n) => n.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: 'Notification not found' });
    res.json({ data: item });
  });

  app.put(`${prefix}/notifications/:id`, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const idx = notifications.findIndex((n) => n.id === id);
    if (idx === -1) return res.status(404).json({ detail: 'Notification not found' });

    if (req.body.is_read !== undefined) {
      notifications[idx].is_read = req.body.is_read;
    }
    res.json({ message: 'Notification updated successfully', data: notifications[idx] });
  });

  app.delete(`${prefix}/notifications/:id`, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    notifications = notifications.filter((n) => n.id !== id);
    res.json({ message: 'Notification deleted successfully' });
  });

  // Sponsorships
  app.get(`${prefix}/sponsorships`, (req: Request, res: Response) => {
    res.json({
      total: sponsorships.length,
      data: sponsorships,
    });
  });

  app.post(`${prefix}/sponsorships`, (req: Request, res: Response) => {
    const { brand_name, campaign, contract_value, start_date, end_date, status, payment_status } = req.body;
    const newItem: SponsorshipItem = {
      id: sponsorships.length + 1,
      creator_id: 1,
      brand_name: brand_name || 'Brand Partner',
      campaign: campaign || 'Campaign',
      contract_value: Number(contract_value) || 0,
      start_date: start_date || new Date().toISOString().split('T')[0],
      end_date: end_date || new Date().toISOString().split('T')[0],
      status: status || 'Active',
      payment_status: payment_status || 'Pending',
    };
    sponsorships.push(newItem);
    res.status(201).json(newItem);
  });

  app.get(`${prefix}/sponsorships/:id`, (req: Request, res: Response) => {
    const item = sponsorships.find((s) => s.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: 'Sponsorship record not found' });
    res.json({ data: item });
  });

  app.put(`${prefix}/sponsorships/:id`, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const idx = sponsorships.findIndex((s) => s.id === id);
    if (idx === -1) return res.status(404).json({ detail: 'Sponsorship record not found' });
    sponsorships[idx] = { ...sponsorships[idx], ...req.body };
    res.json({ message: 'Sponsorship updated successfully', data: sponsorships[idx] });
  });

  app.delete(`${prefix}/sponsorships/:id`, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    sponsorships = sponsorships.filter((s) => s.id !== id);
    res.json({ message: 'Sponsorship deleted successfully' });
  });

  // Revenue
  app.get(`${prefix}/revenue`, (req: Request, res: Response) => {
    res.json({
      total: revenues.length,
      data: revenues,
    });
  });

  app.get(`${prefix}/revenue/analytics/summary`, (req: Request, res: Response) => {
    const total = revenues.reduce((sum, r) => sum + r.amount, 0);
    res.json({ total_revenue: total, total_records: revenues.length });
  });

  app.get(`${prefix}/revenue/analytics/by-source`, (req: Request, res: Response) => {
    const map: Record<string, number> = {};
    for (const r of revenues) {
      map[r.source] = (map[r.source] || 0) + r.amount;
    }
    const data = Object.entries(map).map(([source, amount]) => ({ source, amount }));
    res.json({ data });
  });

  app.get(`${prefix}/revenue/analytics/monthly`, (req: Request, res: Response) => {
    res.json({
      data: [
        { month: '2026-06', amount: 98000 },
        { month: '2026-07', amount: 124000 },
        { month: '2026-08', amount: 148500 },
      ],
    });
  });

  app.get(`${prefix}/revenue/analytics/trend`, (req: Request, res: Response) => {
    res.json({
      trend: '+19.7%',
      direction: 'up',
    });
  });

  app.post(`${prefix}/revenue`, (req: Request, res: Response) => {
    const { amount, revenue_date, source, description } = req.body;
    const newItem: RevenueItem = {
      id: revenues.length + 1,
      creator_id: 1,
      amount: Number(amount) || 0,
      revenue_date: revenue_date || new Date().toISOString().split('T')[0],
      source: source || 'Direct',
      description: description || '',
    };
    revenues.push(newItem);
    res.status(201).json(newItem);
  });

  // Content
  app.get(`${prefix}/content`, (req: Request, res: Response) => {
    const platform = req.query.platform as string | undefined;
    let list = contents;
    if (platform && platform !== 'All' && platform !== 'All Platforms') {
      list = list.filter((c) => c.platform.toLowerCase() === platform.toLowerCase());
    }
    res.json({
      total: list.length,
      data: list,
    });
  });

  app.post(`${prefix}/content`, (req: Request, res: Response) => {
    const newItem: ContentItem = {
      id: contents.length + 1,
      creator_id: 1,
      platform: req.body.platform || 'YouTube',
      content_title: req.body.content_title || req.body.title || 'Untitled',
      views: Number(req.body.views) || 0,
      likes: Number(req.body.likes) || 0,
      comments: Number(req.body.comments) || 0,
      shares: Number(req.body.shares) || 0,
      saves: Number(req.body.saves) || 0,
      watch_time: Number(req.body.watch_time) || 0,
      reach: Number(req.body.reach) || (Number(req.body.views) ? Math.round(Number(req.body.views) * 1.15) : 0),
      published_date: req.body.published_date || new Date().toISOString().split('T')[0],
    };
    contents.push(newItem);
    res.status(201).json({ message: 'Content created successfully', data: newItem });
  });

  // Audience & Growth
  app.get(`${prefix}/audience`, (req: Request, res: Response) => {
    const platform = req.query.platform as string | undefined;
    let list = audiences;
    if (platform && platform !== 'All' && platform !== 'All Platforms') {
      list = list.filter((a) => a.platform.toLowerCase() === platform.toLowerCase());
    }
    res.json({
      total: list.length,
      data: list,
    });
  });

  app.get(`${prefix}/growth`, (req: Request, res: Response) => {
    const platform = req.query.platform as string | undefined;
    let list = growths;
    if (platform && platform !== 'All' && platform !== 'All Platforms') {
      list = list.filter((g) => g.platform.toLowerCase() === platform.toLowerCase() || g.platform === 'All');
    }
    res.json({
      total: list.length,
      data: list,
    });
  });

  // Analytics Endpoints
  app.get(`${prefix}/analytics/summary`, (req: Request, res: Response) => {
    const platform = req.query.platform as string | undefined;
    const rep = computeContentReport(1, platform);
    const avgEngagement = rep.total_reach > 0 ? Number((((rep.total_likes + rep.total_comments + rep.total_shares) / rep.total_reach) * 100).toFixed(2)) : 0;
    res.json({
      ...rep,
      average_engagement_rate: avgEngagement || 9.8,
    });
  });

  app.get(`${prefix}/analytics/top-content`, (req: Request, res: Response) => {
    const platform = req.query.platform as string | undefined;
    const rep = computeContentReport(1, platform);
    res.json(rep.content.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5));
  });

  app.get(`${prefix}/analytics/platform-comparison`, (req: Request, res: Response) => {
    res.json(computePlatformComparison(1));
  });

  app.get(`${prefix}/analytics/platform-performance`, (req: Request, res: Response) => {
    res.json(computePlatformComparison(1));
  });

  app.get(`${prefix}/analytics/chart/engagement`, (req: Request, res: Response) => {
    res.json({
      labels: contents.map((c) => c.published_date),
      values: contents.map((c) => (c.reach > 0 ? Number((((c.likes + c.comments + c.shares) / c.reach) * 100).toFixed(2)) : 0)),
    });
  });

  app.get(`${prefix}/analytics/chart/followers`, (req: Request, res: Response) => {
    res.json({
      labels: growths.map((g) => g.date),
      values: growths.map((g) => g.followers),
    });
  });

  app.get(`${prefix}/analytics/audience`, (req: Request, res: Response) => {
    res.json({
      total_followers: audiences.reduce((sum, a) => sum + a.followers, 0),
      total_reach: audiences.reduce((sum, a) => sum + a.reach, 0),
      total_impressions: audiences.reduce((sum, a) => sum + a.impressions, 0),
      gender_distribution: { Male: 2, Female: 3 },
      age_group_distribution: { '18-24': 3, '25-34': 2 },
    });
  });

  app.get(`${prefix}/analytics/growth`, (req: Request, res: Response) => {
    res.json(growths);
  });

  app.get(`${prefix}/analytics/audience-trends`, (req: Request, res: Response) => {
    res.json(growths.map((g) => ({ date: g.date, followers: g.followers, reach: g.reach })));
  });

  // Users & Auth
  app.get(`${prefix}/users/me`, (req: Request, res: Response) => {
    res.json(users[0]);
  });

  app.get(`${prefix}/auth/me`, (req: Request, res: Response) => {
    res.json(users[0]);
  });

  app.post(`${prefix}/auth/login`, (req: Request, res: Response) => {
    res.json({
      access_token: 'mock_jwt_token_' + Date.now(),
      token_type: 'bearer',
    });
  });

  app.post(`${prefix}/auth/register`, (req: Request, res: Response) => {
    const { full_name, email, role } = req.body;
    const newUser: User = {
      id: users.length + 1,
      full_name: full_name || 'New Creator',
      email: email || 'user@example.com',
      role: role || 'Creator',
    };
    users.push(newUser);
    res.status(201).json({
      message: 'User registered successfully',
      data: newUser,
    });
  });

  app.get(`${prefix}/users`, (req: Request, res: Response) => {
    res.json(users);
  });

  // Home
  app.get(`${prefix}/`, (req: Request, res: Response) => {
    res.json({
      message: 'Welcome to CreatorIQ API',
      version: '0.1.0',
      docs: '/docs',
    });
  });

  // Content CRUD & Analytics
  app.get(`${prefix}/content/:content_id`, (req: Request, res: Response) => {
    const item = contents.find((c) => c.id === Number(req.params.content_id));
    if (!item) return res.status(404).json({ detail: 'Content not found' });
    res.json(item);
  });

  app.put(`${prefix}/content/:content_id`, (req: Request, res: Response) => {
    const id = Number(req.params.content_id);
    const idx = contents.findIndex((c) => c.id === id);
    if (idx === -1) return res.status(404).json({ detail: 'Content not found' });
    contents[idx] = { ...contents[idx], ...req.body };
    res.json(contents[idx]);
  });

  app.delete(`${prefix}/content/:content_id`, (req: Request, res: Response) => {
    const id = Number(req.params.content_id);
    contents = contents.filter((c) => c.id !== id);
    res.json({ message: 'Content deleted successfully' });
  });

  app.get(`${prefix}/analytics/content/:content_id/engagement`, (req: Request, res: Response) => {
    const item = contents.find((c) => c.id === Number(req.params.content_id)) || contents[0];
    const engagement = item.likes + item.comments + item.shares + item.saves;
    const rate = item.reach > 0 ? Number(((engagement / item.reach) * 100).toFixed(2)) : 0;
    res.json({
      content_id: item.id,
      title: item.content_title,
      engagement_total: engagement,
      engagement_rate: rate,
      likes: item.likes,
      comments: item.comments,
      shares: item.shares,
      saves: item.saves,
    });
  });

  // Audience & Growth CRUD
  app.post(`${prefix}/audience`, (req: Request, res: Response) => {
    const { platform, followers, reach, impressions, gender, age_group, country, city, device_type } = req.body;
    const newItem: AudienceItem = {
      id: audiences.length + 1,
      creator_id: 1,
      platform: platform || 'YouTube',
      followers: Number(followers) || 0,
      reach: Number(reach) || 0,
      impressions: Number(impressions) || 0,
      gender: gender || 'Other',
      age_group: age_group || '18-24',
      country: country || 'Global',
      city: city || 'Global',
      device_type: device_type || 'Mobile',
    };
    audiences.push(newItem);
    res.status(201).json(newItem);
  });

  app.get(`${prefix}/audience/:id`, (req: Request, res: Response) => {
    const item = audiences.find((a) => a.id === Number(req.params.id));
    if (!item) return res.status(404).json({ detail: 'Audience record not found' });
    res.json(item);
  });

  app.put(`${prefix}/audience/:id`, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const idx = audiences.findIndex((a) => a.id === id);
    if (idx === -1) return res.status(404).json({ detail: 'Audience record not found' });
    audiences[idx] = { ...audiences[idx], ...req.body };
    res.json(audiences[idx]);
  });

  app.delete(`${prefix}/audience/:id`, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    audiences = audiences.filter((a) => a.id !== id);
    res.json({ message: 'Audience record deleted successfully' });
  });

  app.post(`${prefix}/growth`, (req: Request, res: Response) => {
    const { date, followers, reach } = req.body;
    const newItem: GrowthItem = {
      id: growths.length + 1,
      creator_id: 1,
      date: date || new Date().toISOString().split('T')[0],
      followers: Number(followers) || 0,
      reach: Number(reach) || 0,
    };
    growths.push(newItem);
    res.status(201).json(newItem);
  });

  // Social Integration
  app.get(`${prefix}/social/platforms`, (req: Request, res: Response) => {
    res.json({
      platforms: Object.keys(connectedPlatforms),
    });
  });

  app.post(`${prefix}/social/connect`, (req: Request, res: Response) => {
    const { platform, account_name } = req.body;
    if (!platform) return res.status(400).json({ detail: 'Platform required' });
    connectedPlatforms[platform] = { account_name: account_name || `@${platform.toLowerCase()}_creator` };
    res.json({
      message: `${platform} account connected successfully`,
      platform,
      account_name: connectedPlatforms[platform].account_name,
    });
  });

  app.post(`${prefix}/social/sync`, (req: Request, res: Response) => {
    res.json({
      message: `Data synchronized successfully`,
      records_added: 2,
    });
  });

  app.post(`${prefix}/social/youtube/sync`, (req: Request, res: Response) => {
    res.json({
      platform: 'YouTube',
      status: 'success',
      records_synced: contents.filter((c) => c.platform === 'YouTube').length,
      created_records: 0,
      updated_records: contents.filter((c) => c.platform === 'YouTube').length,
    });
  });
};

// Register for both standard routes and /api prefixed routes
registerRoutes('');
registerRoutes('/api');

// ==========================================
// Vite Middleware / Static Serving
// ==========================================

async function startServer() {
  const frontendPath = path.resolve(__dirname, '../frontend');
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      root: frontendPath,
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(frontendPath, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CreatorIQ Server running at http://0.0.0.0:${PORT}`);
    console.log(`Swagger UI live at http://0.0.0.0:${PORT}/docs`);
  });
}

startServer();
