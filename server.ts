import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

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
  {
    id: 1,
    creator_id: 1,
    platform: 'YouTube',
    content_title: 'Full Stack React & Node Tutorial 2026',
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
    platform: 'Instagram',
    content_title: 'Desk Setup Tour & Gear Breakdown',
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
    id: 4,
    creator_id: 1,
    platform: 'Instagram',
    content_title: '5 CSS Tricks You Did Not Know',
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
    id: 5,
    creator_id: 1,
    platform: 'LinkedIn',
    content_title: 'How I Built and Scaled My Tech Channel',
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
    id: 6,
    creator_id: 1,
    platform: 'TikTok',
    content_title: 'Fast vs Slow Coding Habits',
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
    id: 7,
    creator_id: 1,
    platform: 'X',
    content_title: 'Thread: Web Development Trends in 2026',
    views: 14500,
    likes: 980,
    comments: 140,
    shares: 260,
    saves: 310,
    watch_time: 12000,
    reach: 19500,
    published_date: '2026-08-30',
  },
];

let audiences: AudienceItem[] = [
  {
    id: 1,
    creator_id: 1,
    platform: 'YouTube',
    followers: 65400,
    reach: 86000,
    impressions: 142000,
    gender: 'Male',
    age_group: '25-34',
    country: 'India',
    city: 'Hyderabad',
    device_type: 'Mobile',
  },
  {
    id: 2,
    creator_id: 1,
    platform: 'YouTube',
    followers: 24500,
    reach: 34000,
    impressions: 58000,
    gender: 'Female',
    age_group: '18-24',
    country: 'United States',
    city: 'San Francisco',
    device_type: 'Desktop',
  },
  {
    id: 3,
    creator_id: 1,
    platform: 'Instagram',
    followers: 48200,
    reach: 64000,
    impressions: 98000,
    gender: 'Female',
    age_group: '18-24',
    country: 'India',
    city: 'Bengaluru',
    device_type: 'Mobile',
  },
  {
    id: 4,
    creator_id: 1,
    platform: 'Instagram',
    followers: 32100,
    reach: 48000,
    impressions: 72000,
    gender: 'Male',
    age_group: '25-34',
    country: 'United Kingdom',
    city: 'London',
    device_type: 'Mobile',
  },
  {
    id: 5,
    creator_id: 1,
    platform: 'TikTok',
    followers: 55000,
    reach: 78000,
    impressions: 125000,
    gender: 'Female',
    age_group: '18-24',
    country: 'United States',
    city: 'New York',
    device_type: 'Mobile',
  },
];

let growths: GrowthItem[] = [
  { id: 1, creator_id: 1, date: '2026-08-01', followers: 185000, reach: 240000 },
  { id: 2, creator_id: 1, date: '2026-08-05', followers: 192000, reach: 258000 },
  { id: 3, creator_id: 1, date: '2026-08-10', followers: 201000, reach: 279000 },
  { id: 4, creator_id: 1, date: '2026-08-15', followers: 212500, reach: 295000 },
  { id: 5, creator_id: 1, date: '2026-08-20', followers: 224000, reach: 312000 },
  { id: 6, creator_id: 1, date: '2026-08-25', followers: 238000, reach: 334000 },
  { id: 7, creator_id: 1, date: '2026-08-30', followers: 245200, reach: 350000 },
];

let revenues: RevenueItem[] = [
  {
    id: 1,
    creator_id: 1,
    amount: 45000,
    revenue_date: '2026-08-01',
    source: 'YouTube AdSense',
    description: 'Monthly video monetization revenue',
  },
  {
    id: 2,
    creator_id: 1,
    amount: 60000,
    revenue_date: '2026-08-12',
    source: 'Brand Sponsorship',
    description: 'DevTools Pro summer campaign integration',
  },
  {
    id: 3,
    creator_id: 1,
    amount: 18500,
    revenue_date: '2026-08-18',
    source: 'Affiliate Marketing',
    description: 'Hardware & course referral commissions',
  },
  {
    id: 4,
    creator_id: 1,
    amount: 25000,
    revenue_date: '2026-08-25',
    source: 'Course Sales',
    description: 'Creator Bootcamp Digital downloads',
  },
];

let sponsorships: SponsorshipItem[] = [
  {
    id: 1,
    creator_id: 1,
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
    brand_name: 'CloudScale Hosting',
    campaign: 'Serverless Platform Awareness',
    contract_value: 45000,
    start_date: '2026-08-15',
    end_date: '2026-09-15',
    status: 'Active',
    payment_status: 'Pending',
  },
  {
    id: 3,
    creator_id: 1,
    brand_name: 'ErgoChair Tech',
    campaign: 'Product Showcase & Reel Feature',
    contract_value: 30000,
    start_date: '2026-07-10',
    end_date: '2026-08-10',
    status: 'Completed',
    payment_status: 'Paid',
  },
];

