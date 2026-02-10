import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SeasonForm } from "@/components/forms/season-form";
import { SeasonList } from "@/components/seasons/season-list";
import { getSeasons } from "@/lib/queries/seasons";
import { createSeason } from "@/lib/actions/seasons";
import { Trophy } from "lucide-react";

export default async function TemporadasPage() {
  const seasons = await getSeasons();

  return (
    <>
      <PageHeader
        title="Temporadas"
        description="Gestión de temporadas de la liga"
      />

      {/* Existing seasons */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Temporadas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {seasons.length === 0 ? (
            <EmptyState
              icon={<Trophy size={32} />}
              title="No hay temporadas"
              description="Crea la primera temporada para comenzar"
            />
          ) : (
            <SeasonList seasons={seasons} />
          )}
        </CardContent>
      </Card>

      {/* Create new season */}
      <Card>
        <CardHeader>
          <CardTitle>Nueva Temporada</CardTitle>
        </CardHeader>
        <CardContent>
          <SeasonForm onSubmit={createSeason} />
        </CardContent>
      </Card>
    </>
  );
}
