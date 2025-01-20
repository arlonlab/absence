import { useState } from "react";
import CheckboxMenu from "./CheckboxMenu";
import DropBox from "./DropBox";

const tiere = ["katze", "maus"];
const abw = ["zu spät", "sonstige Gründe", "krank", "lockdown"];

interface Props {
  onClick: (input: string) => void;
  onChange: () => void;
}
const FilterMenu = ({ onClick, onChange }: Props) => {
  const [inputVal, updateInputVal] = useState("");

  const [triangleColor, setTriangleColor] = useState("bg-[#A82036]"); 
  const [statistikColor, setStatistikColor] = useState("bg-[#808080]"); 

  const [status, setStatus] = useState(true); 



  const handleTriangleClick = () => {


    setTriangleColor((prevColor) =>
      prevColor === "bg-[#A82036]" ? "bg-[#808080]" : "bg-[#A82036]"

    );

    setStatistikColor((prevColor) =>
      prevColor === "bg-[#808080]" ? "bg-[#A82036]" : "bg-[#808080]"

    );



    setStatus(!status);
    
    onChange();
  };

  const handleChange = (event: any) => {
    updateInputVal(event.target.value);
  };

  return (
    <div className="h-[91vh] w-full bg-[#fefefe]">
      <div className="w-ful flex flex-col items-start">
        <img
          src="Logo.png"
          alt="Beschreibung des Bildes"
          className="w-64 pt-8 pl-10 "
        />
      </div>

      <div className="w-full flex flex-col items-end">
        <img
          src="htl3r_logo_transp_gross.png"
          alt="Beschreibung des Bildes"
          className="w-1/2 py-5  pr-10"
        />
      </div>
      <div className={`relative w-full h-24 mb-5 flex items-center justify-center ${triangleColor} shadow-[0px_4px_6px_rgba(0,0,0,0.1)]` } disabled={!status}
      onClick={handleTriangleClick}   

      >
        <p className="text-white font-semibold text-3xl">Dashboard</p>

        {status && (
        <div className="absolute -right-5 top-1/2 -translate-y-1/2 h-0 w-0 border-y-[22px] border-y-transparent border-l-[24px] border-l-[#A82036]"></div>
      )}
      </div>
      {/* 
      <div className="px-20">
        <input
          className=" border-2 rounded-3xl border-black  w-full py-3 px-5 text-gray-800 leading-tight focus:outline-none 
      mt-14 "
          id="search"
          type="text"
          placeholder="search for keywords"
          onChange={handleChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onClick(inputVal);
            }
          }}
        />
      </div>

      */}
      {status && (

      <div className="flex flex-row w-full my-10 gap-24 justify-between px-20">
        <div className="flex flex-col gap-4">
          <DropBox items={tiere}>Abteilung</DropBox>
          <DropBox items={tiere}>Klasse</DropBox>
          <DropBox items={tiere}>SchülerIn</DropBox>
          <DropBox items={tiere}>Zeitraum</DropBox>

          <DropBox items={tiere}>Fach</DropBox>
          <DropBox items={tiere}>Lehrkraft</DropBox>
          <DropBox items={tiere}>Abwesenheitsgrund</DropBox>
        </div>
      </div>
      )}
  <div className={`relative w-full h-24 mb-5 flex items-center justify-center ${statistikColor} shadow-[0px_4px_6px_rgba(0,0,0,0.1)]`} 
      onClick={handleTriangleClick}    >       
             

      <p className="text-white font-semibold text-3xl">Statistiken</p>
      {!status && (

        <div className="absolute -right-5 top-1/2 -translate-y-1/2 h-0 w-0 border-y-[22px] border-y-transparent border-l-[24px] border-l-[#A82036]"></div>
      )}
      </div>
    </div>
  );
};

export default FilterMenu;
