import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, UploadSimple } from "@phosphor-icons/react"
import MonacoEditor from "@monaco-editor/react"


type TokenRow = {
	id: string
	line: number
	type: string
	lexeme: string
}

type ErrorRow = {
	id: string
	line: number
	lexeme: string
	description: string
}

const DEFAULT_SOURCE = `int contador = 10;
while (contador > 0) {
	imprimir(contador);
	contador = contador - 1;
}`

const API_URL = "http://localhost:3000/api/analyze"

export default function App() {
	const [sourceCode, setSourceCode] = useState(DEFAULT_SOURCE)
	const [tokens, setTokens] = useState<TokenRow[]>([])
	const [errors, setErrors] = useState<ErrorRow[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [isDarkMode, setIsDarkMode] = useState(() => {
		if (typeof window === "undefined") return true
		const stored = window.localStorage.getItem("theme")
		if (stored) return stored === "dark"
		return window.matchMedia("(prefers-color-scheme: dark)").matches
	})
	const fileInputRef = useRef<HTMLInputElement>(null)

	const hasResults = tokens.length > 0 || errors.length > 0

	const metrics = useMemo(() => {
		return {
			totalTokens: tokens.length,
			totalErrors: errors.length,
			lines: sourceCode.split("\n").length,
		}
	}, [errors.length, sourceCode, tokens.length])


	const handleAnalyze = async () => {
		setIsLoading(true)
		try {
			const response = await fetch(API_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sourceCode }),
			})

			if (!response.ok) {
				throw new Error("Error al analizar el codigo.")
			}

			const data = (await response.json()) as {
				tokens: TokenRow[]
				errors: ErrorRow[]
			}

			setTokens(data.tokens)
			setErrors(data.errors)
		} catch (error) {
			setTokens([])
			setErrors([
				{
					id: "request-error",
					line: 1,
					lexeme: "",
					description: error instanceof Error ? error.message : "Error inesperado.",
				},
			])
		} finally {
			setIsLoading(false)
		}
	}

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		const reader = new FileReader()
		reader.onload = () => {
			setSourceCode(String(reader.result ?? ""))
			setTokens([])
			setErrors([])
		}
		reader.readAsText(file)
	}


	useEffect(() => {
		const root = document.documentElement
		if (isDarkMode) {
			root.classList.add("dark")
			window.localStorage.setItem("theme", "dark")
		} else {
			root.classList.remove("dark")
			window.localStorage.setItem("theme", "light")
		}
	}, [isDarkMode])

	return (
		<main className="relative min-h-screen bg-background font-mono text-zinc-900 dark:text-white">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.04),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.03),transparent_42%),linear-gradient(to_bottom,rgba(250,250,250,0.96),rgba(244,244,244,0.98))] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.06),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_40%),linear-gradient(to_bottom,rgba(2,2,2,0.95),rgba(10,10,10,0.98))]" />
			<div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
				<header className="rounded-[26px] border border-black/10 bg-card/80 px-5 py-5 shadow-[0_25px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl dark:border-white/10 dark:shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
					<div className="flex flex-col gap-2">
						<span className="text-[11px] uppercase tracking-[0.35em] text-zinc-600 dark:text-white/70">
							Minilang Compiler
						</span>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
							<div>
								<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
									Analizador Léxico
								</h1>
								<p className="text-sm text-zinc-600 dark:text-white/70">
									Interfaz minimal para inspeccionar tokens y errores.
								</p>
							</div>
							<Button
								variant="outline"
								className="h-8 rounded-full border-black/20 bg-black/5 px-3 text-[11px] text-zinc-700 hover:bg-black/10 dark:border-white/20 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
								onClick={() => setIsDarkMode((prev) => !prev)}
							>
								{isDarkMode ? "Dark" : "Light"}
							</Button>
						</div>
					</div>
				</header>

				<section className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
					<Card className="rounded-[24px] border-black/10 bg-card/80 shadow-[0_25px_px_rgba(0,0,0,0.35)] backdrop-blur-2xl dark:border-white/10 dark:shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
						<CardHeader className="space-y-1 border-b border-black/10 pb-4 dark:border-white/10">
							<CardTitle className="text-sm font-medium tracking-tight">
								Entrada de codigo
							</CardTitle>
							<CardDescription className="text-xs text-zinc-600 dark:text-white/70">
								Pega tu codigo o carga un archivo para iniciar el analisis.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4 pt-4">
							<div className="h-[380px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-none backdrop-blur-sm dark:border-white/10 dark:bg-black/40">
								<MonacoEditor
									height="380px"
									language="javascript"
									theme={isDarkMode ? "vs-dark" : "vs"}
									value={sourceCode}
									onChange={(value) => setSourceCode(value ?? "")}
									options={{
										minimap: { enabled: false },
										fontFamily: "JetBrains Mono Variable, ui-monospace, SFMono-Regular, monospace",
										fontSize: 13,
										lineHeight: 24,
										lineNumbersMinChars: 3,
										scrollBeyondLastLine: false,
										wordWrap: "off",
										padding: { top: 12, bottom: 12 },
									}}
								/>
							</div>
							<input
								ref={fileInputRef}
								type="file"
								accept=".txt,.ml,.minilang"
								className="hidden"
								onChange={handleFileUpload}
							/>
							<div className="flex flex-col gap-3 sm:flex-row">
								<Button
									type="button"
									variant="outline"
									className="flex-1 justify-center gap-2 rounded-xl border-black/15 bg-black/5 text-zinc-800 hover:bg-black/10 dark:border-white/15 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
									onClick={() => fileInputRef.current?.click()}
								>
									<UploadSimple size={16} />
									Subir Archivo
								</Button>
								<Button
									type="button"
									className="flex-1 justify-center gap-2 rounded-xl bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
									onClick={handleAnalyze}
									disabled={isLoading}
								>
									<Play size={16} weight="fill" />
									{isLoading ? "Analizando..." : "Analizar Codigo"}
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card className="rounded-[24px] border-black/10 bg-card/80 shadow-[0_25px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl dark:border-white/10 dark:shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
						<CardHeader className="space-y-1 border-b border-black/10 pb-4 dark:border-white/10">
							<CardTitle className="text-sm font-medium tracking-tight">
								Panel de resultados
							</CardTitle>
							<CardDescription className="text-xs text-zinc-600 dark:text-white/70">
								Cambia entre resumen, tokens y errores en modo monocromo.
							</CardDescription>
						</CardHeader>
						<CardContent className="pt-4">
							<Tabs defaultValue="summary" className="flex w-full flex-col gap-4">
								<TabsList className="inline-flex w-full rounded-full border border-black/10 bg-black/5 p-1 dark:border-white/10 dark:bg-white/5">
									<TabsTrigger value="summary" className="rounded-full px-3 py-1.5 text-black">
										Resumen
									</TabsTrigger>
									<TabsTrigger value="tokens" className="rounded-full px-3 py-1.5">
										Tokens ({tokens.length})
									</TabsTrigger>
									<TabsTrigger value="errors" className="rounded-full px-3 py-1.5">
										Errores ({errors.length})
									</TabsTrigger>
								</TabsList>

								<TabsContent value="summary" className="mt-0 outline-none">
									<div className="grid gap-3 sm:grid-cols-3">
										<div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
											<p className="text-xs uppercase tracking-[0.3em] text-zinc-600 dark:text-white/70">
												Lineas
											</p>
											<p className="mt-2 text-2xl font-semibold">{metrics.lines}</p>
										</div>
										<div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
											<p className="text-xs uppercase tracking-[0.3em] text-zinc-600 dark:text-white/70">
												Tokens
											</p>
											<p className="mt-2 text-2xl font-semibold">{metrics.totalTokens}</p>
										</div>
										<div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
											<p className="text-xs uppercase tracking-[0.3em] text-zinc-600 dark:text-white/70">
												Errores
											</p>
											<p className="mt-2 text-2xl font-semibold">{metrics.totalErrors}</p>
										</div>
									</div>

									<div className="mt-4 rounded-2xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.03]">
										<p className="text-sm text-zinc-600 dark:text-white/70">
											{hasResults
												? "Analisis completado. Revisa las pestañas para ver el detalle."
												: "Todavia no hay resultados. Ejecuta el analisis para llenar el panel."}
										</p>
									</div>
								</TabsContent>

								<TabsContent value="tokens" className="mt-0 outline-none">
									<ScrollArea className="h-[500px] rounded-2xl border border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]">
										<div className="grid gap-2 p-4 text-xs">
											{tokens.length === 0 ? (
												<p className="text-zinc-600 dark:text-white/70">
													No hay tokens aun. Ejecuta el analisis para verlos aqui.
												</p>
											) : (
												tokens.map((row) => (
													<div
														key={row.id}
														className="grid grid-cols-[64px_1fr_1fr] gap-3 rounded-xl border border-black/5 bg-black/5 px-3 py-2 dark:border-white/5 dark:bg-black/30"
													>
														<span className="text-zinc-700 dark:text-white/80">L{row.line}</span>
														<span className="font-medium">{row.type}</span>
														<span className="text-zinc-600 dark:text-white/70">{row.lexeme}</span>
													</div>
												))
											)}
										</div>
									</ScrollArea>
								</TabsContent>

								<TabsContent value="errors" className="mt-0 outline-none">
									<ScrollArea className="h-[500px] rounded-2xl border border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]">
										<div className="grid gap-2 p-4 text-xs">
											{errors.length === 0 ? (
												<p className="text-zinc-600 dark:text-white/70">
													No hay errores lexicos en esta ejecucion.
												</p>
											) : (
												errors.map((row) => (
													<div
														key={row.id}
														className="rounded-xl border border-black/10 bg-black/5 px-3 py-2 dark:border-white/10 dark:bg-black/35"
													>
														<div className="flex items-center justify-between text-zinc-600 dark:text-white/70">
															<span>Linea {row.line}</span>
															<span>{row.lexeme}</span>
														</div>
														<p className="mt-1 text-zinc-900 dark:text-white">{row.description}</p>
													</div>
												))
											)}
										</div>
									</ScrollArea>
								</TabsContent>
							</Tabs>
						</CardContent>
					</Card>
				</section>
			</div>
		</main>
	)
}
