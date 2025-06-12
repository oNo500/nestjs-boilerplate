import Nav from '../ui/navbar';

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-8 pb-20 sm:p-20">
      <Nav />
      <main className="flex h-full w-full flex-1 flex-col">{children}</main>
    </div>
  );
};

export default BaseLayout;
