import React, { useState, useEffect } from 'react';
import { recommendationService } from '../services/recommendationService';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import SmartInsightsList from '../components/recommendations/SmartInsightsList';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { Lightbulb, Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';

const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await recommendationService.getRecommendations();
      setRecommendations(data?.recommendations || []);
      setInsights(data?.insights || []);
    } catch (err) {
      setError(err.message || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return <LoadingState message="Analyzing your financial habits and evaluating smart rules..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchRecommendations} />;
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Smart Financial Advice</h1>
          <p className="page-subtitle">Deterministic insights and habits coaching tailored for teenagers</p>
        </div>
      </div>

      <div className="dashboard-grid-2">
        {/* Left Column: Personalized Recommendation Cards */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ShieldAlert size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Actionable Recommendations</h3>
          </div>

          {recommendations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <div style={{ color: 'var(--status-success)', display: 'inline-flex', padding: '1rem', background: 'var(--status-success-bg)', borderRadius: '50%', marginBottom: '1rem' }}>
                <CheckCircle2 size={32} />
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>You're Doing Great!</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto' }}>
                All your categories are within budget, your entertainment spending is balanced, and your savings habit is healthy.
              </p>
            </div>
          ) : (
            <div>
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          )}

          {/* Educational Disclaimer */}
          <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            💡 <strong>TeenSpend Note:</strong> These recommendations are calculated using automated deterministic rules to help you develop healthy financial habits before university. They are not professional banking advice.
          </div>
        </div>

        {/* Right Column: Dynamic Smart Insights */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={20} color="var(--accent-pink)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Dynamic Spending Insights</h3>
          </div>

          <div className="card">
            <SmartInsightsList insights={insights} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;
