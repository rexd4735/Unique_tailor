import { useEffect, useState } from "react";
import hero1 from "/img/banner-1.jpg";
import hero2 from "/img/banner2.jpg";
import hero3 from "/img/banner3.jpg";

const slides = [
  {
    image: hero1,
    title: "Customizing Your Own Style",
    subtitle: " your attractive clothes are made with us. We provide the best shirt tailoring services to make you look your best.",
    buttonText: "Book Now"
  },
  {
    image: hero2,
    title: "Define Your Unique Look",
    subtitle: "Discover your personal style with our expert tailoring services. From classic to contemporary, we help you create a wardrobe that reflects your individuality and confidence.",
    buttonText: "Explore Now"
  },
  {
    image: hero3,
    title: "Tailoring Excellence for Every Occasion",
    subtitle: "Experience the art of tailoring with us. From everyday wear to special occasions, we craft garments that fit perfectly and elevate your style. Your perfect fit awaits.",
    buttonText: "Get Started"
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="Heroslider">
    <div className="relative min-h-screen w-full bg-cover bg-center">
      <div
        className="flex h-full transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="relative min-w-full h-full object-cover"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "100vh",
              width: "100%"
            }}
          >
            {/* dark layer */}
            <div className="absolute inset-0 bg-black/40" />

            {/* text */}
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-5xl font-medium font-montserrat mb-4">
                  {slide.title}
                </h1>
                <p className="text-xl">
                  {slide.subtitle}
                </p>
                <button className="mt-6 px-6 py-3 bg-white text-black font-montserrat font-medium rounded hover:bg-gray-200 transition">
                  {slide.buttonText}
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
    </section>
  );
}
