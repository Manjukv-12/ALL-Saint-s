import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ChurchName from '@/components/common/ChurchName';
import csiLogo from '../assets/csi_logo.jpg';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

const LaunchPage = () => {
  const [isLaunching, setIsLaunching] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationFrame = useRef<number>();
  const navigate = useNavigate();

  // Particle colors including rose/pink from the logo
  const confettiColors = ['#1E3A5F', '#B7950B', '#7E909A', '#E91E63', '#ffffff'];

  const createParticles = () => {
    const count = 180;
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 25,
        vy: (Math.random() - 0.5) * 25 - 8,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
      });
    }
  };

  const updateParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.current.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.6; // Gravity
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();

      if (p.y > canvas.height + 100) {
        particles.current.splice(i, 1);
      }
    });

    if (particles.current.length > 0) {
      animationFrame.current = requestAnimationFrame(updateParticles);
    }
  };

  const handleLaunch = () => {
    setIsLaunching(true);
    createParticles();
    updateParticles();

    setTimeout(() => {
      navigate('/home');
    }, 2800);
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#fdfbf7] overflow-hidden">
      {/* Premium Background: Soft radial gradient and lattice pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, #1E3A5F 1px, transparent 0)`, 
          backgroundSize: '40px 40px' 
        }} 
      />
      <div 
        className="absolute inset-0" 
        style={{ 
          background: 'radial-gradient(circle at center, transparent 0%, rgba(253, 251, 247, 0.8) 100%), radial-gradient(circle at center, rgba(30, 58, 95, 0.03) 0%, transparent 70%)' 
        }} 
      />
      
      {/* Decorative center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-50"
      />

      <AnimatePresence mode="wait">
        {!isLaunching ? (
          <motion.div
            key="launch-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.5 } }}
            className="relative z-10 text-center px-4 w-full max-w-2xl"
          >
            {/* Logo Section with breathing animation and glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 1, 
                ease: [0.22, 1, 0.36, 1] 
              }}
              className="mb-12 flex justify-center"
            >
              <motion.div
                animate={{ 
                  boxShadow: ['0 0 20px rgba(30, 58, 95, 0.1)', '0 0 40px rgba(30, 58, 95, 0.2)', '0 0 20px rgba(30, 58, 95, 0.1)'],
                  scale: [1, 1.02, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-28 h-28 rounded-full bg-white shadow-medium flex items-center justify-center p-1 overflow-hidden border border-primary/10"
              >
                <img src={csiLogo} alt="CSI Logo" className="w-full h-full object-cover rounded-full" />
              </motion.div>
            </motion.div>

            {/* Typography Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h2 className="text-secondary-foreground/60 font-sans tracking-[0.2em] uppercase text-sm mb-4 font-bold">
                Launching
              </h2>
              <h1 className="text-h1 mb-8 leading-tight">
                <span className="block font-old-english text-primary scale-110 mb-2">
                  <ChurchName variant="csidot" />
                </span>
                <span className="text-h2 font-serif italic text-secondary-foreground/80 lowercase tracking-tight">
                  thrissur, kerala
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-body-lg text-muted-foreground mb-12 max-w-md mx-auto leading-relaxed"
            >
              Step into our new digital sanctuary. <br />
              Experience our worship, heritage, and community.
            </motion.p>

            {/* Redesigned Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <motion.button
                onClick={handleLaunch}
                whileHover={{ scale: 1.05, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-12 py-5 bg-primary rounded-full font-bold text-lg shadow-medium overflow-hidden transition-all duration-300"
              >
                {/* Background gradient including rose highlight */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-[#2a4f7c] to-primary group-hover:via-[#E91E63]/20 transition-all duration-500" />
                
                <span className="relative z-10 !text-white flex items-center gap-3">
                  Redirect to Website
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
                
                {/* Shine effect */}
                <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-white/20 skew-x-[-25deg] group-hover:left-[150%] transition-all duration-700 ease-in-out" />
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="success-message"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 text-center"
          >
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-h2 text-primary font-old-english mb-4"
            >
              Welcome Home
            </motion.h2>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 100 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-0.5 bg-primary/20 mx-auto"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-12 left-0 right-0 text-center">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.2 }}
          className="text-caption tracking-widest uppercase font-semibold"
        >
          © {new Date().getFullYear()} All Saints’ CSI Church
        </motion.p>
      </div>
    </div>
  );
};

export default LaunchPage;
