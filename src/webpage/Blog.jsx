function Blog() {
  return (
	<div className="">
	  {
        <section className=" dark:bg-gray-900 relative">
    <div className="container px-6 py-10 mx-auto">
        <div className="text-center">
             <div className="text-center mb-16">
          <h2 className="text-4xl font-montserrat text-stone-900 tracking-tight">From The Blog</h2>
          <div className="h-1 w-12 bg-amber-600 mx-auto mt-4"></div>
    
            <p className="max-w-lg mx-auto mt-4  text-gray-500">
                from our blog, you can find the latest trends in tailoring, fashion tips, and discover how to elevate your style with our tailored creations.
            </p>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-8 mt-8 md:mt-16 md:grid-cols-2 xl:grid-cols-3">
            <div>
                <div className="relative">
                    <img className="object-center object-fill items-center w-full h-70 rounded-lg lg:h-80" src="/public/img/blog1.jpg" alt=""></img>

                    <div className="absolute bottom-0 flex p-3 bg-white dark:bg-gray-900 ">
                        <img className="object-cover object-center w-10 h-10 rounded-full" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" alt=""></img>

                        <div className="mx-4">
                            <h1 className="text-sm text-gray-700 dark:text-gray-200">Fahim</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Trip Advisor</p>
                        </div>
                    </div>
                </div>

                <h1 className="mt-6 text-xl font-semibold text-gray-800 dark:text-white">
                    clothes that fit your style
                </h1>

                <hr className="w-32 my-6 text-blue-500"></hr>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                    fashion is not just about wearing clothes; it's about expressing your unique style and personality. With our expert tailoring services, you can create garments that fit you perfectly and reflect your individuality. Whether you're looking for everyday wear or something special for a memorable occasion, we are here to help you look and feel your best.
                </p>

                <a href="#" className="inline-block mt-4 text-blue-500 underline hover:text-blue-400">Read more</a>
            </div>

            <div>
                <div className="relative">
                    <img className="object-center object-fill items-center w-full h-70 rounded-lg lg:h-80" src="/public/img/blog2.jpg" alt=""></img>

                    <div className="absolute bottom-0 flex p-3 bg-white dark:bg-gray-900 ">
                        <img className="object-cover object-center w-10 h-10 rounded-full"src="./public/img/ejas1.jpeg"alt=""></img>

                        <div className="mx-4">
                            <h1 className="text-sm text-gray-700 dark:text-gray-200">Ejas</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Leading Software Tester</p>
                        </div>
                    </div>
                </div>

                <h1 className="mt-6 text-xl font-semibold text-gray-800 dark:text-white">
                    dreams are made with us
                </h1>

                <hr className="w-32 my-6 text-blue-500"></hr>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                        your attractive clothes are made with us. We provide the best shirt tailoring services to make you look your best. With our expert craftsmanship and attention to detail, we ensure that every garment we create fits you perfectly and enhances your style. Whether you're looking for a classic shirt or a trendy design, we are here to bring your fashion dreams to life.
                </p>

                <a href="#" className="inline-block mt-4 text-blue-500 underline hover:text-blue-400">Read more</a>
            </div>

            <div>
                <div className="relative">
                    <img className="object-center object-fill items-center w-full h-70 rounded-lg lg:h-80" src="/public/img/blog3.jpg" alt="" />

                    <div className="absolute bottom-0 flex p-3 bg-white dark:bg-gray-900 ">
                        <img className="object-cover  object-center w-10 h-10 rounded-full" src="./public/img/jul1.jpeg" alt="" />

                        <div className="mx-4">
                            <h1 className="text-sm text-gray-700 dark:text-gray-200">Julkifili</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Future CA</p>
                        </div>
                    </div>
                </div>

                <h1 className="mt-6 text-xl font-semibold text-gray-800 dark:text-white">
                    beautiful clothes for your memorable moments
                </h1>

                <hr className="w-32 my-6 text-blue-500"></hr>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  fantasy is not just about wearing clothes; it's about expressing your unique style and personality. With our expert tailoring services, you can create garments that fit you perfectly and reflect your individuality. Whether you're looking for everyday wear or something special for a memorable occasion, we are here to help you look and feel your best.
                </p>

                <a href="#" className="inline-block mt-4 text-blue-500 underline hover:text-blue-400">Read more</a>
            </div>
        </div>
    </div>
</section>
      }
	</div>
  );
}

export default Blog;