import Overview from '@/features/home/components/overview';
import ProgrammingLanguagesUsage from '@/features/home/components/programming-languages-usage';
import TechnologyTackDistribution from '@/features/home/components/technology-tack-distribution';
import MonthlyDevelopmentActivity from '@/features/home/components/monthly-development-activity';

const Home = () => {
  return (
    <>
      <Overview />
      <div className="grid auto-rows-min gap-4 md:grid-cols-2">
        <div className="bg-muted/50 aspect-video rounded-xl p-4">
          <h2 className="mb-6 text-xl font-bold">Technology Tack Distribution</h2>
          <TechnologyTackDistribution />
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl p-4">
          <h2 className="mb-6 text-xl font-bold">Monthly Development Activity</h2>
          <MonthlyDevelopmentActivity />
        </div>
      </div>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl p-4 md:min-h-min">
        <h2 className="pb-6 text-xl font-bold">Programming Languages Usage</h2>
        <ProgrammingLanguagesUsage />
      </div>
    </>
  );
};

export default Home;
