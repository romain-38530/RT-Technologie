import { TourStep } from '../components/TourGuide';

/**
 * Tour guidé pour l'application Industriel
 */
export const industryTour: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur RT-Technologie !',
    content:
      'Découvrez comment créer et gérer vos commandes de transport en quelques clics. Ce tour rapide vous montrera les fonctionnalités essentielles.',
    target: '[data-tour="dashboard"]',
    placement: 'bottom',
  },
  {
    id: 'create-order',
    title: 'Créer une commande',
    content:
      'Cliquez ici pour créer votre première commande de transport. Vous pourrez saisir toutes les informations nécessaires : origine, destination, poids, volume...',
    target: '[data-tour="create-order-button"]',
    placement: 'bottom',
  },
  {
    id: 'import-orders',
    title: 'Import en masse',
    content:
      'Gagnez du temps en important plusieurs commandes à la fois via fichiers CSV ou Excel. Parfait pour les gros volumes !',
    target: '[data-tour="import-button"]',
    placement: 'left',
  },
  {
    id: 'palettes-module',
    title: 'Module Palettes',
    content:
      'Nouveau ! Gérez l\'économie circulaire de vos palettes avec des chèques QR et la détection IA. Suivez votre stock en temps réel.',
    target: '[data-tour="palettes-menu"]',
    placement: 'right',
  },
  {
    id: 'pricing-grids',
    title: 'Grilles tarifaires',
    content:
      'Configurez vos propres grilles de tarification par zone géographique. Définissez des tarifs spéciaux pour certains clients.',
    target: '[data-tour="pricing-menu"]',
    placement: 'right',
  },
  {
    id: 'tracking',
    title: 'Suivi en temps réel',
    content:
      'Suivez vos transporteurs en direct sur la carte. Recevez des notifications à chaque étape de la livraison.',
    target: '[data-tour="tracking-menu"]',
    placement: 'right',
  },
  {
    id: 'help',
    title: 'Besoin d\'aide ?',
    content:
      'Cliquez sur ce bouton à tout moment pour accéder au centre de formation, aux vidéos tutoriels et obtenir de l\'aide.',
    target: '[data-tour="help-button"]',
    placement: 'left',
  },
];

export default industryTour;
