import Neko from '@/components/Neko';

export default function Test() {
    return (
        <div className="grid grid-rows-[0px_1fr_20px] md:items-center items-start md:justify-items-center min-h-screen p-4 pb-20 gap-8 sm:p-20 sm:gap-16 font-[family-name:var(--font-geist-sans)]">
            <main className="flex max-w-2xl flex-col md:items-center gap-8 row-start-2 sm:items-start mt-8 ">
      Raaaaaa I love kitties
            </main>
            <Neko spriteUrl="/oneko.gif" />
        </div>
    );
}
