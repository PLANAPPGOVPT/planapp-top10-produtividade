import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

interface Medida {
  id: string
  titulo: string
  dimensao_titulo: string
}

interface Props {
  escolhas: Medida[]
  onRemove: (id: string) => void
  onReorder: (oldIndex: number, newIndex: number) => void
}

export default function EscolhasPanel({ escolhas, onRemove }: Props) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="font-semibold">As suas 10 escolhas</h2>
        <p className="text-muted-foreground text-sm">
          {escolhas.length} de 10
        </p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {escolhas.length === 0 && (
            <div className="text-muted-foreground p-4 text-center text-sm">
              Explore as dimensões e adicione até 10 medidas que considera mais importantes.
            </div>
          )}
          {escolhas.map((m, i) => (
            <div
              key={m.id}
              className="group mb-2 flex items-start gap-2 rounded-lg border bg-white p-3 shadow-sm"
            >
              <span className="text-muted-foreground mt-0.5 text-xs font-bold">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-[10px]">
                    {m.id}
                  </Badge>
                </div>
                <p className="mt-1 text-sm leading-snug font-medium">
                  {m.titulo}
                </p>
                <p className="text-muted-foreground text-xs">
                  {m.dimensao_titulo}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 opacity-0 group-hover:opacity-100"
                onClick={() => onRemove(m.id)}
                aria-label={`Remover ${m.titulo}`}
              >
                <X className="size-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
      {escolhas.length === 10 && (
        <div className="border-t bg-green-50 p-3 text-center">
          <Button
            className="w-full"
            onClick={() => {
              // Submeter — chamada à API
            }}
          >
            Submeter votação
          </Button>
        </div>
      )}
    </div>
  )
}
