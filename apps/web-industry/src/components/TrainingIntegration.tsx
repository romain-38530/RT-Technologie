/**
 * Intégration du système de formation dans web-industry
 * @description Exemple d'intégration du HelpButton et TourGuide
 */

'use client';

import React, { useEffect, useState } from 'react';
import { HelpButton, TourGuide, industryTour } from '@rt/onboarding';

interface TrainingIntegrationProps {
  userId: string;
}

export const TrainingIntegration: React.FC<TrainingIntegrationProps> = ({ userId }) => {
  const [modules, setModules] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [certificates, setCertificates] = useState([]);
  const [showTour, setShowTour] = useState(false);

  // Charger les modules de formation depuis l'API
  useEffect(() => {
    const fetchTrainingData = async () => {
      try {
        // Récupérer les modules pour cette app
        const modulesRes = await fetch(
          `${process.env.NEXT_PUBLIC_TRAINING_API || 'http://localhost:3012'}/training/modules?targetApp=web-industry`
        );
        const modulesData = await modulesRes.json();
        setModules(modulesData.data || []);

        // Récupérer la progression de l'utilisateur
        const progressRes = await fetch(
          `${process.env.NEXT_PUBLIC_TRAINING_API || 'http://localhost:3012'}/training/progress/${userId}`
        );
        const progressData = await progressRes.json();

        // Convertir en format attendu
        const progressMap: Record<string, number> = {};
        (progressData.data || []).forEach((p: any) => {
          if (!progressMap[p.moduleId]) {
            progressMap[p.moduleId] = 0;
          }
          progressMap[p.moduleId] = Math.max(progressMap[p.moduleId], p.progress || 0);
        });
        setUserProgress(progressMap);

        // Récupérer les certificats
        const certsRes = await fetch(
          `${process.env.NEXT_PUBLIC_TRAINING_API || 'http://localhost:3012'}/training/certificates/${userId}`
        );
        const certsData = await certsRes.json();
        setCertificates(certsData.data || []);

        // Vérifier si c'est la première visite
        const hasSeenTour = localStorage.getItem('rt-industry-tour-completed');
        if (!hasSeenTour) {
          setShowTour(true);
        }
      } catch (error) {
        console.error('Error fetching training data:', error);
      }
    };

    fetchTrainingData();
  }, [userId]);

  const handleStartModule = (moduleId: string) => {
    // Rediriger vers la page du module
    window.location.href = `/training/modules/${moduleId}`;
  };

  const handleTourComplete = () => {
    localStorage.setItem('rt-industry-tour-completed', 'true');
    setShowTour(false);
  };

  const handleTourSkip = () => {
    setShowTour(false);
  };

  return (
    <>
      {/* Bouton d'aide flottant */}
      <HelpButton
        modules={modules}
        userProgress={userProgress}
        certificates={certificates}
        onStartModule={handleStartModule}
        position="top-right"
      />

      {/* Tour guidé au premier accès */}
      {showTour && (
        <TourGuide
          tourId="industry-welcome-tour"
          steps={industryTour}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
          autoStart={true}
        />
      )}
    </>
  );
};

export default TrainingIntegration;
