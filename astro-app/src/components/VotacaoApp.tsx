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
import { X, Check, HelpCircle, ChevronUp, Vote } from "lucide-react"

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
  const [modalAberto, setModalAberto] = useState(true)
  const [grupo, setGrupo] = useState<string | null>(null)
  const [mobilePanelAberto, setMobilePanelAberto] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const g = params.get("grupo")
    if (g) {
      localStorage.setItem("grupo_voto", g)
      setGrupo(g)
    } else {
      setGrupo(localStorage.getItem("grupo_voto"))
    }

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
      body: JSON.stringify({ sessao_id, medidas: escolhas, grupo }),
    })

    setSubmetido(true)
  }, [escolhas, grupo])

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
    <div className="flex h-full gap-4">
      {/* Painel lateral — escolhas (desktop only) */}
      <aside className="hidden lg:flex bg-muted h-full w-80 shrink-0 flex-col overflow-hidden rounded-xl border">
        <div className="border-b bg-white p-4 shrink-0">
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
              Explore as dimensões ao lado e Escolha 10 medidas que considera mais importantes para Portugal.
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
                  <p className="text-muted-foreground text-xs leading-tight">
                    {m.dimensao_titulo}
                  </p>
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
        <div className="border-t bg-white p-3 shrink-0">
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
      <main className="flex-1 min-w-0 overflow-hidden rounded-xl border bg-white">
        <div className="border-b bg-gray-50 px-4 py-3 flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <img src="/logo_navbar.png" alt="Planapp" className="h-6 w-auto shrink-0" />
              <h1 className="text-base sm:text-lg font-semibold">
                Escolha as 10 Medidas
              </h1>
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              Clique nas dimensões para explorar as medidas propostas.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={() => setModalAberto(true)}
          >
            <HelpCircle className="size-4" />
            <span className="hidden sm:inline">Como funciona</span>
          </Button>
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
                          role="button"
                          tabIndex={0}
                          className={`cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-all ${
                            selecionada
                              ? "border-green-300 ring-1 ring-green-200"
                              : "hover:shadow-md"
                          } ${
                            !selecionada && escolhas.length >= 10
                              ? "pointer-events-none opacity-50"
                              : ""
                          }`}
                          onClick={() => toggleMedida(m.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              toggleMedida(m.id)
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-semibold leading-snug">
                                {m.titulo}
                              </h4>
                              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                                {m.descricao}
                              </p>
                            </div>
                            {selecionada && (
                              <Check className="size-5 shrink-0 text-green-600" />
                            )}
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

      {/* Botão flutuante mobile */}
      {escolhas.length === 10 ? (
        <div className="lg:hidden fixed bottom-4 left-1/2 z-30 -translate-x-1/2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobilePanelAberto(true)}
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-lg border transition-transform active:scale-95"
          >
            Rever
            <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-gray-200 px-1.5 py-0.5 text-xs">
              10
            </span>
          </button>
          <button
            type="button"
            onClick={submit}
            className="flex items-center gap-1.5 rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform active:scale-95"
          >
            <Check className="size-4" />
            Submeter votação
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setMobilePanelAberto(true)}
          className="lg:hidden fixed bottom-4 left-1/2 z-30 -translate-x-1/2 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform active:scale-95"
          aria-label="Abrir escolhas"
        >
          <Vote className="size-4" />
          As suas escolhas
          <span className="ml-1 inline-flex items-center justify-center rounded-full bg-white/20 px-2 py-0.5 text-xs">
            {escolhas.length}/10
          </span>
        </button>
      )}

      {/* Bottom sheet mobile com as escolhas */}
      {mobilePanelAberto && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobilePanelAberto(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[80vh] rounded-t-2xl border bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="font-semibold">As suas 10 escolhas</h2>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs font-medium">
                  {escolhas.length}/10
                </span>
                <button
                  type="button"
                  onClick={() => setMobilePanelAberto(false)}
                  className="rounded-full bg-gray-100 p-1.5 transition-colors hover:bg-gray-200"
                  aria-label="Fechar"
                >
                  <ChevronUp className="size-4 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="h-2 bg-gray-100">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${escolhas.length * 10}%` }}
              />
            </div>
            <ScrollArea className="flex-1 overflow-y-auto px-3 py-3">
              {escolhas.length === 0 && (
                <p className="text-muted-foreground p-4 text-center text-sm leading-relaxed">
                  Explore as dimensões e escolha 10 medidas que considera mais importantes para Portugal.
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
                      <p className="text-muted-foreground text-xs leading-tight">
                        {m.dimensao_titulo}
                      </p>
                      <p className="mt-0.5 text-sm leading-snug font-medium">
                        {m.titulo}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 opacity-60 group-hover:opacity-100 transition-opacity"
                      onClick={() => toggleMedida(id)}
                      aria-label={`Remover ${m.titulo}`}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                )
              })}
            </ScrollArea>
            <div className="border-t bg-white p-3 shrink-0">
              <Button
                className="w-full"
                disabled={escolhas.length !== 10}
                onClick={() => {
                  setMobilePanelAberto(false)
                  submit()
                }}
              >
                {escolhas.length < 10
                  ? `Faltam ${10 - escolhas.length}`
                  : "Submeter votação"}
              </Button>
            </div>
          </div>
        </div>
      )}

        {/* Modal "Como funciona" */}
        {modalAberto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setModalAberto(false)}
          >
            <div
              className="relative w-full max-w-lg rounded-xl border bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3"
                onClick={() => setModalAberto(false)}
                aria-label="Fechar"
              >
                <X className="size-4" />
              </Button>

              <div className="flex items-center gap-2 mb-5">
                <span className="text-2xl">👋</span>
                <h2 className="text-lg font-semibold">Bem-vindo(a)!</h2>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                No contexto do Projeto <strong className="text-foreground">"Analisar e melhorar a produtividade em Portugal: um plano holístico de intervenção"</strong>, estão em consulta <strong className="text-foreground">32 medidas</strong> de
                política pública para aumentar a produtividade em Portugal,
                distribuídas por <strong className="text-foreground">9 dimensões</strong> de
                intervenção. O seu papel é escolher as{" "}
                <strong className="text-foreground">10 mais importantes</strong>.
              </p>

              <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm">
                <p className="text-blue-800">
                  O resultado agregado de todas as votações será apresentado ao Governo como um conjunto de <strong>10 recomendações prioritárias</strong> de políticas pró-produtividade.
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <h3 className="font-semibold text-foreground">Como participar:</h3>

                <div className="flex gap-3 rounded-lg border bg-gray-50 p-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                  <div>
                    <p className="font-medium text-foreground">Explore as dimensões</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Clique nos cabeçalhos das dimensões para expandir e ver as medidas disponíveis em cada uma.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-lg border bg-gray-50 p-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                  <div>
                    <p className="font-medium text-foreground">Selecione as medidas</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Toque/clique num cartão de medida para a selecionar. A medida aparece automaticamente no painel de escolhas. Toque novamente para remover.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-lg border bg-gray-50 p-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                  <div>
                    <p className="font-medium text-foreground">Submeta a votação</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Quando tiver as 10 escolhas, o botão <strong>Submeter votação</strong> fica ativo no painel de escolhas. Reveja as suas escolhas e submeta.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-lg bg-green-50 border border-green-200 p-3 text-sm">
                <p className="text-green-800">
                  <strong>💡 Dica:</strong> Pode remover e trocar medidas à vontade antes de submeter. A ordem das medidas não influencia o resultado — só conta a votação final com as 10 escolhidas.
                </p>
              </div>

              <div className="mt-5 flex justify-end">
                <Button onClick={() => setModalAberto(false)}>
                  Começar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
  )
}
