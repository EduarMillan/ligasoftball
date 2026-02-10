import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { TeamForm } from "@/components/forms/team-form";
import { createTeam } from "@/lib/actions/teams";

export default function NuevoEquipoPage() {
  return (
    <>
      <PageHeader
        title="Crear Equipo"
        description="Agrega un nuevo equipo a la liga"
      />

      <Card>
        <CardContent className="pt-2">
          <TeamForm onSubmit={createTeam} />
        </CardContent>
      </Card>
    </>
  );
}