let notifications: NotificationItem[] = [
  {
    id: 1,
    creator_id: 1,
    notification_type: 'performance',
    title: 'High-Performing Content Alert',
    message: "Content '5 CSS Tricks You Did Not Know' achieved 52,000 views and 6,300 likes on Instagram!",
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    creator_id: 1,
    notification_type: 'growth',
    title: 'Growth Milestone Reached',
    message: 'Congratulations! Your total content reach across all platforms has crossed 300,000 reach.',
    is_read: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    creator_id: 1,
    notification_type: 'revenue',
    title: 'Revenue Analytics Alert',
    message: 'Total revenue recorded: ₹148,500.00 across 4 transactions.',
    is_read: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    creator_id: 1,
    notification_type: 'engagement',
    title: 'High Platform Engagement Rate',
    message: 'Instagram and TikTok content show exceptional engagement rates over 11% based on recent interaction volume.',
    is_read: true,
    created_at: new Date().toISOString(),
  },
];

const connectedPlatforms: Record<string, { account_name: string }> = {
  YouTube: { account_name: '@monikacreator' },
  Instagram: { account_name: '@monika_dev' },
};

// ==========================================
// Helper Calculation Functions
// ==========================================

function computeContentReport(creatorId: number = 1) {
  const userContent = contents.filter((c) => c.creator_id === creatorId);
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
    if (!map[c.platform]) {
      map[c.platform] = {
        platform: c.platform,
        content_count: 0,
        total_views: 0,
        total_likes: 0,
        total_comments: 0,
        total_shares: 0,
        total_reach: 0,
        total_engagement: 0,
      };
    }
    map[c.platform].content_count += 1;
    map[c.platform].total_views += c.views || 0;
    map[c.platform].total_likes += c.likes || 0;
    map[c.platform].total_comments += c.comments || 0;
    map[c.platform].total_shares += c.shares || 0;
    map[c.platform].total_reach += c.reach || 0;
    map[c.platform].total_engagement += (c.likes || 0) + (c.comments || 0) + (c.shares || 0) + (c.saves || 0);
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

function computeCreatorReport(creatorId: number = 1) {
  const userAudience = audiences.filter((a) => a.creator_id === creatorId);
  const userRevenue = revenues.filter((r) => r.creator_id === creatorId);
  const userGrowth = growths.filter((g) => g.creator_id === creatorId);
  const userSponsorships = sponsorships.filter((s) => s.creator_id === creatorId);

  const total_revenue = userRevenue.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const total_contract_value = userSponsorships.reduce((sum, s) => sum + (Number(s.contract_value) || 0), 0);

  return {
    creator_id: creatorId,
    content_performance: computeContentReport(creatorId),
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
// OpenAPI 3.0.3 Specification Definition
// ==========================================

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "CreatorIQ Cross-Platform Analytics API",
    version: "1.0.0",
    description:
      "Enterprise Multi-Channel Analytics, Demographics, Monetization, Sponsorship Pipeline, and Notifications Engine for Digital Content Creators.",
    contact: {
      name: "CreatorIQ Engineering",
      email: "monikachowdary2203@gmail.com",
    },
  },
  servers: [
    {
      url: "/",
      description: "Default API Server",
    },
  ],
  paths: {
    "/reports": {
      get: {
        tags: ["Reports"],
        summary: "Get aggregated dashboard dossier",
        description: "Retrieves complete content performance, platform comparisons, audience summaries, and monetization stats.",
        responses: {
          200: {
            description: "Successful response",
          },
        },
      },
    },
    "/reports/content": {
      get: {
        tags: ["Reports"],
        summary: "Get content performance breakdown",
        responses: { 200: { description: "Successful response" } },
      },
    },
    "/reports/audience": {
      get: {
        tags: ["Reports"],
        summary: "Get audience demographics report",
        responses: { 200: { description: "Successful response" } },
      },
    },
    "/reports/revenue": {
      get: {
        tags: ["Reports"],
        summary: "Get monetization & revenue report",
        responses: { 200: { description: "Successful response" } },
      },
    },
    "/reports/growth": {
      get: {
        tags: ["Reports"],
        summary: "Get follower velocity & growth trends",
        responses: { 200: { description: "Successful response" } },
      },
    },
    "/reports/platforms": {
      get: {
        tags: ["Reports"],
        summary: "Get cross-platform efficiency comparison",
        responses: { 200: { description: "Successful response" } },
      },
    },
    "/reports/export/pdf": {
      get: {
        tags: ["Exports"],
        summary: "Download compiled PDF dossier",
        responses: { 200: { description: "Binary PDF stream" } },
      },
    },
    "/reports/export/excel": {
      get: {
        tags: ["Exports"],
        summary: "Download multi-sheet XLSX workbook",
        responses: { 200: { description: "Binary XLSX stream" } },
      },
    },
    "/content": {
      get: {
        tags: ["Content"],
        summary: "List all published content items",
        responses: { 200: { description: "List of content" } },
      },
      post: {
        tags: ["Content"],
        summary: "Record newly published content",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  platform: { type: "string", example: "YouTube" },
                  content_title: { type: "string", example: "Advanced React 19 Architectures" },
                  views: { type: "number", example: 12500 },
                  likes: { type: "number", example: 1400 },
                  comments: { type: "number", example: 180 },
                  shares: { type: "number", example: 95 },
                  reach: { type: "number", example: 15000 },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Content recorded" } },
      },
    },
    "/revenue": {
      get: {
        tags: ["Revenue"],
        summary: "List revenue transactions",
        responses: { 200: { description: "Revenue list" } },
      },
      post: {
        tags: ["Revenue"],
        summary: "Record new monetization stream",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  amount: { type: "number", example: 35000 },
                  source: { type: "string", example: "Brand Sponsorship" },
                  description: { type: "string", example: "Product integration" },
                  revenue_date: { type: "string", example: "2026-08-30" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Revenue recorded" } },
      },
    },
    "/sponsorships": {
      get: {
        tags: ["Sponsorships"],
        summary: "List active brand campaigns & contracts",
        responses: { 200: { description: "Sponsorships list" } },
      },
      post: {
        tags: ["Sponsorships"],
        summary: "Create a new brand sponsorship campaign",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  brand_name: { type: "string", example: "Supabase" },
                  campaign: { type: "string", example: "Backend Made Simple" },
                  contract_value: { type: "number", example: 50000 },
                  start_date: { type: "string", example: "2026-09-01" },
                  end_date: { type: "string", example: "2026-09-30" },
                  status: { type: "string", example: "Active" },
                  payment_status: { type: "string", example: "Pending" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Sponsorship created" } },
      },
    },
    "/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "List real-time alerts",
        responses: { 200: { description: "Notifications list" } },
      },
      post: {
        tags: ["Notifications"],
        summary: "Create notification alert",
        responses: { 201: { description: "Notification created" } },
      },
    },
    "/notifications/mark-all-read": {
      put: {
        tags: ["Notifications"],
        summary: "Mark all alerts as read",
        responses: { 200: { description: "Updated status" } },
      },
    },
    "/notifications/check-alerts": {
      post: {
        tags: ["Notifications"],
        summary: "Trigger automated metric spike alert check",
        responses: { 200: { description: "Check result" } },
      },
    },
    "/social/youtube/sync": {
      post: {
        tags: ["Social Integration"],
        summary: "Sync YouTube channel metrics",
        responses: { 200: { description: "Sync confirmation" } },
      },
    },
    "/users/me": {
      get: {
        tags: ["User & Auth"],
        summary: "Get authenticated creator profile",
        responses: { 200: { description: "User object" } },
      },
    },
  },
};

// ==========================================
// Swagger UI & ReDoc HTML Handlers
// ==========================================

app.get('/openapi.json', (req, res) => {
  res.json(openApiSpec);
});

app.get(['/docs', '/api/docs'], (req, res) => {
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

app.get('/redoc', (req, res) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>CreatorIQ API - ReDoc</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>body { margin: 0; padding: 0; }</style>
</head>
<body>
  <redoc spec-url='/openapi.json'></redoc>
  <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"></script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// ==========================================
// API Routes (Dual prefix support / and /api)
// ==========================================

const registerRoutes = (prefix = '') => {
  // Health
  app.get(`${prefix}/api/health`, (req, res) => {
    res.json({ status: 'ok', name: 'CreatorIQ API' });
  });

  // Reports
  app.get(`${prefix}/reports`, (req: Request, res: Response) => {
    res.json(computeCreatorReport(1));
  });

  app.get(`${prefix}/reports/content`, (req: Request, res: Response) => {
    res.json(computeContentReport(1));
  });

  app.get(`${prefix}/reports/audience`, (req: Request, res: Response) => {
    const userAudience = audiences.filter((a) => a.creator_id === 1);
    res.json({
      total_records: userAudience.length,
      data: userAudience,
    });
  });

  app.get(`${prefix}/reports/revenue`, (req: Request, res: Response) => {
    const userRevenue = revenues.filter((r) => r.creator_id === 1);
    const total_revenue = userRevenue.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    res.json({
      total_revenue,
      total_records: userRevenue.length,
      data: userRevenue,
    });
  });

  app.get(`${prefix}/reports/growth`, (req: Request, res: Response) => {
    const userGrowth = growths.filter((g) => g.creator_id === 1);
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

  // Export PDF
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

  // Export Excel
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

  // Notifications
  app.get(`${prefix}/notifications`, (req: Request, res: Response) => {
    res.json({
      total: notifications.length,
      data: notifications,
    });
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
    res.json({
      total: contents.length,
      data: contents,
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
    res.json({
      total: audiences.length,
      data: audiences,
    });
  });

  app.get(`${prefix}/growth`, (req: Request, res: Response) => {
    res.json({
      total: growths.length,
      data: growths,
    });
  });

  // Analytics Endpoints
  app.get(`${prefix}/analytics/summary`, (req: Request, res: Response) => {
    const rep = computeContentReport(1);
    res.json({
      ...rep,
      average_engagement_rate: 9.8,
    });
  });

  app.get(`${prefix}/analytics/top-content`, (req: Request, res: Response) => {
    const rep = computeContentReport(1);
    res.json(rep.content.slice(0, 5));
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
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
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
