'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface HeroSectionProps {
  title: string
  subtitle: string  
  imageSrc: string
  imageAlt: string
  height?: string
  overlayColor?: string
  accentColor?: string
}

export function HeroSection({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  height = 'h-[280px]',
  overlayColor = 'bg-[#0a0f1e]/85',
  accentColor = 'text-[#00b4d8]'
}: HeroSectionProps) {
  return (
    <div className={`relative ${height} w-full overflow-hidden rounded-2xl mb-8`}>
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover"
        priority
      />
      <div className={`absolute inset-0 ${overlayColor}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent" />
      <motion.div
        className="relative z-10 h-full flex flex-col justify-end p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className={`text-sm font-medium uppercase tracking-widest mb-2 ${accentColor}`}>
          {subtitle}
        </p>
        <h1 className="text-4xl font-bold text-white">{title}</h1>
      </motion.div>
    </div>
  )
}
