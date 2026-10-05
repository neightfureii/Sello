import { ChevronLeft } from "lucide-react";

const BackButton = () => {
  return (
    <button
      className="text-sm text-gray-600 hover:text-gray-800 transition-colors bg-blue-100 hover:bg-blue-200 rounded-full p-2 hover:cursor-pointer"
      onClick={() => window.history.back()}
    >
      <ChevronLeft />
    </button>
  );
};

export default BackButton;
