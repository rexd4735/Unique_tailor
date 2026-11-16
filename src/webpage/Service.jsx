const services = [
  {
    title: 'Shirt Tailoring',
    desc: 'your attractive clothes are made with us. We provide the best shirt tailoring services to make you look your best.',
    image: '/public/img/blog1.jpg',
  },
  {
    title: 'Blouse Tailoring',
    desc: 'Customized blouses tailored to your exact dreams. Experience the perfect fit and style with our expert tailoring services.',
    image: '/public/img/blog2.jpg', 
  },
  {
    title: 'Special Occasion Tailoring',
    desc: 'Tailored for your most memorable moments. Our special occasion tailoring services ensure you look stunning for weddings, parties, and all your cherished events.',
    image: '/public/img/blog3.jpg',
  },
];

export default function TailoringServices() {
  return (
    <section id="Service" className="py-20 relative">
      <div className="w-full px-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-montserrat text-stone-900 tracking-tight">Our Services</h2>
          <div className="h-1 w-12 bg-amber-600 mx-auto mt-4"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 ">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group relative z-50 h-120 w-full overflow-hidden rounded-lg bg-stone-200 shadow-xl shadow-stone-200/50 cursor-pointer"
            >
              {/* Background Image with Zoom Effect */}
              <img 
                src={service.image} 
                alt={service.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
              />

              {/* Dynamic Overlay */}
              <div className="absolute inset-0 bg-stone-900/40 transition-colors duration-500 group-hover:bg-stone-900/75" />

              {/* Text Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <h3 className="text-2xl font-montserrat mb-3 translate-y-8 transition-transform duration-500 group-hover:translate-y-0">
                  {service.title}
                </h3>
                
                <div className="h-0.5 w-0 bg-amber-500 mb-4 transition-all duration-700 delay-100 group-hover:w-full" />

                <p className="text-sm text-stone-300 opacity-0 translate-y-4 transition-all duration-500 delay-200 group-hover:opacity-100 group-hover:translate-y-0 leading-relaxed">
                  {service.desc}
                </p>

                <button className="mt-6 w-max border-b border-amber-500 py-1 text-xs uppercase tracking-[0.2em] font-bold opacity-0 transition-opacity duration-700 group-hover:opacity-100">
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}