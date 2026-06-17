import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Check } from "lucide-react"

interface Medida {
  id: string
  titulo: string
  descricao: string
}

interface Props {
  medida: Medida
  selecionada: boolean
  podeAdicionar: boolean
  onToggle: () => void
}

export default function MedidaCard({
  medida,
  selecionada,
  podeAdicionar,
  onToggle,
}: Props) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono">
              {medida.id}
            </Badge>
            <h4 className="text-sm font-semibold leading-snug">
              {medida.titulo}
            </h4>
          </div>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {medida.descricao}
          </p>
        </div>
        <Button
          size="sm"
          variant={selecionada ? "default" : "outline"}
          className="shrink-0"
          disabled={!selecionada && !podeAdicionar}
          onClick={onToggle}
        >
          {selecionada ? (
            <>
              <Check className="mr-1 size-3.5" /> Selecionada
            </>
          ) : (
            <>
              <Plus className="mr-1 size-3.5" /> Adicionar
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
