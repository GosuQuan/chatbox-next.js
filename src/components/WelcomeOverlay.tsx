import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function WelcomeOverlay() {
  const [show, setShow] = useState(true)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    // 延迟显示按钮
    const buttonTimer = setTimeout(() => {
      setShowButton(true)
    }, 1000)

    return () => clearTimeout(buttonTimer)
  }, [])

  const handleEnter = () => {
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 1, ease: "easeOut" }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: { duration: 0.8, ease: "easeOut" }
            }}
            exit={{
              y: -20,
              opacity: 0,
              transition: { duration: 0.5, ease: "easeIn" }
            }}
            style={{
              textAlign: 'center',
              color: '#ffffff',
            }}
          >
            <motion.h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                background: 'linear-gradient(45deg, #4f46e5, #06b6d4)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              你的下一个大模型
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 0.5, duration: 0.8 }
              }}
              style={{
                fontSize: '2rem',
                fontWeight: 'normal',
                color: '#9ca3af',
                marginBottom: '3rem',
              }}
            >
              未必是 ChatGPT
            </motion.h2>

            {showButton && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: "easeOut" }
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEnter}
                style={{
                  padding: '12px 32px',
                  fontSize: '1.2rem',
                  color: '#fff',
                  background: 'linear-gradient(45deg, #4f46e5, #06b6d4)',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  fontWeight: '500',
                  letterSpacing: '1px',
                }}
              >
                点击进入
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
