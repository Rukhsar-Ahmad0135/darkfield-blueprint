export const TECHNOLOGIES = [
  {
    slug: "wireless",
    index: "01",
    title: "Wireless Systems",
    tagline: "Proprietary propagation. Non-line-of-sight telemetry.",
    summary:
      "Custom signal protocols, NLOS telemetry, and spectrum efficiency algorithms engineered for contested and bandwidth-constrained environments.",
    capabilities: [
      "Proprietary signal propagation protocols",
      "Non-line-of-sight (NLOS) telemetry",
      "Spectrum efficiency optimization",
      "Hybrid mesh radio fabric",
    ],
    sections: [
      {
        h: "Overview",
        b: "Our wireless stack targets the physics layer first — propagation, spectrum, and interference — so the application layer never has to compromise.",
      },
      {
        h: "Signal Processing",
        b: "Adaptive modulation pipelines and DSP routines tuned for low-SNR conditions, with hardware-accelerated decoding paths.",
      },
      {
        h: "Mesh Networks",
        b: "Self-organizing, self-healing meshes built on hybrid wireless links — designed for environments where centralized infrastructure fails.",
      },
      {
        h: "Use Cases",
        b: "Off-grid logistics, autonomous fleets, remote sensing arrays, and resilient enterprise backhaul.",
      },
    ],
  },
  {
    slug: "stealth",
    index: "02",
    title: "Stealth Systems",
    tagline: "Signature reduction. Low-observable infrastructure.",
    summary:
      "RF, thermal, and acoustic signature reduction paired with low-observable digital infrastructure for adversarial operating conditions.",
    capabilities: [
      "RF signature reduction",
      "Thermal & acoustic dampening",
      "Low-observable digital fabric",
      "Counter-detection telemetry",
    ],
    sections: [
      { h: "Overview", b: "Stealth is treated as a systems-level discipline — across emissions, posture, and protocol behavior." },
      { h: "Signature Engineering", b: "Material, geometry, and emissions co-design to minimize observability across multiple sensing modalities." },
      { h: "Protocol Posture", b: "Traffic shaping, timing decorrelation, and quiet-by-default network behavior." },
      { h: "Use Cases", b: "Sensitive deployments, embedded research platforms, secure relay infrastructure." },
    ],
  },
  {
    slug: "surveillance",
    index: "03",
    title: "Surveillance Systems",
    tagline: "Sensor arrays. Autonomous threat detection.",
    summary:
      "High-fidelity sensor arrays, autonomous threat detection matrices, and real-time analytical monitoring suites with AI-driven triage.",
    capabilities: [
      "Multi-modal sensor fusion",
      "Autonomous threat detection",
      "Real-time analytical monitoring",
      "Edge-side AI triage",
    ],
    sections: [
      { h: "Overview", b: "We build perception systems that prioritize ground-truth fidelity over feature checklists." },
      { h: "Sensor Fusion", b: "Vision, radar, acoustic, and RF streams aligned into a single temporal model." },
      { h: "Threat Matrices", b: "Autonomous classification with explainable confidence intervals for operator review." },
      { h: "Use Cases", b: "Perimeter defense, critical infrastructure monitoring, environmental research." },
    ],
  },
  {
    slug: "systems",
    index: "04",
    title: "Core Systems",
    tagline: "Hardware-software synthesis. Scalable infrastructure.",
    summary:
      "Orchestration of complex architecture, scalable infrastructure, and unified hardware-software synthesis across the full stack.",
    capabilities: [
      "Hardware-software co-design",
      "Scalable orchestration",
      "Unified deployment fabric",
      "Zero-trust architecture",
    ],
    sections: [
      { h: "Overview", b: "A systems group whose mandate is to make the rest of the company's work deployable, observable, and durable." },
      { h: "Orchestration", b: "Declarative infrastructure with first-class support for edge, mesh, and core environments." },
      { h: "Zero-Trust Fabric", b: "Identity, attestation, and policy enforced at every hop, including hardware roots of trust." },
      { h: "Use Cases", b: "Enterprise rollouts, classified deployments, multi-site R&D programs." },
    ],
  },
] as const;

export type Technology = (typeof TECHNOLOGIES)[number];

