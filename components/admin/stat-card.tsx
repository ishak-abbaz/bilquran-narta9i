type StatCardProps = {
  title: string;
  value: string | number;
};

export default function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      <p className="mt-3 text-3xl font-semibold">
        {value}
      </p>
    </div>
  );
}