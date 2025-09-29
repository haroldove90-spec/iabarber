import React from 'react';

export const HeroSection: React.FC = () => {
  
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href')?.substring(1);
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 md:py-32 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/1600/900?grayscale&blur=5')" }}>
      <div className="absolute inset-0 bg-black/80"></div>
      <div className="container mx-auto px-6 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-4 leading-tight">
          Descubre Tu Peinado Perfecto.
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Deja de adivinar. Deja que nuestra IA analice tu rostro y te recomiende los mejores cortes de pelo para tu look único.
        </p>
        <a href="#recommender" onClick={handleScroll} className="bg-gray-200 hover:bg-white text-black font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105">
          Encontrar Mi Estilo
        </a>
      </div>
    </section>
  );
};