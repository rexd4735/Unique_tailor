import { FaMapMarkerAlt } from "react-icons/fa";
import { FaClock } from "react-icons/fa";
import { useState } from "react";
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
   <nav className="absolute top-0 left-0 flex justify-center items-center w-full h-23 bg-transparent z-50">
        <div className='absolute left-8 mt-5 max-sm:left-4'>
         <img
  className="h-33 w-68 max-sm:w-16 max-sm:h-16"
  src="/img/logo3.png"
  alt="Logo"
/>
        </div>
   <div className=" hidden md:flex opacity-90 px-4 py-2 font-montserrat font-medium items-center space-x-20 text-white text-shadow-transparent dark:text-gray-900 text-lg max-sm:text-sm max-sm:space-x-2">
    <a href="#Heroslider" className=" border-b-2 border-transparent hover:text-gray-400 hover:border-white transition-all duration-300">Home</a>
    <a href="#" className=" border-b-2 border-transparent hover:text-gray-400 hover:border-white transition-all duration-300">Track</a>
    <a href="#Service" className=" border-b-2 border-transparent hover:text-gray-400 hover:border-white transition-all duration-300">Our Service</a>
    <a href="#Contact" className=" border-b-2 border-transparent hover:text-gray-400 hover:border-white transition-all duration-300">Contact</a>
   </div>
        <div className='hidden md:flex absolute top-6 right-8 items-center space-x-1 max-sm:right-4'>
          <FaMapMarkerAlt className="text-white text-lg pr-1" />
          <a href="#"><h3 className='font-montserrat text-white text-sm'>Location :</h3></a>
          <h3 className='font-montserrat text-white text-sm'>T nagar Chennai</h3>
        </div>
         <div className='hidden md:flex absolute bottom-1 right-8 items-center space-x-1 max-sm:right-4'>
          <FaClock className="text-white text-lg pr-1" />
          <a href="#"><h3 className='font-montserrat text-white text-sm'>Shop Timing :</h3></a>
          <h3 className='font-montserrat text-white text-sm'>09:00 AM To 08:00 PM</h3>
        </div>
        <button
            className="md:hidden absolute right-5 flex flex-col space-y-1"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span
              className={`h-0.5 w-6 bg-neutral-900 transition-all duration-300 ${
                isOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-neutral-900 transition-all duration-300 ${
                isOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-neutral-900 transition-all duration-300 ${
                isOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            />
          </button>
          {isOpen && (
       <div
  className={`md:hidden shadow-md flex relative z-50 gap-2 transition-all duration-500 ease-in-out ${
    isOpen ? " opacity-100 " : " opacity-0"
  }`}
>
        <a
          href="#Heroslider"
          className="block px-2 py-3 font-montserrat  hover:border-b-2 hover:bg-neutral-300 border-black transition-all duration-300"
          onClick={() => setIsOpen(false)}
        >
          Home
        </a>
        <a
          href="#Track"
          className="block  px-2 py-3 font-montserrat  hover:border-b-2 hover:bg-neutral-300 border-black transition-all duration-300"
          onClick={() => setIsOpen(false)}
        >
          Track
        </a>
        <a
          href="#Service"
          className="block  px-2 py-3 font-montserrat hover:border-b-2 hover:bg-neutral-300 border-black transition-all duration-300"
          onClick={() => setIsOpen(false)}
        >
          Services
        </a>
        <a
          href="#Contact"
          className="block px-2 py-3 font-montserrat hover:bg-neutral-300"
          onClick={() => setIsOpen(false)}
        >
          Contact
        </a>
      </div>
      )}

</nav>
  );
}

export default Navbar;
