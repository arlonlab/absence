import { useState } from "react";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

interface Props {
  items: string[];
  children: string;
}

const DropBox = ({ items, children }: Props) => {
  const [selected, setSelected] = useState(items[0]);

  return (
    <>
      <div>
        <Listbox value={selected} onChange={setSelected}>
          <Label className="absolute ml-3 px-2 text-sm font-medium  bg-white text-gray-700 z-10"
>
            {children}
          </Label>
          <div className="relative mt-2">
            <ListboxButton className="relative w-full min-w-64 cursor-default border-2 rounded-md border-[#FF9AA9] bg-white py-2 px-5 text-gray-800 leading-tight focus:outline-none ">
              <span className="flex items-center">
                <span className="ml-3 block truncate">{selected}</span>
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                <ChevronUpDownIcon
                  aria-hidden="true"
                  className="size-5 text-gray-400"
                />
              </span>
            </ListboxButton>

            <ListboxOptions
              transition
              className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
            >
              {items.map((item, index) => (
                <ListboxOption
                  key={index}
                  value={item}
                  className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-[#ebe9e9] data-[focus]:text-black"
                >
                  <div className="flex items-center">
                    <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">
                      {item}
                    </span>
                  </div>

                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-black group-data-[focus]:text-black [.group:not([data-selected])_&]:hidden">
                    <CheckIcon aria-hidden="true" className="size-5" />
                  </span>
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
      </div>
    </>
  );
};

export default DropBox;