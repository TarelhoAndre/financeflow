import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Navbar */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 font-bold text-zinc-950">
              F
            </div>

            <span className="text-xl font-semibold">
              Finance<span className="text-cyan-400">Flow</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-zinc-300 md:flex">
            <a href="#recursos" className="transition hover:text-white">
              Recursos
            </a>

            <a href="#sobre" className="transition hover:text-white">
              Sobre
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden rounded-lg px-4 py-2 text-sm text-zinc-300 transition hover:text-white sm:block"
            >
              Entrar
            </Link>

            <Link
              href="/demo"
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-300"
            >
              Testar demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-20 -z-0 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-14 px-6 py-24 lg:grid-cols-2 lg:items-center lg:py-32">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
              Gerenciamento financeiro simples e inteligente
            </div>

            <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
              Assuma o controle das suas{" "}
              <span className="text-cyan-400">finanças.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
              Organize receitas e despesas, acompanhe seus gastos e visualize
              sua vida financeira através de dashboards simples e intuitivos.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/demo"
                className="rounded-xl bg-cyan-400 px-6 py-3 text-center font-semibold text-zinc-950 transition hover:bg-cyan-300"
              >
                Testar demonstração
              </Link>

              <Link
                href="/auth/sign-up"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-center font-semibold transition hover:bg-white/10"
              >
                Criar conta
              </Link>
            </div>

            <p className="mt-4 text-sm text-zinc-500">
              A demonstração não exige cadastro.
            </p>
          </div>

          {/* Preview Dashboard */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">Saldo atual</p>
                <p className="mt-1 text-3xl font-bold">R$ 4.850,00</p>
              </div>

              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-400">
                +12,4%
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
                <p className="text-sm text-zinc-500">Receitas</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-400">
                  R$ 8.500
                </p>
                <p className="mt-2 text-xs text-zinc-500">Neste mês</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
                <p className="text-sm text-zinc-500">Despesas</p>
                <p className="mt-2 text-2xl font-semibold text-rose-400">
                  R$ 3.650
                </p>
                <p className="mt-2 text-xs text-zinc-500">Neste mês</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">Economia mensal</p>
                  <p className="mt-1 text-xl font-semibold">R$ 4.850</p>
                </div>

                <p className="text-sm text-cyan-400">57%</p>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                <div className="h-full w-[57%] rounded-full bg-cyan-400" />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-900 p-5">
              <p className="mb-5 text-sm font-medium">Gastos por categoria</p>

              <div className="space-y-4 text-sm">
                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-zinc-400">Moradia</span>
                    <span>R$ 1.450</span>
                  </div>

                  <div className="h-2 rounded-full bg-zinc-800">
                    <div className="h-2 w-[70%] rounded-full bg-cyan-400" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-zinc-400">Alimentação</span>
                    <span>R$ 920</span>
                  </div>

                  <div className="h-2 rounded-full bg-zinc-800">
                    <div className="h-2 w-[48%] rounded-full bg-cyan-400" />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-zinc-400">Transporte</span>
                    <span>R$ 480</span>
                  </div>

                  <div className="h-2 rounded-full bg-zinc-800">
                    <div className="h-2 w-[28%] rounded-full bg-cyan-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section
        id="recursos"
        className="border-t border-white/10 bg-zinc-900/30 py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
              Recursos
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Tudo que você precisa para organizar suas finanças
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Feature
              title="Controle de transações"
              description="Cadastre receitas e despesas e mantenha todo seu histórico financeiro organizado."
            />

            <Feature
              title="Dashboard financeiro"
              description="Acompanhe saldo, receitas, despesas e categorias através de indicadores visuais."
            />

            <Feature
              title="Orçamentos e metas"
              description="Defina limites de gastos e acompanhe seu progresso em objetivos financeiros."
            />
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            FinanceFlow
          </p>

          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Finanças sem complicação.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl leading-7 text-zinc-400">
            FinanceFlow é uma aplicação full stack desenvolvida para facilitar
            o acompanhamento financeiro pessoal através de uma experiência
            moderna, rápida e intuitiva.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-zinc-500 sm:flex-row">
          <p>© 2026 FinanceFlow</p>

          <p>Projeto desenvolvido para portfólio</p>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-400/30 hover:bg-white/[0.05]">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-xl text-cyan-400">
        ✓
      </div>

      <h3 className="text-lg font-semibold">{title}</h3>

      <p className="mt-3 leading-6 text-zinc-400">{description}</p>
    </article>
  );
}