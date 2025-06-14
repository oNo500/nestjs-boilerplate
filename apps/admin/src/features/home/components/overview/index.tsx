import { Card, CardContent, CardHeader } from '@repo/ui/components/card';
import { ProjectorIcon, UserIcon, GaugeIcon } from 'lucide-react';

const stats = [
  {
    title: 'Total Projects',
    value: 24,
    change: '+12%',
    icon: <ProjectorIcon className="text-primary h-6 w-6" />,
    description: 'All created projects',
  },
  {
    title: 'Active Users',
    value: '1,200',
    change: '+12%',
    icon: <UserIcon className="text-primary h-6 w-6" />,
    description: 'Users logged in this month',
  },
  {
    title: 'Performance',
    value: '90%',
    change: '+12%',
    icon: <GaugeIcon className="text-primary h-6 w-6" />,
    description: 'Average response speed',
  },
];

const Overview = () => {
  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      {stats.map((item) => (
        <Card key={item.title} className="rounded-xl">
          <CardHeader className="flex items-center gap-2">
            {item.icon}
            <span className="text-base font-medium">{item.title}</span>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-sm text-green-500">{item.change}</div>
            </div>
            <div className="mt-1 text-xs text-gray-500">{item.description}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Overview;
