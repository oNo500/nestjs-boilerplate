import { ChartContainer } from '@repo/ui/components/chart';
import { Treemap } from 'recharts';

const data = [
  {
    name: 'React',
    size: 300,
    fill: '#61dafb',
  },
  {
    name: 'Node.js',
    size: 200,
    fill: '#339933',
  },
  {
    name: 'Python',
    size: 300,
    fill: '#3776ab',
  },
  {
    name: 'TypeScript',
    size: 400,
    fill: '#3178c6',
  },
  {
    name: 'Next.js',
    size: 500,
    fill: '#000000',
  },
];

const MonthlyDevelopmentActivity = () => {
  return (
    <ChartContainer config={{}} className="min-h-[200px] w-full">
      <Treemap width={400} height={200} data={data} dataKey="size" aspectRatio={1} stroke="#fff" fill="#8884d8" />
    </ChartContainer>
  );
};

export default MonthlyDevelopmentActivity;
