import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

function App() {
  const API_URL = "http://127.0.0.1:8000";

  const [activePage, setActivePage] = useState("Dashboard");
  const [platform, setPlatform] = useState("All");

  // ============================================================
  // DASHBOARD STATES
  // ============================================================

  const [kpiData, setKpiData] = useState({
    total_views: 0,
    total_likes: 0,
    total_comments: 0,
    total_shares: 0,
    total_reach: 0,
    average_engagement_rate: 0,
  });

  const [engagementData, setEngagementData] = useState([]);
  const [platformComparisonData, setPlatformComparisonData] =
    useState([]);
  const [topContentData, setTopContentData] = useState([]);

  // ============================================================
  // CONTENT STATES
  // ============================================================

  const [contentData, setContentData] = useState([]);
  const [showContentForm, setShowContentForm] = useState(false);
  const [editingContentId, setEditingContentId] = useState(null);
  const [loading, setLoading] = useState(false);

  const emptyForm = {
    platform: "YouTube",
    content_title: "",
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    watch_time: 0,
    reach: 0,
    published_date: "",
  };

  const [contentForm, setContentForm] = useState(emptyForm);

  // ============================================================
  // ANALYTICS STATES
  // ============================================================

  const [analyticsKpi, setAnalyticsKpi] = useState({
    total_views: 0,
    total_likes: 0,
    total_comments: 0,
    total_shares: 0,
    total_reach: 0,
    average_engagement_rate: 0,
  });

  const [analyticsEngagement, setAnalyticsEngagement] =
    useState([]);

  const [analyticsPlatformPerformance, setAnalyticsPlatformPerformance] =
    useState([]);

  const [analyticsPlatformComparison, setAnalyticsPlatformComparison] =
    useState([]);

  const [analyticsTopContent, setAnalyticsTopContent] =
    useState([]);

  // ============================================================
  // AUDIENCE STATES
  // ============================================================

  const emptyAudienceForm = {
    creator_id: 1,
    age_group: "",
    gender: "",
    country: "",
    city: "",
    device_type: "",
    active_hour: 0,
    followers: 0,
    impressions: 0,
    reach: 0,
  };

  const [audienceData, setAudienceData] = useState([]);
  const [showAudienceForm, setShowAudienceForm] = useState(false);
  const [editingAudienceId, setEditingAudienceId] = useState(null);
  const [audienceForm, setAudienceForm] = useState(emptyAudienceForm);
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [audienceAnalytics, setAudienceAnalytics] = useState(null);
  const [audienceTrends, setAudienceTrends] = useState([]);

  // ============================================================
  // REVENUE STATES
  // ============================================================

  const emptyRevenueForm = {
    creator_id: 1,
    source: "",
    amount: 0,
    currency: "INR",
    revenue_date: "",
    description: "",
  };

  const [revenueData, setRevenueData] = useState([]);
  const [revenueSummary, setRevenueSummary] = useState(null);
  const [revenueBySource, setRevenueBySource] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [revenueDashboard, setRevenueDashboard] = useState(null);

  const [showRevenueForm, setShowRevenueForm] = useState(false);
  const [editingRevenueId, setEditingRevenueId] = useState(null);
  const [revenueForm, setRevenueForm] =
    useState(emptyRevenueForm);
  const [revenueLoading, setRevenueLoading] =
    useState(false);

  // ============================================================
  // SPONSORSHIP STATES
  // ============================================================

  const emptySponsorshipForm = {
    creator_id: 1,
    brand_name: "",
    campaign_name: "",
    amount: 0,
    status: "Pending",
    start_date: "",
    end_date: "",
  };

  const [sponsorshipData, setSponsorshipData] = useState([]);
  const [sponsorshipSummary, setSponsorshipSummary] =
    useState(null);
  const [sponsorshipByStatus, setSponsorshipByStatus] =
    useState([]);
  const [sponsorshipByBrand, setSponsorshipByBrand] =
    useState([]);

  const [showSponsorshipForm, setShowSponsorshipForm] =
    useState(false);

  const [editingSponsorshipId, setEditingSponsorshipId] =
    useState(null);

  const [sponsorshipForm, setSponsorshipForm] =
    useState(emptySponsorshipForm);

  const [sponsorshipLoading, setSponsorshipLoading] =
    useState(false);
  // ============================================================
// NOTIFICATION STATES
// ============================================================

const [notificationData, setNotificationData] = useState([]);

const [notificationLoading, setNotificationLoading] =
  useState(false);

const [showNotificationForm, setShowNotificationForm] =
  useState(false);

const [notificationForm, setNotificationForm] = useState({
  creator_id: 1,
  notification_type: "Alert",
  title: "",
  message: "",
  is_read: false,
});

  // ============================================================
  // DASHBOARD - KPI
  // ============================================================

  useEffect(() => {
    if (activePage !== "Dashboard") return;

    axios
      .get(`${API_URL}/analytics/summary`, {
        params: {
          platform: platform,
        },
      })
      .then((response) => {
        const data = response.data.data || {};

        setKpiData({
          total_views: data.total_views || 0,
          total_likes: data.total_likes || 0,
          total_comments: data.total_comments || 0,
          total_shares: data.total_shares || 0,
          total_reach: data.total_reach || 0,
          average_engagement_rate:
            data.average_engagement_rate || 0,
        });
      })
      .catch((error) => {
        console.error("Dashboard KPI Error:", error);
      });
  }, [platform, activePage]);

  // ============================================================
  // DASHBOARD - ENGAGEMENT
  // ============================================================

  useEffect(() => {
    if (activePage !== "Dashboard") return;

    axios
      .get(`${API_URL}/analytics/chart/engagement`, {
        params: {
          platform: platform,
        },
      })
      .then((response) => {
        const data = response.data.data || {
          labels: [],
          values: [],
        };

        const chartData = (data.labels || []).map(
          (label, index) => ({
            date: label,
            engagement: Number(data.values?.[index] || 0),
          })
        );

        setEngagementData(chartData);
      })
      .catch((error) => {
        console.error(
          "Dashboard Engagement Error:",
          error
        );

        setEngagementData([]);
      });
  }, [platform, activePage]);

  // ============================================================
  // DASHBOARD - PLATFORM COMPARISON
  // ============================================================

  useEffect(() => {
    if (activePage !== "Dashboard") return;

    axios
      .get(`${API_URL}/analytics/platform-comparison`)
      .then((response) => {
        const data = response.data.data || {};

        const chartData = Object.keys(data).map(
          (platformName) => ({
            platform: platformName,
            views: data[platformName].views || 0,
            reach: data[platformName].reach || 0,
            likes: data[platformName].likes || 0,
            comments: data[platformName].comments || 0,
            engagement_rate:
              data[platformName].engagement_rate || 0,
          })
        );

        setPlatformComparisonData(chartData);
      })
      .catch((error) => {
        console.error(
          "Dashboard Platform Comparison Error:",
          error
        );

        setPlatformComparisonData([]);
      });
  }, [activePage]);

  // ============================================================
  // DASHBOARD - TOP CONTENT
  // ============================================================

  useEffect(() => {
    if (activePage !== "Dashboard") return;

    axios
      .get(`${API_URL}/analytics/top-content`, {
        params: {
          platform: platform,
        },
      })
      .then((response) => {
        setTopContentData(response.data.data || []);
      })
      .catch((error) => {
        console.error(
          "Dashboard Top Content Error:",
          error
        );

        setTopContentData([]);
      });
  }, [platform, activePage]);

  // ============================================================
  // GET ALL CONTENT
  // ============================================================

  const fetchContent = () => {
    axios
      .get(`${API_URL}/content`)
      .then((response) => {
        setContentData(response.data.data || []);
      })
      .catch((error) => {
        console.error(
          "Content API Error:",
          error
        );

        setContentData([]);
      });
  };

  useEffect(() => {
    if (activePage !== "Content") return;

    fetchContent();
  }, [activePage]);

  // ============================================================
  // CONTENT FORM CHANGE
  // ============================================================

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setContentForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // ADD CONTENT
  // ============================================================

  const handleAddContent = () => {
    setEditingContentId(null);

    setContentForm({
      ...emptyForm,
      published_date: new Date()
        .toISOString()
        .split("T")[0],
    });

    setShowContentForm(true);
  };

  // ============================================================
  // EDIT CONTENT
  // ============================================================

  const handleEditContent = (content) => {
    setEditingContentId(content.id);

    setContentForm({
      platform: content.platform || "YouTube",
      content_title: content.content_title || "",
      views: content.views || 0,
      likes: content.likes || 0,
      comments: content.comments || 0,
      shares: content.shares || 0,
      saves: content.saves || 0,
      watch_time: content.watch_time || 0,
      reach: content.reach || 0,
      published_date: content.published_date || "",
    });

    setShowContentForm(true);
  };

  // ============================================================
  // CREATE / UPDATE CONTENT
  // ============================================================

  const handleSubmitContent = async (e) => {
    e.preventDefault();

    setLoading(true);

    const payload = {
      platform: contentForm.platform,
      content_title: contentForm.content_title,
      views: Number(contentForm.views),
      likes: Number(contentForm.likes),
      comments: Number(contentForm.comments),
      shares: Number(contentForm.shares),
      saves: Number(contentForm.saves),
      watch_time: Number(contentForm.watch_time),
      reach: Number(contentForm.reach),
      published_date: contentForm.published_date,
    };

    try {
      if (editingContentId) {
        await axios.put(
          `${API_URL}/content/${editingContentId}`,
          payload
        );

        alert("Content updated successfully!");
      } else {
        await axios.post(
          `${API_URL}/content`,
          payload
        );

        alert("Content created successfully!");
      }

      setShowContentForm(false);
      setEditingContentId(null);
      setContentForm(emptyForm);

      fetchContent();
    } catch (error) {
      console.error(
        "Content Save Error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to save content."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DELETE CONTENT
  // ============================================================

  const handleDeleteContent = async (contentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this content?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/content/${contentId}`
      );

      alert("Content deleted successfully!");

      fetchContent();
    } catch (error) {
      console.error(
        "Delete Content Error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to delete content."
      );
    }
  };

  // ============================================================
  // CONTENT FILTER
  // ============================================================

  const filteredContent =
    platform === "All"
      ? contentData
      : contentData.filter(
          (content) =>
            content.platform?.toLowerCase() ===
            platform.toLowerCase()
        );

  // ============================================================
  // ANALYTICS PAGE - FETCH KPI
  // ============================================================

  useEffect(() => {
    if (activePage !== "Analytics") return;

    axios
      .get(`${API_URL}/analytics/summary`, {
        params: {
          platform: platform,
        },
      })
      .then((response) => {
        const data = response.data.data || {};

        setAnalyticsKpi({
          total_views: data.total_views || 0,
          total_likes: data.total_likes || 0,
          total_comments: data.total_comments || 0,
          total_shares: data.total_shares || 0,
          total_reach: data.total_reach || 0,
          average_engagement_rate:
            data.average_engagement_rate || 0,
        });
      })
      .catch((error) => {
        console.error(
          "Analytics KPI Error:",
          error
        );
      });
  }, [platform, activePage]);

  // ============================================================
  // ANALYTICS PAGE - ENGAGEMENT
  // ============================================================

  useEffect(() => {
    if (activePage !== "Analytics") return;

    axios
      .get(`${API_URL}/analytics/chart/engagement`, {
        params: {
          platform: platform,
        },
      })
      .then((response) => {
        const data = response.data.data || {
          labels: [],
          values: [],
        };

        const chartData = (data.labels || []).map(
          (label, index) => ({
            date: label,
            engagement: Number(
              data.values?.[index] || 0
            ),
          })
        );

        setAnalyticsEngagement(chartData);
      })
      .catch((error) => {
        console.error(
          "Analytics Engagement Error:",
          error
        );

        setAnalyticsEngagement([]);
      });
  }, [platform, activePage]);

  // ============================================================
  // ANALYTICS PAGE - PLATFORM PERFORMANCE
  // ============================================================

  useEffect(() => {
    if (activePage !== "Analytics") return;

    axios
      .get(
        `${API_URL}/analytics/platform-performance`,
        {
          params: {
            platform: platform,
          },
        }
      )
      .then((response) => {
        const data = response.data.data;

        let formattedData = [];

        if (Array.isArray(data)) {
          formattedData = data;
        } else if (
          data &&
          typeof data === "object"
        ) {
          formattedData = Object.keys(data).map(
            (platformName) => ({
              platform: platformName,
              ...data[platformName],
            })
          );
        }

        setAnalyticsPlatformPerformance(
          formattedData
        );
      })
      .catch((error) => {
        console.error(
          "Analytics Platform Performance Error:",
          error
        );

        setAnalyticsPlatformPerformance([]);
      });
  }, [platform, activePage]);

  // ============================================================
  // ANALYTICS PAGE - PLATFORM COMPARISON
  // ============================================================

  useEffect(() => {
    if (activePage !== "Analytics") return;

    axios
      .get(
        `${API_URL}/analytics/platform-comparison`
      )
      .then((response) => {
        const data = response.data.data || {};

        const formattedData = Object.keys(data).map(
          (platformName) => ({
            platform: platformName,
            views:
              data[platformName].views || 0,
            reach:
              data[platformName].reach || 0,
            likes:
              data[platformName].likes || 0,
            comments:
              data[platformName].comments || 0,
            engagement_rate:
              data[platformName]
                .engagement_rate || 0,
          })
        );

        setAnalyticsPlatformComparison(
          formattedData
        );
      })
      .catch((error) => {
        console.error(
          "Analytics Platform Comparison Error:",
          error
        );

        setAnalyticsPlatformComparison([]);
      });
  }, [activePage]);

  // ============================================================
  // ANALYTICS PAGE - TOP CONTENT
  // ============================================================

  useEffect(() => {
    if (activePage !== "Analytics") return;

    axios
      .get(`${API_URL}/analytics/top-content`, {
        params: {
          platform: platform,
        },
      })
      .then((response) => {
        setAnalyticsTopContent(
          response.data.data || []
        );
      })
      .catch((error) => {
        console.error(
          "Analytics Top Content Error:",
          error
        );

        setAnalyticsTopContent([]);
      });
  }, [platform, activePage]);

  // ============================================================
  // AUDIENCE - GET ALL
  // ============================================================

  const fetchAudience = () => {
    axios
      .get(`${API_URL}/audience`)
      .then((response) => {
        setAudienceData(
          response.data.data || []
        );
      })
      .catch((error) => {
        console.error(
          "Audience API Error:",
          error
        );

        setAudienceData([]);
      });
  };

  // ============================================================
  // AUDIENCE - ANALYTICS
  // ============================================================

  const fetchAudienceAnalytics = () => {
    axios
      .get(`${API_URL}/analytics/audience`)
      .then((response) => {
        setAudienceAnalytics(
          response.data.data || null
        );
      })
      .catch((error) => {
        console.error(
          "Audience Analytics Error:",
          error
        );

        setAudienceAnalytics(null);
      });
  };

  // ============================================================
  // AUDIENCE - TRENDS
  // ============================================================

  const fetchAudienceTrends = () => {
    axios
      .get(`${API_URL}/analytics/audience-trends`)
      .then((response) => {
        const data = response.data.data || [];

        const formattedData = data.map(
          (item) => ({
            date: item.date,
            followers: Number(
              item.followers || 0
            ),
            reach: Number(
              item.reach || 0
            ),
          })
        );

        setAudienceTrends(formattedData);
      })
      .catch((error) => {
        console.error(
          "Audience Trends Error:",
          error
        );

        setAudienceTrends([]);
      });
  };

  // ============================================================
  // AUDIENCE PAGE LOAD
  // ============================================================

  useEffect(() => {
    if (activePage !== "Audience") return;

    fetchAudience();
    fetchAudienceAnalytics();
    fetchAudienceTrends();
  }, [activePage]);

  // ============================================================
  // AUDIENCE FORM CHANGE
  // ============================================================

  const handleAudienceFormChange = (e) => {
    const { name, value } = e.target;

    setAudienceForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // ADD AUDIENCE
  // ============================================================

  const handleAddAudience = () => {
    setEditingAudienceId(null);

    setAudienceForm({
      ...emptyAudienceForm,
    });

    setShowAudienceForm(true);
  };

  // ============================================================
  // EDIT AUDIENCE
  // ============================================================

  const handleEditAudience = (audience) => {
    setEditingAudienceId(audience.id);

    setAudienceForm({
      creator_id: audience.creator_id || 1,
      age_group: audience.age_group || "",
      gender: audience.gender || "",
      country: audience.country || "",
      city: audience.city || "",
      device_type: audience.device_type || "",
      active_hour: audience.active_hour || 0,
      followers: audience.followers || 0,
      impressions: audience.impressions || 0,
      reach: audience.reach || 0,
    });

    setShowAudienceForm(true);
  };

  // ============================================================
  // CREATE / UPDATE AUDIENCE
  // ============================================================

  const handleSubmitAudience = async (e) => {
    e.preventDefault();

    setAudienceLoading(true);

    const payload = {
      creator_id: Number(
        audienceForm.creator_id
      ),
      age_group: audienceForm.age_group,
      gender: audienceForm.gender,
      country: audienceForm.country,
      city: audienceForm.city,
      device_type: audienceForm.device_type,
      active_hour: Number(
        audienceForm.active_hour
      ),
      followers: Number(
        audienceForm.followers
      ),
      impressions: Number(
        audienceForm.impressions
      ),
      reach: Number(
        audienceForm.reach
      ),
    };

    try {
      if (editingAudienceId) {
        await axios.put(
          `${API_URL}/audience/${editingAudienceId}`,
          payload
        );

        alert(
          "Audience updated successfully!"
        );
      } else {
        await axios.post(
          `${API_URL}/audience`,
          payload
        );

        alert(
          "Audience created successfully!"
        );
      }

      setShowAudienceForm(false);
      setEditingAudienceId(null);
      setAudienceForm(emptyAudienceForm);

      fetchAudience();
      fetchAudienceAnalytics();
      fetchAudienceTrends();
    } catch (error) {
      console.error(
        "Audience Save Error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to save audience."
      );
    } finally {
      setAudienceLoading(false);
    }
  };

  // ============================================================
  // DELETE AUDIENCE
  // ============================================================

  const handleDeleteAudience = async (
    audienceId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this audience record?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/audience/${audienceId}`
      );

      alert(
        "Audience deleted successfully!"
      );

      fetchAudience();
      fetchAudienceAnalytics();
      fetchAudienceTrends();
    } catch (error) {
      console.error(
        "Delete Audience Error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to delete audience."
      );
    }
  };

  // ============================================================
  // REVENUE - GET CREATOR REVENUE
  // ============================================================

  const fetchRevenue = () => {
    setRevenueLoading(true);

    axios
      .get(`${API_URL}/revenue/creator/1`)
      .then((response) => {
        setRevenueData(response.data || []);
      })
      .catch((error) => {
        console.error(
          "Revenue Fetch Error:",
          error
        );

        setRevenueData([]);
      })
      .finally(() => {
        setRevenueLoading(false);
      });
  };

  // ============================================================
  // REVENUE - SUMMARY
  // ============================================================

  const fetchRevenueSummary = () => {
    axios
      .get(`${API_URL}/revenue/analytics/summary`)
      .then((response) => {
        setRevenueSummary(
          response.data || null
        );
      })
      .catch((error) => {
        console.error(
          "Revenue Summary Error:",
          error
        );

        setRevenueSummary(null);
      });
  };

  // ============================================================
  // REVENUE - BY SOURCE
  // ============================================================

  const fetchRevenueBySource = () => {
    axios
      .get(
        `${API_URL}/revenue/analytics/by-source`
      )
      .then((response) => {
        setRevenueBySource(
          response.data || []
        );
      })
      .catch((error) => {
        console.error(
          "Revenue By Source Error:",
          error
        );

        setRevenueBySource([]);
      });
  };

  // ============================================================
  // REVENUE - MONTHLY
  // ============================================================

  const fetchMonthlyRevenue = () => {
    axios
      .get(
        `${API_URL}/revenue/analytics/monthly`
      )
      .then((response) => {
        setMonthlyRevenue(
          response.data || []
        );
      })
      .catch((error) => {
        console.error(
          "Monthly Revenue Error:",
          error
        );

        setMonthlyRevenue([]);
      });
  };

  // ============================================================
  // REVENUE - DASHBOARD
  // ============================================================

  const fetchRevenueDashboard = () => {
    axios
      .get(
        `${API_URL}/revenue/analytics/dashboard`
      )
      .then((response) => {
        setRevenueDashboard(
          response.data || null
        );
      })
      .catch((error) => {
        console.error(
          "Revenue Dashboard Error:",
          error
        );

        setRevenueDashboard(null);
      });
  };

  // ============================================================
  // REVENUE PAGE LOAD
  // ============================================================

  useEffect(() => {
    if (activePage !== "Revenue") return;

    fetchRevenue();
    fetchRevenueSummary();
    fetchRevenueBySource();
    fetchMonthlyRevenue();
    fetchRevenueDashboard();
  }, [activePage]);

  // ============================================================
  // REVENUE FORM CHANGE
  // ============================================================

  const handleRevenueFormChange = (e) => {
    const { name, value } = e.target;

    setRevenueForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // ADD REVENUE
  // ============================================================

  const handleAddRevenue = () => {
    setEditingRevenueId(null);

    setRevenueForm({
      ...emptyRevenueForm,
      revenue_date: new Date()
        .toISOString()
        .split("T")[0],
    });

    setShowRevenueForm(true);
  };

  // ============================================================
  // EDIT REVENUE
  // ============================================================

  const handleEditRevenue = (revenue) => {
    setEditingRevenueId(revenue.id);

    setRevenueForm({
      creator_id: revenue.creator_id || 1,
      source: revenue.source || "",
      amount: revenue.amount || 0,
      currency: revenue.currency || "INR",
      revenue_date:
        revenue.revenue_date || "",
      description:
        revenue.description || "",
    });

    setShowRevenueForm(true);
  };

  // ============================================================
  // CREATE / UPDATE REVENUE
  // ============================================================

  const handleSubmitRevenue = async (e) => {
    e.preventDefault();

    setRevenueLoading(true);

    const payload = {
      creator_id: Number(
        revenueForm.creator_id
      ),
      source: revenueForm.source,
      amount: Number(
        revenueForm.amount
      ),
      currency: revenueForm.currency,
      revenue_date:
        revenueForm.revenue_date,
      description:
        revenueForm.description || null,
    };

    try {
      if (editingRevenueId) {
        await axios.put(
          `${API_URL}/revenue/${editingRevenueId}`,
          payload,
          {
            params: {
              creator_id: Number(
                revenueForm.creator_id
              ),
            },
          }
        );

        alert(
          "Revenue updated successfully!"
        );
      } else {
        await axios.post(
          `${API_URL}/revenue`,
          payload
        );

        alert(
          "Revenue created successfully!"
        );
      }

      setShowRevenueForm(false);
      setEditingRevenueId(null);
      setRevenueForm(emptyRevenueForm);

      fetchRevenue();
      fetchRevenueSummary();
      fetchRevenueBySource();
      fetchMonthlyRevenue();
      fetchRevenueDashboard();
    } catch (error) {
      console.error(
        "Revenue Save Error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to save revenue."
      );
    } finally {
      setRevenueLoading(false);
    }
  };

  // ============================================================
  // DELETE REVENUE
  // ============================================================

  const handleDeleteRevenue = async (
    revenueId,
    creatorId = 1
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this revenue record?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/revenue/${revenueId}`,
        {
          params: {
            creator_id: creatorId,
          },
        }
      );

      alert(
        "Revenue deleted successfully!"
      );

      fetchRevenue();
      fetchRevenueSummary();
      fetchRevenueBySource();
      fetchMonthlyRevenue();
      fetchRevenueDashboard();
    } catch (error) {
      console.error(
        "Delete Revenue Error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to delete revenue."
      );
    }
  };

  // ============================================================
  // SPONSORSHIP - GET ALL
  // ============================================================

  const fetchSponsorships = () => {
    axios
      .get(`${API_URL}/sponsorships/`)
      .then((response) => {
        setSponsorshipData(
          response.data || []
        );
      })
      .catch((error) => {
        console.error(
          "Sponsorship API Error:",
          error
        );

        setSponsorshipData([]);
      });
  };

  // ============================================================
  // SPONSORSHIP - SUMMARY
  // ============================================================

  const fetchSponsorshipSummary = () => {
    axios
      .get(
        `${API_URL}/sponsorships/analytics/summary`
      )
      .then((response) => {
        setSponsorshipSummary(
          response.data || null
        );
      })
      .catch((error) => {
        console.error(
          "Sponsorship Summary Error:",
          error
        );

        setSponsorshipSummary(null);
      });
  };

  // ============================================================
  // SPONSORSHIP - BY STATUS
  // ============================================================

  const fetchSponsorshipByStatus = () => {
    axios
      .get(
        `${API_URL}/sponsorships/analytics/by-status`
      )
      .then((response) => {
        setSponsorshipByStatus(
          response.data || []
        );
      })
      .catch((error) => {
        console.error(
          "Sponsorship By Status Error:",
          error
        );

        setSponsorshipByStatus([]);
      });
  };

  // ============================================================
  // SPONSORSHIP - BY BRAND
  // ============================================================

  const fetchSponsorshipByBrand = () => {
    axios
      .get(
        `${API_URL}/sponsorships/analytics/by-brand`
      )
      .then((response) => {
        setSponsorshipByBrand(
          response.data || []
        );
      })
      .catch((error) => {
        console.error(
          "Sponsorship By Brand Error:",
          error
        );

        setSponsorshipByBrand([]);
      });
  };

  // ============================================================
  // SPONSORSHIP PAGE LOAD
  // ============================================================

  useEffect(() => {
    if (activePage !== "Sponsorships") return;

    fetchSponsorships();
    fetchSponsorshipSummary();
    fetchSponsorshipByStatus();
    fetchSponsorshipByBrand();
  }, [activePage]);

  // ============================================================
  // SPONSORSHIP FORM CHANGE
  // ============================================================

  const handleSponsorshipFormChange = (e) => {
    const { name, value } = e.target;

    setSponsorshipForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // ADD SPONSORSHIP
  // ============================================================

  const handleAddSponsorship = () => {
    setEditingSponsorshipId(null);

    setSponsorshipForm({
      ...emptySponsorshipForm,
      start_date: new Date()
        .toISOString()
        .split("T")[0],
    });

    setShowSponsorshipForm(true);
  };

  // ============================================================
  // EDIT SPONSORSHIP
  // ============================================================

  const handleEditSponsorship = (
    sponsorship
  ) => {
    setEditingSponsorshipId(
      sponsorship.id
    );

    setSponsorshipForm({
      creator_id:
        sponsorship.creator_id || 1,
      brand_name:
        sponsorship.brand_name || "",
      campaign_name:
        sponsorship.campaign_name || "",
      amount:
        sponsorship.amount || 0,
      status:
        sponsorship.status || "Pending",
      start_date:
        sponsorship.start_date || "",
      end_date:
        sponsorship.end_date || "",
    });

    setShowSponsorshipForm(true);
  };

  // ============================================================
  // CREATE / UPDATE SPONSORSHIP
  // ============================================================

  const handleSubmitSponsorship = async (
    e
  ) => {
    e.preventDefault();

    setSponsorshipLoading(true);

    const payload = {
      creator_id: Number(
        sponsorshipForm.creator_id
      ),
      brand_name:
        sponsorshipForm.brand_name,
      campaign_name:
        sponsorshipForm.campaign_name,
      amount: Number(
        sponsorshipForm.amount
      ),
      status:
        sponsorshipForm.status,
      start_date:
        sponsorshipForm.start_date,
      end_date:
        sponsorshipForm.end_date || null,
    };

    try {
      if (editingSponsorshipId) {
        const updatePayload = {
          brand_name:
            payload.brand_name,
          campaign_name:
            payload.campaign_name,
          amount:
            payload.amount,
          status:
            payload.status,
          start_date:
            payload.start_date,
          end_date:
            payload.end_date,
        };

        await axios.put(
          `${API_URL}/sponsorships/${editingSponsorshipId}`,
          updatePayload
        );

        alert(
          "Sponsorship updated successfully!"
        );
      } else {
        await axios.post(
          `${API_URL}/sponsorships/`,
          payload
        );

        alert(
          "Sponsorship created successfully!"
        );
      }

      setShowSponsorshipForm(false);
      setEditingSponsorshipId(null);
      setSponsorshipForm(
        emptySponsorshipForm
      );

      fetchSponsorships();
      fetchSponsorshipSummary();
      fetchSponsorshipByStatus();
      fetchSponsorshipByBrand();
    } catch (error) {
      console.error(
        "Sponsorship Save Error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to save sponsorship."
      );
    } finally {
      setSponsorshipLoading(false);
    }
  };

  // ============================================================
  // DELETE SPONSORSHIP
  // ============================================================

  const handleDeleteSponsorship = async (
    sponsorshipId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sponsorship?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${API_URL}/sponsorships/${sponsorshipId}`
      );

      alert(
        "Sponsorship deleted successfully!"
      );

      fetchSponsorships();
      fetchSponsorshipSummary();
      fetchSponsorshipByStatus();
      fetchSponsorshipByBrand();
    } catch (error) {
      console.error(
        "Delete Sponsorship Error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to delete sponsorship."
      );
    }
  };
    // ============================================================
  // NOTIFICATIONS - GET ALL
  // ============================================================

  const fetchNotifications = () => {
    setNotificationLoading(true);

    axios
      .get(`${API_URL}/notifications/`)
      .then((response) => {
        setNotificationData(response.data || []);
      })
      .catch((error) => {
        console.error(
          "Notification Fetch Error:",
          error
        );

        setNotificationData([]);
      })
      .finally(() => {
        setNotificationLoading(false);
      });
  };

  // ============================================================
  // NOTIFICATION PAGE LOAD
  // ============================================================

  useEffect(() => {
    if (activePage !== "Notifications") return;

    fetchNotifications();
  }, [activePage]);

  // ============================================================
  // NOTIFICATION FORM CHANGE
  // ============================================================

  const handleNotificationFormChange = (e) => {
    const { name, value } = e.target;

    setNotificationForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // ADD NOTIFICATION
  // ============================================================

  const handleAddNotification = () => {
    setNotificationForm({
      creator_id: 1,
      notification_type: "Alert",
      title: "",
      message: "",
      is_read: false,
    });

    setShowNotificationForm(true);
  };

  // ============================================================
  // CREATE NOTIFICATION
  // ============================================================

  const handleSubmitNotification = async (e) => {
    e.preventDefault();

    setNotificationLoading(true);

    const payload = {
      creator_id: Number(
        notificationForm.creator_id
      ),
      notification_type:
        notificationForm.notification_type,
      title: notificationForm.title,
      message: notificationForm.message,
      is_read: Boolean(
        notificationForm.is_read
      ),
    };

    try {
      await axios.post(
        `${API_URL}/notifications/`,
        payload
      );

      alert(
        "Notification created successfully!"
      );

      setShowNotificationForm(false);

      setNotificationForm({
        creator_id: 1,
        notification_type: "Alert",
        title: "",
        message: "",
        is_read: false,
      });

      fetchNotifications();
    } catch (error) {
      console.error(
        "Notification Save Error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Failed to create notification."
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  // ============================================================
  // DASHBOARD
  // ============================================================

  const renderDashboard = () => {
    return (
      <>
        <header className="header">
          <div>
            <h1>
              Creator Analytics Dashboard
            </h1>

            <p>
              Track your content performance
              across platforms
            </p>
          </div>

          <select
            value={platform}
            onChange={(e) =>
              setPlatform(e.target.value)
            }
            className="platform-select"
          >
            <option value="All">
              All Platforms
            </option>

            <option value="YouTube">
              YouTube
            </option>

            <option value="Instagram">
              Instagram
            </option>
          </select>
        </header>

        <div className="platform-info">
          Showing analytics for:{" "}
          <strong>{platform}</strong>
        </div>

        <section className="kpi-grid">
          <div className="kpi-card">
            <p>Total Views</p>

            <h2>
              {kpiData.total_views.toLocaleString()}
            </h2>

            <span>
              Overall content views
            </span>
          </div>

          <div className="kpi-card">
            <p>Total Likes</p>

            <h2>
              {kpiData.total_likes.toLocaleString()}
            </h2>

            <span>
              Total audience likes
            </span>
          </div>

          <div className="kpi-card">
            <p>Total Comments</p>

            <h2>
              {kpiData.total_comments.toLocaleString()}
            </h2>

            <span>
              Audience interactions
            </span>
          </div>

          <div className="kpi-card">
            <p>Total Reach</p>

            <h2>
              {kpiData.total_reach.toLocaleString()}
            </h2>

            <span>
              People reached
            </span>
          </div>
        </section>

        <section className="chart-grid">
          <div className="chart-card">
            <div className="card-header">
              <h3>
                Engagement Trend
              </h3>

              <span>{platform}</span>
            </div>

            <div
              className="chart-placeholder"
              style={{ height: "400px" }}
            >
              {engagementData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={engagementData}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis dataKey="date" />

                    <YAxis />

                    <Tooltip
                      formatter={(value) => [
                        `${value}%`,
                        "Engagement",
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="#2563eb"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p>
                  No engagement data available
                </p>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="card-header">
              <h3>
                Platform Comparison
              </h3>

              <span>Views</span>
            </div>

            <div
              className="chart-placeholder"
              style={{ height: "400px" }}
            >
              {platformComparisonData.length >
              0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      platformComparisonData
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="platform"
                    />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="views"
                      fill="#2563eb"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>
                  No platform comparison
                  data available
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="content-card">
          <div className="card-header">
            <h3>
              Top Performing Content
            </h3>

            <span>{platform}</span>
          </div>

          <div className="content-list">
            {topContentData.length > 0 ? (
              topContentData.map(
                (content, index) => (
                  <div
                    className="content-row"
                    key={index}
                  >
                    <span>
                      {index + 1}
                    </span>

                    <div>
                      <strong>
                        {
                          content.content_title
                        }
                      </strong>

                      <small>
                        {
                          content.platform
                        }{" "}
                        • Engagement{" "}
                        {
                          content.engagement_rate
                        }%
                      </small>
                    </div>

                    <strong>
                      {(
                        content.views || 0
                      ).toLocaleString()}{" "}
                      views
                    </strong>
                  </div>
                )
              )
            ) : (
              <p>
                No top performing content
                available
              </p>
            )}
          </div>
        </section>
      </>
    );
  };

  // ============================================================
  // CONTENT PAGE
  // ============================================================

  const renderContentPage = () => {
    return (
      <>
        <header className="header">
          <div>
            <h1>
              Content Management
            </h1>

            <p>
              Create, view, update and
              delete your content
            </p>
          </div>

          <button
            className="add-content-btn"
            onClick={handleAddContent}
          >
            + Add Content
          </button>
        </header>

        <div className="content-toolbar">
          <select
            value={platform}
            onChange={(e) =>
              setPlatform(e.target.value)
            }
            className="platform-select"
          >
            <option value="All">
              All Platforms
            </option>

            <option value="YouTube">
              YouTube
            </option>

            <option value="Instagram">
              Instagram
            </option>
          </select>

          <div className="content-count">
            Total:{" "}
            <strong>
              {filteredContent.length}
            </strong>
          </div>
        </div>

        <section className="content-card">
          <div className="card-header">
            <h3>
              All Content
            </h3>

            <span>
              {filteredContent.length} records
            </span>
          </div>

          <div className="content-table-wrapper">
            <table className="content-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Platform</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Comments</th>
                  <th>Shares</th>
                  <th>Reach</th>
                  <th>Published Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredContent.length > 0 ? (
                  filteredContent.map(
                    (content) => (
                      <tr key={content.id}>
                        <td className="content-title">
                          {
                            content.content_title
                          }
                        </td>

                        <td>
                          <span className="platform-badge">
                            {
                              content.platform
                            }
                          </span>
                        </td>

                        <td>
                          {(
                            content.views || 0
                          ).toLocaleString()}
                        </td>

                        <td>
                          {(
                            content.likes || 0
                          ).toLocaleString()}
                        </td>

                        <td>
                          {(
                            content.comments || 0
                          ).toLocaleString()}
                        </td>

                        <td>
                          {(
                            content.shares || 0
                          ).toLocaleString()}
                        </td>

                        <td>
                          {(
                            content.reach || 0
                          ).toLocaleString()}
                        </td>

                        <td>
                          {
                            content.published_date
                          }
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-btn"
                              onClick={() =>
                                handleEditContent(
                                  content
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDeleteContent(
                                  content.id
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="empty-message"
                    >
                      No content available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showContentForm && (
          <div className="modal-overlay">
            <div className="content-modal">
              <div className="modal-header">
                <div>
                  <h2>
                    {editingContentId
                      ? "Edit Content"
                      : "Add New Content"}
                  </h2>

                  <p>
                    {editingContentId
                      ? "Update content details"
                      : "Enter your content details"}
                  </p>
                </div>

                <button
                  className="close-modal-btn"
                  onClick={() =>
                    setShowContentForm(false)
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleSubmitContent
                }
                className="content-form"
              >
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Platform
                    </label>

                    <select
                      name="platform"
                      value={
                        contentForm.platform
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    >
                      <option value="YouTube">
                        YouTube
                      </option>

                      <option value="Instagram">
                        Instagram
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Published Date
                    </label>

                    <input
                      type="date"
                      name="published_date"
                      value={
                        contentForm.published_date
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Content Title
                  </label>

                  <input
                    type="text"
                    name="content_title"
                    value={
                      contentForm.content_title
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Enter content title"
                    required
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Views
                    </label>

                    <input
                      type="number"
                      name="views"
                      min="0"
                      value={
                        contentForm.views
                      }
                      onChange={
                        handleFormChange
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Likes
                    </label>

                    <input
                      type="number"
                      name="likes"
                      min="0"
                      value={
                        contentForm.likes
                      }
                      onChange={
                        handleFormChange
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Comments
                    </label>

                    <input
                      type="number"
                      name="comments"
                      min="0"
                      value={
                        contentForm.comments
                      }
                      onChange={
                        handleFormChange
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Shares
                    </label>

                    <input
                      type="number"
                      name="shares"
                      min="0"
                      value={
                        contentForm.shares
                      }
                      onChange={
                        handleFormChange
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Saves
                    </label>

                    <input
                      type="number"
                      name="saves"
                      min="0"
                      value={
                        contentForm.saves
                      }
                      onChange={
                        handleFormChange
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Watch Time
                    </label>

                    <input
                      type="number"
                      name="watch_time"
                      min="0"
                      value={
                        contentForm.watch_time
                      }
                      onChange={
                        handleFormChange
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Reach
                    </label>

                    <input
                      type="number"
                      name="reach"
                      min="0"
                      value={
                        contentForm.reach
                      }
                      onChange={
                        handleFormChange
                      }
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() =>
                      setShowContentForm(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-btn"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : editingContentId
                      ? "Update Content"
                      : "Create Content"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  };

  // ============================================================
  // ANALYTICS PAGE
  // ============================================================

  const renderAnalyticsPage = () => {
    return (
      <>
        <header className="header">
          <div>
            <h1>Analytics</h1>

            <p>
              Detailed performance analytics
              across your platforms
            </p>
          </div>

          <select
            value={platform}
            onChange={(e) =>
              setPlatform(e.target.value)
            }
            className="platform-select"
          >
            <option value="All">
              All Platforms
            </option>

            <option value="YouTube">
              YouTube
            </option>

            <option value="Instagram">
              Instagram
            </option>
          </select>
        </header>

        <div className="platform-info">
          Showing detailed analytics for:{" "}
          <strong>{platform}</strong>
        </div>

        <section className="kpi-grid">
          <div className="kpi-card">
            <p>Total Views</p>

            <h2>
              {analyticsKpi.total_views.toLocaleString()}
            </h2>

            <span>
              Total content views
            </span>
          </div>

          <div className="kpi-card">
            <p>Total Likes</p>

            <h2>
              {analyticsKpi.total_likes.toLocaleString()}
            </h2>

            <span>
              Total audience likes
            </span>
          </div>

          <div className="kpi-card">
            <p>Total Comments</p>

            <h2>
              {analyticsKpi.total_comments.toLocaleString()}
            </h2>

            <span>
              Audience comments
            </span>
          </div>

          <div className="kpi-card">
            <p>Average Engagement</p>

            <h2>
              {
                analyticsKpi.average_engagement_rate
              }%
            </h2>

            <span>
              Average engagement rate
            </span>
          </div>
        </section>

        <section className="chart-grid">
          <div className="chart-card">
            <div className="card-header">
              <h3>
                Engagement Trend
              </h3>

              <span>{platform}</span>
            </div>

            <div
              className="chart-placeholder"
              style={{ height: "400px" }}
            >
              {analyticsEngagement.length >
              0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={
                      analyticsEngagement
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="date"
                    />

                    <YAxis />

                    <Tooltip
                      formatter={(value) => [
                        `${value}%`,
                        "Engagement",
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p>
                  No engagement data available
                </p>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="card-header">
              <h3>
                Platform Comparison
              </h3>

              <span>Views</span>
            </div>

            <div
              className="chart-placeholder"
              style={{ height: "400px" }}
            >
              {analyticsPlatformComparison.length >
              0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      analyticsPlatformComparison
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="platform"
                    />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="views"
                      fill="#2563eb"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>
                  No platform comparison
                  data available
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="content-card">
          <div className="card-header">
            <h3>
              Platform Performance
            </h3>

            <span>{platform}</span>
          </div>

          {analyticsPlatformPerformance.length >
          0 ? (
            <div className="content-table-wrapper">
              <table className="content-table">
                <thead>
                  <tr>
                    <th>Platform</th>
                    <th>Views</th>
                    <th>Reach</th>
                    <th>Likes</th>
                    <th>Comments</th>
                    <th>
                      Engagement Rate
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {analyticsPlatformPerformance.map(
                    (item, index) => (
                      <tr key={index}>
                        <td>
                          <span className="platform-badge">
                            {
                              item.platform ||
                              item.name ||
                              "Platform"
                            }
                          </span>
                        </td>

                        <td>
                          {(
                            item.views ||
                            item.total_views ||
                            0
                          ).toLocaleString()}
                        </td>

                        <td>
                          {(
                            item.reach ||
                            item.total_reach ||
                            0
                          ).toLocaleString()}
                        </td>

                        <td>
                          {(
                            item.likes ||
                            item.total_likes ||
                            0
                          ).toLocaleString()}
                        </td>

                        <td>
                          {(
                            item.comments ||
                            item.total_comments ||
                            0
                          ).toLocaleString()}
                        </td>

                        <td>
                          {
                            item.engagement_rate ||
                            item.average_engagement_rate ||
                            0
                          }%
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="placeholder-page">
              <h2>
                No Platform Performance
              </h2>

              <p>
                No platform performance
                data available.
              </p>
            </div>
          )}
        </section>

        <section
          className="content-card"
          style={{ marginTop: "22px" }}
        >
          <div className="card-header">
            <h3>
              Top Performing Content
            </h3>

            <span>{platform}</span>
          </div>

          <div className="content-list">
            {analyticsTopContent.length >
            0 ? (
              analyticsTopContent.map(
                (content, index) => (
                  <div
                    className="content-row"
                    key={index}
                  >
                    <span>
                      {index + 1}
                    </span>

                    <div>
                      <strong>
                        {
                          content.content_title
                        }
                      </strong>

                      <small>
                        {
                          content.platform
                        }{" "}
                        • Engagement{" "}
                        {
                          content.engagement_rate
                        }%
                      </small>
                    </div>

                    <strong>
                      {(
                        content.views || 0
                      ).toLocaleString()}{" "}
                      views
                    </strong>
                  </div>
                )
              )
            ) : (
              <p>
                No top performing content
                available
              </p>
            )}
          </div>
        </section>
      </>
    );
  };

  // ============================================================
  // AUDIENCE PAGE
  // ============================================================

  const renderAudiencePage = () => {
    const totalFollowers = audienceData.reduce(
      (sum, item) =>
        sum + Number(item.followers || 0),
      0
    );

    const totalImpressions = audienceData.reduce(
      (sum, item) =>
        sum + Number(item.impressions || 0),
      0
    );

    const totalReach = audienceData.reduce(
      (sum, item) =>
        sum + Number(item.reach || 0),
      0
    );

    return (
      <>
        <header className="header">
          <div>
            <h1>
              Audience Management
            </h1>

            <p>
              Manage and analyze your audience
              information
            </p>
          </div>

          <button
            className="add-content-btn"
            onClick={handleAddAudience}
          >
            + Add Audience
          </button>
        </header>

        <section className="kpi-grid">
          <div className="kpi-card">
            <p>Audience Records</p>

            <h2>
              {audienceData.length.toLocaleString()}
            </h2>

            <span>
              Total audience records
            </span>
          </div>

          <div className="kpi-card">
            <p>Followers</p>

            <h2>
              {totalFollowers.toLocaleString()}
            </h2>

            <span>
              Total followers
            </span>
          </div>

          <div className="kpi-card">
            <p>Impressions</p>

            <h2>
              {totalImpressions.toLocaleString()}
            </h2>

            <span>
              Total impressions
            </span>
          </div>

          <div className="kpi-card">
            <p>Reach</p>

            <h2>
              {totalReach.toLocaleString()}
            </h2>

            <span>
              Total audience reach
            </span>
          </div>
        </section>

        <section className="content-card">
          <div className="card-header">
            <h3>
              Audience Records
            </h3>

            <span>
              {audienceData.length} records
            </span>
          </div>

          <div className="content-table-wrapper">
            <table className="content-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Age Group</th>
                  <th>Gender</th>
                  <th>Country</th>
                  <th>City</th>
                  <th>Device</th>
                  <th>Active Hour</th>
                  <th>Followers</th>
                  <th>Impressions</th>
                  <th>Reach</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {audienceData.length > 0 ? (
                  audienceData.map(
                    (audience) => (
                      <tr key={audience.id}>
                        <td>
                          {audience.id}
                        </td>

                        <td>
                          {audience.age_group}
                        </td>

                        <td>
                          {audience.gender}
                        </td>

                        <td>
                          {audience.country}
                        </td>

                        <td>
                          {audience.city}
                        </td>

                        <td>
                          {audience.device_type}
                        </td>

                        <td>
                          {
                            audience.active_hour
                          }
                          :00
                        </td>

                        <td>
                          {(
                            audience.followers ||
                            0
                          ).toLocaleString()}
                        </td>

                        <td>
                          {(
                            audience.impressions ||
                            0
                          ).toLocaleString()}
                        </td>

                        <td>
                          {(
                            audience.reach ||
                            0
                          ).toLocaleString()}
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-btn"
                              onClick={() =>
                                handleEditAudience(
                                  audience
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDeleteAudience(
                                  audience.id
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="11"
                      className="empty-message"
                    >
                      No audience records
                      available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className="chart-grid"
          style={{
            marginTop: "22px",
          }}
        >
          <div className="chart-card">
            <div className="card-header">
              <h3>
                Audience Growth
              </h3>

              <span>
                Followers
              </span>
            </div>

            <div
              className="chart-placeholder"
              style={{ height: "400px" }}
            >
              {audienceTrends.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={audienceTrends}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="date"
                    />

                    <YAxis />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="followers"
                      stroke="#2563eb"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p>
                  No audience growth data
                  available
                </p>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="card-header">
              <h3>
                Audience Reach
              </h3>

              <span>
                Reach
              </span>
            </div>

            <div
              className="chart-placeholder"
              style={{ height: "400px" }}
            >
              {audienceTrends.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={audienceTrends}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="date"
                    />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="reach"
                      fill="#2563eb"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>
                  No audience reach data
                  available
                </p>
              )}
            </div>
          </div>
        </section>

        <section
          className="content-card"
          style={{ marginTop: "22px" }}
        >
          <div className="card-header">
            <h3>
              Audience Trend Details
            </h3>

            <span>
              {audienceTrends.length} records
            </span>
          </div>

          <div className="content-table-wrapper">
            <table className="content-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Followers</th>
                  <th>Reach</th>
                </tr>
              </thead>

              <tbody>
                {audienceTrends.length > 0 ? (
                  audienceTrends.map(
                    (item, index) => (
                      <tr key={index}>
                        <td>
                          {item.date}
                        </td>

                        <td>
                          {Number(
                            item.followers
                          ).toLocaleString()}
                        </td>

                        <td>
                          {Number(
                            item.reach
                          ).toLocaleString()}
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="empty-message"
                    >
                      No audience trend
                      data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showAudienceForm && (
          <div className="modal-overlay">
            <div className="content-modal">
              <div className="modal-header">
                <div>
                  <h2>
                    {editingAudienceId
                      ? "Edit Audience"
                      : "Add New Audience"}
                  </h2>

                  <p>
                    {editingAudienceId
                      ? "Update audience details"
                      : "Enter audience details"}
                  </p>
                </div>

                <button
                  className="close-modal-btn"
                  onClick={() =>
                    setShowAudienceForm(false)
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleSubmitAudience
                }
                className="content-form"
              >
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Creator ID
                    </label>

                    <input
                      type="number"
                      name="creator_id"
                      min="1"
                      value={
                        audienceForm.creator_id
                      }
                      onChange={
                        handleAudienceFormChange
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Age Group
                    </label>

                    <select
                      name="age_group"
                      value={
                        audienceForm.age_group
                      }
                      onChange={
                        handleAudienceFormChange
                      }
                      required
                    >
                      <option value="">
                        Select Age Group
                      </option>

                      <option value="13-17">
                        13-17
                      </option>

                      <option value="18-24">
                        18-24
                      </option>

                      <option value="25-34">
                        25-34
                      </option>

                      <option value="35-44">
                        35-44
                      </option>

                      <option value="45-54">
                        45-54
                      </option>

                      <option value="55+">
                        55+
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Gender
                    </label>

                    <select
                      name="gender"
                      value={
                        audienceForm.gender
                      }
                      onChange={
                        handleAudienceFormChange
                      }
                      required
                    >
                      <option value="">
                        Select Gender
                      </option>

                      <option value="Male">
                        Male
                      </option>

                      <option value="Female">
                        Female
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Country
                    </label>

                    <input
                      type="text"
                      name="country"
                      value={
                        audienceForm.country
                      }
                      onChange={
                        handleAudienceFormChange
                      }
                      placeholder="Enter country"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={
                        audienceForm.city
                      }
                      onChange={
                        handleAudienceFormChange
                      }
                      placeholder="Enter city"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Device Type
                    </label>

                    <select
                      name="device_type"
                      value={
                        audienceForm.device_type
                      }
                      onChange={
                        handleAudienceFormChange
                      }
                      required
                    >
                      <option value="">
                        Select Device
                      </option>

                      <option value="Mobile">
                        Mobile
                      </option>

                      <option value="Desktop">
                        Desktop
                      </option>

                      <option value="Tablet">
                        Tablet
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Active Hour
                    </label>

                    <input
                      type="number"
                      name="active_hour"
                      min="0"
                      max="23"
                      value={
                        audienceForm.active_hour
                      }
                      onChange={
                        handleAudienceFormChange
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Followers
                    </label>

                    <input
                      type="number"
                      name="followers"
                      min="0"
                      value={
                        audienceForm.followers
                      }
                      onChange={
                        handleAudienceFormChange
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Impressions
                    </label>

                    <input
                      type="number"
                      name="impressions"
                      min="0"
                      value={
                        audienceForm.impressions
                      }
                      onChange={
                        handleAudienceFormChange
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Reach
                    </label>

                    <input
                      type="number"
                      name="reach"
                      min="0"
                      value={
                        audienceForm.reach
                      }
                      onChange={
                        handleAudienceFormChange
                      }
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() =>
                      setShowAudienceForm(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-btn"
                    disabled={
                      audienceLoading
                    }
                  >
                    {audienceLoading
                      ? "Saving..."
                      : editingAudienceId
                      ? "Update Audience"
                      : "Create Audience"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  };

  // ============================================================
  // REVENUE PAGE
  // ============================================================

  const renderRevenuePage = () => {
    const dashboard = revenueDashboard || {};

    const totalRevenue = Number(
      dashboard.total_revenue ??
        revenueSummary?.total_revenue ??
        0
    );

    const totalTransactions = Number(
      dashboard.total_transactions ??
        revenueSummary?.revenue_count ??
        0
    );

    const averageRevenue = Number(
      dashboard.average_revenue ?? 0
    );

    return (
      <>
        <header className="header">
          <div>
            <h1>
              Revenue Management
            </h1>

            <p>
              Track and analyze your creator
              revenue
            </p>
          </div>

          <button
            className="add-content-btn"
            onClick={handleAddRevenue}
          >
            + Add Revenue
          </button>
        </header>

        {/* REVENUE KPI */}

        <section className="kpi-grid">
          <div className="kpi-card">
            <p>Total Revenue</p>

            <h2>
              ₹{totalRevenue.toLocaleString()}
            </h2>

            <span>
              Total earnings
            </span>
          </div>

          <div className="kpi-card">
            <p>Total Transactions</p>

            <h2>
              {totalTransactions.toLocaleString()}
            </h2>

            <span>
              Revenue records
            </span>
          </div>

          <div className="kpi-card">
            <p>Average Revenue</p>

            <h2>
              ₹{averageRevenue.toLocaleString()}
            </h2>

            <span>
              Average per transaction
            </span>
          </div>

          <div className="kpi-card">
            <p>Currency</p>

            <h2>INR</h2>

            <span>
              Default revenue currency
            </span>
          </div>
        </section>

        {/* REVENUE CHARTS */}

        <section className="chart-grid">
          {/* BY SOURCE */}

          <div className="chart-card">
            <div className="card-header">
              <h3>
                Revenue by Source
              </h3>

              <span>
                Source
              </span>
            </div>

            <div
              className="chart-placeholder"
              style={{ height: "400px" }}
            >
              {revenueBySource.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={revenueBySource}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="source"
                    />

                    <YAxis />

                    <Tooltip
                      formatter={(value) => [
                        `₹${Number(
                          value
                        ).toLocaleString()}`,
                        "Revenue",
                      ]}
                    />

                    <Bar
                      dataKey="total_amount"
                      fill="#2563eb"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>
                  No revenue source data
                  available
                </p>
              )}
            </div>
          </div>

          {/* MONTHLY REVENUE */}

          <div className="chart-card">
            <div className="card-header">
              <h3>
                Monthly Revenue
              </h3>

              <span>
                Monthly
              </span>
            </div>

            <div
              className="chart-placeholder"
              style={{ height: "400px" }}
            >
              {monthlyRevenue.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={monthlyRevenue.map(
                      (item) => ({
                        ...item,
                        monthLabel: `${item.month}/${item.year}`,
                        total_amount: Number(
                          item.total_amount || 0
                        ),
                      })
                    )}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="monthLabel"
                    />

                    <YAxis />

                    <Tooltip
                      formatter={(value) => [
                        `₹${Number(
                          value
                        ).toLocaleString()}`,
                        "Revenue",
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="total_amount"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p>
                  No monthly revenue data
                  available
                </p>
              )}
            </div>
          </div>
        </section>

        {/* REVENUE TABLE */}

        <section className="content-card">
          <div className="card-header">
            <h3>
              Revenue Records
            </h3>

            <span>
              {revenueData.length} records
            </span>
          </div>

          <div className="content-table-wrapper">
            <table className="content-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Source</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Revenue Date</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {revenueData.length > 0 ? (
                  revenueData.map(
                    (revenue) => (
                      <tr key={revenue.id}>
                        <td>
                          {revenue.id}
                        </td>

                        <td>
                          <span className="platform-badge">
                            {revenue.source}
                          </span>
                        </td>

                        <td>
                          {Number(
                            revenue.amount || 0
                          ).toLocaleString()}
                        </td>

                        <td>
                          {revenue.currency}
                        </td>

                        <td>
                          {revenue.revenue_date}
                        </td>

                        <td>
                          {revenue.description ||
                            "-"}
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-btn"
                              onClick={() =>
                                handleEditRevenue(
                                  revenue
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDeleteRevenue(
                                  revenue.id,
                                  revenue.creator_id
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="empty-message"
                    >
                      {revenueLoading
                        ? "Loading revenue records..."
                        : "No revenue records available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* REVENUE MODAL */}

        {showRevenueForm && (
          <div className="modal-overlay">
            <div className="content-modal">
              <div className="modal-header">
                <div>
                  <h2>
                    {editingRevenueId
                      ? "Edit Revenue"
                      : "Add New Revenue"}
                  </h2>

                  <p>
                    {editingRevenueId
                      ? "Update revenue details"
                      : "Enter revenue details"}
                  </p>
                </div>

                <button
                  className="close-modal-btn"
                  onClick={() =>
                    setShowRevenueForm(false)
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleSubmitRevenue
                }
                className="content-form"
              >
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Creator ID
                    </label>

                    <input
                      type="number"
                      name="creator_id"
                      min="1"
                      value={
                        revenueForm.creator_id
                      }
                      onChange={
                        handleRevenueFormChange
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Source
                    </label>

                    <select
                      name="source"
                      value={
                        revenueForm.source
                      }
                      onChange={
                        handleRevenueFormChange
                      }
                      required
                    >
                      <option value="">
                        Select Source
                      </option>

                      <option value="Sponsorship">
                        Sponsorship
                      </option>

                      <option value="YouTube">
                        YouTube
                      </option>

                      <option value="Instagram">
                        Instagram
                      </option>

                      <option value="Affiliate">
                        Affiliate
                      </option>

                      <option value="Ads">
                        Ads
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Amount
                    </label>

                    <input
                      type="number"
                      name="amount"
                      min="0"
                      step="0.01"
                      value={
                        revenueForm.amount
                      }
                      onChange={
                        handleRevenueFormChange
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Currency
                    </label>

                    <select
                      name="currency"
                      value={
                        revenueForm.currency
                      }
                      onChange={
                        handleRevenueFormChange
                      }
                      required
                    >
                      <option value="INR">
                        INR
                      </option>

                      <option value="USD">
                        USD
                      </option>

                      <option value="EUR">
                        EUR
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Revenue Date
                    </label>

                    <input
                      type="date"
                      name="revenue_date"
                      value={
                        revenueForm.revenue_date
                      }
                      onChange={
                        handleRevenueFormChange
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      revenueForm.description
                    }
                    onChange={
                      handleRevenueFormChange
                    }
                    placeholder="Enter revenue description"
                    rows="4"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() =>
                      setShowRevenueForm(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-btn"
                    disabled={
                      revenueLoading
                    }
                  >
                    {revenueLoading
                      ? "Saving..."
                      : editingRevenueId
                      ? "Update Revenue"
                      : "Create Revenue"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  };

  // ============================================================
  // SPONSORSHIP PAGE
  // ============================================================

  const renderSponsorshipPage = () => {
    const totalSponsorships = Number(
      sponsorshipSummary?.total_sponsorships || 0
    );

    const totalValue = Number(
      sponsorshipSummary?.total_value || 0
    );

    return (
      <>
        <header className="header">
          <div>
            <h1>
              Sponsorship Management
            </h1>

            <p>
              Track and manage brand
              sponsorship campaigns
            </p>
          </div>

          <button
            className="add-content-btn"
            onClick={
              handleAddSponsorship
            }
          >
            + Add Sponsorship
          </button>
        </header>

        {/* SPONSORSHIP KPI */}

        <section className="kpi-grid">
          <div className="kpi-card">
            <p>Total Sponsorships</p>

            <h2>
              {totalSponsorships.toLocaleString()}
            </h2>

            <span>
              Total sponsorship campaigns
            </span>
          </div>

          <div className="kpi-card">
            <p>
              Total Sponsorship Value
            </p>

            <h2>
              ₹{totalValue.toLocaleString()}
            </h2>

            <span>
              Total campaign value
            </span>
          </div>

          <div className="kpi-card">
            <p>Brands</p>

            <h2>
              {sponsorshipByBrand.length}
            </h2>

            <span>
              Partner brands
            </span>
          </div>

          <div className="kpi-card">
            <p>Status Types</p>

            <h2>
              {sponsorshipByStatus.length}
            </h2>

            <span>
              Sponsorship statuses
            </span>
          </div>
        </section>

        {/* SPONSORSHIP CHARTS */}

        <section className="chart-grid">
          {/* STATUS CHART */}

          <div className="chart-card">
            <div className="card-header">
              <h3>
                Sponsorships by Status
              </h3>

              <span>
                Status
              </span>
            </div>

            <div
              className="chart-placeholder"
              style={{ height: "400px" }}
            >
              {sponsorshipByStatus.length >
              0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      sponsorshipByStatus
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="status"
                    />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="count"
                      fill="#2563eb"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>
                  No sponsorship status data
                  available
                </p>
              )}
            </div>
          </div>

          {/* BRAND CHART */}

          <div className="chart-card">
            <div className="card-header">
              <h3>
                Sponsorship Value by Brand
              </h3>

              <span>
                Brand
              </span>
            </div>

            <div
              className="chart-placeholder"
              style={{ height: "400px" }}
            >
              {sponsorshipByBrand.length >
              0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      sponsorshipByBrand
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="brand_name"
                    />

                    <YAxis />

                    <Tooltip
                      formatter={(value) => [
                        `₹${Number(
                          value
                        ).toLocaleString()}`,
                        "Amount",
                      ]}
                    />

                    <Bar
                      dataKey="total_amount"
                      fill="#2563eb"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>
                  No sponsorship brand data
                  available
                </p>
              )}
            </div>
          </div>
        </section>

        {/* SPONSORSHIP TABLE */}

        <section className="content-card">
          <div className="card-header">
            <h3>
              Sponsorship Records
            </h3>

            <span>
              {sponsorshipData.length} records
            </span>
          </div>

          <div className="content-table-wrapper">
            <table className="content-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Brand</th>
                  <th>Campaign</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sponsorshipData.length > 0 ? (
                  sponsorshipData.map(
                    (sponsorship) => (
                      <tr
                        key={
                          sponsorship.id
                        }
                      >
                        <td>
                          {sponsorship.id}
                        </td>

                        <td>
                          {
                            sponsorship.brand_name
                          }
                        </td>

                        <td>
                          {
                            sponsorship.campaign_name
                          }
                        </td>

                        <td>
                          ₹
                          {Number(
                            sponsorship.amount ||
                              0
                          ).toLocaleString()}
                        </td>

                        <td>
                          <span className="platform-badge">
                            {
                              sponsorship.status
                            }
                          </span>
                        </td>

                        <td>
                          {
                            sponsorship.start_date
                          }
                        </td>

                        <td>
                          {sponsorship.end_date ||
                            "-"}
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-btn"
                              onClick={() =>
                                handleEditSponsorship(
                                  sponsorship
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDeleteSponsorship(
                                  sponsorship.id
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="empty-message"
                    >
                      No sponsorship records
                      available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* SPONSORSHIP MODAL */}

        {showSponsorshipForm && (
          <div className="modal-overlay">
            <div className="content-modal">
              <div className="modal-header">
                <div>
                  <h2>
                    {editingSponsorshipId
                      ? "Edit Sponsorship"
                      : "Add New Sponsorship"}
                  </h2>

                  <p>
                    {editingSponsorshipId
                      ? "Update sponsorship details"
                      : "Enter sponsorship details"}
                  </p>
                </div>

                <button
                  className="close-modal-btn"
                  onClick={() =>
                    setShowSponsorshipForm(
                      false
                    )
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleSubmitSponsorship
                }
                className="content-form"
              >
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      Creator ID
                    </label>

                    <input
                      type="number"
                      name="creator_id"
                      min="1"
                      value={
                        sponsorshipForm.creator_id
                      }
                      onChange={
                        handleSponsorshipFormChange
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Brand Name
                    </label>

                    <input
                      type="text"
                      name="brand_name"
                      value={
                        sponsorshipForm.brand_name
                      }
                      onChange={
                        handleSponsorshipFormChange
                      }
                      placeholder="Enter brand name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Campaign Name
                    </label>

                    <input
                      type="text"
                      name="campaign_name"
                      value={
                        sponsorshipForm.campaign_name
                      }
                      onChange={
                        handleSponsorshipFormChange
                      }
                      placeholder="Enter campaign name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Amount
                    </label>

                    <input
                      type="number"
                      name="amount"
                      min="0"
                      step="0.01"
                      value={
                        sponsorshipForm.amount
                      }
                      onChange={
                        handleSponsorshipFormChange
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Status
                    </label>

                    <select
                      name="status"
                      value={
                        sponsorshipForm.status
                      }
                      onChange={
                        handleSponsorshipFormChange
                      }
                      required
                    >
                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Active">
                        Active
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="Cancelled">
                        Cancelled
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Start Date
                    </label>

                    <input
                      type="date"
                      name="start_date"
                      value={
                        sponsorshipForm.start_date
                      }
                      onChange={
                        handleSponsorshipFormChange
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      End Date
                    </label>

                    <input
                      type="date"
                      name="end_date"
                      value={
                        sponsorshipForm.end_date
                      }
                      onChange={
                        handleSponsorshipFormChange
                      }
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() =>
                      setShowSponsorshipForm(
                        false
                      )
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-btn"
                    disabled={
                      sponsorshipLoading
                    }
                  >
                    {sponsorshipLoading
                      ? "Saving..."
                      : editingSponsorshipId
                      ? "Update Sponsorship"
                      : "Create Sponsorship"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  };
  // ============================================================
// NOTIFICATIONS PAGE
  // ============================================================

  const renderNotificationsPage = () => {
    const totalNotifications =
      notificationData.length;

    const unreadNotifications =
      notificationData.filter(
        (notification) =>
          notification.is_read === false
      ).length;

    const readNotifications =
      notificationData.filter(
        (notification) =>
          notification.is_read === true
      ).length;

    const alertNotifications =
      notificationData.filter(
        (notification) =>
          notification.notification_type ===
          "Alert"
      ).length;

    return (
      <>
        <header className="header">
          <div>
            <h1>Notifications</h1>

            <p>
              Manage creator alerts and notifications
            </p>
          </div>

          <button
            className="add-content-btn"
            onClick={handleAddNotification}
          >
            + Add Notification
          </button>
        </header>

        <section className="kpi-grid">
          <div className="kpi-card">
            <p>Total Notifications</p>
            <h2>{totalNotifications}</h2>
            <span>All notifications</span>
          </div>

          <div className="kpi-card">
            <p>Unread</p>
            <h2>{unreadNotifications}</h2>
            <span>Unread notifications</span>
          </div>

          <div className="kpi-card">
            <p>Read</p>
            <h2>{readNotifications}</h2>
            <span>Read notifications</span>
          </div>

          <div className="kpi-card">
            <p>Alerts</p>
            <h2>{alertNotifications}</h2>
            <span>Alert notifications</span>
          </div>
        </section>

        <section className="content-card">
          <div className="card-header">
            <h3>Notification Records</h3>

            <span>
              {notificationData.length} records
            </span>
          </div>

          <div className="content-table-wrapper">
            <table className="content-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>

              <tbody>
                {notificationData.length > 0 ? (
                  notificationData.map(
                    (notification) => (
                      <tr
                        key={
                          notification.id
                        }
                      >
                        <td>
                          {notification.id}
                        </td>

                        <td>
                          <span className="platform-badge">
                            {
                              notification.notification_type
                            }
                          </span>
                        </td>

                        <td>
                          <strong>
                            {
                              notification.title
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            notification.message
                          }
                        </td>

                        <td>
                          <span className="platform-badge">
                            {notification.is_read
                              ? "Read"
                              : "Unread"}
                          </span>
                        </td>

                        <td>
                          {notification.created_at
                            ? new Date(
                                notification.created_at
                              ).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="empty-message"
                    >
                      {notificationLoading
                        ? "Loading notifications..."
                        : "No notifications available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showNotificationForm && (
          <div className="modal-overlay">
            <div className="content-modal">
              <div className="modal-header">
                <div>
                  <h2>
                    Add New Notification
                  </h2>

                  <p>
                    Enter notification details
                  </p>
                </div>

                <button
                  className="close-modal-btn"
                  onClick={() =>
                    setShowNotificationForm(
                      false
                    )
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={
                  handleSubmitNotification
                }
                className="content-form"
              >
                <div className="form-grid">
                  <div className="form-group">
                    <label>Creator ID</label>

                    <input
                      type="number"
                      name="creator_id"
                      min="1"
                      value={
                        notificationForm.creator_id
                      }
                      onChange={
                        handleNotificationFormChange
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Notification Type
                    </label>

                    <select
                      name="notification_type"
                      value={
                        notificationForm.notification_type
                      }
                      onChange={
                        handleNotificationFormChange
                      }
                      required
                    >
                      <option value="Alert">
                        Alert
                      </option>

                      <option value="Reminder">
                        Reminder
                      </option>

                      <option value="Revenue Alert">
                        Revenue Alert
                      </option>

                      <option value="Report">
                        Report
                      </option>

                      <option value="System">
                        System
                      </option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Title</label>

                  <input
                    type="text"
                    name="title"
                    value={
                      notificationForm.title
                    }
                    onChange={
                      handleNotificationFormChange
                    }
                    placeholder="Enter notification title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message</label>

                  <textarea
                    name="message"
                    value={
                      notificationForm.message
                    }
                    onChange={
                      handleNotificationFormChange
                    }
                    placeholder="Enter notification message"
                    rows="5"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>

                  <select
                    name="is_read"
                    value={
                      notificationForm.is_read
                        ? "true"
                        : "false"
                    }
                    onChange={(e) =>
                      setNotificationForm(
                        (previous) => ({
                          ...previous,
                          is_read:
                            e.target.value ===
                            "true",
                        })
                      )
                    }
                    required
                  >
                    <option value="false">
                      Unread
                    </option>

                    <option value="true">
                      Read
                    </option>
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() =>
                      setShowNotificationForm(
                        false
                      )
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-btn"
                    disabled={
                      notificationLoading
                    }
                  >
                    {notificationLoading
                      ? "Saving..."
                      : "Create Notification"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  };

  // ============================================================
  // PLACEHOLDER
  // ============================================================

  const renderPlaceholder = (pageName) => {
    return (
      <>
        <header className="header">
          <div>
            <h1>{pageName}</h1>

            <p>
              {pageName} module of CreatorIQ
            </p>
          </div>
        </header>

        <section className="content-card">
          <div className="card-header">
            <h3>{pageName}</h3>
          </div>

          <div className="placeholder-page">
            <h2>
              {pageName} Page
            </h2>

            <p>
              This module will be connected
              to the backend next.
            </p>
          </div>
        </section>
      </>
    );
  };

  // ============================================================
  // MAIN UI
  // ============================================================

 return (
  <div className="app">
    <aside className="sidebar">
      <div className="logo">
        Creator<span>IQ</span>
      </div>

      <nav>
        <button
          className={`nav-item ${
            activePage === "Dashboard"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActivePage("Dashboard")
          }
        >
          Dashboard
        </button>

        <button
          className={`nav-item ${
            activePage === "Content"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActivePage("Content")
          }
        >
          Content
        </button>

        <button
          className={`nav-item ${
            activePage === "Analytics"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActivePage("Analytics")
          }
        >
          Analytics
        </button>

        <button
          className={`nav-item ${
            activePage === "Audience"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActivePage("Audience")
          }
        >
          Audience
        </button>

        <button
          className={`nav-item ${
            activePage === "Revenue"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActivePage("Revenue")
          }
        >
          Revenue
        </button>

        <button
          className={`nav-item ${
            activePage === "Sponsorships"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActivePage("Sponsorships")
          }
        >
          Sponsorships
        </button>

        <button
          className={`nav-item ${
            activePage === "Notifications"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActivePage("Notifications")
          }
        >
          Notifications
        </button>

        <button
          className={`nav-item ${
            activePage === "Reports"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setActivePage("Reports")
          }
        >
          Reports
        </button>
      </nav>
    </aside>

    <main className="main-content">
      {activePage === "Dashboard" &&
        renderDashboard()}

      {activePage === "Content" &&
        renderContentPage()}

      {activePage === "Analytics" &&
        renderAnalyticsPage()}

      {activePage === "Audience" &&
        renderAudiencePage()}

      {activePage === "Revenue" &&
        renderRevenuePage()}

      {activePage === "Sponsorships" &&
        renderSponsorshipPage()}

      {activePage === "Notifications" &&
        renderNotificationsPage()}

      {activePage !== "Dashboard" &&
        activePage !== "Content" &&
        activePage !== "Analytics" &&
        activePage !== "Audience" &&
        activePage !== "Revenue" &&
        activePage !== "Sponsorships" &&
        activePage !== "Notifications" &&
        renderPlaceholder(activePage)}
    </main>
  </div>
);
}

export default App;