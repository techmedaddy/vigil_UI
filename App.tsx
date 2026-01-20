
import React from 'react';
import { Layout } from './components/Layout';
import { Page } from './constants';
import { Dashboard } from './components/Dashboard';
import { MetricsIngestion } from './components/MetricsIngestion';
import { Actions } from './components/Actions';
import { QueueMonitor } from './components/QueueMonitor';
import { Policies } from './components/Policies';
import { Simulator } from './components/Simulator';
import { PolicyTester } from './components/PolicyTester';

const App: React.FC = () => {
  const [activePage, setActivePage] = React.useState<Page>(Page.DASHBOARD);

  const renderPage = () => {
    switch (activePage) {
      case Page.DASHBOARD:
        return <Dashboard onPageChange={setActivePage} />;
      case Page.METRICS:
        return <MetricsIngestion />;
      case Page.POLICIES:
        return <Policies />;
      case Page.ACTIONS:
        return <Actions />;
      case Page.QUEUE:
        return <QueueMonitor />;
      case Page.SIMULATOR:
        return <Simulator />;
      case Page.TESTER:
        return <PolicyTester />;
      default:
        return <Dashboard onPageChange={setActivePage} />;
    }
  };

  return (
    <Layout activePage={activePage} onPageChange={setActivePage}>
      {renderPage()}
    </Layout>
  );
};

export default App;
