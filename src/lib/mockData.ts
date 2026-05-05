import type { Event, Course } from './supabase';

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  description?: string;
  type: 'video' | 'text' | 'quiz';
}

export interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

export const COURSE_CONTENT: Record<string, Section[]> = {
  '1': [
    {
      id: 's1',
      title: 'Introducción a Solidity',
      lessons: [
        { id: 'l1', title: 'Bienvenida al curso', duration: '3:20', type: 'video', videoUrl: 'https://www.youtube.com/embed/gyMwXuJrbJQ', description: 'Presentación del curso y lo que aprenderás.' },
        { id: 'l2', title: '¿Qué es Solidity?', duration: '8:45', type: 'video', videoUrl: 'https://www.youtube.com/embed/M576WGiDBdQ', description: 'Historia y propósito del lenguaje Solidity.' },
        { id: 'l3', title: 'Configurando el entorno de desarrollo', duration: '12:10', type: 'video', videoUrl: 'https://www.youtube.com/embed/ipwxYa-F1uY', description: 'Remix IDE, MetaMask y testnets.' },
      ],
    },
    {
      id: 's2',
      title: 'Variables y Tipos de Datos',
      lessons: [
        { id: 'l4', title: 'Tipos de datos básicos', duration: '15:30', type: 'video', videoUrl: 'https://www.youtube.com/embed/gyMwXuJrbJQ', description: 'uint, int, bool, address, bytes y strings.' },
        { id: 'l5', title: 'Visibilidad: public, private, internal', duration: '11:20', type: 'video', videoUrl: 'https://www.youtube.com/embed/M576WGiDBdQ', description: 'Cómo controlar el acceso a variables y funciones.' },
        { id: 'l6', title: 'Quiz: Variables', duration: '5:00', type: 'quiz', description: 'Pon a prueba lo aprendido.' },
      ],
    },
    {
      id: 's3',
      title: 'Funciones y Modificadores',
      lessons: [
        { id: 'l7', title: 'Declaración de funciones', duration: '18:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/ipwxYa-F1uY', description: 'Parámetros, retorno y tipos de funciones.' },
        { id: 'l8', title: 'Modificadores personalizados', duration: '14:15', type: 'video', videoUrl: 'https://www.youtube.com/embed/gyMwXuJrbJQ', description: 'onlyOwner, whenNotPaused y más.' },
        { id: 'l9', title: 'Eventos y logs', duration: '9:40', type: 'video', videoUrl: 'https://www.youtube.com/embed/M576WGiDBdQ', description: 'Emitir y escuchar eventos en la blockchain.' },
      ],
    },
    {
      id: 's4',
      title: 'Contratos Avanzados',
      lessons: [
        { id: 'l10', title: 'Herencia y interfaces', duration: '20:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/ipwxYa-F1uY', description: 'Reutilización de código con herencia.' },
        { id: 'l11', title: 'Patrones de seguridad', duration: '22:30', type: 'video', videoUrl: 'https://www.youtube.com/embed/gyMwXuJrbJQ', description: 'ReentrancyGuard, Ownable, Pausable.' },
        { id: 'l12', title: 'Deploy en mainnet', duration: '16:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/M576WGiDBdQ', description: 'Hardhat, Foundry y verificación en Etherscan.' },
      ],
    },
  ],
  '2': [
    {
      id: 's1',
      title: 'Fundamentos de DeFi',
      lessons: [
        { id: 'l1', title: '¿Qué es DeFi?', duration: '10:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/gyMwXuJrbJQ', description: 'El ecosistema financiero descentralizado.' },
        { id: 'l2', title: 'AMMs y liquidity pools', duration: '18:30', type: 'video', videoUrl: 'https://www.youtube.com/embed/M576WGiDBdQ', description: 'Cómo funciona Uniswap por dentro.' },
      ],
    },
    {
      id: 's2',
      title: 'Protocolos de Lending',
      lessons: [
        { id: 'l3', title: 'Aave: préstamos sin colateral', duration: '20:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/ipwxYa-F1uY', description: 'Flash loans y estrategias avanzadas.' },
        { id: 'l4', title: 'Compound y tasas de interés', duration: '15:45', type: 'video', videoUrl: 'https://www.youtube.com/embed/gyMwXuJrbJQ', description: 'cTokens y el modelo de tasas dinámicas.' },
        { id: 'l5', title: 'Gestión de riesgos', duration: '12:20', type: 'video', videoUrl: 'https://www.youtube.com/embed/M576WGiDBdQ', description: 'Liquidaciones y cómo proteger tu posición.' },
      ],
    },
    {
      id: 's3',
      title: 'Yield Farming Avanzado',
      lessons: [
        { id: 'l6', title: 'Estrategias de yield', duration: '25:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/ipwxYa-F1uY', description: 'Optimizar rendimientos con múltiples protocolos.' },
        { id: 'l7', title: 'Impermanent loss', duration: '14:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/gyMwXuJrbJQ', description: 'Cálculo y mitigación del impermanent loss.' },
      ],
    },
  ],
  '4': [
    {
      id: 's1',
      title: 'Arte y Creatividad en NFTs',
      lessons: [
        { id: 'l1', title: 'Introducción al mundo NFT', duration: '8:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/gyMwXuJrbJQ', description: 'Historia y casos de éxito.' },
        { id: 'l2', title: 'Creando tu arte digital', duration: '20:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/M576WGiDBdQ', description: 'Herramientas: Midjourney, Photoshop, Procreate.' },
      ],
    },
    {
      id: 's2',
      title: 'Técnica: Smart Contracts ERC-721',
      lessons: [
        { id: 'l3', title: 'Estándar ERC-721', duration: '15:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/ipwxYa-F1uY', description: 'El contrato detrás de cada NFT.' },
        { id: 'l4', title: 'Metadata e IPFS', duration: '18:30', type: 'video', videoUrl: 'https://www.youtube.com/embed/gyMwXuJrbJQ', description: 'Cómo almacenar imágenes de forma descentralizada.' },
        { id: 'l5', title: 'Deploy de tu colección', duration: '22:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/M576WGiDBdQ', description: 'Lanzamiento en Ethereum y Polygon.' },
      ],
    },
    {
      id: 's3',
      title: 'Negocio y Marketing',
      lessons: [
        { id: 'l6', title: 'Construyendo comunidad', duration: '16:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/ipwxYa-F1uY', description: 'Discord, Twitter y estrategia de lanzamiento.' },
        { id: 'l7', title: 'Royalties y monetización', duration: '10:00', type: 'video', videoUrl: 'https://www.youtube.com/embed/gyMwXuJrbJQ', description: 'Cómo ganar con cada reventa.' },
      ],
    },
  ],
};

