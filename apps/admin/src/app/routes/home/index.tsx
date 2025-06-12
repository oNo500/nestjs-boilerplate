import BaseLayout from '@/components/layouts/base-layout';
import Hero from '@/features/home/components/hero';
import TechStack from '@/features/home/components/tech-stack';

const Home = () => {
  return (
    <BaseLayout>
      <Hero />
      <TechStack />
    </BaseLayout>
  );
};

export default Home;
