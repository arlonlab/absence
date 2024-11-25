interface Props {
  items: string[];
}

const CheckboxMenu = ({ items }: Props) => {
  return (
    <>
      <div className="bg-white rounded-xl py-4 px-8">
        {items.map((item, index) => (
          <>
            <div key={index} className="flex items-center my-2">
              <input
                id="default-checkbox"
                type="checkbox"
                value=""
                className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="default-checkbox"
                className="ms-2 text-sm font-medium text-black "
              >
                {item}
              </label>
            </div>
          </>
        ))}
      </div>
    </>
  );
};

export default CheckboxMenu;