export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Introducción a Web3 y Blockchain',
    description:
      'Aprende los fundamentos de la tecnología blockchain, qué es Web3, cómo funcionan los smart contracts y cómo empezar tu carrera en el ecosistema descentralizado.',
    date: '2026-05-10T18:00:00Z',
    end_date: '2026-05-10T20:00:00Z',
    location: 'Online — Zoom',
    image_urls: [
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80',
      'https://images.unsplash.com/photo-1642790551116-18a150d248bc?w=800&q=80',
    ],
    agenda:
      '18:00 — Bienvenida y presentaciones\n18:15 — ¿Qué es blockchain y por qué importa?\n18:45 — Smart contracts en la práctica\n19:15 — Demo: Interactuando con dApps\n19:45 — Q&A y cierre',
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Workshop: Construye tu primer NFT',
    description:
      'Taller práctico donde aprenderás a crear, desplegar y vender tu primer NFT paso a paso. Cubriremos Solidity básico, IPFS para metadata y cómo listar en OpenSea.',
    date: '2026-05-17T16:00:00Z',
    end_date: '2026-05-17T19:00:00Z',
    location: 'Online — Google Meet',
    image_urls: [
      'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&q=80',
    ],
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    agenda:
      '16:00 — Setup del entorno (Hardhat + MetaMask)\n16:30 — Escribiendo el smart contract ERC-721\n17:15 — Subiendo metadata a IPFS\n18:00 — Deploy en testnet\n18:30 — Listado en OpenSea\n18:50 — Q&A',
    created_at: '2026-04-05T00:00:00Z',
  },
  {
    id: '3',
    title: 'KeyLab Meetup: IA + Web3',
    description:
      'Evento presencial y online donde exploraremos la intersección entre inteligencia artificial y tecnología descentralizada. Ponentes de la industria compartirán casos de uso reales.',
    date: '2026-05-24T17:00:00Z',
    end_date: '2026-05-24T21:00:00Z',
    location: 'Ciudad de México + Online',
    image_urls: [
      'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80',
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
    ],
    agenda:
      '17:00 — Registro y networking\n17:30 — Apertura: El futuro de IA descentralizada\n18:00 — Talk 1: Agentes autónomos en blockchain\n18:45 — Talk 2: Datos privados con ZK-proofs + LLMs\n19:30 — Panel: Oportunidades de negocio\n20:15 — Networking y cierre',
    created_at: '2026-04-10T00:00:00Z',
  },
];

