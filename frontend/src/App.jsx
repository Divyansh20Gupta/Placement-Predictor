import { useState, useEffect, useRef } from "react"
import axios from "axios"

// Custom cursor - ripple only
function CustomCursor() {
  useEffect(() => {
    const createRipple = (e) => {
      const ripple = document.createElement("div")
      ripple.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        border: 1px solid rgba(100, 180, 255, 0.6);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9997;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        transform: translate(-50%, -50%);
        animation: rippleOut 0.6s ease-out forwards;
      `
      document.body.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    }

    document.addEventListener("click", createRipple)
    return () => document.removeEventListener("click", createRipple)
  }, [])

  return (
    <style>{`
      @keyframes rippleOut {
        0% { width: 8px; height: 8px; opacity: 0.8; }
        100% { width: 60px; height: 60px; opacity: 0; }
      }
    `}</style>
  )
}

// Nebula background
function NebulaCanvas({ mousePos }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const cx = canvas.width / 2
    const cy = canvas.height / 2

    particlesRef.current = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.0 + 0.1,
      opacity: Math.random() * 0.5 + 0.05,
      twinkleSpeed: Math.random() * 0.015 + 0.003,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: Math.random() > 0.7 ? "#a0c4ff" : "#ffffff"
    }))

    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.height * 0.5)
      core.addColorStop(0, "rgba(80, 40, 120, 0.12)")
      core.addColorStop(0.3, "rgba(30, 20, 80, 0.08)")
      core.addColorStop(0.7, "rgba(10, 10, 40, 0.04)")
      core.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = core
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const ring1 = ctx.createRadialGradient(cx, cy, canvas.height * 0.15, cx, cy, canvas.height * 0.45)
      ring1.addColorStop(0, "rgba(0,0,0,0)")
      ring1.addColorStop(0.4, "rgba(40, 60, 140, 0.05)")
      ring1.addColorStop(0.7, "rgba(20, 40, 100, 0.03)")
      ring1.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = ring1
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const mouseGlow = ctx.createRadialGradient(
        mousePos.current.x, mousePos.current.y, 0,
        mousePos.current.x, mousePos.current.y, 200
      )
      mouseGlow.addColorStop(0, "rgba(60, 100, 200, 0.04)")
      mouseGlow.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = mouseGlow
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach(star => {
        const twinkle = Math.sin(time * star.twinkleSpeed * 60 + star.twinkleOffset)
        const opacity = Math.max(0.02, star.opacity + twinkle * 0.15)
        const size = Math.max(0.1, star.size + twinkle * 0.3)

        ctx.beginPath()
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2)
        ctx.fillStyle = star.color
        ctx.globalAlpha = opacity
        ctx.fill()
        ctx.globalAlpha = 1
      })

      time++
      animRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        zIndex: 0,
        pointerEvents: "none"
      }}
    />
  )
}

// True liquid glass card
function GlassCard({ children, style = {}, tint = "blue" }) {
  const tints = {
    blue: "rgba(20, 60, 120, 0.25)",
    green: "rgba(20, 80, 50, 0.25)",
    purple: "rgba(60, 20, 100, 0.25)",
    neutral: "rgba(20, 25, 50, 0.2)"
  }

  return (
    <div style={{
      background: tints[tint] || tints.neutral,
      backdropFilter: "blur(60px) saturate(200%) brightness(1.1)",
      WebkitBackdropFilter: "blur(60px) saturate(200%) brightness(1.1)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      borderTop: "1px solid rgba(255, 255, 255, 0.2)",
      borderLeft: "1px solid rgba(255, 255, 255, 0.15)",
      borderRadius: "24px",
      padding: "32px",
      boxShadow: `
        0 8px 32px rgba(0,0,0,0.5),
        0 2px 8px rgba(0,0,0,0.3),
        inset 0 1px 0 rgba(255,255,255,0.12),
        inset 0 -1px 0 rgba(0,0,0,0.2)
      `,
      ...style
    }}>
      {children}
    </div>
  )
}

// Glass input
function GlassInput({ label, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{
        display: "block",
        marginBottom: "8px",
        color: focused ? "rgba(160, 200, 255, 0.9)" : "rgba(255,255,255,0.35)",
        fontSize: "11px",
        fontWeight: "600",
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        transition: "color 0.3s"
      }}>
        {label}
      </label>
      <input
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "13px 16px",
          background: focused
            ? "rgba(100, 160, 255, 0.06)"
            : "rgba(255, 255, 255, 0.03)",
          border: focused
            ? "1px solid rgba(120, 180, 255, 0.4)"
            : "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "12px",
          color: "rgba(255,255,255,0.9)",
          fontSize: "15px",
          outline: "none",
          transition: "all 0.3s",
          boxShadow: focused
            ? "0 0 0 3px rgba(100,160,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "inset 0 1px 0 rgba(255,255,255,0.03)"
        }}
      />
    </div>
  )
}

// Results
function Results({ result }) {
  const placed = result.placement_prediction === 1
  const tier = result.college_tier

  return (
    <div style={{ marginTop: "24px" }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Profile card */}
      <GlassCard tint="neutral" style={{ marginBottom: "16px", animation: "fadeUp 0.5s ease" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "20px"
        }}>
          <div>
            <h2 style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "rgba(255,255,255,0.92)",
              letterSpacing: "-0.3px"
            }}>
              {result.name}
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: "13px",
              marginTop: "4px"
            }}>
              {result.college}
            </p>

            {/* Tier badge - only highlighted for Tier 1/2 */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "10px",
              padding: "4px 12px",
              background: tier === "Tier 1"
                ? "rgba(255, 200, 50, 0.12)"
                : tier === "Tier 2"
                ? "rgba(100, 160, 255, 0.08)"
                : "rgba(255,255,255,0.03)",
              border: tier === "Tier 1"
                ? "1px solid rgba(255, 200, 50, 0.3)"
                : tier === "Tier 2"
                ? "1px solid rgba(100, 160, 255, 0.15)"
                : "1px solid rgba(255,255,255,0.05)",
              borderRadius: "20px"
            }}>
              <div style={{
                width: "5px", height: "5px",
                borderRadius: "50%",
                background: tier === "Tier 1"
                  ? "#fbbf24"
                  : tier === "Tier 2"
                  ? "#60a5fa"
                  : "rgba(255,255,255,0.2)"
              }} />
              <span style={{
                fontSize: "11px",
                color: tier === "Tier 1"
                  ? "rgba(255, 200, 50, 0.8)"
                  : tier === "Tier 2"
                  ? "rgba(150, 200, 255, 0.7)"
                  : "rgba(255,255,255,0.25)",
                letterSpacing: "0.5px"
              }}>
                {tier}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
            {[
              { label: "Skills", value: result.skills_count },
              { label: "Internships", value: result.internships_count },
              { label: "Projects", value: result.projects_count },
              { label: "Certs", value: result.certifications_count }
            ].map(item => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "rgba(180, 210, 255, 0.9)"
                }}>
                  {item.value}
                </div>
                <div style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.3)",
                  marginTop: "2px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase"
                }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Prediction card */}
      <GlassCard
        tint={placed ? "green" : "blue"}
        style={{
          marginBottom: "16px",
          textAlign: "center",
          animation: "fadeUp 0.65s ease",
          border: placed
            ? "1px solid rgba(80, 200, 120, 0.2)"
            : "1px solid rgba(100, 150, 255, 0.2)"
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>
          {placed ? "🚀" : "⭐"}
        </div>

        <h2 style={{
          fontSize: "22px",
          fontWeight: "700",
          color: placed
            ? "rgba(120, 220, 160, 0.95)"
            : "rgba(150, 190, 255, 0.95)",
          marginBottom: "8px",
          letterSpacing: "-0.3px"
        }}>
          {placed
            ? "Strongly Positioned for Placement"
            : "Your Journey is Just Beginning"}
        </h2>

        <p style={{
          color: "rgba(255,255,255,0.3)",
          fontSize: "14px",
          maxWidth: "380px",
          margin: "0 auto",
          lineHeight: "1.6"
        }}>
          {placed
            ? "Your profile stands out. The opportunities are out there — go claim them."
            : "Every expert was once exactly where you are. Your roadmap to success starts here."}
        </p>

        <div style={{
          marginTop: "24px",
          padding: "20px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.06)"
        }}>
          <div style={{
            fontSize: "10px",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "8px"
          }}>
            Expected Package
          </div>
          <div style={{
            fontSize: "38px",
            fontWeight: "800",
            color: "rgba(180, 220, 255, 0.95)",
            letterSpacing: "-1px"
          }}>
            ₹{result.salary_prediction.toLocaleString()}
          </div>
          <div style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.25)",
            marginTop: "4px",
            letterSpacing: "1px"
          }}>
            PER ANNUM
          </div>
        </div>
      </GlassCard>

      {/* Suggestions */}
      <GlassCard tint="neutral" style={{ marginBottom: "16px", animation: "fadeUp 0.8s ease" }}>
        <h3 style={{
          fontSize: "11px",
          fontWeight: "600",
          color: "rgba(150, 200, 255, 0.6)",
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: "16px"
        }}>
          Profile Analysis
        </h3>
        {result.suggestions.map((s, i) => (
          <div key={i} style={{
            padding: "13px 16px",
            marginBottom: "8px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "12px",
            borderLeft: "2px solid rgba(100, 160, 255, 0.4)",
            color: "rgba(255,255,255,0.55)",
            fontSize: "13px",
            lineHeight: "1.6"
          }}>
            {s}
          </div>
        ))}
      </GlassCard>

      {/* AI Recommendations - structured cards */}
      <GlassCard tint="purple" style={{ animation: "fadeUp 0.95s ease" }}>
        <h3 style={{
          fontSize: "11px",
          fontWeight: "600",
          color: "rgba(150, 200, 255, 0.6)",
          letterSpacing: "2px",
          textTransform: "uppercase",
          marginBottom: "20px"
        }}>
          🤖 AI Career Recommendations
        </h3>

        {(() => {
          const text = result.gemini_suggestions.replace(/\*\*/g, "").replace(/\*/g, "")
          const lines = text.split("\n").filter(l => l.trim())

          const skill_lines = lines.filter(l => {
            const lower = l.toLowerCase()
            return lower.includes("skill") || lower.includes("learn") ||
              lower.includes("docker") || lower.includes("aws") ||
              lower.includes("framework") || lower.includes("language") ||
              lower.includes("kubernetes") || lower.includes("next")
          }).slice(0, 4)

          const cert_lines = lines.filter(l => {
            const lower = l.toLowerCase()
            return lower.includes("certif") || lower.includes("associate") ||
              lower.includes("professional") || lower.includes("az-") ||
              lower.includes("saa") || lower.includes("google certified")
          }).slice(0, 3)

          const project_lines = lines.filter(l => {
            const lower = l.toLowerCase()
            return lower.includes("project") || lower.includes("build") ||
              lower.includes("develop") || lower.includes("platform") ||
              lower.includes("e-commerce") || lower.includes("saas") ||
              lower.includes("microservice")
          }).slice(0, 3)

          const sections = [
            { icon: "⚡", title: "Skills to Learn", lines: skill_lines, color: "rgba(100, 160, 255, 0.12)", border: "rgba(100, 160, 255, 0.2)" },
            { icon: "🏆", title: "Certifications", lines: cert_lines, color: "rgba(80, 180, 120, 0.1)", border: "rgba(80, 180, 120, 0.2)" },
            { icon: "🚀", title: "Project Idea", lines: project_lines, color: "rgba(160, 100, 255, 0.1)", border: "rgba(160, 100, 255, 0.2)" }
          ]

          return sections.map((section, idx) => (
            <div key={idx} style={{
              marginBottom: "14px",
              padding: "18px 20px",
              background: section.color,
              border: `1px solid ${section.border}`,
              borderRadius: "14px"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px"
              }}>
                <span style={{ fontSize: "15px" }}>{section.icon}</span>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase"
                }}>
                  {section.title}
                </span>
              </div>
              {section.lines.length > 0 ? section.lines.map((line, i) => (
                <div key={i} style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "8px",
                  alignItems: "flex-start"
                }}>
                  <span style={{
                    color: "rgba(150, 200, 255, 0.4)",
                    fontSize: "11px",
                    marginTop: "3px",
                    flexShrink: 0
                  }}>→</span>
                  <span style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "13px",
                    lineHeight: "1.6"
                  }}>
                    {line.replace(/^[•\-\d\.\s]+/, "").trim()}
                  </span>
                </div>
              )) : (
                <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px" }}>
                  No specific items found
                </p>
              )}
            </div>
          ))
        })()}
      </GlassCard>
    </div>
  )
}

// Main App
function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [file, setFile] = useState(null)
  const [formData, setFormData] = useState({
    ssc_p: "",
    hsc_p: "",
    degree_p: "",
    is_graduated: false
  })
  const mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleFileChange = (e) => setFile(e.target.files[0])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    const data = new FormData()
    data.append("file", file)
    data.append("ssc_p", formData.ssc_p)
    data.append("hsc_p", formData.hsc_p)
    data.append("degree_p", formData.degree_p)
    data.append("is_graduated", formData.is_graduated)

    try {
      const response = await axios.post("https://placement-predictor-production-2753.up.railway.app/predict", data)
      setResult(response.data)
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <CustomCursor />
      <NebulaCanvas mousePos={mousePos} />

      <div style={{
        position: "relative",
        zIndex: 1,
        maxWidth: "680px",
        margin: "0 auto",
        padding: "60px 24px 80px"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            background: "rgba(100, 160, 255, 0.06)",
            border: "1px solid rgba(100, 160, 255, 0.12)",
            borderRadius: "20px",
            marginBottom: "24px"
          }}>
            <div style={{
              width: "5px", height: "5px",
              borderRadius: "50%",
              background: "#60a5fa",
              boxShadow: "0 0 6px #60a5fa"
            }} />
            <span style={{
              fontSize: "10px",
              color: "rgba(150, 200, 255, 0.7)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontWeight: "600"
            }}>
              AI Powered Career Intelligence
            </span>
          </div>

          <h1 style={{
            fontSize: "48px",
            fontWeight: "800",
            color: "rgba(255,255,255,0.92)",
            lineHeight: "1.1",
            letterSpacing: "-1.5px",
            marginBottom: "14px"
          }}>
            Placement
            <span style={{
              display: "block",
              background: "linear-gradient(135deg, rgba(150,200,255,0.9), rgba(100,150,255,0.7))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Predictor
            </span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.28)",
            fontSize: "15px",
            letterSpacing: "0.3px",
            lineHeight: "1.6"
          }}>
            Upload your resume · Discover your potential · Own your future
          </p>
        </div>

        {/* Form */}
        <GlassCard tint="blue">
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                color: "rgba(255,255,255,0.35)",
                fontSize: "11px",
                fontWeight: "600",
                letterSpacing: "1.5px",
                textTransform: "uppercase"
              }}>
                Resume
              </label>
              <label style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "14px",
                padding: "28px 20px",
                background: file ? "rgba(100, 160, 255, 0.04)" : "rgba(255,255,255,0.02)",
                border: file
                  ? "1px solid rgba(100, 160, 255, 0.25)"
                  : "1px dashed rgba(255,255,255,0.08)",
                borderRadius: "16px",
                cursor: "pointer",
                transition: "all 0.3s"
              }}>
                <span style={{ fontSize: "22px" }}>{file ? "✓" : "↑"}</span>
                <div>
                  <div style={{
                    fontSize: "14px",
                    color: file ? "rgba(150,200,255,0.8)" : "rgba(255,255,255,0.3)",
                    fontWeight: "500"
                  }}>
                    {file ? file.name : "Upload your resume"}
                  </div>
                  {!file && (
                    <div style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.18)",
                      marginTop: "3px"
                    }}>
                      PDF format · Max 10MB
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <GlassInput
                label="10th %"
                type="number"
                name="ssc_p"
                value={formData.ssc_p}
                onChange={handleInputChange}
                placeholder="Percentage"
                min="0" max="100" step="0.01"
                required
              />
              <GlassInput
                label="12th %"
                type="number"
                name="hsc_p"
                value={formData.hsc_p}
                onChange={handleInputChange}
                placeholder="Percentage"
                min="0" max="100" step="0.01"
                required
              />
              <GlassInput
                label="CGPA"
                type="number"
                name="degree_p"
                value={formData.degree_p}
                onChange={handleInputChange}
                placeholder="Out of 10"
                min="0" max="10" step="0.01"
                required
              />
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer"
              }}>
                <input
                  type="checkbox"
                  name="is_graduated"
                  checked={formData.is_graduated}
                  onChange={handleInputChange}
                  style={{ width: "15px", height: "15px", accentColor: "#60a5fa" }}
                />
                <span style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.35)",
                  letterSpacing: "0.5px"
                }}>
                  I have already graduated
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "15px",
                background: loading
                  ? "rgba(100,150,255,0.08)"
                  : "rgba(100,150,255,0.15)",
                color: loading
                  ? "rgba(255,255,255,0.3)"
                  : "rgba(200,220,255,0.9)",
                border: "1px solid rgba(100,150,255,0.25)",
                borderTop: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "14px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s",
                letterSpacing: "1px",
                textTransform: "uppercase",
                backdropFilter: "blur(10px)",
                boxShadow: loading
                  ? "none"
                  : "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 15px rgba(100,150,255,0.1)"
              }}
            >
              {loading ? "Analyzing your profile..." : "Predict My Placement →"}
            </button>
          </form>

          {error && (
            <div style={{
              marginTop: "16px",
              padding: "12px 16px",
              background: "rgba(200,60,60,0.06)",
              border: "1px solid rgba(200,60,60,0.15)",
              borderRadius: "10px",
              color: "rgba(255,160,160,0.8)",
              fontSize: "13px"
            }}>
              {error}
            </div>
          )}
        </GlassCard>

        {result && <Results result={result} />}
      </div>
    </div>
  )
}

export default App