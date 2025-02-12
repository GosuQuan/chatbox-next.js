'use client'

import { useEffect, useRef, forwardRef } from 'react'

const fragmentShader = `
  precision highp float;
  uniform float time;
  uniform vec2 resolution;
  uniform vec2 mouse;
  uniform vec2 mouseVelocity;

  #define PI 3.14159
  #define NUM_BEAMS 16.0
  #define FADE_SPEED 0.5
  #define BEAM_WIDTH 12.0
  #define BASE_INTENSITY 0.15

  vec3 getBeamColor(float strength) {
    vec3 color1 = vec3(0.0, 0.1, 0.4);  // 更暗的蓝色
    vec3 color2 = vec3(0.1, 0.3, 0.8);  // 柔和的蓝色
    vec3 color3 = vec3(0.5, 0.7, 1.0);  // 淡蓝色（不用纯白色）
    
    strength = pow(strength, 1.5);  // 使颜色过渡更加柔和
    
    if (strength < 0.5) {
      return mix(color1, color2, strength * 2.0);
    } else {
      return mix(color2, color3, (strength - 0.5) * 2.0);
    }
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 center = mouse / resolution.xy;
    float speed = length(mouseVelocity);
    
    vec3 finalColor = vec3(0.0);
    float totalIntensity = 0.0;
    
    if (speed > 0.001) {
      for(float i = 0.0; i < NUM_BEAMS; i++) {
        float angle = (i / NUM_BEAMS) * PI * 2.0;
        vec2 dir = vec2(cos(angle), sin(angle));
        
        // 计算光束长度
        float len = 0.2 + speed * 0.3;  // 减小基础长度和速度影响
        
        // 计算到光束的距离
        vec2 p = uv - center;
        float d = dot(p, dir);
        d = clamp(d, 0.0, len);
        vec2 closest = center + dir * d;
        float dist = distance(uv, closest);
        
        // 计算光束强度
        float width = BEAM_WIDTH + sin(time * FADE_SPEED + i) * 1.0;  // 减小波动幅度
        float beam = exp(-dist * width) * pow(1.0 - d / len, 1.5);  // 使边缘更柔和
        beam *= BASE_INTENSITY + speed * 0.4;  // 降低基础亮度，减小速度影响
        beam *= 0.9 + sin(time * FADE_SPEED + i * 0.5) * 0.1;  // 减小脉动效果
        
        totalIntensity += beam;
        finalColor += getBeamColor(beam) * beam;
      }
    }
    
    gl_FragColor = vec4(finalColor, min(1.0, totalIntensity));
  }
`

