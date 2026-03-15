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

  const colors = ['#1E3A5F', '#B7950B', '#7E909A', '#4F4F4F', '#ffffff'];

  const createParticles = () => {
    const count = 150;
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
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
      p.vy += 0.5; // Gravity
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();

      // Remove particles off screen
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

    // Redirect after animation
    setTimeout(() => {
      navigate('/home');
    }, 2500);
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
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #1E3A5F 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-50"
      />

      <AnimatePresence>
        {!isLaunching ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 text-center px-4 max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-8 flex justify-center"
            >
              <div className="w-24 h-24 rounded-full bg-white shadow-soft flex items-center justify-center p-0.5 overflow-hidden">
                <img src={csiLogo} alt="CSI Logo" className="w-full h-full object-cover rounded-full" />
              </div>
            </motion.div>

            <h1 className="text-h1 mb-6 tracking-tight">
              Launching <br />
              <span className="text-primary group relative inline-block">
                <ChurchName variant="csidot" />
                <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </span>
            </h1>

            <p className="text-body-lg text-muted-foreground mb-10 max-w-md mx-auto">
              Welcome to our new digital sanctuary. Click below to enter and explore our community and heritage.
            </p>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={handleLaunch}
                className="group relative px-10 py-4 bg-primary rounded-full font-bold text-lg shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 !text-white">Redirect to Website</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 text-center"
          >
            <motion.h2
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-h2 text-primary font-old-english"
            >
              Welcome Home
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-10 left-0 right-0 text-center">
        <p className="text-caption opacity-40">
          © {new Date().getFullYear()} All Saints’ CSI Church, Thrissur
        </p>
      </div>
    </div>
  );
};

export default LaunchPage;
