export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="fixed inset-0 grid h-dvh w-dvw place-items-center">
      {/* biome-ignore lint/performance/noImgElement: A full-viewport CSS background does not need Next Image sizing or optimization. */}
      <img
        alt="background"
        className={
          'absolute -z-10 size-full scale-105 object-cover object-center blur-md brightness-90'
        }
        src="/background.jpg"
      />

      {children}
    </div>
  );
}