export const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: 'Solidity desde Cero',
    description:
      'El curso más completo para aprender Solidity y desarrollar smart contracts seguros. Desde variables y funciones hasta patrones avanzados de seguridad.',
    price: 0,
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
    category: 'Desarrollo',
    type: 'video',
    instructor: 'Key Lab Team',
    duration: '12 horas',
    level: 'beginner',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'DeFi: Protocolos y Estrategias',
    description:
      'Entiende cómo funcionan Uniswap, Aave, Compound y otros protocolos DeFi. Aprende a optimizar tu yield farming y gestionar riesgos.',
    price: 25,
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
    category: 'DeFi',
    type: 'video',
    instructor: 'Ana García',
    duration: '8 horas',
    level: 'intermediate',
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: '3',
    title: 'Guía completa de ThirdWeb v5',
    description:
      'PDF + código fuente. Todo lo que necesitas para integrar autenticación Web3, contratos y pagos crypto en tu aplicación con ThirdWeb SDK v5.',
    price: 19,
    image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
    category: 'Desarrollo',
    type: 'download',
    instructor: 'Key Lab Team',
    duration: '120 páginas',
    level: 'intermediate',
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: '4',
    title: 'NFTs: Creación y Negocio',
    description:
      'Aprende a crear colecciones NFT desde el arte hasta el smart contract. Incluye estrategias de marketing, comunidad y monetización.',
    price: 20,
    image_url: 'https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?w=600&q=80',
    category: 'NFT',
    type: 'video',
    instructor: 'Carlos Mendez',
    duration: '6 horas',
    level: 'beginner',
    created_at: '2026-02-15T00:00:00Z',
  },
  {
    id: '5',
    title: 'Seguridad en Smart Contracts',
    description:
      'Auditoría de contratos inteligentes: ataques más comunes (reentrancy, overflow, front-running), herramientas de análisis estático y mejores prácticas.',
    price: 25,
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80',
    category: 'Seguridad',
    type: 'video',
    instructor: 'María Torres',
    duration: '10 horas',
    level: 'advanced',
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: '6',
    title: 'Kit de Inicio Web3 (Templates)',
    description:
      'Pack de 10 templates React + Next.js listos para producción: dApp starter, NFT marketplace, DAO voting, token dashboard y más.',
    price: 39,
    image_url: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=600&q=80',
    category: 'Recursos',
    type: 'download',
    instructor: 'Key Lab Team',
    duration: '10 templates',
    level: 'intermediate',
    created_at: '2026-03-15T00:00:00Z',
  },
];
