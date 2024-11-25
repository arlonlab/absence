function NavBar() {
  return (
    <>
      <header className="bg-[#ebe9e9] text-black-lingu sticky top-0 z-10 ">
        <section className="max-w-8xl mx-auto py-2 flex justify-between items-center px-20 ">
          <h1 className="text-5xl relative right-16">Abscence</h1>

          <div className="py-2 px-1">
            <img
              src="profile_placeholder.png"
              alt="Beschreibung des Bildes"
              className="w-16 h-16 rounded-full  object-cover"
            />
          </div>
        </section>
      </header>
    </>
  );
}

export default NavBar;
