var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api-src/handler-netlify.ts
var handler_netlify_exports = {};
__export(handler_netlify_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(handler_netlify_exports);

// load-env.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
import_dotenv.default.config({ path: import_path.default.resolve(process.cwd(), ".env.local") });

// api-src/handler-netlify.ts
var import_serverless_http = __toESM(require("serverless-http"), 1);

// src/server/createApp.ts
var import_express = __toESM(require("express"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var cheerio2 = __toESM(require("cheerio"), 1);

// src/server/db.ts
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "gen-lang-client-0879921495",
  appId: "1:158255740190:web:105c940a2edd1214cdc50f",
  apiKey: "AIzaSyC2DU6Q-jJh9SxSjFCbMCWYf9GPq9Cimeg",
  authDomain: "gen-lang-client-0879921495.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-rashednetlify-897cf488-25fb-4f14-8ab5-cfd354b192a1",
  storageBucket: "gen-lang-client-0879921495.firebasestorage.app",
  messagingSenderId: "158255740190",
  measurementId: "",
  oAuthClientId: "158255740190-dhabknamcj1nqlipj2lubv7g45sd4itj.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

// data/portfolio_db.json
var portfolio_db_default = {
  profile: {
    location: "Cox's Bazar Sadar, 4700, Bangladesh",
    social: {
      researchgate: "https://www.researchgate.net/profile/Rashedul-Islam-65",
      orcid: "https://orcid.org/0009-0001-9844-5678",
      scholar: "https://scholar.google.com/citations?user=lCyuApIAAAAJ&hl",
      linkedin: "https://linkedin.com/in/rashedown"
    },
    siteTitle: "Rashedul Islam\u2014 Mechanical Engineer ",
    affiliation: "Hajee Mohammad Danesh Science & Technology University (HSTU)",
    phone: "(+880) 1855 362 882",
    stats: {
      hIndex: 2,
      publicationsCount: 6,
      citations: 12,
      researchProjects: 2
    },
    bio: "",
    name: "RASHEDUL ISLAM",
    researchInterests: [
      "Materials Science",
      "Additive Manufacturing Materials",
      "Renewable Energy",
      "Hydrogen Fuel",
      "CFD in biofuels"
    ],
    logoUrl: "/api/portfolio/logo",
    headline: "Featured Research",
    email: "rashed.me.82@gmail.com",
    avatarUrl: "https://drive.google.com/file/d/1uHdhS_9toIz1McR5Qn78qE2opogHWl5c/view?usp=drive_link",
    statusTag: "",
    cvUrl: "#",
    department: "Department of Mechanical Engineering",
    title: "\u2022 Mechanical Engineer  \u2022 Researcher \u2022 Philomath",
    aboutText: [
      "Hi! I'm Rashedul Islam, a mechanical engineer a native of Cox's Bazar, Bangladesh, with a strong and lasting interest in Computational Fluid Dynamics and hydrogen combustion. I completed my B.Sc. in Mechanical Engineering at Hajee Mohammad Danesh Science and Technology University (HSTU), Dinajpur, and from early on I found myself pulled toward the questions CFD lets you ask- how fuels ignite and burn, how flows behave under pressure and turbulence, and how small changes in geometry or chemistry ripple through a system's performance. That curiosity has stayed with me, and I continue to work with tools like CONVERGE, and COMSOL Multiphysics to explore combustion and reacting-flow problems, with hydrogen as a fuel of particular interest given its promise for cleaner energy systems.",
      "Beyond CFD, I've been increasingly drawn into materials science and heat transfer. I'm fascinated by how materials behave under mechanical, thermal, and structural stress at the molecular level, and by the engineering challenge of moving heat efficiently through complex systems- both feel like natural extensions of the same simulation-driven mindset I bring to combustion work.",
      "Renewable energy rounds out my interests. Having grown up in a coastal region shaped by resource constraints and grid instability, I care about hybrid and off-grid power systems- solar, wind, and biogas, and how they can be modeled, optimized, and deployed in places that need them most.",
      "At the core of all this is a simple motivation: using computation to make sense of complex physical problems, and building engineering judgment that translates cleanly from simulation to the real world. I hope to keep deepening that work across CFD, materials science, heat transfer, and renewable energy in the years ahead."
    ],
    researchInterestText: "My work centers on computational fluid dynamics and hydrogen combustion, extending into materials science, heat transfer, and additive manufacturing. Renewable energy systems- particularly hybrid, off-grid optimized solutions- round out this focus, with simulation-driven modeling as the common thread across all of it."
  },
  publications: [
    {
      key_findings: [],
      title: "Comparative Molecular Dynamics Study of Mechanical, Thermal, and Fracture Behavior in Ti, Si, and Ti-Si-Doped Monolayer Graphene",
      methods_used: [],
      doi: "",
      abstract: "Atomistic molecular dynamics simulation investigating stress-strain relationships, thermal conductivity variations, and crack propagation fracture mechanics in pristine and doped monolayer graphene.",
      link: "",
      year: 2025,
      category: "Submitted",
      bibtex: "",
      isVisible: false,
      tags: [
        "Molecular Dynamics",
        "Monolayer Graphene",
        "Material Science",
        "Fracture Mechanics",
        "Thermal Behavior"
      ],
      purpose: "",
      venue: "Submitted",
      id: "pub-1788592390706-19",
      citations: 0,
      pdfUrl: "",
      featured: false,
      statusNote: "Submitted",
      authors: "Rashedul Islam et al."
    },
    {
      category: "Under Review",
      doi: "",
      purpose: "",
      tags: [
        "Dynamical Systems",
        "Perron-Frobenius",
        "Chaotic Logistic Map",
        "Equilibrium Convergence",
        "Mathematical Modeling"
      ],
      statusNote: "Under Review",
      venue: "Under Review",
      authors: "Rashedul Islam et al.",
      featured: false,
      title: "Exact Perron-Frobenius Orbits and Quantitative Convergence to Equilibrium for the Fully Chaotic Logistic Map",
      bibtex: "",
      isVisible: false,
      year: 2025,
      link: "",
      id: "pub-1788592390662-13",
      key_findings: [],
      citations: 0,
      methods_used: [],
      pdfUrl: "",
      abstract: "Analytical and numerical study establishing exact Perron-Frobenius transfer operator orbits and quantitative convergence rates towards invariant equilibrium measures in fully chaotic logistic map dynamics."
    },
    {
      abstract: "Numerical investigation of fluid flow dynamics, heat transfer enhancement, and friction factor penalties in a shell and tube heat exchanger equipped with concave triangular turbulator ribs.",
      title: "Computational Thermo-Hydraulic Performance Evaluation of a Shell and Tube Heat Exchanger Using Concave Triangular Ribs",
      doi: "",
      year: 2025,
      link: "",
      citations: 0,
      statusNote: "Under Review",
      pdfUrl: "",
      bibtex: "",
      isVisible: false,
      id: "pub-1788592211520-676",
      featured: false,
      authors: "Rashedul Islam et al.",
      purpose: "",
      tags: [
        "Heat Exchanger",
        "Thermo-Hydraulic",
        "ANSYS Fluent",
        "CFD Simulation",
        "Heat Transfer Enhancement"
      ],
      venue: "Under Review",
      category: "Under Review",
      key_findings: [],
      methods_used: []
    },
    {
      title: "Techno-Economic and Environmental Optimization of Advanced Hybrid Renewable Energy Systems with Green Hydrogen Production for Off-Grid Coastal Community Electrification in Bangladesh",
      bibtex: "@article{islam2026techno,\n  title={Techno-Economic and Environmental Optimization of Advanced Hybrid Renewable Energy Systems with Green Hydrogen Production for Off-Grid Coastal Community Electrification in Bangladesh},\n  author={Islam, R. and Ahmed, M. R. and Sayem, S. I.},\n  journal={Energy Conversion and Management: X},\n  pages={102179},\n  year={2026},\n  publisher={Elsevier},\n  doi={10.1016/j.ecmx.2026.102179}\n}",
      doi: "10.1016/j.ecmx.2026.102179",
      category: "Journal",
      link: "https://doi.org/10.1016/j.ecmx.2026.102179",
      year: 2026,
      authors: "R. Islam, M. R. Ahmed, and S. I. Sayem",
      tags: [
        "Hybrid Renewable Energy",
        "Green Hydrogen",
        "HOMER Pro",
        "Off-Grid Electrification",
        "Coastal Bangladesh"
      ],
      abstract: "Techno-economic and environmental optimization of an advanced hybrid renewable energy system with green hydrogen production designed for off-grid coastal community electrification in Bangladesh.",
      featured: true,
      venue: "Energy Conversion and Management: X, p. 102179",
      id: "pub-1"
    },
    {
      bibtex: "@article{scholar_2025_Techno_eco,\n  title = {Techno-economic investigation of a solar Photovoltaic (PV) energy model using PVsyst, Homer, RETscreen: a case study in Bangladesh},\n  author = {S. M. Saklain Mostak Saumik, Naimur Rahman, Md Abdullah Al Noman, Rashedul ...},\n  journal = {Discover Electronics 2 (1), 81, 2025},\n  year = {2025}\n}",
      tags: [
        "Solar PV",
        "PVsyst",
        "HOMER",
        "RETScreen",
        "Techno-Economic Analysis"
      ],
      abstract: "Comparative techno-economic investigation and energy yield assessment of a solar Photovoltaic (PV) system utilizing PVsyst, HOMER, and RETscreen software models for Bangladesh climate conditions.",
      title: "Techno-economic investigation of a solar Photovoltaic (PV) energy model using PVsyst, Homer, RETscreen: a case study in Bangladesh",
      id: "pub-2",
      authors: "S. M. Saklain Mostak Saumik, Naimur Rahman, Md Abdullah Al Noman, Rashedul ...",
      citations: 8,
      featured: false,
      category: "Journal",
      year: 2025,
      link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=lCyuApIAAAAJ&pagesize=100&citation_for_view=lCyuApIAAAAJ:9yKSN-GCB0IC",
      venue: "Discover Electronics 2 (1), 81, 2025",
      doi: "10.1007/s44291-025-00119-1"
    },
    {
      venue: "Next Energy 9, 100404, 2025",
      doi: "10.1016/j.nxener.2025.100404",
      authors: "R Islam, SMA Rahman, MR Islam, MR Islam, MR Ahmed, MRI Sarker",
      citations: 4,
      id: "pub-3",
      tags: [
        "Hydrogen Fuel",
        "CONVERGE 3.0",
        "PFI SI Engine",
        "Combustion Modeling",
        "Emissions Reduction"
      ],
      abstract: "Comprehensive 3D CFD combustion simulation, thermal efficiency assessment, and emission characterization comparing pure hydrogen against conventional fuels in port fuel injection spark ignition engines using CONVERGE 3.0.",
      category: "Journal",
      year: 2025,
      link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=lCyuApIAAAAJ&pagesize=100&citation_for_view=lCyuApIAAAAJ:d1gkVwhDpl0C",
      title: "Performance and emission analysis of hydrogen and conventional fuels in PFI SI engines using CONVERGE 3.0",
      featured: false,
      bibtex: "@article{scholar_2025_Performanc,\n  title = {Performance and emission analysis of hydrogen and conventional fuels in PFI SI engines using CONVERGE 3.0},\n  author = {R Islam, SMA Rahman, MR Islam, MR Islam, MR Ahmed, MRI Sarker},\n  journal = {Next Energy 9, 100404, 2025},\n  year = {2025}\n}"
    }
  ],
  projects: [
    {
      featured: true,
      description: "The goal of this project is to design and build an affordable solution to the mobility issues faced by those with physical limitations.",
      technologies: [
        "SolidWorks",
        "CAD Modeling",
        "Kinematic Analysis",
        "Rendering & Animation"
      ],
      githubUrl: "",
      title: "Electro-Mechanical Wheel Chair",
      imageUrl: "https://drive.google.com/file/d/1QebJ9WOID0GL-lH92WFUxPU3sfqWxTaw/view?usp=sharing ",
      category: "Undergraduate Project",
      id: "proj-1",
      date: "2022",
      fullDescription: "Utilized SolidWorks for designing CAD models Pro to render images and animations.",
      liveUrl: "",
      images: [
        "https://drive.google.com/file/d/1wfMCWA_3X3NqUx3RU1jG4ov7oXbIiOwX/view?usp=sharing "
      ]
    },
    {
      technologies: [
        "Mechanical Design",
        "Gear Ratio Optimization (6:1)",
        "Coaxial Transmission",
        "CAD"
      ],
      featured: true,
      date: "2020",
      fullDescription: "Designed for improved power transmission efficiency, optimized gear mesh ratios, and fuel economy.",
      category: "Undergraduate Project",
      title: "Five speed Gear Box Mechanism with High rpm, high gear ratio and Fuel efficiency",
      description: "Used in coaxial input and output, more accuracy, high torque and high gear (6:1) ratio.",
      id: "proj-2"
    }
  ],
  experience: [
    {
      description: "As a Research Assistant in the Department of Mechanical Engineering at Hajee Mohammad Danesh Science and Technology University (HSTU) and Rajshahi University of Engineering Technology (RUET), I have worked under the mentorship of Md. Rasel Ahmed on multidisciplinary research spanning combustion engineering, hybrid renewable energy systems, and solar photovoltaic technologies. My work combines high-fidelity numerical simulation with techno-economic and environmental analysis to support cleaner, more efficient energy systems for Bangladesh and similar developing regions.\n\nI contributed to a 3-dimensional CFD study using CONVERGE 3.0 and the SAGE detailed-chemistry combustion solver to compare the in-cylinder performance and emissions of hydrogen against gasoline, methane, and M10 in a port-fuel-injected spark-ignition engine, identifying operating conditions that maximize thermal efficiency while minimizing pollutant formation. I also worked on a HOMER Pro-based techno-economic and environmental optimization of six advanced hybrid renewable energy configurations- combining wind, solar PV, biogas, diesel, battery storage, and green-hydrogen electrolysis- for off-grid coastal electrification, supported by Monte Carlo uncertainty analysis and NSGA-II multi-objective optimization. In a related study, I helped benchmark PVsyst, HOMER Pro, and RETScreen for a standalone solar PV system, comparing their technical, financial, and emissions outputs to identify the most reliable design approach for off-grid island communities.\n\nThese projects have been published in peer-reviewed journals, including Next Energy, Energy Conversion and Management: X, and Discover Electronics. Building on this foundation, I am now extending my research into next-generation photovoltaics- designing and numerically simulating a lead-free, double-absorber perovskite solar cell optimized electron transport layers, aimed at improving power conversion efficiency while addressing the toxicity concerns of conventional lead-based perovskites.",
      department: "Mechanical Engineering",
      current: false,
      period: "Aug 2024- On going",
      employmentType: "Full Time",
      role: "Research Assistant (RA)",
      organization: "Hajee Mohammad Danesh Science and Technology University  (HSTU)\nRajshahi University of Engineering & Technology (RUET)",
      location: "Dinajpur, Bangladesh\nKazla, Rajshahi, Bangladesh",
      supervisors: "[Md. Rasel Ahmed](https://www.ruet.ac.bd/raselahmedruet13)",
      highlights: [],
      id: "exp-1788090880989-916",
      paperLink: ""
    },
    {
      id: "exp-1",
      period: "Jan 2025 \u2013 May 2025",
      location: "Dhaka, Bangladesh",
      organization: "Placid Bangladesh (Intern)",
      current: false,
      description: "Mechanical systems assessment, product optimization, and maintenance operations.",
      highlights: [
        "Assessed mechanical systems and completed product optimization resulting in reduced material waste and improved operational efficiency.",
        "Participated in structured training sessions on technical operations, maintenance procedures, and quality standards.",
        "Gained practical exposure to maintenance scheduling, equipment inspection, and corrective action follow-up in a field environment."
      ],
      role: "Mechanical Engineering Intern"
    }
  ],
  education: [
    {
      institution: "Hajee Mohammad Danesh Science & Technology University (HSTU)",
      coursework: "Power Plant Engineering, Thermodynamics, Fluid Mechanics, Electrical Machines, Engineering Design, Heat Transfer, Renewable Energy Systems.",
      department: "",
      degree: "B.Sc. in Mechanical Engineering",
      location: "Dinajpur, Bangladesh",
      advisor: "[Md. Rasel Ahmed](https://www.ruet.ac.bd/raselahmedruet13)",
      year: "Jan 2019 \u2013 Dec 2022",
      synopsis: "This dissertation presents the exciting frontier of hydrogen as a clean, high-efficiency fuel in spark-ignition engines, using advanced Converge CFD simulations to compare it against conventional fuels like gasoline, methane, and M10. Through a series of simulated combustion trials, hydrogen proves itself not just as a viable alternative but a standout performer-delivering smoother cylinder pressures, higher thermal efficiency, and near-zero emissions at optimal conditions. Particularly at an equivalence ratio of 0.4 and 3000 rpm, hydrogen showcases its potential to power the future of transportation with minimal environmental impact. The research boldly positions hydrogen as a clean-energy champion ready to replace carbon-heavy fuels in a world urgently seeking sustainability.",
      thesis: "Investigate the Performance of Hydrogen Fuel and Compare with Conventional Fuels in Port Fuel Injection SI Engine using CONVERGE CFD. (One Q1 Journal was Published- Next Energy, 2025)",
      result: "CGPA: 3.363 / 4.00",
      id: "edu-1"
    }
  ],
  skillGroups: [
    {
      description: "Computational fluid dynamics, multiphysics simulation, and mechanical design across industry-standard CFD and CAD platforms.",
      category: "CFD, Simulation & CAD Tools",
      id: "sg-5",
      skills: [
        {
          id: "sk-dmkea22y8",
          level: 80,
          name: "CONVERGE CFD",
          highlight: true
        },
        {
          level: 70,
          id: "sk-oqf8eyqw1",
          name: "COMSOL Multiphysics",
          highlight: true
        },
        {
          level: 70,
          id: "sk-0oe1cq5g3",
          highlight: true,
          name: "SolidWorks"
        },
        {
          id: "sk-0dix1fofx",
          highlight: true,
          level: 80,
          name: "AutoCAD"
        },
        {
          level: 65,
          id: "sk-gy3ws1jb4",
          name: "Solid Edge",
          highlight: true
        }
      ]
    },
    {
      description: "Techno-economic modelling and optimization of renewable and hybrid energy systems, from feasibility through uncertainty analysis",
      id: "sg-1",
      skills: [
        {
          name: "HOMER Pro",
          highlight: true,
          id: "sk-1cqkrr1tx",
          level: 95
        },
        {
          name: "PVsyst",
          level: 95,
          id: "sk-2v4e0hulr",
          highlight: true
        },
        {
          level: 90,
          highlight: true,
          id: "sk-fpm0c3z9l",
          name: "RETscreen"
        },
        {
          id: "sk-przhloj7y",
          name: "Decision Science, Hybrid System Design & Optimization (NSGA-II)",
          highlight: true
        },
        {
          highlight: true,
          name: "LCOE / NPC / LCOH Analysis",
          id: "sk-g9zpq2pym"
        },
        {
          highlight: true,
          name: "Load Assessment, LCA & Uncertainty Analysis (Montecarlo)",
          id: "sk-23njf3txm"
        }
      ],
      category: "Energy Modelling & Analysis"
    },
    {
      description: "Molecular dynamics simulation and atomistic-scale analysis of material structure and mechanical behavior.",
      id: "sg-2",
      skills: [
        {
          id: "sk-nr994rx67",
          highlight: true,
          name: "LAMMPS"
        },
        {
          highlight: true,
          name: "OVITO",
          id: "sk-lbq1igf4m"
        }
      ],
      category: "Atomistics & Molecular Dynamics"
    },
    {
      description: "Technical reporting, system diagramming, and field documentation, paired with hands-on training and technician coaching.",
      category: "Technical Documentation & Capacity Building",
      skills: [
        {
          id: "sk-gtjturowo",
          name: "Energy Performance Reports (MS Office and Latex)",
          level: 95,
          highlight: true
        },
        {
          name: "System Diagrams",
          highlight: true,
          id: "sk-b95zg4jqf"
        },
        {
          name: "Maintenance Records & Feasibility Studies",
          highlight: true,
          id: "sk-c2rmgech2"
        },
        {
          highlight: true,
          name: "Power Assessments",
          id: "sk-2mr9vb57c"
        },
        {
          highlight: true,
          id: "sk-vqar83ahz",
          name: "Training & Technician Coaching"
        },
        {
          id: "sk-qyn4j6479",
          highlight: true,
          name: "Hands-on Field Instruction"
        }
      ],
      id: "sg-4"
    },
    {
      id: "sg-3",
      skills: [
        {
          name: "Electrical Installation Assessment",
          id: "sk-xip5jvc58",
          highlight: true
        },
        {
          highlight: true,
          name: "Preventive & Corrective Maintenance",
          id: "sk-4xer2oehy"
        },
        {
          highlight: true,
          name: "Safety Compliance",
          id: "sk-d5bn0zj0r"
        }
      ],
      description: "Electrical system assessment, preventive and corrective maintenance, and field safety compliance.",
      category: "Electrical & Maintenance"
    },
    {
      id: "sg-6",
      description: "Scientific programming, field logistics coordination, and project leadership supporting technical operations.",
      category: "Programming & Soft Skills",
      skills: [
        {
          highlight: true,
          name: "Python",
          id: "sk-3yoqzm80p"
        },
        {
          highlight: true,
          id: "sk-hf8ztxp8n",
          name: "MATLAB"
        },
        {
          name: "Field Logistics Coordination",
          highlight: true,
          id: "sk-8h0d7gov5"
        },
        {
          id: "sk-ew3q8549i",
          name: "Team Leadership & Project Management",
          highlight: true
        }
      ]
    }
  ],
  trainings: [
    {
      galleryUrls: [
        "https://drive.google.com/file/d/1NgkgOciuvlNhD_ZsdtFbaqW-pyeCunaZ/view?usp=sharing",
        "https://drive.google.com/file/d/1zesrD_H9DKzlPFgyZD6uqGmn-9R9lpgf/view?usp=sharing"
      ],
      id: "tr-1",
      skillsAcquired: [],
      description: "A 109-hour industrial mechanical training program covering workshop technology, metro-logy and drawing, bearings and lubrication, process plant machinery, refrigeration and A/C, power transmission and alignment, bench fitting, industrial ancillaries, plant safety and instrumentation, and including the Ashulia Gas Powerplant, Narsingdi; Bangladesh.",
      credentialUrl: "",
      tickerSpeed: 30,
      title: "28 days of Mechanical Workshop",
      year: "2023",
      issuer: "Technical Institute of Chemical Industries, Bangladesh (TICI)"
    },
    {
      tickerSpeed: 30,
      description: "Participated in scheduled training sessions and lab works conducted by railway mechanical experts, gaining hands-on experience with workshop projects focused on generation and power transmission , wheel and axle profiling using heavy machinery, major accident restorations, structural welding, industrial painting, and modern technology retrofitting to upgrade older trains and keep the railway network running smoothly and safely.",
      skillsAcquired: [],
      isLive: true,
      title: "1 days workshop visit on Production Process of Machineries in Saidpur Railway Workshop",
      credentialUrl: "",
      issuer: "Saidpur Railway Workshop",
      year: "2019",
      id: "tr-2",
      galleryUrls: []
    },
    {
      issuer: "Cox's Bazar Wind Power Project",
      title: "Field visit: Wind Turbine Power Plant, Cox's Bazar",
      tickerSpeed: 30,
      skillsAcquired: [],
      credentialUrl: "",
      description: "Operational energy data collection for off-grid hybrid energy research.",
      id: "tr-3",
      year: "2024"
    }
  ],
  certifications: [
    {
      year: "2026",
      credentialUrl: "https://www.coursera.org/account/accomplishments/specialization/DF6IXCZ4GLCO",
      description: "",
      id: "cert-1788063191590-92",
      title: "AI for Mechanical Engineers",
      modules: [
        {
          credentialUrl: "https://www.coursera.org/account/accomplishments/specialization/DF6IXCZ4GLCO",
          title: "AI for Design and Optimizaiton",
          imageUrl: "https://drive.google.com/file/d/1XUkCtnrSg4htDac9IMRv4hHllRbu9QOC/view?usp=drive_link"
        },
        {
          credentialUrl: "https://www.coursera.org/account/accomplishments/verify/NZNF1UFC18QI",
          title: "AI for Autonomous Vehicles and Robotics",
          imageUrl: "https://drive.google.com/file/d/1x7yzfp1fW-SSLA5kIldHi6s2IlqU-kgN/view?usp=sharing"
        },
        {
          imageUrl: "https://drive.google.com/file/d/1SbhAHZT_NTk8iOx0XtkoHz7u_IVORxkp/view?usp=sharing",
          credentialUrl: "https://www.coursera.org/account/accomplishments/verify/C0RIZNP9P4MK",
          title: "AI for Energy and Biomedical Applications"
        }
      ],
      issuer: "University of Michigan",
      imageUrl: "https://drive.google.com/file/d/1XUkCtnrSg4htDac9IMRv4hHllRbu9QOC/view?usp=drive_link"
    },
    {
      title: "Materials Science for Advanced Technological Applications",
      imageUrl: "https://drive.google.com/file/d/1zRk1s7TC5p4JpTzbwdqA7kCDnktcDoBv/view?usp=sharing",
      modules: [
        {
          imageUrl: "https://drive.google.com/file/d/1Wc57wPvZ3-m3EzmoTqfKvqyEe2dNd-Yy/view?usp=sharing",
          title: "Phase Diagrams",
          credentialUrl: "https://www.coursera.org/account/accomplishments/verify/GH5HTVBG61IY"
        },
        {
          credentialUrl: "https://www.coursera.org/account/accomplishments/verify/9NUO2KHTHM07",
          imageUrl: "https://drive.google.com/file/d/1clQroLsiG1ilp65g88bGUTd6hacjFAIX/view?usp=sharing",
          title: "Hardening, Polymers, Properties"
        },
        {
          title: "Electrical Properties and Semiconductors",
          credentialUrl: "https://www.coursera.org/account/accomplishments/verify/X8MU7P38P4BO",
          imageUrl: "https://drive.google.com/file/d/1alhKsD-ljXV3shQrnagTkoElrf-W8JYP/view?usp=sharing"
        },
        {
          imageUrl: "https://drive.google.com/file/d/1l920d6JdV8xHPtB2pztkyPtYa_yUf-fn/view?usp=sharing",
          title: "Ceramics and Composites",
          credentialUrl: "https://www.coursera.org/account/accomplishments/verify/DRAV9EKVWSM1"
        }
      ],
      description: "",
      year: "2026",
      id: "cert-3",
      issuer: "Arizona State University, USA",
      credentialUrl: "https://www.coursera.org/account/accomplishments/specialization/XFZITWSB4QJN"
    },
    {
      description: "",
      year: "2026",
      credentialUrl: "https://www.coursera.org/account/accomplishments/verify/GEHSZNLRV8FC",
      id: "cert-1788063291673-648",
      modules: [],
      title: "Materials Science: 10 Things Every Engineer Should Know",
      issuer: "University of California, Davis",
      imageUrl: "https://drive.google.com/file/d/1wRxmZATVMb6iHH2Z0WrNwGeIo2FUnV_I/view?usp=sharing"
    },
    {
      credentialUrl: "https://www.coursera.org/account/accomplishments/specialization/7AKSDBAO0KRT",
      modules: [
        {
          imageUrl: "https://drive.google.com/file/d/106GDNR_AGMymEhSez0J-Qw9jXzyWDgUV/view?usp=sharing",
          credentialUrl: "https://www.coursera.org/account/accomplishments/verify/WL4W4N1LDT6B",
          title: "Electric Power System"
        },
        {
          title: "Natural Gas",
          imageUrl: "https://drive.google.com/file/d/1W-a7KbQBqTzsACBuZFYQ4TOyMWgVD1r6/view?usp=sharing",
          credentialUrl: "https://www.coursera.org/account/accomplishments/verify/PSJW9LLSVEVX"
        },
        {
          credentialUrl: "https://www.coursera.org/account/accomplishments/verify/XQVIXFNU5FBV",
          title: "Safety in the Utility Industry",
          imageUrl: "https://drive.google.com/file/d/19ITJF6tNJl2YZj0XcDm0flMaNV2-4Vbu/view?usp=sharing"
        },
        {
          imageUrl: "https://drive.google.com/file/d/1FtxKZ6dSkL9uwJfDkriWogKw6SwTVBGF/view?usp=sharing",
          title: "Energy: The Enterprise",
          credentialUrl: "https://www.coursera.org/account/accomplishments/verify/VGRP1I5LDIKS"
        }
      ],
      description: "",
      imageUrl: "https://drive.google.com/file/d/10-jKeV10EPFKQ1GSka5jVHjVkT4KYRoK/view?usp=sharing",
      issuer: "University of Buffalo and Stony Brook University, USA",
      year: "2026",
      id: "cert-1",
      title: "Energy Production Distribution & Safety"
    },
    {
      title: "Renewable Energy Technology Fundamentals",
      description: "",
      imageUrl: "https://drive.google.com/file/d/1fGpE6RpWDeqsgOjZd9wSDpip9SEWriv1/view?usp=sharing",
      modules: [],
      credentialUrl: "https://www.coursera.org/account/accomplishments/verify/MR040LC5TPUN",
      year: "2026",
      issuer: "University of Colorado Boulder, USA",
      id: "cert-2"
    },
    {
      title: "MATLAB Simulink",
      imageUrl: "https://drive.google.com/file/d/1GsV8eY9oWyNxDdmEJM7iPbFt5e6vCjfC/view?usp=sharing",
      description: "",
      issuer: "MATLAB",
      credentialUrl: "",
      modules: [
        {
          credentialUrl: "",
          imageUrl: "https://drive.google.com/file/d/1iCTZzU9vto31geTi2GXcEdPu1bpsK8EG/view?usp=sharing",
          title: "MATLAB Mathworks"
        }
      ],
      year: "2026",
      id: "cert-1788069686296-80"
    },
    {
      issuer: "SolidWorks (Online)",
      year: "2020",
      title: "SolidWorks Certified Additive Manufacturing Associate, Certified CAD Professional, Certified Sheet Metal Professional",
      id: "cert-4"
    },
    {
      id: "cert-5",
      title: "Certified on Physics Olympiad in Divisional Region",
      issuer: "Bangladesh Physics Olympiad",
      credentialUrl: "",
      imageUrl: "https://drive.google.com/file/d/1KyB0IlPYgzsnIv_UBuP1kgWjn6hHRsnR/view?usp=sharing",
      year: "2017",
      description: "",
      modules: [
        {
          credentialUrl: "",
          title: "Physics Olympiad",
          imageUrl: "https://drive.google.com/file/d/1KyB0IlPYgzsnIv_UBuP1kgWjn6hHRsnR/view?usp=sharing"
        }
      ]
    },
    {
      year: "2026",
      credentialUrl: "",
      title: "Workshop on Python PL",
      imageUrl: "https://drive.google.com/file/d/14iBTWY6eox0UIQmHTBuU6F7G0cVd5V-D/view?usp=sharing",
      id: "cert-6",
      issuer: "IEEE HSTU and University of MICHIGAN",
      description: "",
      modules: [
        {
          credentialUrl: "https://www.coursera.org/account/accomplishments/verify/6IMNFGVU2JPK",
          title: "Python Basics",
          imageUrl: "https://drive.google.com/file/d/1DhfUFw8s__7Sa4BVIjZozPNqHFkYS2yN/view?usp=sharing"
        }
      ]
    },
    {
      imageUrl: "https://drive.google.com/file/d/1PbEdQlKXfQEE1FOhc53SNm2a6p3ttYVS/view?usp=drive_link",
      modules: [],
      issuer: "SCRUMstudy",
      description: "",
      title: "Six Sigma Yellow Belt",
      year: "2025",
      id: "cert-7",
      credentialUrl: "https://www.6sigmastudy.com/certification/verify?type=SSYB&number=904518"
    }
  ],
  achievements: [
    {
      organization: "Bangladesh Physics Olympiad",
      id: "ach-1",
      title: "Bronze Medalist, Divisional Physics Olympiad",
      date: "August, 2016"
    },
    {
      date: "January, 2017",
      title: "Bronze Medalist, Regional Mathematical Olympiad",
      organization: "Bangladesh Mathematical Olympiad",
      id: "ach-2"
    }
  ],
  affiliations: [
    {
      organization: "Cox\u2019s Bazar Youth Development Society (CYDS)",
      period: "2024 - 2025",
      role: "Executive Member",
      id: "aff-1"
    },
    {
      id: "aff-2",
      organization: "Institution of Mechanical Engineers (IMechE)",
      period: "2019 - 2024",
      role: "Affiliated Member",
      membershipId: "80778687"
    },
    {
      period: "2019 - 2024",
      membershipId: "103515864",
      id: "aff-3",
      organization: "American Society of Mechanical Engineers (ASME)",
      role: "Student Member"
    }
  ],
  volunteerWork: [
    {
      id: "vol-1",
      period: "2022 \u2013 2023",
      description: "Organized and conducted two segments of the national inter-university mechanical festival at HSTU",
      title: "Robo-riot Contest Event Organizer, Deceleration - A National Mechanical Festival"
    },
    {
      period: "2019 \u2013 2021",
      title: "Autodesk Ambassador Hub",
      description: "Shared news about Autodesk products, events, and completed challenges on social media platforms",
      id: "vol-2"
    },
    {
      description: "Conducted weekly classes for junior categories",
      title: "Adjunct Teacher, Cox's Bazar Govt. High School",
      id: "vol-3",
      period: "2017 \u2013 2018"
    }
  ],
  references: [
    {
      website: "https://www.ruet.ac.bd/raselahmedruet13",
      id: "ref-1",
      role: "Lecturer",
      department: "Department of Mechanical Engineering",
      phone: "+880 1776 976 345",
      organization: "Rajshahi University of Engineering & Technology (RUET)",
      name: "Md. Rasel Ahmed",
      email: "rasel@me.ruet.ac.bd"
    },
    {
      department: "Department of Mechanical Engineering",
      id: "ref-2",
      role: "Chairman and Assistant Professor",
      organization: "Hajee Mohammad Danesh Science & Technology University (HSTU)",
      phone: "+880 1884 598 886",
      website: "https://hstu.ac.bd/teacher/nazmul_ahsan",
      email: "nazmul.me@hstu.ac.bd",
      name: "KH. Nazmul Ahshan"
    }
  ],
  sectionConfig: {
    honors: {
      title: "Honors, Co-Curricular Leadership & Academic References",
      subtitle: "Competitive olympiad awards, university organization leadership, disaster relief volunteering, and academic thesis references."
    },
    experience: {
      title: "Relevant Experiences & Education",
      subtitle: ""
    },
    capabilities: {
      subtitle: "",
      title: "Engineering & Simulation Proficiencies"
    },
    publications: {
      subtitle: "Scholarly articles published in international journals and conferences covering hybrid microgrid optimization, machine learning diagnostics, solar PV soiling, and battery degradation.",
      title: "Peer-Reviewed Journal Papers, Conference Proceedings & Preprints"
    },
    overview: {
      showPillars: true
    },
    trainings: {
      subtitle: "Industrial workshops, power plant field visits, and internationally accredited certifications in energy, materials science, CAD, and quality engineering.",
      title: "Traning & Professional Certifications"
    },
    projects: {
      title: "Undergrad Projects",
      subtitle: ""
    }
  },
  adminConfig: {
    lastUpdated: "2026-09-24T07:27:50.592Z",
    username: "admin",
    passwordHashOrPlain: "adminpassword123"
  },
  pillars: [
    {
      id: "pillar-2",
      tag: "CONVERGE 3.0 \xB7 COMSOL Multiphysics \xB7 SolidWorks",
      title: "Computation Fluid Dynamics",
      description: "Combustion modeling of green hydrogen vs conventional fuels in PFI SI engines, thermo-hydraulic heat exchanger modeling, and atomistic molecular dynamics.",
      icon: "Flame"
    },
    {
      icon: "Cpu",
      tag: "HOMER Pro \xB7 PVsyst \xB7 RETscreen",
      id: "pillar-1",
      description: "Hybrid system optimization, LCOE/NPC/LCOH techno-economic analysis, load assessment, life cycle analysis (LCA), and off-grid system validation with uncertainty analysis (Montecarlo) and multi-objective optimization (MOPSO/NSGA-II)",
      title: "Hybrid Energy Modelling"
    },
    {
      icon: "Wrench",
      tag: "Preventive & Corrective Diagnostics",
      title: "Electrical & Maintenance",
      id: "pillar-3",
      description: "Electrical installation assessment, PV integration, diesel/biogas generator performance monitoring, and safety compliance in resource-constrained environments."
    },
    {
      tag: "Remote Infrastructure \xB7 Capacity Building",
      id: "pillar-4",
      description: "Hands-on fieldwork across coastal Bangladesh, technician coaching, technical documentation, and applying energy expertise for coastal community.",
      icon: "Compass",
      title: "Fieldwork & Humanitarian Support"
    }
  ],
  metrics: [
    {
      id: "metric-1",
      label: "Journal Publications & Research",
      value: "6 Papers",
      sub: "3 Published \xB7 2 Under Review \xB7 1 Submitted"
    },
    {
      value: "3.363 / 4.00",
      id: "metric-2",
      label: "B.Sc. Mechanical Engineering",
      sub: "HSTU Dinajpur (2019\u20132022)"
    },
    {
      label: "SolidWorks Certified",
      id: "metric-3",
      value: "CSWE",
      sub: "CAD Professional & Sheet Metal"
    },
    {
      id: "metric-4",
      value: "2 Medals",
      label: "Physics & Math Olympiad",
      sub: "Divisional & Regional Awards"
    }
  ],
  messages: []
};

// src/server/db.ts
var app = (0, import_app.initializeApp)(firebase_applet_config_default);
var firestore = (0, import_firestore.getFirestore)(app, firebase_applet_config_default.firestoreDatabaseId || "(default)");
var DEFAULT_PORTFOLIO_DATA = portfolio_db_default;
var FIREBASE_DOC_KEYS = [
  "profile",
  "publications",
  "projects",
  "experience",
  "education",
  "skillGroups",
  "trainings",
  "certifications",
  "achievements",
  "affiliations",
  "volunteerWork",
  "references",
  "sectionConfig",
  "adminConfig",
  "pillars",
  "metrics",
  "messages"
];
var PortfolioDatabase = class {
  constructor() {
    // Tracks the most recent Postgres write so callers running in a
    // serverless environment (Netlify/Vercel functions) can await it before
    // the response is sent. Without this, the function can be frozen right
    // after res.json() fires and the write to Postgres may never land —
    // in-memory `this.data` looks correct until a new/cold instance reloads
    // from Postgres and the change appears to "disappear".
    this.pendingWrite = Promise.resolve();
    this.data = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
    this.ready = this.loadData();
  }
  // Ensures Firebase hydration finishes before requests are served,
  // preventing any flash of outdated or demo data.
  async waitUntilReady() {
    await this.ready;
  }
  mergeWithDefaults(parsed) {
    return {
      ...DEFAULT_PORTFOLIO_DATA,
      ...parsed,
      profile: {
        ...DEFAULT_PORTFOLIO_DATA.profile,
        ...parsed.profile || {},
        stats: {
          ...DEFAULT_PORTFOLIO_DATA.profile.stats,
          ...parsed.profile?.stats || {}
        },
        social: {
          ...DEFAULT_PORTFOLIO_DATA.profile.social,
          ...parsed.profile?.social || {}
        }
      },
      publications: Array.isArray(parsed.publications) ? parsed.publications : DEFAULT_PORTFOLIO_DATA.publications,
      pillars: Array.isArray(parsed.pillars) ? parsed.pillars : DEFAULT_PORTFOLIO_DATA.pillars,
      metrics: Array.isArray(parsed.metrics) ? parsed.metrics : DEFAULT_PORTFOLIO_DATA.metrics,
      projects: Array.isArray(parsed.projects) ? parsed.projects : DEFAULT_PORTFOLIO_DATA.projects,
      experience: Array.isArray(parsed.experience) ? parsed.experience : DEFAULT_PORTFOLIO_DATA.experience,
      education: Array.isArray(parsed.education) ? parsed.education : DEFAULT_PORTFOLIO_DATA.education,
      skillGroups: Array.isArray(parsed.skillGroups) ? parsed.skillGroups : DEFAULT_PORTFOLIO_DATA.skillGroups,
      trainings: Array.isArray(parsed.trainings) ? parsed.trainings : DEFAULT_PORTFOLIO_DATA.trainings,
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : DEFAULT_PORTFOLIO_DATA.certifications,
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements : DEFAULT_PORTFOLIO_DATA.achievements,
      affiliations: Array.isArray(parsed.affiliations) ? parsed.affiliations : DEFAULT_PORTFOLIO_DATA.affiliations,
      volunteerWork: Array.isArray(parsed.volunteerWork) ? parsed.volunteerWork : DEFAULT_PORTFOLIO_DATA.volunteerWork,
      references: Array.isArray(parsed.references) ? parsed.references : DEFAULT_PORTFOLIO_DATA.references,
      messages: Array.isArray(parsed.messages) ? parsed.messages : DEFAULT_PORTFOLIO_DATA.messages,
      sectionConfig: parsed.sectionConfig || DEFAULT_PORTFOLIO_DATA.sectionConfig,
      adminConfig: parsed.adminConfig || DEFAULT_PORTFOLIO_DATA.adminConfig
    };
  }
  async loadData() {
    try {
      let loadedData = {};
      let foundAny = false;
      const docSnaps = await Promise.all(
        FIREBASE_DOC_KEYS.map(async (key) => {
          try {
            const snap = await (0, import_firestore.getDoc)((0, import_firestore.doc)(firestore, "portfolio", key));
            return { key, snap };
          } catch (e) {
            console.warn(`[Firebase] Failed to fetch ${key}:`, e.message);
            return { key, snap: null };
          }
        })
      );
      for (const { key, snap } of docSnaps) {
        if (snap && snap.exists()) {
          foundAny = true;
          if (key === "adminConfig") {
            loadedData[key] = snap.data();
          } else {
            loadedData[key] = snap.data()?.data;
          }
        }
      }
      if (loadedData.profile?.logoUrl === "chunked") {
        try {
          const chunkPromises = [];
          for (let i = 0; i < 20; i++) {
            chunkPromises.push((0, import_firestore.getDoc)((0, import_firestore.doc)(firestore, "portfolio_images", `logo_${i}`)));
          }
          const chunkSnaps = await Promise.all(chunkPromises);
          const chunks = [];
          chunkSnaps.forEach((d) => {
            if (d && d.exists()) {
              const cdata = d.data();
              chunks.push({ index: cdata.index, data: cdata.data });
            }
          });
          chunks.sort((a, b) => a.index - b.index);
          const assembledLogo = chunks.map((c) => c.data).join("");
          if (assembledLogo) {
            loadedData.profile.logoUrl = assembledLogo;
          } else {
            loadedData.profile.logoUrl = "";
          }
        } catch (e) {
          console.warn("Could not load logo chunks:", e);
          loadedData.profile.logoUrl = "";
        }
      }
      if (foundAny) {
        this.data = this.mergeWithDefaults(loadedData);
      }
    } catch (err) {
      console.error("Error loading portfolio database from Firebase:", err);
    }
  }
  sync() {
    const keys = Object.keys(this.data);
    const promises = [];
    let logoUrl = this.data.profile.logoUrl;
    let dataToSave = { ...this.data };
    if (logoUrl && logoUrl.length > 5e5) {
      dataToSave.profile = { ...dataToSave.profile, logoUrl: "chunked" };
      const numChunks = Math.ceil(logoUrl.length / 5e5);
      for (let i = 0; i < numChunks; i++) {
        const chunk = logoUrl.slice(i * 5e5, (i + 1) * 5e5);
        promises.push((0, import_firestore.setDoc)((0, import_firestore.doc)(firestore, "portfolio_images", `logo_${i}`), { data: chunk, index: i, total: numChunks }));
      }
    }
    for (const key of keys) {
      if (key === "adminConfig") {
        promises.push((0, import_firestore.setDoc)((0, import_firestore.doc)(firestore, "portfolio", "adminConfig"), dataToSave[key]));
      } else {
        promises.push((0, import_firestore.setDoc)((0, import_firestore.doc)(firestore, "portfolio", key), { data: dataToSave[key] }));
      }
    }
    this.pendingWrite = Promise.all(promises).then(() => {
    }).catch((err) => console.error("Failed to persist database to Firebase:", err));
  }
  // Waits for the most recently triggered Postgres write to finish. Call
  // this before sending an HTTP response in a serverless environment so
  // the write can't get cut off by the function freezing after res.json().
  async flush() {
    try {
      await this.pendingWrite;
    } catch {
    }
  }
  getFullData() {
    const { profile, ...rest } = this.data;
    const safeProfile = { ...profile };
    if (safeProfile.logoUrl === "chunked") {
      safeProfile.logoUrl = "";
    }
    if (safeProfile.logoUrl && safeProfile.logoUrl.startsWith("data:")) {
      safeProfile.logoUrl = "/api/portfolio/logo";
    }
    if (safeProfile.avatarUrl && safeProfile.avatarUrl.startsWith("data:")) {
      safeProfile.avatarUrl = "/api/portfolio/avatar";
    }
    return { ...rest, profile: safeProfile };
  }
  getPublicData() {
    const { messages, adminConfig, profile, ...rest } = this.data;
    const publicProfile = { ...profile };
    if (publicProfile.logoUrl === "chunked") {
      publicProfile.logoUrl = "";
    }
    if (publicProfile.logoUrl && publicProfile.logoUrl.startsWith("data:")) {
      publicProfile.logoUrl = "/api/portfolio/logo";
    }
    if (publicProfile.avatarUrl && publicProfile.avatarUrl.startsWith("data:")) {
      publicProfile.avatarUrl = "/api/portfolio/avatar";
    }
    return { ...rest, profile: publicProfile };
  }
  updateProfile(updatedProfile) {
    if (updatedProfile.logoUrl === "/api/portfolio/logo") {
      delete updatedProfile.logoUrl;
    }
    if (updatedProfile.avatarUrl === "/api/portfolio/avatar") {
      delete updatedProfile.avatarUrl;
    }
    this.data.profile = {
      ...this.data.profile,
      ...updatedProfile,
      stats: {
        ...this.data.profile.stats,
        ...updatedProfile.stats || {}
      },
      social: {
        ...this.data.profile.social,
        ...updatedProfile.social || {}
      }
    };
    this.sync();
    return this.data.profile;
  }
  getAdminConfig() {
    return this.data.adminConfig || DEFAULT_PORTFOLIO_DATA.adminConfig;
  }
  verifyAdmin(username, passwordAttempt) {
    const config = this.getAdminConfig();
    return config.username === username && config.passwordHashOrPlain === passwordAttempt;
  }
  updateSectionConfig(sectionConfig) {
    this.data.sectionConfig = sectionConfig;
    this.sync();
    return this.data.sectionConfig;
  }
  updateAdminCredentials(username, passwordHashOrPlain) {
    this.data.adminConfig = {
      username,
      passwordHashOrPlain,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.sync();
    return true;
  }
  // --- Publications Operations ---
  getPublications() {
    return this.data.publications;
  }
  addPublication(pub) {
    const newPub = {
      ...pub,
      id: `pub-${Date.now()}-${Math.floor(Math.random() * 1e3)}`
    };
    this.data.publications.unshift(newPub);
    this.sync();
    return newPub;
  }
  updatePublication(id, updatedPub) {
    const idx = this.data.publications.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.publications[idx] = {
      ...this.data.publications[idx],
      ...updatedPub,
      id
    };
    this.sync();
    return this.data.publications[idx];
  }
  deletePublication(id) {
    const beforeLen = this.data.publications.length;
    this.data.publications = this.data.publications.filter((p) => p.id !== id);
    const deleted = this.data.publications.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }
  bulkImportPublications(newPubs, options = { updateExisting: true }) {
    let addedCount = 0;
    let updatedCount = 0;
    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
    for (const item of newPubs) {
      if (!item.title || !item.title.trim()) continue;
      const normTitle = normalize(item.title);
      const cleanDoi = (item.doi || "").trim().toLowerCase();
      const existingIdx = this.data.publications.findIndex((p) => {
        if (cleanDoi && p.doi && p.doi.trim().toLowerCase() === cleanDoi) {
          return true;
        }
        if (normalize(p.title) === normTitle) {
          return true;
        }
        return false;
      });
      if (existingIdx !== -1) {
        if (options.updateExisting) {
          const existing = this.data.publications[existingIdx];
          this.data.publications[existingIdx] = {
            ...existing,
            ...item,
            id: existing.id,
            // Keep existing tags / featured status if not specified
            featured: item.featured ?? existing.featured,
            tags: item.tags && item.tags.length > 0 ? item.tags : existing.tags,
            citations: item.citations !== void 0 ? item.citations : existing.citations,
            doi: item.doi || existing.doi,
            link: item.link || existing.link,
            pdfUrl: item.pdfUrl || existing.pdfUrl,
            abstract: item.abstract || existing.abstract,
            bibtex: item.bibtex || existing.bibtex
          };
          updatedCount++;
        }
      } else {
        const newPub = {
          title: item.title,
          authors: item.authors || "Unknown Authors",
          venue: item.venue || "Academic Publication",
          year: item.year || (/* @__PURE__ */ new Date()).getFullYear(),
          category: item.category || "Journal",
          doi: item.doi || "",
          link: item.link || "",
          pdfUrl: item.pdfUrl || "",
          abstract: item.abstract || "",
          citations: item.citations || 0,
          featured: !!item.featured,
          tags: item.tags || [],
          bibtex: item.bibtex || "",
          statusNote: item.statusNote || "",
          id: item.id || `pub-${Date.now()}-${Math.floor(Math.random() * 1e4)}`
        };
        this.data.publications.unshift(newPub);
        addedCount++;
      }
    }
    this.sync();
    return {
      addedCount,
      updatedCount,
      publications: this.data.publications
    };
  }
  // --- Projects Operations ---
  addProject(proj) {
    const newProj = {
      ...proj,
      id: `proj-${Date.now()}-${Math.floor(Math.random() * 1e3)}`
    };
    this.data.projects.unshift(newProj);
    this.sync();
    return newProj;
  }
  updateProject(id, updatedProj) {
    const idx = this.data.projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.projects[idx] = {
      ...this.data.projects[idx],
      ...updatedProj,
      id
    };
    this.sync();
    return this.data.projects[idx];
  }
  deleteProject(id) {
    const beforeLen = this.data.projects.length;
    this.data.projects = this.data.projects.filter((p) => p.id !== id);
    const deleted = this.data.projects.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }
  // --- Experience Operations ---
  addExperience(exp) {
    const newExp = {
      ...exp,
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1e3)}`
    };
    this.data.experience.unshift(newExp);
    this.sync();
    return newExp;
  }
  updateExperience(id, updatedExp) {
    const idx = this.data.experience.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.data.experience[idx] = {
      ...this.data.experience[idx],
      ...updatedExp,
      id
    };
    this.sync();
    return this.data.experience[idx];
  }
  deleteExperience(id) {
    const beforeLen = this.data.experience.length;
    this.data.experience = this.data.experience.filter((e) => e.id !== id);
    const deleted = this.data.experience.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }
  // --- Education Operations ---
  addEducation(edu) {
    const newEdu = {
      ...edu,
      id: `edu-${Date.now()}-${Math.floor(Math.random() * 1e3)}`
    };
    this.data.education.unshift(newEdu);
    this.sync();
    return newEdu;
  }
  updateEducation(id, updatedEdu) {
    const idx = this.data.education.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.data.education[idx] = {
      ...this.data.education[idx],
      ...updatedEdu,
      id
    };
    this.sync();
    return this.data.education[idx];
  }
  deleteEducation(id) {
    const beforeLen = this.data.education.length;
    this.data.education = this.data.education.filter((e) => e.id !== id);
    const deleted = this.data.education.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }
  // --- Trainings Operations ---
  getTrainings() {
    return this.data.trainings || [];
  }
  addCertification(cert) {
    const newCert = {
      ...cert,
      id: `cert-${Date.now()}-${Math.floor(Math.random() * 1e3)}`
    };
    if (!this.data.certifications) this.data.certifications = [];
    this.data.certifications.unshift(newCert);
    this.sync();
    return newCert;
  }
  reorderTrainings(orderedIds) {
    if (!this.data.trainings) return [];
    const newOrder = [];
    const currentMap = new Map(this.data.trainings.map((item) => [item.id, item]));
    for (const id of orderedIds) {
      if (currentMap.has(id)) {
        newOrder.push(currentMap.get(id));
        currentMap.delete(id);
      }
    }
    for (const item of currentMap.values()) {
      newOrder.push(item);
    }
    this.data.trainings = newOrder;
    this.sync();
    return this.data.trainings;
  }
  reorderExperiences(orderedIds) {
    if (!this.data.experience) return [];
    const newOrder = [];
    const currentMap = new Map(this.data.experience.map((item) => [item.id, item]));
    for (const id of orderedIds) {
      if (currentMap.has(id)) {
        newOrder.push(currentMap.get(id));
        currentMap.delete(id);
      }
    }
    for (const item of currentMap.values()) {
      newOrder.push(item);
    }
    this.data.experience = newOrder;
    this.sync();
    return this.data.experience;
  }
  reorderEducations(orderedIds) {
    if (!this.data.education) return [];
    const newOrder = [];
    const currentMap = new Map(this.data.education.map((item) => [item.id, item]));
    for (const id of orderedIds) {
      if (currentMap.has(id)) {
        newOrder.push(currentMap.get(id));
        currentMap.delete(id);
      }
    }
    for (const item of currentMap.values()) {
      newOrder.push(item);
    }
    this.data.education = newOrder;
    this.sync();
    return this.data.education;
  }
  reorderProjects(orderedIds) {
    if (!this.data.projects) return [];
    const newOrder = [];
    const currentMap = new Map(this.data.projects.map((item) => [item.id, item]));
    for (const id of orderedIds) {
      if (currentMap.has(id)) {
        newOrder.push(currentMap.get(id));
        currentMap.delete(id);
      }
    }
    for (const item of currentMap.values()) {
      newOrder.push(item);
    }
    this.data.projects = newOrder;
    this.sync();
    return this.data.projects;
  }
  reorderCertifications(orderedIds) {
    if (!this.data.certifications) return [];
    const newOrder = [];
    const currentMap = new Map(this.data.certifications.map((c) => [c.id, c]));
    for (const id of orderedIds) {
      if (currentMap.has(id)) {
        newOrder.push(currentMap.get(id));
        currentMap.delete(id);
      }
    }
    for (const [_, cert] of currentMap) {
      newOrder.push(cert);
    }
    this.data.certifications = newOrder;
    this.sync();
    return this.data.certifications;
  }
  updateCertification(id, certUpdates) {
    if (!this.data.certifications) return null;
    const idx = this.data.certifications.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.certifications[idx] = { ...this.data.certifications[idx], ...certUpdates };
    this.sync();
    return this.data.certifications[idx];
  }
  deleteCertification(id) {
    if (!this.data.certifications) return false;
    const beforeLen = this.data.certifications.length;
    this.data.certifications = this.data.certifications.filter((c) => c.id !== id);
    const deleted = this.data.certifications.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }
  addTraining(training) {
    const newTr = {
      ...training,
      id: `tr-${Date.now()}-${Math.floor(Math.random() * 1e3)}`
    };
    if (!this.data.trainings) this.data.trainings = [];
    this.data.trainings.unshift(newTr);
    this.sync();
    return newTr;
  }
  updateTraining(id, updatedTr) {
    if (!this.data.trainings) this.data.trainings = [];
    const idx = this.data.trainings.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.data.trainings[idx] = {
      ...this.data.trainings[idx],
      ...updatedTr,
      id
    };
    this.sync();
    return this.data.trainings[idx];
  }
  deleteTraining(id) {
    if (!this.data.trainings) return false;
    const beforeLen = this.data.trainings.length;
    this.data.trainings = this.data.trainings.filter((t) => t.id !== id);
    const deleted = this.data.trainings.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }
  // --- Skills Operations ---
  updatePillars(pillars) {
    this.data.pillars = pillars;
    this.sync();
    return this.data.pillars;
  }
  updateMetrics(metrics) {
    this.data.metrics = metrics;
    this.sync();
    return this.data.metrics;
  }
  updateSkillGroups(groups) {
    this.data.skillGroups = groups.map((g, idx) => ({
      ...g,
      id: g.id || `sg-${idx + 1}-${Date.now()}`,
      skills: Array.isArray(g.skills) ? g.skills : []
    }));
    this.sync();
    return this.data.skillGroups;
  }
  // --- Messages Operations ---
  getMessages() {
    return this.data.messages;
  }
  addMessage(msg) {
    const newMsg = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      name: msg.name.trim(),
      email: msg.email.trim(),
      subject: msg.subject.trim() || "General Inquiry",
      message: msg.message.trim(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      read: false,
      replied: false
    };
    this.data.messages.unshift(newMsg);
    this.sync();
    return newMsg;
  }
  toggleMessageRead(id) {
    const idx = this.data.messages.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.data.messages[idx].read = !this.data.messages[idx].read;
    this.sync();
    return this.data.messages[idx];
  }
  deleteMessage(id) {
    const beforeLen = this.data.messages.length;
    this.data.messages = this.data.messages.filter((m) => m.id !== id);
    const deleted = this.data.messages.length < beforeLen;
    if (deleted) this.sync();
    return deleted;
  }
  // --- Full DB Operations ---
  resetToDefault() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
    this.sync();
    return this.data;
  }
  // --- Honors & Activities Operations ---
  updateReferences(references) {
    this.data.references = references.map((r, idx) => ({ ...r, id: r.id || `ref-${Date.now()}-${idx}` }));
    this.sync();
    return this.data.references;
  }
  updateVolunteerWork(volunteerWork) {
    this.data.volunteerWork = volunteerWork.map((v, idx) => ({ ...v, id: v.id || `vol-${Date.now()}-${idx}` }));
    this.sync();
    return this.data.volunteerWork;
  }
  updateAchievements(achievements) {
    this.data.achievements = achievements.map((a, idx) => ({ ...a, id: a.id || `ach-${Date.now()}-${idx}` }));
    this.sync();
    return this.data.achievements;
  }
  updateAffiliations(affiliations) {
    this.data.affiliations = affiliations.map((a, idx) => ({ ...a, id: a.id || `aff-${Date.now()}-${idx}` }));
    this.sync();
    return this.data.affiliations;
  }
  importDatabase(importedData) {
    if (!importedData || typeof importedData !== "object") {
      throw new Error("Invalid JSON structure");
    }
    if (!importedData.profile || !Array.isArray(importedData.publications)) {
      throw new Error("Missing essential profile or publications array");
    }
    this.data = {
      ...DEFAULT_PORTFOLIO_DATA,
      ...importedData,
      adminConfig: this.data.adminConfig
    };
    this.sync();
    return true;
  }
};
var db = new PortfolioDatabase();

// src/server/academicImporter.ts
var cheerio = __toESM(require("cheerio"), 1);
function cleanLatex(text) {
  if (!text) return "";
  return text.replace(/\\['"`^~=.](\w)/g, "$1").replace(/\\&/g, "&").replace(/\\%/g, "%").replace(/\\_/g, "_").replace(/\\#/g, "#").replace(/\{([^{}]+)\}/g, "$1").replace(/[{}]/g, "").replace(/\s+/g, " ").trim();
}
function formatBibtexAuthors(authorField) {
  if (!authorField) return "";
  const cleaned = cleanLatex(authorField);
  const authorsList = cleaned.split(/\s+and\s+/i).map((a) => a.trim()).filter(Boolean);
  const formatted = authorsList.map((author) => {
    if (author.includes(",")) {
      const parts = author.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        return `${parts[1]} ${parts[0]}`.trim();
      }
    }
    return author;
  });
  return formatted.join(", ");
}
function parseBibTeX(rawBibtex) {
  if (!rawBibtex || typeof rawBibtex !== "string") return [];
  const results = [];
  const entryRegex = /@([a-zA-Z]+)\s*\{\s*([^,\s]*)\s*,([\s\S]*?)(?=\n@|\s*$)/g;
  let match;
  while ((match = entryRegex.exec(rawBibtex)) !== null) {
    const entryType = match[1].toLowerCase();
    const citeKey = match[2].trim();
    const body = match[3];
    const fields = {};
    const fieldRegex = /([a-zA-Z_-]+)\s*=\s*(?:\{([\s\S]*?)\}|"([\s\S]*?)"|([^\s,}]+))/g;
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(body)) !== null) {
      const fieldName = fieldMatch[1].toLowerCase().trim();
      const val = fieldMatch[2] ?? fieldMatch[3] ?? fieldMatch[4] ?? "";
      fields[fieldName] = cleanLatex(val);
    }
    const title = fields["title"] || fields["booktitle"] || citeKey || "Untitled Publication";
    const authors = formatBibtexAuthors(fields["author"] || fields["authors"] || fields["editor"] || "");
    const venue = fields["journal"] || fields["journaltitle"] || fields["booktitle"] || fields["school"] || fields["institution"] || fields["publisher"] || fields["series"] || "Academic Publication";
    let year = parseInt(fields["year"] || "", 10);
    if (isNaN(year) || year < 1900 || year > 2100) {
      year = (/* @__PURE__ */ new Date()).getFullYear();
    }
    let category = "Journal";
    if (entryType === "article") {
      category = "Journal";
    } else if (entryType === "inproceedings" || entryType === "conference" || entryType === "proceedings") {
      category = "Conference";
    } else if (entryType === "book" || entryType === "incollection" || entryType === "inbook") {
      category = "Book Chapter";
    } else if (entryType === "techreport" || entryType === "misc" || entryType === "unpublished" || entryType === "preprint") {
      const lowerVenue = venue.toLowerCase();
      if (lowerVenue.includes("arxiv") || lowerVenue.includes("biorxiv") || lowerVenue.includes("chemrxiv") || lowerVenue.includes("ssrn") || lowerVenue.includes("preprint")) {
        category = "Preprint";
      } else if (lowerVenue.includes("workshop")) {
        category = "Workshop";
      } else {
        category = "Journal";
      }
    }
    const doi = fields["doi"] || "";
    let link = fields["url"] || (doi ? `https://doi.org/${doi}` : "");
    const pdfUrl = fields["pdf"] || fields["pdfurl"] || fields["eprint"] || "";
    const abstract = fields["abstract"] || fields["note"] || "";
    const citations = parseInt(fields["citations"] || fields["citationcount"] || "0", 10) || 0;
    const bibtexSnippet = `@${entryType}{${citeKey || "pub_" + year},
  title = {${fields["title"] || title}},
  author = {${fields["author"] || authors}},
  ${category === "Journal" ? "journal" : "booktitle"} = {${venue}},
  year = {${year}}${doi ? `,
  doi = {${doi}}` : ""}${fields["volume"] ? `,
  volume = {${fields["volume"]}}` : ""}${fields["pages"] ? `,
  pages = {${fields["pages"]}}` : ""}
}`;
    results.push({
      title,
      authors: authors || "Unknown Authors",
      venue,
      year,
      category,
      doi,
      link,
      pdfUrl,
      abstract,
      citations,
      featured: false,
      tags: [],
      bibtex: bibtexSnippet,
      source: "BibTeX File"
    });
  }
  return results;
}
async function scrapeGoogleScholar(scholarUrlOrId) {
  let targetUrl = scholarUrlOrId.trim();
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = `https://scholar.google.com/citations?user=${encodeURIComponent(targetUrl)}&hl=en&pagesize=100`;
  } else if (!targetUrl.includes("pagesize=")) {
    targetUrl += (targetUrl.includes("?") ? "&" : "?") + "pagesize=100&cstart=0";
  }
  const response = await fetch(targetUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
    }
  });
  if (!response.ok) {
    throw new Error(`Google Scholar responded with status ${response.status}`);
  }
  const html = await response.text();
  const $ = cheerio.load(html);
  const items = [];
  $(".gsc_a_tr").each((_, el) => {
    const titleEl = $(el).find(".gsc_a_at");
    const title = titleEl.text().trim();
    const relativeLink = titleEl.attr("href");
    const link = relativeLink ? `https://scholar.google.com${relativeLink}` : "";
    const grayDivs = $(el).find(".gs_gray");
    const authors = grayDivs.eq(0).text().trim() || "Unknown Authors";
    const venueRaw = grayDivs.eq(1).text().trim() || "Google Scholar Publication";
    const citationText = $(el).find(".gsc_a_ac").text().trim();
    const citations = parseInt(citationText, 10) || 0;
    const yearText = $(el).find(".gsc_a_y").text().trim();
    const year = parseInt(yearText, 10) || (/* @__PURE__ */ new Date()).getFullYear();
    let category = "Journal";
    const lowerVenue = venueRaw.toLowerCase();
    if (lowerVenue.includes("conference") || lowerVenue.includes("proceedings") || lowerVenue.includes("symposium") || lowerVenue.includes("ieee") || lowerVenue.includes("icre")) {
      category = "Conference";
    } else if (lowerVenue.includes("arxiv") || lowerVenue.includes("biorxiv") || lowerVenue.includes("preprint")) {
      category = "Preprint";
    } else if (lowerVenue.includes("book") || lowerVenue.includes("chapter")) {
      category = "Book Chapter";
    } else if (lowerVenue.includes("workshop")) {
      category = "Workshop";
    }
    if (title) {
      items.push({
        title,
        authors,
        venue: venueRaw,
        year,
        category,
        doi: "",
        link,
        pdfUrl: "",
        abstract: "",
        citations,
        featured: false,
        tags: [],
        bibtex: `@article{scholar_${year}_${title.substring(0, 10).replace(/[^a-zA-Z0-9]/g, "_")},
  title = {${title}},
  author = {${authors}},
  journal = {${venueRaw}},
  year = {${year}}
}`,
        source: "Google Scholar"
      });
    }
  });
  return items;
}
async function fetchSemanticScholarPapers(authorQueryOrId) {
  let authorId = authorQueryOrId.trim();
  let authorName;
  if (!/^\d+$/.test(authorId) && !/^[a-f0-9]{40}$/i.test(authorId)) {
    const searchUrl = `https://api.semanticscholar.org/graph/v1/author/search?query=${encodeURIComponent(authorId)}&fields=name,paperCount,citationCount,hIndex`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      throw new Error(`Semantic Scholar author search failed: ${searchRes.statusText}`);
    }
    const searchJson = await searchRes.json();
    if (!searchJson.data || searchJson.data.length === 0) {
      return { papers: [] };
    }
    authorId = searchJson.data[0].authorId;
    authorName = searchJson.data[0].name;
  }
  const papersUrl = `https://api.semanticscholar.org/graph/v1/author/${authorId}/papers?fields=title,authors,venue,year,citationCount,openAccessPdf,externalIds,abstract,publicationTypes,url,publicationDate&limit=100`;
  const papersRes = await fetch(papersUrl);
  if (!papersRes.ok) {
    throw new Error(`Semantic Scholar papers fetch failed: ${papersRes.statusText}`);
  }
  const papersJson = await papersRes.json();
  const rawList = papersJson.data || [];
  const parsedItems = [];
  for (const item of rawList) {
    if (!item.title) continue;
    const authorsStr = (item.authors || []).map((a) => a.name).join(", ") || "Unknown Authors";
    const doi = item.externalIds?.DOI || "";
    const link = item.url || (doi ? `https://doi.org/${doi}` : "");
    const pdfUrl = item.openAccessPdf?.url || "";
    const year = item.year || (/* @__PURE__ */ new Date()).getFullYear();
    const venue = item.venue || "Academic Journal / Conference";
    let category = "Journal";
    const pubTypes = item.publicationTypes || [];
    if (pubTypes.includes("Conference") || pubTypes.includes("JournalArticle") === false && venue.toLowerCase().includes("conference")) {
      category = "Conference";
    } else if (pubTypes.includes("Book") || pubTypes.includes("BookSection")) {
      category = "Book Chapter";
    } else if (pubTypes.includes("Review")) {
      category = "Journal";
    }
    const bibKey = `s2_${year}_${(item.title || "paper").substring(0, 12).replace(/[^a-zA-Z0-9]/g, "_")}`;
    const bibtex = `@article{${bibKey},
  title = {${item.title}},
  author = {${authorsStr}},
  journal = {${venue}},
  year = {${year}}${doi ? `,
  doi = {${doi}}` : ""}
}`;
    parsedItems.push({
      title: item.title,
      authors: authorsStr,
      venue,
      year,
      category,
      doi,
      link,
      pdfUrl,
      abstract: item.abstract || "",
      citations: item.citationCount || 0,
      featured: false,
      tags: [],
      bibtex,
      source: "Semantic Scholar"
    });
  }
  return { authorName, papers: parsedItems };
}
async function fetchByDOI(doiString) {
  const cleanDoi = doiString.trim().replace(/^https?:\/\/doi\.org\//i, "");
  const url = `https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "EnergySystemsPortfolio/1.0 (mailto:admin@academic-portfolio.app)"
    }
  });
  if (!res.ok) {
    throw new Error(`CrossRef lookup failed for DOI ${cleanDoi}: ${res.statusText}`);
  }
  const json = await res.json();
  const work = json.message;
  if (!work) {
    throw new Error(`No metadata found for DOI ${cleanDoi}`);
  }
  const title = work.title && work.title[0] ? cleanLatex(work.title[0]) : "Untitled";
  const authors = (work.author || []).map((a) => `${a.given || ""} ${a.family || ""}`.trim()).filter(Boolean).join(", ") || "Unknown Authors";
  const venue = work["container-title"] && work["container-title"][0] || work.publisher || "Academic Venue";
  let year = (/* @__PURE__ */ new Date()).getFullYear();
  if (work["published-print"]?.["date-parts"]?.[0]?.[0]) {
    year = work["published-print"]["date-parts"][0][0];
  } else if (work["published-online"]?.["date-parts"]?.[0]?.[0]) {
    year = work["published-online"]["date-parts"][0][0];
  } else if (work.issued?.["date-parts"]?.[0]?.[0]) {
    year = work.issued["date-parts"][0][0];
  }
  let category = "Journal";
  if (work.type === "proceedings-article") {
    category = "Conference";
  } else if (work.type === "book-chapter") {
    category = "Book Chapter";
  } else if (work.type === "posted-content" || work.subtype === "preprint") {
    category = "Preprint";
  }
  const abstract = work.abstract ? cleanLatex(work.abstract.replace(/<[^>]*>/g, "")) : "";
  const citations = work["is-referenced-by-count"] || 0;
  const link = work.URL || `https://doi.org/${cleanDoi}`;
  const bibtex = `@article{doi_${cleanDoi.replace(/[^a-zA-Z0-9]/g, "_")},
  title = {${title}},
  author = {${authors}},
  journal = {${venue}},
  year = {${year}},
  doi = {${cleanDoi}}
}`;
  return {
    title,
    authors,
    venue,
    year,
    category,
    doi: cleanDoi,
    link,
    pdfUrl: "",
    abstract,
    citations,
    featured: false,
    tags: [],
    bibtex,
    source: "CrossRef DOI"
  };
}

// src/server/createApp.ts
var JWT_SECRET = process.env.JWT_SECRET || "dev-only-insecure-secret";
function generateToken(username) {
  return import_jsonwebtoken.default.sign({ username }, JWT_SECRET, { expiresIn: "7d" });
}
function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized: Authentication token required." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    req.user = { username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Session expired or invalid. Please log in again." });
  }
}
async function createApp() {
  const app2 = (0, import_express.default)();
  await db.waitUntilReady();
  app2.use(import_express.default.json({ limit: "10mb" }));
  app2.use(import_express.default.urlencoded({ extended: true, limit: "10mb" }));
  app2.use((req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = ((body) => {
      db.flush().finally(() => originalJson(body));
      return res;
    });
    next();
  });
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/api/portfolio/avatar", (req, res) => {
    try {
      const avatarUrl = db.data?.profile?.avatarUrl;
      if (!avatarUrl) {
        return res.status(404).send("Avatar not found");
      }
      if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
        return res.redirect(302, avatarUrl);
      }
      if (!avatarUrl.startsWith("data:image/")) {
        return res.status(404).send("Invalid image data");
      }
      const matches = avatarUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(404).send("Invalid image data");
      }
      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], "base64");
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(buffer);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  app2.get("/api/portfolio/logo", (req, res) => {
    try {
      const logoUrl = db.data?.profile?.logoUrl;
      if (!logoUrl || logoUrl === "chunked") {
        return res.redirect(302, "/favicon.svg");
      }
      if (logoUrl.startsWith("http://") || logoUrl.startsWith("https://")) {
        return res.redirect(302, logoUrl);
      }
      if (!logoUrl.startsWith("data:image/")) {
        return res.redirect(302, "/favicon.svg");
      }
      const matches = logoUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.redirect(302, "/favicon.svg");
      }
      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], "base64");
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(buffer);
    } catch (err) {
      res.redirect(302, "/favicon.svg");
    }
  });
  app2.get("/api/portfolio", async (req, res) => {
    try {
      await db.waitUntilReady();
      const data = db.getPublicData();
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.get("/api/publications", async (req, res) => {
    try {
      await db.waitUntilReady();
      const publications = db.getPublications();
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.json({ success: true, data: publications });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.post("/api/contact", (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "Name, email, and message are required." });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Please provide a valid email address." });
      }
      const created = db.addMessage({ name, email, subject: subject || "", message });
      res.status(201).json({
        success: true,
        message: "Your message has been delivered successfully. Thank you for reaching out!",
        data: created
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.post("/api/auth/login", (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required." });
      }
      const isValid = db.verifyAdmin(username, password);
      if (!isValid) {
        return res.status(401).json({ success: false, message: "Invalid username or password credentials." });
      }
      const token = generateToken(username);
      res.json({
        success: true,
        token,
        user: { username, role: "admin" },
        message: "Authentication successful."
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.get("/api/auth/me", verifyAuth, (req, res) => {
    const session = req.user;
    res.json({ success: true, user: { username: session.username, role: "admin" } });
  });
  app2.post("/api/auth/update-credentials", verifyAuth, (req, res) => {
    try {
      const { newUsername, newPassword } = req.body;
      if (!newUsername || newUsername.trim().length < 3) {
        return res.status(400).json({ success: false, message: "Username must be at least 3 characters long." });
      }
      if (newPassword && newPassword.trim().length < 4) {
        return res.status(400).json({ success: false, message: "Password must be at least 4 characters long." });
      }
      db.updateAdminCredentials(newUsername, newPassword);
      res.json({ success: true, message: "Admin credentials updated successfully." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.get("/api/scholar/stats", async (req, res) => {
    try {
      const scholarUrl = req.query.url;
      if (!scholarUrl) {
        return res.status(400).json({ success: false, message: "Google Scholar URL is required." });
      }
      const response = await fetch(scholarUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9"
        }
      });
      if (!response.ok) {
        throw new Error(`Scholar responded with status: ${response.status}`);
      }
      const html = await response.text();
      const $ = cheerio2.load(html);
      let citations = null;
      let hIndex = null;
      const cells = $("#gsc_rsb_st td.gsc_rsb_std");
      if (cells.length >= 2) {
        citations = parseInt($(cells[0]).text().trim(), 10);
        hIndex = parseInt($(cells[2]).text().trim(), 10);
      }
      if (citations !== null && hIndex !== null && !isNaN(citations) && !isNaN(hIndex)) {
        res.json({ success: true, data: { citations, hIndex } });
      } else {
        res.status(500).json({ success: false, message: "Could not parse Scholar stats" });
      }
    } catch (err) {
      console.error("Scholar stats error:", err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.get("/api/scholar/sync", async (req, res) => {
    try {
      const scholarUrl = req.query.url;
      if (!scholarUrl) {
        return res.status(400).json({ success: false, message: "Google Scholar URL is required." });
      }
      const response = await fetch(scholarUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9"
        }
      });
      if (!response.ok) {
        throw new Error(`Scholar responded with status: ${response.status}`);
      }
      const html = await response.text();
      const $ = cheerio2.load(html);
      const citationsMap = {};
      $(".gsc_a_tr").each((i, el) => {
        const title = $(el).find(".gsc_a_at").text().trim();
        const citationText = $(el).find(".gsc_a_ac").text().trim();
        const citationCount = parseInt(citationText, 10);
        if (title && !isNaN(citationCount)) {
          citationsMap[title.toLowerCase()] = citationCount;
        }
      });
      res.json({ success: true, data: citationsMap, message: "Successfully fetched citations from Google Scholar." });
    } catch (err) {
      console.error("Scholar sync error:", err.message);
      res.status(500).json({
        success: false,
        message: "Could not reach Google Scholar directly. It may be temporarily blocking automated requests.",
        error: err.message
      });
    }
  });
  app2.get("/api/admin/data", verifyAuth, (req, res) => {
    try {
      const fullData = db.getFullData();
      res.json({ success: true, data: fullData });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.put("/api/admin/profile", verifyAuth, (req, res) => {
    try {
      const updated = db.updateProfile(req.body);
      res.json({ success: true, data: updated, message: "Profile information updated successfully." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.post("/api/admin/publications", verifyAuth, (req, res) => {
    try {
      const { title, authors, venue, year, category } = req.body;
      if (!title || !authors || !venue || !year || !category) {
        return res.status(400).json({ success: false, message: "Title, authors, venue, year, and category are required." });
      }
      const created = db.addPublication(req.body);
      res.status(201).json({ success: true, data: created, message: "Publication created successfully." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.put("/api/admin/publications/:id", verifyAuth, (req, res) => {
    try {
      const updated = db.updatePublication(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Publication not found." });
      }
      res.json({ success: true, data: updated, message: "Publication updated successfully." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.delete("/api/admin/publications/:id", verifyAuth, (req, res) => {
    try {
      const deleted = db.deletePublication(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Publication not found." });
      }
      res.json({ success: true, message: "Publication deleted successfully." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.post("/api/admin/publications/parse-bibtex", verifyAuth, (req, res) => {
    try {
      const { bibtex } = req.body;
      if (!bibtex || typeof bibtex !== "string") {
        return res.status(400).json({ success: false, message: "BibTeX string is required." });
      }
      const parsed = parseBibTeX(bibtex);
      const existingPubs = db.getPublications();
      const normalize = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
      const enriched = parsed.map((item) => {
        const normTitle = normalize(item.title);
        const cleanDoi = (item.doi || "").trim().toLowerCase();
        const existing = existingPubs.find((p) => {
          if (cleanDoi && p.doi && p.doi.trim().toLowerCase() === cleanDoi) return true;
          return normalize(p.title) === normTitle;
        });
        return {
          ...item,
          tempId: `tmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          existsInDb: !!existing,
          existingId: existing ? existing.id : void 0
        };
      });
      res.json({
        success: true,
        count: enriched.length,
        data: enriched,
        message: `Parsed ${enriched.length} publications from BibTeX.`
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.post("/api/admin/publications/fetch-academic", verifyAuth, async (req, res) => {
    try {
      const { source, query } = req.body;
      if (!query || typeof query !== "string") {
        return res.status(400).json({ success: false, message: "Search query or URL is required." });
      }
      let papers = [];
      let sourceName = source;
      let notes = "";
      if (source === "scholar") {
        try {
          papers = await scrapeGoogleScholar(query);
          sourceName = "Google Scholar Profile";
        } catch (scholarErr) {
          console.warn("Google Scholar direct scrape failed, attempting Semantic Scholar fallback:", scholarErr.message);
          const fallbackResult = await fetchSemanticScholarPapers(query);
          papers = fallbackResult.papers;
          sourceName = "Semantic Scholar (Scholar Scrape Fallback)";
          notes = "Google Scholar rate-limited automated requests; automatically retrieved via Semantic Scholar Open API.";
        }
      } else if (source === "semanticscholar") {
        const result = await fetchSemanticScholarPapers(query);
        papers = result.papers;
        sourceName = "Semantic Scholar Graph API";
      } else if (source === "doi") {
        const dois = query.split(/[\n,;]+/).map((d) => d.trim()).filter(Boolean);
        for (const singleDoi of dois) {
          try {
            const paper = await fetchByDOI(singleDoi);
            papers.push(paper);
          } catch (doiErr) {
            console.warn(`DOI fetch failed for ${singleDoi}:`, doiErr.message);
          }
        }
        sourceName = "CrossRef / OpenAlex DOI Lookup";
      } else {
        return res.status(400).json({ success: false, message: "Invalid source. Supported: scholar, semanticscholar, doi" });
      }
      const existingPubs = db.getPublications();
      const normalize = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
      const enriched = papers.map((item) => {
        const normTitle = normalize(item.title);
        const cleanDoi = (item.doi || "").trim().toLowerCase();
        const existing = existingPubs.find((p) => {
          if (cleanDoi && p.doi && p.doi.trim().toLowerCase() === cleanDoi) return true;
          return normalize(p.title) === normTitle;
        });
        return {
          ...item,
          tempId: `tmp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          existsInDb: !!existing,
          existingId: existing ? existing.id : void 0
        };
      });
      res.json({
        success: true,
        source: sourceName,
        count: enriched.length,
        notes: notes || void 0,
        data: enriched,
        message: `Retrieved ${enriched.length} publications from ${sourceName}.`
      });
    } catch (err) {
      console.error("Fetch academic error:", err);
      res.status(500).json({ success: false, message: err.message || "Failed to fetch publications from academic source." });
    }
  });
  app2.post("/api/admin/publications/bulk-import", verifyAuth, (req, res) => {
    try {
      const { publications: itemsToImport, updateExisting = true } = req.body;
      if (!Array.isArray(itemsToImport) || itemsToImport.length === 0) {
        return res.status(400).json({ success: false, message: "An array of publications is required." });
      }
      const result = db.bulkImportPublications(itemsToImport, { updateExisting });
      res.json({
        success: true,
        data: result,
        message: `Successfully imported: ${result.addedCount} new papers added, ${result.updatedCount} existing papers updated.`
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.post("/api/admin/projects", verifyAuth, (req, res) => {
    try {
      const { title, category, description } = req.body;
      if (!title || !category || !description) {
        return res.status(400).json({ success: false, message: "Title, category, and description are required." });
      }
      const created = db.addProject(req.body);
      res.status(201).json({ success: true, data: created, message: "Project created successfully." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.put("/api/admin/projects/:id", verifyAuth, (req, res) => {
    try {
      const updated = db.updateProject(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Project not found." });
      }
      res.json({ success: true, data: updated, message: "Project updated successfully." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.delete("/api/admin/projects/:id", verifyAuth, (req, res) => {
    try {
      const deleted = db.deleteProject(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Project not found." });
      }
      res.json({ success: true, message: "Project deleted successfully." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.post("/api/admin/experience", verifyAuth, (req, res) => {
    try {
      const { role, organization, period, description } = req.body;
      if (!role || !organization || !period) {
        return res.status(400).json({ success: false, message: "Role, organization, and period are required." });
      }
      const created = db.addExperience(req.body);
      res.status(201).json({ success: true, data: created, message: "Experience record added." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.put("/api/admin/experience/:id", verifyAuth, (req, res) => {
    try {
      const updated = db.updateExperience(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Experience not found." });
      }
      res.json({ success: true, data: updated, message: "Experience record updated." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.delete("/api/admin/experience/:id", verifyAuth, (req, res) => {
    try {
      const deleted = db.deleteExperience(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Experience not found." });
      }
      res.json({ success: true, message: "Experience record deleted." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.post("/api/admin/education", verifyAuth, (req, res) => {
    try {
      const { degree, institution, year } = req.body;
      if (!degree || !institution || !year) {
        return res.status(400).json({ success: false, message: "Degree, institution, and year are required." });
      }
      const created = db.addEducation(req.body);
      res.status(201).json({ success: true, data: created, message: "Education record added." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.put("/api/admin/education/:id", verifyAuth, (req, res) => {
    try {
      const updated = db.updateEducation(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Education not found." });
      }
      res.json({ success: true, data: updated, message: "Education record updated." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.delete("/api/admin/education/:id", verifyAuth, (req, res) => {
    try {
      const deleted = db.deleteEducation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Education not found." });
      }
      res.json({ success: true, message: "Education record deleted." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.post("/api/admin/certifications", verifyAuth, (req, res) => {
    try {
      const { title, issuer, year } = req.body;
      if (!title || !issuer || !year) {
        return res.status(400).json({ success: false, message: "Title, issuer, and year are required." });
      }
      const created = db.addCertification(req.body);
      res.status(201).json({ success: true, data: created, message: "Certification record added." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.put("/api/admin/certifications/reorder", verifyAuth, (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ success: false, message: "orderedIds must be an array." });
      }
      const reordered = db.reorderCertifications(orderedIds);
      res.json({ success: true, data: reordered, message: "Certifications reordered successfully." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.put("/api/admin/projects/reorder", verifyAuth, (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).json({ success: false, message: "Invalid payload" });
      }
      const updated = db.reorderProjects(orderedIds);
      res.json({ success: true, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  app2.put("/api/admin/education/reorder", verifyAuth, (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).json({ success: false, message: "Invalid payload" });
      }
      const updated = db.reorderEducations(orderedIds);
      res.json({ success: true, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  app2.put("/api/admin/experience/reorder", verifyAuth, (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).json({ success: false, message: "Invalid payload" });
      }
      const updated = db.reorderExperiences(orderedIds);
      res.json({ success: true, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  app2.put("/api/admin/trainings/reorder", verifyAuth, (req, res) => {
    try {
      const { orderedIds } = req.body;
      if (!orderedIds || !Array.isArray(orderedIds)) {
        return res.status(400).json({ success: false, message: "Invalid payload" });
      }
      const updated = db.reorderTrainings(orderedIds);
      res.json({ success: true, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  app2.put("/api/admin/certifications/:id", verifyAuth, (req, res) => {
    try {
      const updated = db.updateCertification(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Certification record not found." });
      }
      res.json({ success: true, data: updated, message: "Certification record updated." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.delete("/api/admin/certifications/:id", verifyAuth, (req, res) => {
    try {
      const deleted = db.deleteCertification(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Certification record not found." });
      }
      res.json({ success: true, message: "Certification record deleted." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.post("/api/admin/section-config", verifyAuth, (req, res) => {
    try {
      const { sectionConfig } = req.body;
      db.updateSectionConfig(sectionConfig);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating section config:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  app2.post("/api/admin/trainings", verifyAuth, (req, res) => {
    try {
      const { title, issuer, year } = req.body;
      if (!title || !issuer || !year) {
        return res.status(400).json({ success: false, message: "Title, issuer, and year are required." });
      }
      const created = db.addTraining(req.body);
      res.status(201).json({ success: true, data: created, message: "Training record added." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.put("/api/admin/trainings/:id", verifyAuth, (req, res) => {
    try {
      const updated = db.updateTraining(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Training record not found." });
      }
      res.json({ success: true, data: updated, message: "Training record updated." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.delete("/api/admin/trainings/:id", verifyAuth, (req, res) => {
    try {
      const deleted = db.deleteTraining(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Training record not found." });
      }
      res.json({ success: true, message: "Training record deleted." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.put("/api/admin/pillars", verifyAuth, (req, res) => {
    try {
      const { pillars } = req.body;
      const updated = db.updatePillars(pillars || []);
      res.json({ success: true, data: updated, message: "Pillars updated successfully." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.put("/api/admin/metrics", verifyAuth, (req, res) => {
    try {
      const { metrics } = req.body;
      const updated = db.updateMetrics(metrics || []);
      res.json({ success: true, data: updated, message: "Metrics updated successfully." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.put("/api/admin/skills", verifyAuth, (req, res) => {
    try {
      const { skillGroups } = req.body;
      if (!Array.isArray(skillGroups)) {
        return res.status(400).json({ success: false, message: "skillGroups array is required." });
      }
      const updated = db.updateSkillGroups(skillGroups);
      res.json({ success: true, data: updated, message: "Skills updated successfully." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.put("/api/admin/references", verifyAuth, (req, res) => {
    try {
      const { references } = req.body;
      const updated = db.updateReferences(references || []);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.put("/api/admin/volunteerWork", verifyAuth, (req, res) => {
    try {
      const { volunteerWork } = req.body;
      const updated = db.updateVolunteerWork(volunteerWork || []);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.put("/api/admin/achievements", verifyAuth, (req, res) => {
    try {
      const { achievements } = req.body;
      const updated = db.updateAchievements(achievements || []);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.put("/api/admin/affiliations", verifyAuth, (req, res) => {
    try {
      const { affiliations } = req.body;
      const updated = db.updateAffiliations(affiliations || []);
      res.json({ success: true, data: updated });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.get("/api/admin/messages", verifyAuth, (req, res) => {
    try {
      const messages = db.getMessages();
      res.json({ success: true, data: messages });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.patch("/api/admin/messages/:id/read", verifyAuth, (req, res) => {
    try {
      const updated = db.toggleMessageRead(req.params.id);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Message not found." });
      }
      res.json({ success: true, data: updated, message: "Message status updated." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.delete("/api/admin/messages/:id", verifyAuth, (req, res) => {
    try {
      const deleted = db.deleteMessage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Message not found." });
      }
      res.json({ success: true, message: "Message deleted successfully." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.post("/api/admin/db/reset", verifyAuth, (req, res) => {
    try {
      const resetData = db.resetToDefault();
      res.json({ success: true, data: resetData, message: "Database reset to default template state." });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
  app2.post("/api/admin/db/import", verifyAuth, (req, res) => {
    try {
      const imported = req.body;
      db.importDatabase(imported);
      res.json({ success: true, message: "Database imported and restored successfully." });
    } catch (err) {
      res.status(400).json({ success: false, message: `Import error: ${err.message}` });
    }
  });
  return app2;
}

// api-src/handler-netlify.ts
var handlerPromise = null;
async function buildHandler() {
  const app2 = await createApp();
  return (0, import_serverless_http.default)(app2);
}
var handler = async (event, context) => {
  if (!handlerPromise) {
    handlerPromise = buildHandler().catch((err) => {
      handlerPromise = null;
      throw err;
    });
  }
  const serverlessHandler = await handlerPromise;
  return serverlessHandler(event, context);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
