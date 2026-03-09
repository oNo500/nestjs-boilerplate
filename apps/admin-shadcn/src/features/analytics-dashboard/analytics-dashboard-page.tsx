import EarningReportChart from './components/earning-report-chart'
import SalesByCountryWidget from './components/sales-by-country-widget'
import SalesOverviewChart from './components/sales-overview-chart'
import StatisticsBlock from './components/statistics-block'
import TopProjectsTable from './components/top-projects-table'

export default function AnalyticsDashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Statistics Cards */}
      <StatisticsBlock />

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <SalesOverviewChart />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <EarningReportChart />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <TopProjectsTable />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <SalesByCountryWidget />
        </div>
      </div>
    </div>
  )
}
