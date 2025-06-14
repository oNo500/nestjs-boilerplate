import { ChartContainer } from '@repo/ui/components/chart';
import { ResponsiveContainer, Treemap } from 'recharts';

const data = [
  {
    name: 'React',
    size: 300,
    fill: '#61dafb', // React 品牌色
  },
  {
    name: 'Node.js',
    size: 200,
    fill: '#339933', // Node.js 品牌色
  },
  {
    name: 'Python',
    size: 300,
    fill: '#3776ab', // Python 品牌色
  },
  {
    name: 'TypeScript',
    size: 400,
    fill: '#3178c6', // TypeScript 品牌色
  },
  {
    name: 'Next.js',
    size: 500,
    fill: '#000000', // Next.js 品牌色
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
