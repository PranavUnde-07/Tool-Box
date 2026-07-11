import { motion } from 'framer-motion';
import { Container } from '../Container';
import './Hero.css';

const trustBadges = [
  'Runs locally',
  'No accounts',
  'No cloud uploads',
  'No ads',
  'Temporary processing only',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

export function Hero() {
  return (
    <section className="hero">
      <Container>
        <motion.div
          className="hero__content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="hero__eyebrow" variants={itemVariants}>
            <span className="hero__eyebrow-line" />
            <span>Privacy-First File Toolkit</span>
          </motion.div>

          <motion.h1 className="hero__title" variants={itemVariants}>
            TOOL<span className="hero__title-accent">BOX</span>
          </motion.h1>

          <motion.p className="hero__subtitle" variants={itemVariants}>
            Privacy-first local file processing.
          </motion.p>

          <motion.p className="hero__description" variants={itemVariants}>
            Process your files directly on your computer using professional
            local tools. Nothing is uploaded, nothing is stored, everything
            stays under your control.
          </motion.p>

          <motion.div className="hero__trust" variants={itemVariants}>
            {trustBadges.map((badge) => (
              <span key={badge} className="hero__trust-badge">
                <span className="hero__trust-check">✓</span>
                {badge}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <div className="hero__decoration" aria-hidden="true">
          TB
        </div>
      </Container>
    </section>
  );
}
