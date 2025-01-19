import Logo from "../assets/logo.png";
import Htl from "../assets/htl3r_logo_transp.png";

function NavBar() {
  return (
    <>
      <header className="bg-[#ebe9e9] text-black-lingu sticky top-0 z-10 ">
        <section className="max-w-8xl mx-auto py-2 flex justify-between items-center px-20 ">
          <div className="w-1/6">
            <img src={Logo} alt="Abscence Logo" />
          </div>

          <div className="">
            <img
              src={Htl}
              alt="Beschreibung des Bildes"
              className="w-full"
            />
          </div>
        </section>
      </header>
    </>
  );
}

export default NavBar;
