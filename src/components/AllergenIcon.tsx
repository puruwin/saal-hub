import GlutenIcon from '../assets/gluten.svg?react';
import LacteosIcon from '../assets/lacteos.svg?react';
import HuevosIcon from '../assets/huevos.svg?react';
import FrutosCascaraIcon from '../assets/frutos-cascara.svg?react';
import SojaIcon from '../assets/soja.svg?react';
import PescadoIcon from '../assets/pescado.svg?react';
import CrustaceosIcon from '../assets/crustaceos.svg?react';
import MoluscosIcon from '../assets/moluscos.svg?react';
import SesamoIcon from '../assets/sesamo.svg?react';
import MostazaIcon from '../assets/mostaza.svg?react';
import ApioIcon from '../assets/apio.svg?react';
import CacahuetesIcon from '../assets/cacahuetes.svg?react';
import AltramucesIcon from '../assets/altramuces.svg?react';
import SulfitosIcon from '../assets/sulfitos.svg?react';

interface AllergenIconProps {
  allergen: string;
  className?: string;
}

const allergenIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'gluten': GlutenIcon,
  'lacteos': LacteosIcon,
  'huevos': HuevosIcon,
  'frutos_secos': FrutosCascaraIcon,
  'soja': SojaIcon,
  'pescado': PescadoIcon,
  'mariscos': CrustaceosIcon,
  'crustaceos': CrustaceosIcon,
  'moluscos': MoluscosIcon,
  'sesamo': SesamoIcon,
  'mostaza': MostazaIcon,
  'apio': ApioIcon,
  'cacahuetes': CacahuetesIcon,
  'altramuces': AltramucesIcon,
  'sulfitos': SulfitosIcon,
};

export default function AllergenIcon({ allergen, className = "w-4 h-4" }: AllergenIconProps) {
  const IconComponent = allergenIcons[allergen];
  
  if (!IconComponent) {
    // Fallback para alérgenos no encontrados
    return <span className="text-xs">⚠️</span>;
  }
  
  return <IconComponent className={className} />;
}
