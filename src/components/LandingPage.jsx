import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Palette, Shield, MousePointer2 
} from 'lucide-react';
import Premium_Sneaker_Customization_Video from "../assets/Premium_Sneaker_Customization_Video.mp4";

const UniqueLandingPage = () => {
  const { scrollYProgress } = useScroll();

  const yVideo = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  const floatAnimation = {
    y: [0, -12, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  };

  const showcaseShoes = [
    {
      id: 1,
      name: "Heritage Runner",
      price: "$185",
      img: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800",
      size: "md:col-span-2"
    },
    {
      id: 2,
      name: "Monarch Low",
      price: "$210",
      img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800",
      size: "md:col-span-1"
    },
    {
      id: 3,
      name: "Aurora Court",
      price: "$195",
      img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800",
      size: "md:col-span-1"
    },
  ];

  return (
    <div className="bg-[#050505] text-white selection:bg-white selection:text-black">

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: yVideo }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-[#050505] z-10" />
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src={Premium_Sneaker_Customization_Video} type="video/mp4" />
          </video>
        </motion.div>

        <motion.div
          style={{ opacity: opacityHero, scale: scaleHero }}
          className="relative z-20 text-center px-6 max-w-5xl"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="h-px w-12 bg-white/40" />
            <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-white/60">
              The Future of Footwear
            </span>
            <span className="h-px w-12 bg-white/40" />
          </div>

          <h1 className="mb-12 leading-[0.9] tracking-tight">
          <span className="block text-6xl md:text-[10rem] font-light bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            Uniquely.
          </span>
          <span className="block text-7xl md:text-[12rem] font-black uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-600">
            Yours.
          </span>
        </h1>


          <Link
            to="/designer"
            className="inline-flex items-center gap-2 px-12 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition"
          >
            Start Designing <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="py-40 container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} className="space-y-16">
            <h2 className="text-6xl leading-none font-light">
              The Science of <br />
              <span className="font-bold">Custom Comfort</span>
            </h2>

            <div className="grid gap-10">
              {[
                { icon: <Palette size={20} />, title: "Bespoke Palettes", desc: "500+ premium textures and shades." },
                { icon: <Shield size={20} />, title: "Lifetime Quality", desc: "Reinforced with military-grade stitching." }
              ].map((f, i) => (
                <div key={i} className="flex gap-8">
                  <motion.div animate={floatAnimation} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                    {f.icon}
                  </motion.div>
                  <div>
                    <h4 className="text-xl font-bold uppercase tracking-tight mb-2">
                      {f.title}
                    </h4>
                    <p className="text-neutral-400 leading-relaxed max-w-sm">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                className="w-full h-full object-cover opacity-70 hover:scale-110 transition duration-[2000ms]"
                alt="detail"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 hidden xl:block bg-[#0a0a0a]/80 p-8 rounded-3xl border border-white/10">
              <MousePointer2 className="mb-4 text-white/40" />
              <p className="text-sm text-neutral-400">
                We build vessels for your personal identity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="py-40 bg-white text-black rounded-t-[6rem]">
        <div className="container mx-auto px-6">
          <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tight mb-24">
            Latest Drops
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {showcaseShoes.map((shoe, i) => (
              <motion.div
                key={shoe.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="rounded-3xl overflow-hidden bg-neutral-100 mb-6">
                  <img src={shoe.img} className="w-full h-full object-cover hover:scale-105 transition duration-1000" />
                </div>
                <h4 className="text-3xl font-bold">{shoe.name}</h4>
                <p className="text-xs uppercase tracking-widest text-neutral-400 font-bold mt-2">
                  {shoe.price}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-60 text-center">
        <h2 className="text-6xl md:text-[8rem] font-light mb-12">
          Ready to define <br /> your legacy?
        </h2>
        <Link
          to="/designer"
          className="inline-block px-20 py-7 bg-white text-black rounded-full font-black uppercase tracking-[0.3em] text-xs hover:scale-105 transition"
        >
          Enter the Studio
        </Link>
      </section>

    </div>
  );
};

export default UniqueLandingPage;