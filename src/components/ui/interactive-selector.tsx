"use client";

import React, { useState, useEffect } from 'react';

export interface InteractiveSelectorOption {
  title: string;
  description: string;
  image: string;
  icon?: React.ReactNode;
}

interface InteractiveSelectorProps {
  options: InteractiveSelectorOption[];
  title?: string;
  subtitle?: string;
}

const InteractiveSelector = ({
  options,
  title = "Escape in Style",
  subtitle = "Discover luxurious camping experiences in nature’s most breathtaking spots."
}: InteractiveSelectorProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatedOptions, setAnimatedOptions] = useState<number[]>([]);

  const handleOptionClick = (index: number) => {
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    options.forEach((_, i) => {
      const timer = setTimeout(() => {
        setAnimatedOptions(prev => [...prev, i]);
      }, 180 * i);
      timers.push(timer);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [options]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] w-full font-sans">
      {/* Header Section */}
      <div className="w-full max-w-2xl px-6 mt-8 mb-2 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight drop-shadow-lg animate-fadeInTop delay-300">{title}</h1>
        <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-xl mx-auto animate-fadeInTop delay-600">{subtitle}</p>
      </div>

      <div className="h-12"></div>

      {/* Options Container */}
      <div className="options flex w-full max-w-5xl h-[400px] sm:h-[500px] mx-auto items-stretch overflow-hidden relative rounded-2xl shadow-xl">
        {options.map((option, index) => (
          <div
            key={index}
            className={`
              option relative flex flex-col justify-end overflow-hidden transition-all duration-700 ease-in-out
              ${activeIndex === index ? 'active' : ''}
            `}
            style={{
              backgroundImage: `url('${option.image}')`,
              backgroundSize: activeIndex === index ? 'auto 100%' : 'auto 120%',
              backgroundPosition: 'center',
              backfaceVisibility: 'hidden',
              opacity: animatedOptions.includes(index) ? 1 : 0,
              transform: animatedOptions.includes(index) ? 'translateX(0)' : 'translateX(-60px)',
              minWidth: '60px',
              minHeight: '100px',
              margin: 0,
              borderRadius: 0,
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: activeIndex === index ? 'rgba(255,255,255,0.8)' : 'rgba(100,100,100,0.3)',
              cursor: 'pointer',
              backgroundColor: '#18181b',
              boxShadow: activeIndex === index
                ? '0 20px 60px rgba(0,0,0,0.50)'
                : '0 10px 30px rgba(0,0,0,0.30)',
              flex: activeIndex === index ? '7 1 0%' : '1 1 0%',
              zIndex: activeIndex === index ? 10 : 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              position: 'relative',
              overflow: 'hidden',
              willChange: 'flex-grow, box-shadow, background-size, background-position'
            }}
            onClick={() => handleOptionClick(index)}
          >
            {/* Shadow effect */}
            <div
              className="shadow absolute left-0 right-0 pointer-events-none transition-all duration-700 ease-in-out"
              style={{
                bottom: activeIndex === index ? '0' : '-40px',
                height: '140px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)',
              }}
            ></div>

            {/* Label with icon and info */}
            <div className="label absolute left-0 right-0 bottom-6 flex items-center justify-start z-10 pointer-events-none px-4 gap-4 w-full">
              <div className="icon min-w-[44px] max-w-[44px] h-[44px] flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md shadow-sm border-2 border-white/20 flex-shrink-0 transition-all duration-200 text-white">
                {option.icon}
              </div>
              <div className="info text-white whitespace-pre-wrap sm:whitespace-nowrap relative w-full overflow-hidden">
                <div
                  className="main font-semibold text-lg md:text-xl transition-all duration-700 ease-in-out truncate"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? 'translateX(0)' : 'translateX(25px)'
                  }}
                >
                  {option.title}
                </div>
                <div
                  className="sub text-sm md:text-base text-gray-300 transition-all duration-700 ease-in-out truncate"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? 'translateX(0)' : 'translateX(25px)'
                  }}
                >
                  {option.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeInFromTop {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInTop {
          opacity: 0;
          transform: translateY(-20px);
          animation: fadeInFromTop 0.8s ease-in-out forwards;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  );
};

export default InteractiveSelector;
