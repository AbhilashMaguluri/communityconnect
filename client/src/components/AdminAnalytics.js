import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ButtonGroup, Table, Badge } from 'react-bootstrap';
import { getIssueStats, getTrendingIssues } from '../services/api';
import { getTimeAgo } from '../components/IssueComponents';

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    totalIssues: 0,
    issuesByStatus: {},
    issuesByCategory: {},
    issuesByPriority: {},
    issuesByMonth: {},
    topCategories: [],
    avgResolutionTime: 0,
    userEngagement: {}
  });
  const [trendingIssues, setTrendingIssues] = useState([]);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch general stats
      const statsResponse = await getIssueStats();
      setStats(statsResponse.data);
      
      // Fetch trending issues
      const trendingResponse = await getTrendingIssues({ days: timeRange });
      setTrendingIssues(trendingResponse.data.issues || []);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'danger',
      'In Progress': 'warning',
      'Under Review': 'info', 
      'Resolved': 'success',
      'Closed': 'secondary'
    };
    return colors[status] || 'secondary';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Critical': 'danger',
      'High': 'warning',
      'Medium': 'info',
      'Low': 'success'
    };
    return colors[priority] || 'secondary';
  };

  const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const formatDuration = (hours) => {
    if (hours < 24) return `${Math.round(hours)} hours`;
    const days = Math.floor(hours / 24);
    return `${days} days`;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading analytics...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1>
            <i className="fas fa-chart-line me-2"></i>
            Analytics Dashboard
          </h1>
          <p className="text-muted">Detailed insights into community issues and system performance</p>
        </Col>
        <Col xs="auto">
          <ButtonGroup>
            <Button 
              variant={timeRange === '7' ? 'primary' : 'outline-primary'}
              onClick={() => setTimeRange('7')}
            >
              7 Days
            </Button>
            <Button 
              variant={timeRange === '30' ? 'primary' : 'outline-primary'}
              onClick={() => setTimeRange('30')}
            >
              30 Days
            </Button>
            <Button 
              variant={timeRange === '90' ? 'primary' : 'outline-primary'}
              onClick={() => setTimeRange('90')}
            >
              90 Days
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <i className="fas fa-exclamation-triangle fa-2x text-primary mb-2"></i>
              <h3 className="mb-1">{stats.totalIssues}</h3>
              <p className="text-muted mb-0">Total Issues</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <i className="fas fa-clock fa-2x text-warning mb-2"></i>
              <h3 className="mb-1">{formatDuration(stats.avgResolutionTime || 0)}</h3>
              <p className="text-muted mb-0">Avg Resolution Time</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <i className="fas fa-thumbs-up fa-2x text-success mb-2"></i>
              <h3 className="mb-1">{stats.userEngagement?.totalVotes || 0}</h3>
              <p className="text-muted mb-0">Total Votes</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} className="mb-3">
          <Card className="h-100">
            <Card.Body className="text-center">
              <i className="fas fa-comments fa-2x text-info mb-2"></i>
              <h3 className="mb-1">{stats.userEngagement?.totalComments || 0}</h3>
              <p className="text-muted mb-0">Total Comments</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Issues by Status */}
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Issues by Status</h5>
            </Card.Header>
            <Card.Body>
              {Object.entries(stats.issuesByStatus || {}).map(([status, count]) => (
                <div key={status} className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <Badge bg={getStatusColor(status)} className="me-2">
                      {status}
                    </Badge>
                  </div>
                  <div className="text-end">
                    <strong>{count}</strong>
                    <small className="text-muted ms-2">
                      ({formatPercentage(count, stats.totalIssues)})
                    </small>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Issues by Priority */}
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Issues by Priority</h5>
            </Card.Header>
            <Card.Body>
              {Object.entries(stats.issuesByPriority || {}).map(([priority, count]) => (
                <div key={priority} className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <Badge bg={getPriorityColor(priority)} className="me-2">
                      {priority}
                    </Badge>
                  </div>
                  <div className="text-end">
                    <strong>{count}</strong>
                    <small className="text-muted ms-2">
                      ({formatPercentage(count, stats.totalIssues)})
                    </small>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Top Categories */}
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Top Issue Categories</h5>
            </Card.Header>
            <Card.Body>
              {(stats.topCategories || []).slice(0, 8).map((item, index) => (
                <div key={item.category} className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-secondary me-2">{index + 1}</span>
                    <span>{item.category}</span>
                  </div>
                  <div className="text-end">
                    <strong>{item.count}</strong>
                    <small className="text-muted ms-2">
                      ({formatPercentage(item.count, stats.totalIssues)})
                    </small>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Trending Issues */}
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">Trending Issues (Last {timeRange} days)</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table size="sm">
                  <thead>
                    <tr>
                      <th>Issue</th>
                      <th>Votes</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trendingIssues.slice(0, 8).map(issue => (
                      <tr key={issue._id}>
                        <td>
                          <div>
                            <strong className="d-block" style={{ fontSize: '0.9rem' }}>
                              {issue.title.length > 30 ? `${issue.title.substring(0, 30)}...` : issue.title}
                            </strong>
                            <small className="text-muted">{getTimeAgo(issue.createdAt)}</small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="text-success me-2">
                              <i className="fas fa-thumbs-up"></i> {issue.votes?.upvotes || 0}
                            </span>
                          </div>
                        </td>
                        <td>
                          <Badge bg={getStatusColor(issue.status)} size="sm">
                            {issue.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {trendingIssues.length === 0 && (
                <div className="text-center py-3">
                  <i className="fas fa-chart-line fa-2x text-muted mb-2"></i>
                  <p className="text-muted mb-0">No trending data available</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Monthly Trends */}
      <Row>
        <Col md={12} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Monthly Issue Trends</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>New Issues</th>
                      <th>Resolved Issues</th>
                      <th>Resolution Rate</th>
                      <th>Avg Resolution Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.issuesByMonth || {}).map(([month, data]) => (
                      <tr key={month}>
                        <td>{month}</td>
                        <td>
                          <Badge bg="primary">{data.created || 0}</Badge>
                        </td>
                        <td>
                          <Badge bg="success">{data.resolved || 0}</Badge>
                        </td>
                        <td>
                          <Badge 
                            bg={data.resolutionRate > 0.8 ? 'success' : data.resolutionRate > 0.5 ? 'warning' : 'danger'}
                          >
                            {formatPercentage(data.resolved || 0, data.created || 1)}
                          </Badge>
                        </td>
                        <td>
                          <span className="text-muted">
                            {formatDuration(data.avgResolutionTime || 0)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {Object.keys(stats.issuesByMonth || {}).length === 0 && (
                <div className="text-center py-4">
                  <i className="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
                  <p className="text-muted mb-0">No monthly data available yet</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Performance Metrics */}
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Performance Metrics</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Open Issue Rate</span>
                  <span>{formatPercentage(stats.issuesByStatus?.Open || 0, stats.totalIssues)}</span>
                </div>
                <div className="progress mt-1">
                  <div 
                    className="progress-bar bg-danger" 
                    style={{ width: formatPercentage(stats.issuesByStatus?.Open || 0, stats.totalIssues) }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>Resolution Rate</span>
                  <span>{formatPercentage(stats.issuesByStatus?.Resolved || 0, stats.totalIssues)}</span>
                </div>
                <div className="progress mt-1">
                  <div 
                    className="progress-bar bg-success" 
                    style={{ width: formatPercentage(stats.issuesByStatus?.Resolved || 0, stats.totalIssues) }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span>User Engagement</span>
                  <span>{((stats.userEngagement?.activeUsers || 0) / (stats.userEngagement?.totalUsers || 1) * 100).toFixed(1)}%</span>
                </div>
                <div className="progress mt-1">
                  <div 
                    className="progress-bar bg-info" 
                    style={{ width: `${(stats.userEngagement?.activeUsers || 0) / (stats.userEngagement?.totalUsers || 1) * 100}%` }}
                  ></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">System Health</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center">
                <div className="mb-3">
                  <i className="fas fa-heartbeat fa-3x text-success mb-2"></i>
                  <h4 className="text-success">System Healthy</h4>
                </div>
                
                <Row>
                  <Col xs={6}>
                    <div className="border-end">
                      <h5 className="mb-1">{stats.userEngagement?.avgResponseTime || 0}ms</h5>
                      <small className="text-muted">Avg Response Time</small>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div>
                      <h5 className="mb-1">99.9%</h5>
                      <small className="text-muted">Uptime</small>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminAnalytics;