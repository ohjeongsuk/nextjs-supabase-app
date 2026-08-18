type Props = {
  params: Promise<{ invite_code: string }>;
};

export default async function JoinPage({ params }: Props) {
  const { invite_code } = await params;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-foreground">
        초대 참여 (코드: {invite_code})
      </h1>
    </div>
  );
}
