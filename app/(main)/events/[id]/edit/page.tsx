type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-foreground">
        이벤트 수정 (ID: {id})
      </h1>
    </div>
  );
}
