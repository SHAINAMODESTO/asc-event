const Hero = ({ banner, title, description }) => {
  return (
    <section className="relative h-[180px] overflow-hidden">
      {banner ? (
        <img
          src={banner}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700" />
      )}

      <div className="absolute inset-0 bg-slate-900/60" />

      <div className="relative mx-auto flex h-full max-w-6xl items-center px-6">
        <div className="max-w-3xl">
          <span className="rounded-full bg-white/20 px-4 py-2 text-sm text-white backdrop-blur">
            EVENT REGISTRATION
          </span>

          <h1 className="mt-6 text-5xl font-bold text-white">{title}</h1>

          <p className="mt-3 text-lg leading-8 text-slate-200">{description}</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
