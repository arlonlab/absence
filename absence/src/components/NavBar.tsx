
function NavBar() {
    

    return (
<>
<header className="bg-ab-grey text-black-lingu sticky top-0 z-10 ">
      <section className="max-w-8xl mx-auto px-4 py-2 flex justify-between  items-center ">
      <form >
    <div>
      <input className=" border-2 rounded-3xl border-black  w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none " id="search" type="text" placeholder="search for keywords"/>
    </div>
        </form>
        
        <img src="logo_placeholder.png" alt="Beschreibung des Bildes" className="h-16 flex-shrink-0 "/>
       
        <div className="py-2 px-1">
        <img src="profile_placeholder.png" alt="Beschreibung des Bildes" className="w-16 h-16 rounded-full  object-cover"/>
        </div>

    </section>
    </header> 
</>
    );

}

export default NavBar;