export const SERVICES = [
  {
    slug: "embedded",
    title: "Embedded Systems & IoT",
    summary:
      "Custom micro-architecture and secure firmware engineering designed for adversarial edge-computing requirements.",
  },
  {
    slug: "ai",
    title: "Software & AI",
    summary:
      "Bespoke neural networks, automated robotic processing, and enterprise-grade software optimization.",
  },
  {
    slug: "rdaas",
    title: "R&D as a Service",
    summary:
      "Turnkey contract research, rapid prototyping, and validation for hardware and software physics engineering.",
  },
  {
    slug: "manufacturing",
    title: "Additive Manufacturing",
    summary:
      "Industrial-grade 3D synthesis for rapid deployment and mechanical component fabrication.",
  },
] as const;

export const JOBS = [
  {
    slug: "ai-engineer",
    title: "AI Engineer",
    team: "Software & AI",
    type: "Full Time",
    location: "Remote",
    summary:
      "Design and ship neural systems that run reliably at the edge of contested environments.",
    responsibilities: [
      "Architect and train models for perception, fusion, and orchestration workloads",
      "Optimize inference paths for embedded hardware",
      "Collaborate with systems and embedded teams on deployment fabric",
    ],
    requirements: [
      "Production ML experience with PyTorch or JAX",
      "Strong fundamentals in linear algebra, optimization, and signal processing",
      "Comfort working in low-resource, high-stakes runtime environments",
    ],
  },
  {
    slug: "full-stack-engineer",
    title: "Full Stack Engineer",
    team: "Core Systems",
    type: "Full Time",
    location: "Hybrid",
    summary:
      "Build the operator surfaces that make distributed mesh systems observable and controllable.",
    responsibilities: [
      "Develop typed end-to-end interfaces across React and serverless runtimes",
      "Own dashboards for fleet telemetry and orchestration",
      "Partner with security on zero-trust integration patterns",
    ],
    requirements: [
      "Deep TypeScript / React experience",
      "Practical knowledge of edge runtimes and streaming data",
      "Quality-obsessed; ships small, durable surfaces",
    ],
  },
  {
    slug: "research-engineer",
    title: "Research Engineer",
    team: "RDaaS",
    type: "Full Time",
    location: "On-site",
    summary:
      "Drive contract research and rapid prototyping across wireless, stealth, and sensing domains.",
    responsibilities: [
      "Lead validation programs from hypothesis to lab evidence",
      "Translate physics-layer findings into engineering specifications",
      "Author technical memoranda for enterprise partners",
    ],
    requirements: [
      "Graduate-level work in EE, physics, or applied mathematics",
      "Hands-on instrumentation experience",
      "Clear, structured technical writing",
    ],
  },
  {
    slug: "embedded-firmware-engineer",
    title: "Embedded Firmware Engineer",
    team: "Embedded Systems",
    type: "Full Time",
    location: "On-site",
    summary:
      "Author secure firmware for custom silicon supporting our mesh and sensing platforms.",
    responsibilities: [
      "Develop bare-metal and RTOS firmware",
      "Integrate hardware roots of trust and attestation",
      "Profile and tune for power and timing budgets",
    ],
    requirements: [
      "Strong C / Rust embedded experience",
      "Familiarity with secure boot, TPM, and attestation flows",
      "Comfort with oscilloscopes, logic analyzers, and lab work",
    ],
  },
  {
    slug: "research-intern",
    title: "Research Intern",
    team: "Research",
    type: "Internship",
    location: "Remote",
    summary:
      "Contribute to active research projects under the mentorship of senior engineers.",
    responsibilities: [
      "Support literature reviews and benchmarking",
      "Prototype experimental modules in collaboration with research leads",
    ],
    requirements: [
      "Currently pursuing a degree in CS, EE, or related field",
      "Strong programming fundamentals",
    ],
  },
] as const;

export type Job = (typeof JOBS)[number];

export const RESEARCH_PROJECTS = [
  {
    code: "DF-01",
    title: "Dark Field Mesh Architecture",
    status: "Active",
    summary:
      "A resilient, off-grid networking ecosystem combining hybrid wireless links, distributed mesh routing, and blockchain-verified ledgering with native AI orchestration.",
  },
  {
    code: "DF-02",
    title: "Zero-Trust Edge Attestation",
    status: "Active",
    summary:
      "Hardware-backed identity and policy enforcement for every node entering the mesh — designed to make compromised endpoints inert by default.",
  },
  {
    code: "DF-03",
    title: "Self-Healing Spectrum Allocation",
    status: "Research",
    summary:
      "Adaptive spectrum reuse algorithms that mitigate structural interference in real-time across contested RF environments.",
  },
  {
    code: "DF-04",
    title: "Low-Observable Telemetry Fabric",
    status: "Research",
    summary:
      "A protocol layer engineered to carry operationally-meaningful telemetry without generating exploitable signal patterns.",
  },
] as const;
