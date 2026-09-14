import MainMailView from '@/components/MainMailView';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function SlugMailPage({ params }: PageProps) {
  return <MainMailView initialSlug={params.slug} />;
}
