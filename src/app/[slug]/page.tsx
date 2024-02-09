import Chat from '@/components/chat';
async function Home({ params }: { params: { slug: string } }) {
  return (
    <main>
      <Chat channel={params.slug} />
    </main>
  );
}

export default Home;
