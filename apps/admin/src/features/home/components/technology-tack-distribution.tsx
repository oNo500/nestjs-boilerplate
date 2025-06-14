import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@repo/ui/components/chart';
import { RadialBarChart, RadialBar, Legend } from 'recharts';

const data = [
  {
    name: 'DevOps',
    value: 300,
    fill: '#F59E0B',
  },
  {
    name: 'Database',
    value: 400,
    fill: '#EF4444',
  },
  {
    name: 'Backend',
    value: 200,
    fill: '#10B981',
  },
  {
    name: 'Frontend',
    value: 500,
    fill: '#3B82F6',
  },
  {
    name: 'AI',
    value: 100,
    fill: '#8B5CF6',
  },
];

const style = {
  left: 0,
  right: 0,
  margin: '0 auto',
  lineHeight: '24px',
  width: 'fit-content',
  position: 'absolute' as const,
  bottom: 0,
  transform: 'translate(0, -100%)',
};

const TechnologyTackDistribution = () => {
  return (
    <ChartContainer config={{}} className="min-h-[200px] w-full">
      <RadialBarChart cx="50%" cy="40%" innerRadius="20%" outerRadius="80%" barSize={15} data={data}>
        <RadialBar background dataKey="value" cornerRadius={10} fill="#8884d8" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" wrapperStyle={style} />
      </RadialBarChart>
    </ChartContainer>
  );
};

export default TechnologyTackDistribution;
