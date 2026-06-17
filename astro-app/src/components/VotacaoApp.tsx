import { useState, useEffect, useCallback } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Check, Plus, ChevronDown } from "lucide-react"

interface Medida {
  id: string
  titulo: string
  descricao: string
}

interface Dimensao {
  id: string
  titulo: string
  medidas: Medida[]
}

export default function VotacaoApp() {
  const [dimensoes, setDimensoes] = useState<Dimensao[]>([])
  const [escolhas, setEscolhas] = useState<string[]>([])
  const [submetido, setSubmetido] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    fetch("/api/dimensoes")
      .then((r) => r.json())
      .then((data) => {
        setDimensoes(data)
        setCarregando(false)
      })
  }, [])

  const toggleMedida = useCallback(
    (id: string) => {
      setEscolhas((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id)
        if (prev.length >= 10) return prev
        return [...prev, id]
      })
    },
    []
  )

  const submit = useCallback(async () => {
    const sessao_id =
      localStorage.getItem("sessao_voto") || crypto.randomUUID()
    localStorage.setItem("sessao_voto", sessao_id)

    await fetch("/api/votar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessao_id, medidas: escolhas }),
    })

    setSubmetido(true)
  }, [escolhas])

  if (carregando) return <div className="p-8 text-center">A carregar...</div>
  if (submetido)
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
          <Check className="size-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold">Votação submetida!</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          Obrigado por participar. As suas 10 escolhas foram registadas.
        </p>
      </div>
    )

  const todasMedidas = dimensoes.flatMap((d) =>
    d.medidas.map((m) => ({ ...m, dimensao_titulo: d.titulo }))
  )

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 overflow-hidden">
      {/* Painel lateral — escolhas */}
      <aside className="bg-muted flex w-80 shrink-0 flex-col rounded-xl border">
        <div className="border-b bg-white p-4">
          <h2 className="font-semibold">As suas 10 escolhas</h2>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${escolhas.length * 10}%` }}
              />
            </div>
            <span className="text-muted-foreground text-xs font-medium">
              {escolhas.length}/10
            </span>
          </div>
        </div>
        <ScrollArea className="flex-1 px-2 py-2">
          {escolhas.length === 0 && (
            <p className="text-muted-foreground p-4 text-center text-sm leading-relaxed">
              Explore as dimensões ao lado e escolha até 10 medidas que considera mais importantes para Portugal.
            </p>
          )}
          {escolhas.map((id, i) => {
            const m = todasMedidas.find((x) => x.id === id)!
            return (
              <div
                key={id}
                className="group mb-2 flex items-start gap-2 rounded-lg border bg-white p-3 shadow-sm"
              >
                <span className="text-muted-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">
                      {m.id}
                    </Badge>
                    <p className="text-muted-foreground text-xs leading-tight">
                      {m.dimensao_titulo}
                    </p>
                  </div>
                  <p className="mt-0.5 text-sm leading-snug font-medium">
                    {m.titulo}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => toggleMedida(id)}
                  aria-label={`Remover ${m.titulo}`}
                >
                  <X className="size-3" />
                </Button>
              </div>
            )
          })}
        </ScrollArea>
        <div className="border-t bg-white p-3">
          <Button
            className="w-full"
            disabled={escolhas.length !== 10}
            onClick={submit}
          >
            {escolhas.length < 10
              ? `Faltam ${10 - escolhas.length}`
              : "Submeter votação"}
          </Button>
        </div>
      </aside>

      {/* Área central — dimensões */}
      <main className="flex-1 overflow-hidden rounded-xl border bg-white">
        <div className="border-b bg-gray-50 p-4">
          <h1 className="text-lg font-semibold">
            Escolha as 10 Medidas para a Produtividade
          </h1>
          <p className="text-muted-foreground text-sm">
            Clique nas dimensões para explorar as medidas propostas.
          </p>
        </div>
        <ScrollArea className="h-[calc(100%-4.5rem)] px-4 py-4">
          <Accordion type="multiple" className="space-y-2">
            {dimensoes.map((d) => {
              const count = d.medidas.filter((m) =>
                escolhas.includes(m.id)
              ).length
              return (
                <AccordionItem
                  key={d.id}
                  value={d.id}
                  className="rounded-lg border bg-gray-50 px-4 data-[state=open]:bg-white"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3 text-left">
                      <Badge
                        variant={count > 0 ? "default" : "outline"}
                        className="shrink-0 text-xs"
                      >
                        {count}/{d.medidas.length}
                      </Badge>
                      <div>
                        <span className="font-semibold">{d.titulo}</span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          {d.medidas.length} medidas
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pb-4">
                    {d.medidas.map((m) => {
                      const selecionada = escolhas.includes(m.id)
                      return (
                        <div
                          key={m.id}
                          className={`rounded-lg border bg-white p-4 shadow-sm transition-all ${
                            selecionada
                              ? "border-green-300 ring-1 ring-green-200"
                              : "hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-[10px] font-mono shrink-0"
                                >
                                  {m.id}
                                </Badge>
                                <h4 className="text-sm font-semibold leading-snug">
                                  {m.titulo}
                                </h4>
                              </div>
                              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                                {m.descricao}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant={selecionada ? "default" : "outline"}
                              className="shrink-0 transition-all"
                              disabled={
                                !selecionada && escolhas.length >= 10
                              }
                              onClick={() => toggleMedida(m.id)}
                            >
                              {selecionada ? (
                                <>
                                  <Check className="mr-1 size-3.5" />{" "}
                                  Escolhida
                                </>
                              ) : (
                                <>
                                  <Plus className="mr-1 size-3.5" /> Escolher
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </ScrollArea>
      </main>
    </div>
  )
}
