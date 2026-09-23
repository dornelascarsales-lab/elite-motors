import { useEffect, useRef } from 'react';

export default function NexusEngine() {
  const canvasRef = useRef(null);
  const gridRef = useRef(null);

  // WebGL Renderer Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl2');
    
    if (!gl) {
      
      return;
    }

    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    
    window.addEventListener('resize', resize);
    resize();

    const vsSource = `#version 300 es
      in float a_t;
      in float a_instance;
      
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_instances;
      
      out float v_instance;
      
      void main() {
          v_instance = a_instance;
          
          // Normalized parameters
          float time = u_time * 0.0004;
          float id = (a_instance / u_instances) * 2.0 - 1.0; // -1 to 1 across ribbon
          float u = a_t * 3.14159 * 2.0; // Uma volta completa do loop
          
          // --- Infinity ribbon (estrada em loop) ---
          vec3 p;
          float d = 1.0 + sin(u) * sin(u);
          p.x = 2.4 * cos(u) / d;
          p.y = 1.5 * sin(u) * cos(u) / d;
          p.z = sin(u * 2.0 + time * 1.5) * 0.5;

          // Gentle pulse effect
          float pulse = 1.0 + 0.05 * sin(time * 5.0);
          p *= pulse;
          
          // Deform to create ribbon thickness (parallel lines)
          float spread = 0.5;
          p.x += sin(u * 4.0 + time) * id * spread * 0.4;
          p.y += cos(u * 4.0 + time) * id * spread * 0.4;
          p.z += sin(u * 2.0) * id * spread;
          
          // Slow global rotation
          float rx = sin(time * 0.5) * 0.2; // Limited X tilt to keep shape recognizable
          float ry = time * 0.4;            // Continuous Y spin
          
          mat2 rotX = mat2(cos(rx), -sin(rx), sin(rx), cos(rx));
          mat2 rotY = mat2(cos(ry), -sin(ry), sin(ry), cos(ry));
          
          vec2 yz = rotX * vec2(p.y, p.z);
          p.y = yz.x; p.z = yz.y;
          
          vec2 xz = rotY * vec2(p.x, p.z);
          p.x = xz.x; p.z = xz.y;
          
          // Simple perspective projection
          float z_dist = 6.0;
          float z_factor = z_dist / (z_dist - p.z);
          vec2 pos2d = p.xy * z_factor;
          
          // Aspect ratio correction & scaling
          float aspect = u_resolution.x / u_resolution.y;
          pos2d.x /= aspect;
          
          // Scale to fit viewport nicely
          pos2d *= 0.45; 
          
          // Subtle breathing scale
          pos2d *= 1.0 + sin(time * 2.0) * 0.02;

          gl_Position = vec4(pos2d, 0.0, 1.0);
      }
    `;

    const fsSource = `#version 300 es
      precision highp float;
      
      in float v_instance;
      uniform float u_instances;
      
      out vec4 outColor;
      
      void main() {
          // Dourado Elite Motors
          vec3 coreColor = vec3(0.83, 0.66, 0.26);
          
          // Fade color slightly towards the darker red edges of the ribbon bundle
          float edgeFactor = abs((v_instance / u_instances) * 2.0 - 1.0);
          vec3 finalColor = mix(coreColor, vec3(0.35, 0.22, 0.05), pow(edgeFactor, 2.0));
          
          // Additive blending alpha
          outColor = vec4(finalColor, 0.28);
      }
    `;

    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const segments = 800;    
    const instances = 60;    

    const tData = new Float32Array(segments);
    for (let i = 0; i < segments; i++) tData[i] = i / (segments - 1);

    const instanceData = new Float32Array(instances);
    for (let i = 0; i < instances; i++) instanceData[i] = i;

    const tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, tData, gl.STATIC_DRAW);
    const a_t = gl.getAttribLocation(program, "a_t");
    gl.enableVertexAttribArray(a_t);
    gl.vertexAttribPointer(a_t, 1, gl.FLOAT, false, 0, 0);

    const instanceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, instanceData, gl.STATIC_DRAW);
    const a_instance = gl.getAttribLocation(program, "a_instance");
    gl.enableVertexAttribArray(a_instance);
    gl.vertexAttribPointer(a_instance, 1, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(a_instance, 1); 

    const u_time = gl.getUniformLocation(program, "u_time");
    const u_resolution = gl.getUniformLocation(program, "u_resolution");
    const u_instances = gl.getUniformLocation(program, "u_instances");

    gl.uniform1f(u_instances, instances);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); 
    gl.disable(gl.DEPTH_TEST);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = (time) => {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(u_time, time);
      gl.uniform2f(u_resolution, canvas.width, canvas.height);

      gl.drawArraysInstanced(gl.LINE_STRIP, 0, segments, instances);

      if (!reduceMotion) animationFrameId = requestAnimationFrame(render);
    };
    
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(tBuffer);
      gl.deleteBuffer(instanceBuffer);
    };
  }, []);

  // Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!gridRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      gridRef.current.style.backgroundPosition = `calc(50% + ${x}px) calc(50% + ${y}px)`;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#030303] text-white" style={{ fontFamily: "'Space Mono', monospace" }}>
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full pointer-events-none opacity-60 md:opacity-100"></canvas>

      {/* Grid Pattern with Parallax */}
      <div 
        ref={gridRef} 
        className="absolute inset-0 z-10 pointer-events-none transition-all duration-100 ease-out will-change-[background-position]"
        style={{ 
          backgroundSize: '80px 80px', 
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px)', 
          backgroundPosition: 'center center' 
        }}
      ></div>

      {/* Diagonal Texture Overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay"
        style={{ 
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255, 255, 255, 0.02) 4px, rgba(255, 255, 255, 0.02) 5px)' 
        }}
      ></div>

      {/* HUD Elements Overlay */}
      <main className="absolute inset-0 z-20 pointer-events-none hidden md:flex flex-col justify-between p-6 md:p-[80px]">
        
        {/* Top Row */}
        <div className="flex justify-between items-start w-full relative">
          <div className="text-[0.65rem] leading-[1.2] tracking-[0.2em] uppercase nexus-gs-reveal" style={{ animationDelay: '0.2s' }}>
            <span className="text-gray-400">ELITE ///</span> MOTORS<br />
            <span className="text-gray-400">///</span> ORLANDO FL
          </div>

          <div 
            className="w-8 h-8 opacity-80 nexus-gs-reveal mt-2 mr-2" 
            style={{ 
              animationDelay: '0.3s',
              background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255, 255, 255, 0.6) 2px, rgba(255, 255, 255, 0.6) 4px)' 
            }}
          ></div>
          
          <div className="absolute top-1/2 left-[30%] w-[20vw] h-[1px] bg-white/10 -translate-y-1/2 nexus-gs-reveal" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Center Interactive Area */}
        <div className="absolute top-1/2 left-[10%] md:left-[20%] -translate-y-1/2 nexus-gs-reveal pointer-events-auto" style={{ animationDelay: '0.5s' }}>
          <div className="absolute -right-12 top-1/2 w-8 h-[1px] bg-white/30 -translate-y-1/2"></div>
        </div>

        {/* Middle Crosshairs / Guides (Hidden on mobile for clarity) */}
        <div className="absolute top-[40%] left-[50%] w-3 h-3 border-t border-l border-white/40 -translate-x-1/2 -translate-y-1/2 hidden md:block"></div>
        <div className="absolute bottom-[30%] right-[30%] w-3 h-3 border-b border-r border-white/40 hidden md:block"></div>
        <div className="absolute top-[20%] right-[40%] w-[1px] h-4 bg-white/30 hidden md:block"></div>

        {/* Bottom Row */}
        <div className="flex justify-between items-end w-full relative">
          
          <div className="text-[0.65rem] leading-[1.2] tracking-[0.2em] uppercase text-right nexus-gs-reveal mb-2 mr-2 ml-auto" style={{ animationDelay: '0.6s' }}>
            <span className="text-gray-400">///</span><br />
            DRIVE
          </div>

          <div className="absolute top-[-10vh] left-0 right-[-10vw] bottom-0 pointer-events-none opacity-30">
            <div className="absolute w-[12px] h-[12px] border-white/40 top-0 left-0 border-t border-l"></div>
            <div className="absolute w-[12px] h-[12px] border-white/40 bottom-0 left-0 border-b border-l"></div>
          </div>
        </div>
      </main>
    </div>
  );
}