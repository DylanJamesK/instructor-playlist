// LavaLampBackground.tsx
import { motion } from "framer-motion";

const blobs = [
  { color: "from-green-400 via-green-500 to-yellow-300", delay: 0 },
  { color: "from-green-400 via-green-500 to-green-400", delay: 2 },
  { color: "from-green-400 via-lime-500 to-green-200", delay: 4 },
  { color: "from-green-400 via-lime-500 to-green-200", delay: 6 },
];

const FloatingCirclesBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute w-full h-full rounded-full 
                      bg-gradient-to-tr ${blob.color} 
                      opacity-50 mix-blend-screen blur-3xl`}
          style={{
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
          }}
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
            scale: [1, 2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: blob.delay,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingCirclesBackground;
