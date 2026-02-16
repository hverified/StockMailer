"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import ActionsBar from "./components/ActionsBar";
import AuthPanel from "./components/AuthPanel";
import HealthSection from "./components/HealthSection";
import HistorySection from "./components/HistorySection";
import LoadingState from "./components/LoadingState";
import MarketScanSection from "./components/MarketScanSection";
import ReportSection from "./components/ReportSection";
import TopBar from "./components/TopBar";

async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || payload.message || `HTTP ${res.status}`);
  }
  return payload;
}

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("signin");
  const [tab, setTab] = useState("history");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [historyViewDate, setHistoryViewDate] = useState("");

  const [authForm, setAuthForm] = useState({
    name: "",
    username: "",
    password: "",
    rememberMe: true,
    newPassword: "",
  });

  const [historyData, setHistoryData] = useState([]);
  const [historyDetail, setHistoryDetail] = useState(null);
  const [historyDateReport, setHistoryDateReport] = useState(null);
  const [savingOutcomeKey, setSavingOutcomeKey] = useState("");
  const [scanData, setScanData] = useState({ nifty: null, stocks: [] });
  const [healthData, setHealthData] = useState(null);
  const [reportData, setReportData] = useState(null);

  const loadTabData = useCallback(
    async (nextTab, opts = {}) => {
      const { forceHistorySummary = false } = opts;
      setLoading(true);
      setError("");
      try {
        if (nextTab === "history") {
          if (forceHistorySummary) setHistoryViewDate("");

          if (!historyViewDate || forceHistorySummary) {
            const res = await api("/scan-history");
            setHistoryData(Array.isArray(res.dates) ? res.dates : []);
            setHistoryDetail(null);
            setHistoryDateReport(null);
          } else {
            const [res, rep] = await Promise.all([
              api(`/scan-history/${historyViewDate}`),
              api(`/scan-history/${historyViewDate}/report`),
            ]);
            setHistoryDetail({
              date: res.date || historyViewDate,
              stocks: Array.isArray(res.stocks) ? res.stocks : [],
              niftyData: res.niftyData || null,
            });
            setHistoryDateReport(rep.report || null);
          }
        }

        if (nextTab === "scan") {
          const [niftyRes, stockRes] = await Promise.all([
            api("/nifty-status"),
            api("/test-scrape"),
          ]);
          setScanData({
            nifty: niftyRes || null,
            stocks: Array.isArray(stockRes?.stocks) ? stockRes.stocks : [],
          });
        }

        if (nextTab === "health") {
          const res = await api("/health");
          setHealthData(res || null);
        }

        if (nextTab === "report") {
          const res = await api("/stocks-report?limit=30");
          setReportData(res?.report || null);
        }
      } catch (e) {
        setError(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [historyViewDate]
  );

  useEffect(() => {
    const init = async () => {
      try {
        const me = await api("/auth/me");
        setUser(me.user || null);
      } catch {
        setUser(null);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) return;
    loadTabData(tab);
  }, [user, tab, loadTabData]);

  useEffect(() => {
    const onBodyClick = () => setProfileOpen(false);
    if (profileOpen) document.addEventListener("click", onBodyClick);
    return () => document.removeEventListener("click", onBodyClick);
  }, [profileOpen]);

  const onAuthSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (authMode === "signup") {
        const res = await api("/auth/signup", {
          method: "POST",
          body: JSON.stringify({
            name: authForm.name.trim(),
            username: authForm.username.trim(),
            password: authForm.password,
            rememberMe: authForm.rememberMe,
          }),
        });
        setUser(res.user || null);
        return;
      }

      if (authMode === "signin") {
        const res = await api("/auth/signin", {
          method: "POST",
          body: JSON.stringify({
            username: authForm.username.trim(),
            password: authForm.password,
            rememberMe: authForm.rememberMe,
          }),
        });
        setUser(res.user || null);
        return;
      }

      await api("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          username: authForm.username.trim(),
          newPassword: authForm.newPassword,
        }),
      });
      setAuthMode("signin");
      setError("Password reset successful. Sign in with your new password.");
    } catch (e) {
      setError(e.message || "Authentication failed");
    }
  };

  const signOut = async () => {
    try {
      await api("/auth/signout", { method: "POST" });
    } catch {
      // no-op
    }
    setProfileOpen(false);
    setUser(null);
    setHistoryData([]);
    setHistoryDetail(null);
    setHistoryDateReport(null);
    setSavingOutcomeKey("");
    setScanData({ nifty: null, stocks: [] });
    setHealthData(null);
    setReportData(null);
  };

  const runManualScan = async () => {
    setLoading(true);
    setError("");
    try {
      await api("/manual-scan", { method: "POST" });
      setTab("history");
      setHistoryViewDate("");
      const res = await api("/scan-history");
      setHistoryData(Array.isArray(res.dates) ? res.dates : []);
      setHistoryDetail(null);
      setHistoryDateReport(null);
    } catch (e) {
      setError(e.message || "Manual scan failed");
    } finally {
      setLoading(false);
    }
  };

  const openHistoryDate = async (date) => {
    if (!date) return;
    setHistoryViewDate(date);
    setLoading(true);
    setError("");
    try {
      const [res, rep] = await Promise.all([
        api(`/scan-history/${date}`),
        api(`/scan-history/${date}/report`),
      ]);
      setHistoryDetail({
        date: res.date || date,
        stocks: Array.isArray(res.stocks) ? res.stocks : [],
        niftyData: res.niftyData || null,
      });
      setHistoryDateReport(rep.report || null);
    } catch (e) {
      setError(e.message || "Unable to load scan date");
    } finally {
      setLoading(false);
    }
  };

  const resetHistoryState = () => {
    setHistoryViewDate("");
    setHistoryDetail(null);
  };

  const restoreHistorySummary = async () => {
    setHistoryViewDate("");
    setHistoryDetail(null);
    setHistoryDateReport(null);
    await loadTabData("history", { forceHistorySummary: true });
  };

  const updateStockOutcome = async (symbol, field, value) => {
    if (!historyViewDate || !symbol || !field) return;
    const key = `${historyViewDate}-${symbol}-${field}`;
    setSavingOutcomeKey(key);
    setError("");
    try {
      const body = field === "triggeredStatus" ? { triggeredStatus: value } : { pnlStatus: value };
      const res = await api(
        `/scan-history/${historyViewDate}/stocks/${encodeURIComponent(symbol)}/outcome`,
        {
          method: "PATCH",
          body: JSON.stringify(body),
        }
      );

      if (res.stock) {
        setHistoryDetail((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            stocks: (prev.stocks || []).map((s) =>
              s.symbol === symbol ? { ...s, ...res.stock } : s
            ),
          };
        });
      }
      if (res.report) {
        setHistoryDateReport(res.report);
      } else {
        const rep = await api(`/scan-history/${historyViewDate}/report`);
        setHistoryDateReport(rep.report || null);
      }
    } catch (e) {
      setError(e.message || "Could not update outcome");
    } finally {
      setSavingOutcomeKey("");
    }
  };

  const reportSummary = useMemo(() => reportData?.summary || {}, [reportData]);
  const reportByDate = useMemo(() => (Array.isArray(reportData?.byDate) ? reportData.byDate : []), [reportData]);

  if (!user) {
    return (
      <AuthPanel
        authMode={authMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        setAuthMode={setAuthMode}
        onAuthSubmit={onAuthSubmit}
        error={error}
      />
    );
  }

  return (
    <main className="app">
      <TopBar user={user} profileOpen={profileOpen} setProfileOpen={setProfileOpen} signOut={signOut} />

      <ActionsBar
        tab={tab}
        setTab={setTab}
        runManualScan={runManualScan}
        resetHistoryState={resetHistoryState}
      />

      {loading && <LoadingState tab={tab} />}
      {!loading && error && <div className="card danger">{error}</div>}

      {!loading && !error && tab === "history" && (
        <HistorySection
          historyViewDate={historyViewDate}
          historyData={historyData}
          historyDateReport={historyDateReport}
          historyDetail={historyDetail}
          savingOutcomeKey={savingOutcomeKey}
          openHistoryDate={openHistoryDate}
          restoreHistorySummary={restoreHistorySummary}
          updateStockOutcome={updateStockOutcome}
        />
      )}

      {!loading && !error && tab === "scan" && <MarketScanSection scanData={scanData} />}

      {!loading && !error && tab === "health" && healthData && <HealthSection healthData={healthData} />}

      {!loading && !error && tab === "report" && (
        <ReportSection reportSummary={reportSummary} reportByDate={reportByDate} />
      )}
    </main>
  );
}