const vertexShader = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const RippleBackground = forwardRef<HTMLCanvasElement>((_, ref) => {
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 })
  const mouseVelocityRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>()
  const startTimeRef = useRef<number>(Date.now())
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    console.log('RippleBackground mounted')
    const canvas = canvasRef.current
    if (!canvas) {
      console.error('Canvas not found')
      return
    }

    const gl = canvas.getContext('webgl')
    if (!gl) {
      console.error('WebGL not supported')
      return
    }
    console.log('WebGL context created')

    // 创建着色器程序
    const program = createProgram(gl, vertexShader, fragmentShader)
    if (!program) return

    // 设置顶点数据
    const vertices = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1,
    ])

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    // 获取着色器变量位置
    const positionLocation = gl.getAttribLocation(program, 'position')
    const timeLocation = gl.getUniformLocation(program, 'time')
    const resolutionLocation = gl.getUniformLocation(program, 'resolution')
    const mouseLocation = gl.getUniformLocation(program, 'mouse')
    const mouseVelocityLocation = gl.getUniformLocation(program, 'mouseVelocity')
    const spectrumLocation = gl.getUniformLocation(program, 'spectrum')

    gl.useProgram(program)
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    // 设置画布尺寸
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    // 初始化鼠标位置在中心
    mouseRef.current = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      lastX: canvas.width / 2,
      lastY: canvas.height / 2
    }
    console.log('Initial mouse position:', mouseRef.current)

    // 平滑跟随参数
    const smoothFactor = 0.15 // 减小平滑系数，使移动更加柔和

    // 处理鼠标移动
    const handleMouseMove = (e: MouseEvent) => {
      console.log('Mouse move:', { x: e.clientX, y: e.clientY })
      const { x: lastX, y: lastY } = mouseRef.current
      const currentX = e.clientX
      const currentY = canvas.height - e.clientY
      
      // 计算鼠标速度，添加惯性
      const velocityX = (currentX - lastX) * 0.3
      const velocityY = (currentY - lastY) * 0.3
      
      mouseVelocityRef.current = {
        x: mouseVelocityRef.current.x * 0.8 + velocityX * 0.2,
        y: mouseVelocityRef.current.y * 0.8 + velocityY * 0.2
      }
      
      mouseRef.current = {
        x: currentX,
        y: currentY,
        lastX,
        lastY
      }
    }
    console.log('Adding mouse event listeners to document')
    document.addEventListener('mousemove', handleMouseMove, { passive: false })

    // 处理触摸移动
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      const { x: lastX, y: lastY } = mouseRef.current
      const targetX = touch.clientX
      const targetY = canvas.height - touch.clientY
      
      // 平滑过渡到新位置
      const currentX = lastX + (targetX - lastX) * smoothFactor
      const currentY = lastY + (targetY - lastY) * smoothFactor
      
      // 计算触摸速度
      mouseVelocityRef.current = {
        x: (currentX - lastX) * 2.0,
        y: (currentY - lastY) * 2.0
      }
      
      mouseRef.current = {
        x: currentX,
        y: currentY,
        lastX,
        lastY
      }
    }
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    
    // 模拟物理惯性
    const updatePhysics = () => {
      const friction = 0.98 // 更慢的衰减，使动画更平滑
      
      // 更新速度
      mouseVelocityRef.current = {
        x: mouseVelocityRef.current.x * friction,
        y: mouseVelocityRef.current.y * friction
      }
      
      requestAnimationFrame(updatePhysics)
    }
    updatePhysics()

    // 自动更新鼠标位置
    const updatePosition = () => {
      const { x, y, lastX, lastY } = mouseRef.current
      mouseRef.current = {
        x: x + mouseVelocityRef.current.x,
        y: y + mouseVelocityRef.current.y,
        lastX: x,
        lastY: y
      }
      requestAnimationFrame(updatePosition)
    }
    updatePosition()

    // 动画循环
    const render = () => {
      const time = (Date.now() - startTimeRef.current) / 1000
      gl.uniform1f(timeLocation, time)
      gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y)
      gl.uniform2f(mouseVelocityLocation, mouseVelocityRef.current.x, mouseVelocityRef.current.y)
      
      // 每60帧打印一次状态
      if (Math.floor(time) % 2 === 0) {
        console.log('Render state:', {
          mousePos: { x: mouseRef.current.x, y: mouseRef.current.y },
          velocity: mouseVelocityRef.current,
          time
        })
      }
      gl.uniform3f(spectrumLocation, 
        Math.sin(time * 0.6) * 0.5 + 0.5,
        Math.sin(time * 0.4) * 0.5 + 0.5,
        Math.sin(time * 0.2) * 0.5 + 0.5
      )

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animationFrameRef.current = requestAnimationFrame(render)
    }
    render()

    // 清理函数
    return () => {
      console.log('Cleaning up RippleBackground')
      window.removeEventListener('resize', resize)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('touchmove', handleTouchMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={(element) => {
        // 同时设置 forwarded ref 和内部 ref
        if (typeof ref === 'function') {
          ref(element)
        } else if (ref) {
          ref.current = element
        }
        canvasRef.current = element
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#000',
        touchAction: 'none',
        zIndex: -1
      }}
    />
  )
})

// 创建着色器
function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

// 创建着色器程序
function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)

  if (!vertexShader || !fragmentShader) return null

  const program = gl.createProgram()
  if (!program) return null

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }

  return program
}

RippleBackground.displayName = 'RippleBackground'

export default RippleBackground
