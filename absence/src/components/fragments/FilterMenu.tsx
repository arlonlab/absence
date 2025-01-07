import { useState } from "react";
import CheckboxMenu from "./CheckboxMenu";
import DropBox from "./DropBox";

const tiere = ["katze", "maus"];
const abw = ["zu spät", "sonstige Gründe", "krank", "lockdown"];

interface Props {
  onClick: (input: string) => void;
}
const FilterMenu = ({ onClick }: Props) => {
  const [inputVal, updateInputVal] = useState("");

  const handleChange = (event: any) => {
    updateInputVal(event.target.value);
  };

  return (
    <div className="h-[91vh] w-full bg-[#474747] px-20">
      <div>
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

      <div className="flex flex-row w-full mt-10 gap-24 justify-between">
        <div className="flex flex-col gap-4">
          <DropBox items={tiere}>Abteilung</DropBox>
          <DropBox items={tiere}>Zeitraum von (placeholder)</DropBox>
          <DropBox items={tiere}>Lehrkraft</DropBox>
          <DropBox items={tiere}>SchülerIn</DropBox>
        </div>

        <div className="flex flex-col justify-center gap-4">
          <DropBox items={tiere}>Klasse</DropBox>
          <DropBox items={tiere}>bis (placeholder)</DropBox>
          <DropBox items={tiere}>Fach</DropBox>
          <DropBox items={tiere}>Entschuldigt</DropBox>
        </div>
      </div>
      <div id="check-menu" className="mt-10">
        <label
          htmlFor="check-menu"
          className="text-sm/6 font-medium text-white "
        >
          Abwesenheitsgrund
        </label>

        <CheckboxMenu items={abw}></CheckboxMenu>
      </div>
    </div>
  );
};

export default FilterMenu;
