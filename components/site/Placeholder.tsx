import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";

export function Placeholder({ title, body, active }: { title: string; body: string; active?: string }) {
  return (
    <>
      <SiteNav active={active} />
      <main className="bg-white px-5 py-24 text-center lg:px-16">
        <h1 className="font-display text-4xl font-bold text-navy lg:text-[56px]">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-body">{body}</p>
        <a href="/preview/" className="mt-8 inline-flex rounded-xl bg-navy px-7 py-4 font-semibold leading-none text-white hover:bg-nav">See the phone preview</a>
      </main>
      <SiteFooter />
    </>
  );
}
